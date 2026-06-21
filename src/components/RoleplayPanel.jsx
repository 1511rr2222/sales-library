import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Avatar from 'boring-avatars';
import { getSystemPrompt } from './prompts';
import EvaluationReport from './EvaluationReport';
import { useNavigate } from 'react-router-dom';

function RoleplayPanel({ episodes, competencies, selectedCustomer, selectedSituation }) {  
  const navigate = useNavigate();
  const [step, setStep] = useState(() => sessionStorage.getItem('rp_step') || 'setup');
  const [messages, setMessages] = useState(() => JSON.parse(sessionStorage.getItem('rp_messages')) || []);
  const [customerType, setCustomerType] = useState(() => sessionStorage.getItem('rp_customerType') || '');
  const [situation, setSituation] = useState(() => sessionStorage.getItem('rp_situation') || '');
  const [selectedEpisode, setSelectedEpisode] = useState(() => JSON.parse(sessionStorage.getItem('rp_selectedEpisode')) || null);
  const [favorability, setFavorability] = useState(() => parseInt(sessionStorage.getItem('rp_favorability')) || 50);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMistake, setIsMistake] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [choices, setChoices] = useState([]);
  const [resultType, setResultType] = useState(null); // 'success' | 'fail'
  const [favorabilityTag, setFavorabilityTag] = useState(null); // ex) "니즈 파악 12점 하강/ 호감도: 55점"
  const MAX_TURNS = 10;

  const getFavorabilityColors = (score) => {
    if (score >= 70) return ["#10B981", "#34D399", "#A7F3D0"];
    if (score >= 40) return ["#6366F1", "#818CF8", "#C7D2FE"];
    return ["#F43F5E", "#FB7185", "#FDA4AF"];
  };

  const parseChoices = (text) => {
    const match = text.match(/\[CHOICES\]([\s\S]*?)\[\/CHOICES\]/);
    if (!match) return [];
    const lines = match[1].trim().split('\n').filter(Boolean);
    return lines.map(line => {
      if (line.startsWith('GOOD:'))    return line.replace('GOOD:', '').trim();
      if (line.startsWith('NEUTRAL:')) return line.replace('NEUTRAL:', '').trim();
      if (line.startsWith('BAD:'))     return line.replace('BAD:', '').trim();
      return null;
    }).filter(Boolean);
  };

  const cleanReply = (text) => text.replace(/\[CHOICES\][\s\S]*?\[\/CHOICES\]/, '').trim();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem('rp_step', step);
      sessionStorage.setItem('rp_messages', JSON.stringify(messages));
      sessionStorage.setItem('rp_customerType', customerType);
      sessionStorage.setItem('rp_situation', situation);
      sessionStorage.setItem('rp_selectedEpisode', JSON.stringify(selectedEpisode));
      sessionStorage.setItem('rp_favorability', favorability);
    }
  }, [step, messages, customerType, situation, selectedEpisode, favorability]);

  const handleStart = async () => {
    if (!customerType || !situation) return alert('모두 선택해주세요!');
    const matches = episodes.filter(e => 
      (e.고객유형_01 === customerType || e.고객유형_02 === customerType) &&
      (e.문제상황_01 === situation || e.문제상황_02 === situation)
    );
    if (matches.length === 0) return alert('조건에 맞는 상황이 없습니다.');
    const targetEpisode = matches[Math.floor(Math.random() * matches.length)];
    setSelectedEpisode(targetEpisode);
    setStep('chat');
    setFavorability(50);
    setIsMistake(false);
    setChoices([]);
    setResultType(null);
    setIsLoading(true);
    try {
      const systemPrompt = getSystemPrompt(customerType, situation, targetEpisode);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: [{ role: 'user', content: '(대화를 시작하세요.)' }] })
      });
      const data = await response.json();
      setMessages([{ role: 'assistant', content: data.content[0].text }]);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const fetchEvaluationReport = async (chatMessages) => {
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: chatMessages,
          episode: selectedEpisode  
        })
      });
      const data = await response.json();
      return data;
    } catch (e) { 
      console.error("결과 분석 실패:", e); 
      return null;
    }
  };

  const handleSend = async (overrideContent) => {
    const content = overrideContent || input;
    if (!content.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setChoices([]);
    setIsLoading(true);

    try {
      const systemPrompt = getSystemPrompt(customerType, situation, selectedEpisode);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: newMessages })
      });
      
      const data = await response.json();
      const reply = data.content[0].text;
      
      // [니즈 파악 12점 하강/ 호감도: 55점] 또는 [변화 없음/ 호감도: 55점] 파싱
      const tagMatch = reply.match(/\[([^\]]+?\/\s*호감도:\s*(\d+)점?)\]/);
      let currentFavorability = favorability;
      if (tagMatch) {
        currentFavorability = parseInt(tagMatch[2]);
        setFavorabilityTag(tagMatch[1].trim());
        if (currentFavorability < favorability) setIsMistake(true);
        setFavorability(currentFavorability);
      }

      const parsed = isMistake ? parseChoices(reply) : [];
      setChoices(parsed);
      const cleaned = cleanReply(reply);

      const updatedMessages = [...newMessages, { role: 'assistant', content: cleaned }];
      setMessages(updatedMessages);

      const assistantTurns = updatedMessages.filter(m => m.role === 'assistant').length;
      const isSessionEnd = reply.includes("[SESSION_END]");
      const isMaxTurns = assistantTurns >= MAX_TURNS;
      const isSuccess = currentFavorability >= 70;
      const isFail = currentFavorability <= 20;

      if (isMaxTurns || isSuccess || isSessionEnd || isFail) {
        setChoices([]);
        // 성공/실패 판정
        const result = isSuccess || (isSessionEnd && currentFavorability >= 50) ? 'success' : 'fail';
        setResultType(result);
        setStep('result'); // 리포트 전에 결과 화면 먼저
      }

    } catch (error) {
      console.error("챗봇 통신 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowReport = async () => {
    setStep('report');
    setIsAnalyzing(true);
    try {
      const report = await fetchEvaluationReport(messages);
      setReportData(report || { error: "분석 실패" });
    } catch (error) {
      console.error("평가 API 호출 에러:", error);
      setReportData({ error: "평가 중 오류가 발생했습니다." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHint = () => setMessages(prev => [...prev, { role: 'assistant', content: "💡 [힌트] 고객의 고민을 먼저 경청하고, 공감하는 태도를 보여주세요." }]);

  const handleReset = () => {
    ['rp_step', 'rp_messages', 'rp_customerType', 'rp_situation', 'rp_selectedEpisode', 'rp_favorability'].forEach(key => sessionStorage.removeItem(key)); 
    setStep('setup'); setMessages([]); setFavorability(50); setIsMistake(false); setReportData(null); setChoices([]); setResultType(null);
  };

  if (step === 'setup') {
    const customerTypes = [...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean))];
    const situations = [...new Set(episodes.filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType).flatMap(e => [e.문제상황_01, e.문제상황_02]).filter(Boolean))];
    const filteredEpisodes = episodes.filter(e => 
      (selectedCustomer === 'All' || e.고객유형_01 === selectedCustomer || e.고객유형_02 === selectedCustomer) &&
      (selectedSituation === 'All' || e.문제상황_01 === selectedSituation || e.문제상황_02 === selectedSituation)
    );

    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-200 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">영업 롤플레잉 설정</h2>
        <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-700 leading-relaxed">
          <p className="font-bold mb-2">본 롤플레잉은 실제 내부 사례를 기반으로 제작되었습니다.</p>
          <p> [사용 설명] </p>
          <p>- 당신은 영업사원이며 챗봇은 당신이 선택된 문제상황에 기반한 '고객'입니다.</p>
          <p>- 가능한 대화 턴은 10턴입니다. 10번의 대화 속에서 담당자의 호감도를 70이상 올려 거래를 성공하세요</p>
          <p>- 대화가 막힐 경우 살제 우수 사례를 참고하거나 힌트를 적극 활용해보세요!</p>
          <p>고객의 마음을 사로잡아 호감도를 올리고 문제를 성공적으로 해결하며 역량을 길러보세요.</p>
        </div>
        <select className="w-full mb-3 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setCustomerType(e.target.value)}><option value="">고객 유형 선택</option>{customerTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className="w-full mb-6 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setSituation(e.target.value)}><option value="">문제 상황 선택</option>{situations.map((s, i) => <option key={i} value={s}>{s}</option>)}</select>
        <button onClick={handleStart} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">시작하기</button>
        {(selectedCustomer !== 'All' || selectedSituation !== 'All') && (
          <div className="border-t pt-6">
            <h3 className="font-bold text-purple-900 mb-4">추천 에피소드</h3>
            <div className="grid gap-3">
              {filteredEpisodes.map(e => (
                <div key={e.episode_id} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-bold text-sm text-purple-900">{e.제목}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 max-w-xl mx-auto flex flex-col min-h-[600px] max-h-[85vh] overflow-hidden"> 
      <div className="px-5 py-4 border-b border-purple-100 bg-purple-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar size={60} name={customerType} variant="beam" colors={getFavorabilityColors(favorability)} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-100 px-1.5 py-0.5 rounded">고객 유형</span>
              <span className="font-bold text-purple-950 text-sm">{customerType}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-100 px-1.5 py-0.5 rounded">문제 상황</span>
              <span className="font-bold text-purple-950 text-sm">{situation}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-100 px-1.5 py-0.5 rounded">진행 턴</span>
              <span className="font-bold text-purple-950 text-sm">
                {messages.filter(m => m.role === 'assistant').length} / {MAX_TURNS}
              </span>
            </div>
          </div>
        </div>
        <button onClick={handleReset} className="text-xs text-red-500 font-bold border border-red-200 px-3 py-1.5 rounded-lg bg-white">종료</button>
      </div>

      {/* 결과 화면 */}
      {step === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          {resultType === 'success' ? (
            <>
              <div className="text-6xl">🎉</div>
              <div className="text-3xl font-black text-emerald-600">성공!</div>
              <p className="text-sm text-gray-500 text-center">고객의 마음을 사로잡았습니다.<br/>어떤 점이 효과적이었는지 확인해보세요.</p>
            </>
          ) : (
            <>
              <div className="text-6xl">😓</div>
              <div className="text-3xl font-black text-red-500">실패</div>
              <p className="text-sm text-gray-500 text-center">아쉽게도 이번엔 설득에 실패했습니다.<br/>리포트를 보며 개선점을 찾아보세요.</p>
            </>
          )}
          <button
            onClick={handleShowReport}
            className={`mt-2 w-full max-w-xs py-3 rounded-xl font-bold text-white text-sm shadow-md transition-colors ${
              resultType === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            📊 결과 리포트 보기
          </button>
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 underline">
            처음으로 돌아가기
          </button>
        </div>
      )}

      {/* 리포트 화면 */}
      {step === 'report' && (
        <div className="flex-1 overflow-y-auto p-4 bg-purple-50/20">
          {isAnalyzing || !reportData ? (
            <div className="text-center p-10 text-purple-400">
              <div className="animate-spin mb-4 inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full" />
              결과를 불러오는 중입니다...
            </div>
          ) : (
            <EvaluationReport reportData={reportData} />
          )}
        </div>
      )}

      {/* 채팅 화면 */}
      {step === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[300px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-900'}`}>{m.content}</div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-purple-400 animate-pulse px-4">작성 중...</div>}
            {isMistake && (
              <div className="p-4 bg-white border border-red-200 shadow-sm rounded-2xl flex justify-between items-center mx-4 my-2">
                <span className="text-xs text-red-600 font-bold">호감도가 하락했습니다.</span>
                <button onClick={() => navigate(`/episode/${selectedEpisode?.episode_id}`, { state: { from: 'roleplay' } })} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">우수사례</button>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-purple-50">
            <button onClick={handleHint} className="w-full mb-4 py-2 text-xs font-bold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100">
              💡 힌트 보기</button>

            {isMistake && choices.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(choice)}
                    className="w-full text-left text-sm px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 hover:bg-purple-100 transition-colors"
                  >
                    {i + 1}. {choice}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input value={input} disabled={isLoading} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 border-2 border-purple-100 rounded-xl px-4 py-2" placeholder="메시지 입력..." />
              <button onClick={() => handleSend()} className="bg-purple-600 text-white p-3 rounded-xl"><Send size={18} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default RoleplayPanel;

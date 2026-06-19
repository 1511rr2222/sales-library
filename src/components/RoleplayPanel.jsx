import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Avatar from 'boring-avatars';
import { getSystemPrompt } from './prompts';
import EvaluationReport from './EvaluationReport';
import { useNavigate } from 'react-router-dom';

function RoleplayPanel({ episodes }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(() => sessionStorage.getItem('rp_step') || 'setup');
  const [messages, setMessages] = useState(() => JSON.parse(sessionStorage.getItem('rp_messages')) || []);
  const [customerType, setCustomerType] = useState(() => sessionStorage.getItem('rp_customerType') || '');
  const [situation, setSituation] = useState(() => sessionStorage.getItem('rp_situation') || '');
  const [selectedEpisode, setSelectedEpisode] = useState(() => JSON.parse(sessionStorage.getItem('rp_selectedEpisode')) || null);
  const [favorability, setFavorability] = useState(() => parseInt(sessionStorage.getItem('rp_favorability')) || 50);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMistake, setIsMistake] = useState(false);
  const [reportData, setReportData] = useState(null);
  const MAX_TURNS = 10;

  const getFavorabilityColors = (score) => {
    if (score >= 70) return ["#10B981", "#34D399", "#A7F3D0"];
    if (score >= 40) return ["#6366F1", "#818CF8", "#C7D2FE"];
    return ["#F43F5E", "#FB7185", "#FDA4AF"];
  };

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
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages })
      });
      const data = await response.json();
      setReportData(data);
    } catch (e) { console.error("결과 분석 실패:", e); }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
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
      
      const match = reply.match(/\[호감도: (\d+)\]/);
      let currentFavorability = favorability;
      if (match) {
        currentFavorability = parseInt(match[1]);
        if (currentFavorability < favorability) setIsMistake(true);
        setFavorability(currentFavorability);
      }

      const updatedMessages = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(updatedMessages);

      const assistantTurns = updatedMessages.filter(m => m.role === 'assistant').length;
      const isSessionEnd = reply.includes("[SESSION_END]");
      
      if (assistantTurns >= MAX_TURNS || currentFavorability >= 70 || isSessionEnd) {
        setStep('result');
        fetchEvaluationReport(updatedMessages);
        
        if (isSessionEnd) {
          const jsonMatch = reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { setReportData(JSON.parse(jsonMatch[0])); } catch (e) { console.error("JSON 파싱 에러:", e); }
          }
        }
      }
    } catch (error) {
      console.error("챗봇 통신 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHint = () => setMessages(prev => [...prev, { role: 'assistant', content: "💡 [힌트] 고객의 고민을 먼저 경청하고, 공감하는 태도를 보여주세요." }]);

  if (step === 'setup') {
    // ... (기존 setup UI 코드 생략 없이 유지하세요)
    const customerTypes = [...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean))];
    const situations = [...new Set(episodes.filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType).flatMap(e => [e.문제상황_01, e.문제상황_02]).filter(Boolean))];
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-200 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">영업 롤플레잉 설정</h2>
        <select className="w-full mb-3 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setCustomerType(e.target.value)}><option value="">고객 유형 선택</option>{customerTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className="w-full mb-6 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setSituation(e.target.value)}><option value="">문제 상황 선택</option>{situations.map((s, i) => <option key={i} value={s}>{s}</option>)}</select>
        <button onClick={handleStart} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">시작하기</button>
      </div>
    );
  }

  return (
   <div className="bg-white rounded-2xl shadow-sm border border-purple-100 max-w-xl mx-auto flex flex-col h-[650px]"> 
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
  <button 
    onClick={() => {
      ['rp_step', 'rp_messages', 'rp_customerType', 'rp_situation', 'rp_selectedEpisode', 'rp_favorability'].forEach(key => sessionStorage.removeItem(key)); 
      setStep('setup'); setMessages([]); setFavorability(50); setIsMistake(false); setReportData(null);
    }} 
    className="text-xs text-red-500 font-bold border border-red-200 px-3 py-1.5 rounded-lg bg-white"
  >종료</button>
</div>

      {step === 'result' ? (
        <div className="flex-1 overflow-y-auto p-4 bg-purple-50/20">
          {reportData ? <EvaluationReport reportData={reportData} /> : <div className="text-center p-10 text-purple-400">결과를 불러오는 중입니다...</div>}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
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
            <button onClick={handleHint} className="w-full mb-4 py-2 text-xs font-bold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100">💡 힌트 보기</button>
            <div className="flex gap-2">
              <input value={input} disabled={isLoading} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 border-2 border-purple-100 rounded-xl px-4 py-2" placeholder="메시지 입력..." />
              <button onClick={handleSend} className="bg-purple-600 text-white p-3 rounded-xl"><Send size={18} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default RoleplayPanel;
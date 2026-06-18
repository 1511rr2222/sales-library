import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { getSystemPrompt } from './prompts';

function RoleplayPanel({ episodes }) {
  const [step, setStep] = useState('setup');
  const [customerType, setCustomerType] = useState('');
  const [situation, setSituation] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favorability, setFavorability] = useState(50); // 호감도 상태

  const MAX_TURNS = 6;

  const handleStart = async () => {
    if (!customerType || !situation) return alert('모두 선택해주세요!');
    
    // 1. 딱 한 행만 필터링하여 랜덤 선택
    const matches = episodes.filter(e => 
      (e.고객유형_01 === customerType || e.고객유형_02 === customerType) &&
      (e.문제상황_01 === situation || e.문제상황_02 === situation)
    );
    if (matches.length === 0) return alert('조건에 맞는 상황이 없습니다.');
    const targetEpisode = matches[Math.floor(Math.random() * matches.length)];
    setSelectedEpisode(targetEpisode);

    setStep('chat');
    setFavorability(50);
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
      if (reply.includes("[SESSION_END]")) {
    setMessages([...newMessages, { role: 'assistant', content: reply }]);
    setStep('result'); // 바로 결과 화면으로 전환
    setIsLoading(false);
    return;
  }
      // 호감도 파싱 (챗봇이 [호감도: XX]로 응답한다고 가정)
      const match = reply.match(/\[호감도: (\d+)\]/);
      if (match) setFavorability(parseInt(match[1]));

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      if (newMessages.filter(m => m.role === 'user').length >= MAX_TURNS) setStep('result');
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleHint = () => {
    setMessages(prev => [...prev, { role: 'assistant', content: "💡 [힌트] 고객의 고민을 먼저 경청하고, 공감하는 태도를 보여주세요." }]);
  };

  if (step === 'setup') {
    const customerTypes = [...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean))];
    const situations = [...new Set(episodes.filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType).flatMap(e => [e.문제상황_01, e.문제상황_02]).filter(Boolean))];

    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-200 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-5 text-purple-800">영업 롤플레잉 설정</h2>
        <select className="w-full mb-3 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setCustomerType(e.target.value)}><option value="">고객 유형 선택</option>{customerTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className="w-full mb-6 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setSituation(e.target.value)}><option value="">문제 상황 선택</option>{situations.map((s, i) => <option key={i} value={s}>{s}</option>)}</select>
        <button onClick={handleStart} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">시작하기</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 max-w-xl mx-auto flex flex-col h-[650px]">
      {/* 헤더 및 호감도 */}
      <div className="px-5 py-4 border-b border-purple-100 bg-purple-50/50">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-purple-600 text-[10px] font-bold uppercase">고객 호감도</div>
            <div className="font-extrabold text-purple-900 text-lg">{favorability}%</div>
          </div>
          <button onClick={() => setStep('setup')} className="text-xs text-red-500 font-bold border border-red-200 px-3 py-1 rounded-lg">종료</button>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${favorability}%` }}></div></div>
      </div>

      {/* 대화창 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-900'}`}>{m.content}</div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-purple-400 animate-pulse px-4">답변 작성 중...</div>}
      </div>

      {/* 입력 및 힌트 */}
      <div className="p-4 border-t border-purple-50">
        <button onClick={handleHint} className="w-full mb-3 py-2 text-xs font-bold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100">💡 힌트 보기</button>
        <div className="flex gap-2">
          <input value={input} disabled={isLoading} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 border-2 border-purple-100 rounded-xl px-4 py-2" placeholder="메시지 입력..." />
          <button onClick={handleSend} className="bg-purple-600 text-white p-3 rounded-xl"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
export default RoleplayPanel;
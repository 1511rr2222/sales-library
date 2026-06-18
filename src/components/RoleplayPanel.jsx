import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { getSystemPrompt } from './prompts';

function RoleplayPanel({ episodes }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup');
  const [customerType, setCustomerType] = useState('');
  const [situation, setSituation] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(null); // 필터링된 에피소드 고정
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const MAX_TURNS = 6;

  // 에피소드에 따른 필터링 로직
  const customerTypes = [...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean))];
  const situations = [...new Set(
    episodes.filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType)
            .flatMap(e => [e.문제상황_01, e.문제상황_02])
            .filter(Boolean)
  )];

  const handleStart = async () => {
    if (!customerType || !situation) return alert('모두 선택해주세요!');

    // 1. 조건에 맞는 에피소드 랜덤 선택
    const matches = episodes.filter(e => 
      (e.고객유형_01 === customerType || e.고객유형_02 === customerType) &&
      (e.문제상황_01 === situation || e.문제상황_02 === situation)
    );
    const targetEpisode = matches[Math.floor(Math.random() * matches.length)];
    setSelectedEpisode(targetEpisode);

    setStep('chat');
    setIsLoading(true);

    try {
      // 2. 외부 prompts.js의 함수에 에피소드 데이터 전달
      const systemPrompt = getSystemPrompt(customerType, situation, targetEpisode);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: [{ role: 'user', content: '(대화를 시작하세요. 당신이 먼저 첫 마디를 건네세요.)' }] })
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
      // 대화 중에도 동일한 에피소드 데이터를 참조
      const systemPrompt = getSystemPrompt(customerType, situation, selectedEpisode);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: newMessages })
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.content[0].text }]);
      if (newMessages.filter(m => m.role === 'user').length >= MAX_TURNS) setStep('result');
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  if (step === 'setup') {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-200 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-5 text-purple-800">영업 롤플레잉 설정</h2>
        <select className="w-full mb-3 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setCustomerType(e.target.value)}>
          <option value="">고객 유형 선택</option>
          {customerTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select className="w-full mb-6 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setSituation(e.target.value)}>
          <option value="">문제 상황 선택</option>
          {situations.map((sit, idx) => <option key={idx} value={sit}>{sit}</option>)}
        </select>
        <button onClick={handleStart} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition">시작하기</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 max-w-xl mx-auto flex flex-col h-[600px]">
      {/* ... 상단 헤더, 메시지 렌더링, 입력창 UI는 동일하게 유지 ... */}
      <div className="px-4 py-4 border-b border-purple-50 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">고객</span><span className="font-bold text-purple-900 text-sm">{customerType}</span></div>
          <div className="flex items-center gap-2"><span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">상황</span><span className="text-xs text-purple-600 font-medium">{situation}</span></div>
        </div>
        <button onClick={() => setStep('setup')} className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold">종료</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-900'}`}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
    <div className="flex justify-start">
      <div className="px-3 py-2 rounded-xl text-sm bg-purple-50 text-purple-400 animate-pulse">
        챗봇이 답변을 작성 중입니다...
      </div>
    </div>
  )}

      </div>
     <input 
  value={input} 
  disabled={isLoading} // [추가] 로딩 중엔 입력 불가
  onChange={e => setInput(e.target.value)} 
  placeholder={isLoading ? "답변을 기다리는 중..." : "메시지를 입력하세요..."} 
  className="..." 
/> {/* 입력부 생략 */}
    </div>
  );
}

export default RoleplayPanel;
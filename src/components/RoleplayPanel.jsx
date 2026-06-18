import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { getSystemPrompt } from './prompts';

function RoleplayPanel({ episodes, competencies }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup');
  const [customerType, setCustomerType] = useState('');
  const [situation, setSituation] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userTurnCount = messages.filter(m => m.role === 'user').length;
  const MAX_TURNS = 6;

  // 힌트 함수 추가
  const handleHint = () => {
    const hintText = "💡 [힌트] 고객의 고민을 먼저 경청하고, 공감하는 태도를 보여주세요.";
    setMessages(prev => [...prev, { role: 'assistant', content: hintText }]);
  };

  const handleStart = async () => {
    if (!customerType || !situation) return alert('모두 선택해주세요!');
    setStep('chat');
    setIsLoading(true);

    try {
      const systemPrompt = `${getSystemPrompt()}\n\n[상황설정]\n고객: ${customerType}\n상황: ${situation}`;
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
      const systemPrompt = `${getSystemPrompt()}\n\n[상황설정]\n고객: ${customerType}\n상황: ${situation}`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: newMessages })
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.content[0].text }]);
      if (newMessages.filter(m => m.role === 'user').length >= MAX_TURNS) handleEnd();
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleEnd = () => setStep('result');

  const customerTypes = [...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean))];
  const situations = [...new Set(
    episodes.filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType)
            .flatMap(e => [e.문제상황_01, e.문제상황_02])
            .filter(Boolean)
  )];

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
      <div className="px-4 py-4 border-b border-purple-50 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">고객유형</span><span className="font-bold text-purple-900 text-sm">{customerType}</span></div>
          <div className="flex items-center gap-2"><span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">해결과제</span><span className="text-xs text-purple-600 font-medium">{situation}</span></div>
        </div>
        <button onClick={handleEnd} className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg text-sm font-bold shadow-sm">종료</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-900'}`}>{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-purple-50">
        <button onClick={handleHint} className="w-full mb-2 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition">💡 힌트 보기</button>
        <div className="flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="메시지를 입력하세요..." className="flex-1 text-sm border border-purple-100 rounded-xl px-3 py-2 outline-none focus:border-purple-400" />
          <button onClick={handleSend} className="w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export default RoleplayPanel;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';

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
  
  const systemPrompt = `고객 유형: ${customerType}, 상황: ${situation}에 맞게 영업 롤플레잉을 진행해줘.`;

  const handleStart = async () => {
    if (!customerType || !situation) return alert('모두 선택해주세요!');
    setStep('chat');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: 'user', content: '(대화를 시작하세요. 당신이 먼저 첫 마디를 건네세요.)' }]
        })
      });
      const data = await response.json();
      setMessages([{ role: 'assistant', content: data.content[0].text }]);
    } catch (error) {
      console.error('API 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: newMessages })
      });
      const data = await response.json();
      const updatedMessages = [...newMessages, { role: 'assistant', content: data.content[0].text }];
      setMessages(updatedMessages);
      if (updatedMessages.filter(m => m.role === 'user').length >= MAX_TURNS) handleEnd();
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleEnd = async () => setStep('result');

  if (step === 'setup') {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-200 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-5 text-purple-800">영업 롤플레잉 설정</h2>
        
        {/* 고객 유형 선택 - _01, _02 모두 처리 */}
        <select className="w-full mb-3 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setCustomerType(e.target.value)}>
          <option value="">고객 유형 선택</option>
          {[...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02].filter(Boolean)))].map(type => 
            <option key={type} value={type}>{type}</option>
          )}
        </select>

        {/* 문제 상황 선택 - _01, _02 모두 처리 및 빈 값 방어 */}
        <select className="w-full mb-6 p-3 border-2 border-purple-200 rounded-lg" onChange={(e) => setSituation(e.target.value)}>
          <option value="">문제 상황 선택</option>
          {episodes
            .filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType)
            .flatMap(e => [e.문제상황_01, e.문제상황_02].filter(Boolean))
            .map((sit, idx) => <option key={idx} value={sit}>{sit}</option>)}
        </select>

        <button onClick={handleStart} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition">
          시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 max-w-xl mx-auto flex flex-col h-[600px]">
      <div className="px-4 py-3 border-b border-purple-50 flex items-center justify-between">
        <div>
            <div className="font-semibold text-purple-900 text-sm">{customerType}</div>
            <div className="text-xs text-purple-400">{situation}</div>
        </div>
        <button onClick={handleEnd} className="text-xs text-purple-400 hover:text-red-500 border border-purple-100 rounded-full px-3 py-1">종료</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-900'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-3 border-t border-purple-50">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="메시지 입력..." 
          className="flex-1 text-sm border border-purple-100 rounded-xl px-3 py-2 outline-none focus:border-purple-400" 
        />
        <button onClick={handleSend} className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

export default RoleplayPanel;
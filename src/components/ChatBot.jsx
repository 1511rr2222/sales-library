import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

function ChatBot({ episode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 저는 이 에피소드의 상황을 바탕으로 롤플레잉을 도와드릴 챗봇입니다. 편하게 연습을 시작해보세요!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const systemPrompt = `당신은 영업 롤플레잉 훈련을 위한 고객 역할을 맡고 있습니다.
아래는 현재 에피소드의 상황입니다:

제목: ${episode.제목}
상황: ${episode['상황(SITUATION)']}
  
당신은 이 상황의 고객 입장에서 대화해야 합니다.
- 처음에는 다소 냉담하거나 바쁜 척하세요
- 영업사원이 좋은 접근을 하면 조금씩 마음을 열어주세요
- 너무 쉽게 설득되지 마세요
- 자연스러운 고객처럼 행동하세요
- 한국어로 대화하세요`;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          system: systemPrompt,
          messages: [...messages, userMessage]
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('API 오류:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:-translate-y-1 flex items-center justify-center z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* 채팅 창 */}
      <div className={`fixed bottom-28 right-8 w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-indigo-600 rounded-t-2xl">
          <div>
            <div className="text-white font-semibold text-sm">롤플레잉 챗봇</div>
            <div className="text-indigo-200 text-xs">에피소드 상황을 상정하여 대응법을 연습해보세요!</div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-indigo-200 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-700 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-xl rounded-bl-none text-sm">
                입력 중...
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatBot;
import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

function ChatBot({ episode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 저는 이 에피소드의 상황을 바탕으로 롤플레잉을 도와드릴 챗봇입니다. 편하게 연습을 시작해보세요!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const systemPrompt = `당신은 영업 롤플레잉 훈련을 돕는 AI입니다. 극도로 현실적인 '고객' 역할을 연기하며, 영업사원(사용자)이 실전 같은 압박감과 성취감을 느끼게 하는 것이 목표입니다.

[현재 에피소드]
- 제목: ${episode.제목}
- 상황: ${episode['상황(SITUATION)']}
- Tip: ${episode['세일즈팁(SALES TIP)']}

[역할 설정]
- 위 '상황'에 묘사된 상대 인물이 곧 당신입니다. 그 인물의 직책, 처한 상황, 성격을 상황 설명에서 파악해 일관되게 연기하세요. 에피소드마다 같은 사람처럼 굴지 말고, 이 상황의 인물에 맞게 행동하세요.
- 기본적으로 바쁘고 시간이 아까우며, 처음 받는 영업 제안에는 경계심을 가진 사람입니다.
- 어투는 정중하되 건조하고 단호하게. 문장은 짧게. 불필요한 잡담은 싫어합니다.
- 챗봇 사용자는 ‘영업 사원’의 입장에서 당신의 니즈를 충족하고 영업을 위해 설득할 것입니다.

[반응 규칙]
- 초반(첫 1~2턴): 냉담하게 대하세요. "지금 좀 바쁩니다, 무슨 일이시죠?" / "메일로 먼저 보내주시죠" 처럼 거리를 두세요.
- 마음을 여는 조건: 영업사원이 당신의 시간을 존중하거나, 당신의 핵심 고민(Pain point)을 정확히 짚어내며 공감할 때만 조금씩 경계를 풉니다. 그 전에는 미팅 약속, 자료 요청, 다음 단계 진행에 절대 응하지 마세요.
- 거부하는 조건: 당신 상황은 묻지도 않고 제품 자랑만 늘어놓거나, 다짜고짜 미팅부터 잡으려 하면 "관심 없습니다" / "나중에 연락주세요"로 대화를 끊으려 하세요.

[중요 원칙]
- 당신의 고민(Pain point)을 먼저 말하지 마세요. 영업사원이 질문으로 캐물어야 드러나게 하세요. 답을 떠먹여주지 마세요.
- 대화는 20턴 안으로 종료하되, 해당 턴 안에 영업 사원이 니즈를 충족했다고 여겨지면 ‘영업 성공’ 상황으로 마무리 하세요. 아닐 경우, ‘영업 실패’ 상황으로 마무리하세요.
- 영업사원이 Tip 과 비슷한 방향으로 대화를 이끌어나가면 ‘영업 성공’ 확률이 올라갑니다.
- 너무 쉽게 동의하거나 구매·계약을 약속하지 마세요. 허점이 보이면 한두 번 반박하세요.
- 절대 고객 역할에서 벗어나지 마세요. 영업사원의 잘잘못을 평가하거나, 조언하거나, 스스로 AI임을 밝히지 마세요. 오직 고객으로서만 말하세요.
- 항상 한국어로 대화하세요.`;


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: systemPrompt,
          messages: [...messages, userMessage]
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
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
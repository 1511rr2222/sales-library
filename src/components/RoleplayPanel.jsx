import React, { useState, useEffect } from 'react';
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
  const [choices, setChoices] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [resultType, setResultType] = useState(null);

  const [favorabilityState, setFavorabilityState] = useState(null);

  const MAX_TURNS = 10;

  const getFavorabilityColors = (score) => {
    if (score >= 70) return ["#10B981", "#34D399", "#A7F3D0"];
    if (score >= 40) return ["#6366F1", "#818CF8", "#C7D2FE"];
    return ["#F43F5E", "#FB7185", "#FDA4AF"];
  };

  const parseChoices = (text) => {
    const match = text.match(/\[CHOICES\]([\s\S]*?)\[\/CHOICES\]/);
    if (!match) return [];
    return match[1]
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => line.replace(/GOOD:|NEUTRAL:|BAD:/, '').trim());
  };

  const cleanReply = (text) =>
    text.replace(/\[CHOICES\][\s\S]*?\[\/CHOICES\]/, '').trim();

  useEffect(() => {
    sessionStorage.setItem('rp_step', step);
    sessionStorage.setItem('rp_messages', JSON.stringify(messages));
    sessionStorage.setItem('rp_customerType', customerType);
    sessionStorage.setItem('rp_situation', situation);
    sessionStorage.setItem('rp_selectedEpisode', JSON.stringify(selectedEpisode));
    sessionStorage.setItem('rp_favorability', favorability);
  }, [step, messages, customerType, situation, selectedEpisode, favorability]);

  const handleStart = async () => {
    if (!customerType || !situation) return alert('모두 선택해주세요!');

    const matches = episodes.filter(e =>
      (e.고객유형_01 === customerType || e.고객유형_02 === customerType) &&
      (e.문제상황_01 === situation || e.문제상황_02 === situation)
    );

    if (!matches.length) return alert('조건에 맞는 상황이 없습니다.');

    const targetEpisode = matches[Math.floor(Math.random() * matches.length)];

    setSelectedEpisode(targetEpisode);
    setStep('chat');
    setFavorability(50);
    setFavorabilityState(null);
    setIsMistake(false);
    setChoices([]);
    setResultType(null);
    setIsLoading(true);

    try {
      const systemPrompt = getSystemPrompt(customerType, situation, targetEpisode);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: 'user', content: '(대화를 시작하세요.)' }]
        })
      });

      const data = await res.json();

      setMessages([{ role: 'assistant', content: data.content[0].text }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (overrideContent) => {
    setFavorabilityState(null);

    const content = overrideContent || input;
    if (!content.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setChoices([]);
    setIsLoading(true);

    try {
      const systemPrompt = getSystemPrompt(customerType, situation, selectedEpisode);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: newMessages })
      });

      const data = await res.json();
      const reply = data.content[0].text;

      const tagMatch = reply.match(/\[([^\]]+?\/\s*호감도:\s*(\d+)점?)\]/);

      let currentFavorability = favorability;

      if (tagMatch) {
        currentFavorability = parseInt(tagMatch[2]);

        if (currentFavorability > favorability) setFavorabilityState('up');
        else if (currentFavorability < favorability) setFavorabilityState('down');
        else setFavorabilityState('neutral');

        setFavorability(currentFavorability);

        if (currentFavorability < favorability) setIsMistake(true);
        else setIsMistake(false);
      }

      const cleaned = cleanReply(reply);

      setMessages(prev => [...prev, { role: 'assistant', content: cleaned }]);

      const assistantTurns = newMessages.filter(m => m.role === 'assistant').length + 1;

      const isEnd =
        reply.includes('[SESSION_END]') ||
        assistantTurns >= MAX_TURNS ||
        currentFavorability >= 70 ||
        currentFavorability <= 20;

      if (isEnd) {
        setResultType(currentFavorability >= 70 ? 'success' : 'fail');
        setStep('result');
      }

      setChoices(isMistake ? parseChoices(reply) : []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHint = () =>
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '💡 고객의 감정에 공감하고 문제를 구조적으로 정리해보세요.'
      }
    ]);

  const handleReset = () => {
    [
      'rp_step',
      'rp_messages',
      'rp_customerType',
      'rp_situation',
      'rp_selectedEpisode',
      'rp_favorability'
    ].forEach(k => sessionStorage.removeItem(k));

    setStep('setup');
    setMessages([]);
    setFavorability(50);
    setFavorabilityState(null);
    setChoices([]);
    setResultType(null);
  };

  /* =========================
     SETUP SCREEN
  ========================= */

  if (step === 'setup') {
    const customerTypes = [...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean))];

    const situations = [...new Set(
      episodes
        .filter(e => e.고객유형_01 === customerType || e.고객유형_02 === customerType)
        .flatMap(e => [e.문제상황_01, e.문제상황_02])
        .filter(Boolean)
    )];

    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-200 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">영업 롤플레잉 설정</h2>

        <select className="w-full mb-3 p-3 border rounded-lg" onChange={e => setCustomerType(e.target.value)}>
          <option value="">고객 유형 선택</option>
          {customerTypes.map(t => <option key={t}>{t}</option>)}
        </select>

        <select className="w-full mb-6 p-3 border rounded-lg" onChange={e => setSituation(e.target.value)}>
          <option value="">문제 상황 선택</option>
          {situations.map((s, i) => <option key={i}>{s}</option>)}
        </select>

        <button onClick={handleStart} className="w-full bg-purple-600 text-white py-3 rounded-lg">
          시작하기
        </button>
      </div>
    );
  }

  /* =========================
     MAIN LAYOUT
  ========================= */

  return (
    <div className="bg-white rounded-2xl shadow-sm border max-w-xl mx-auto flex flex-col h-[85vh] overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-4 border-b flex justify-between bg-purple-50">
        <div>
          <div className="text-sm font-bold">{customerType}</div>
          <div className="text-xs text-gray-500">{situation}</div>
        </div>

        <button onClick={handleReset} className="text-xs text-red-500">
          종료
        </button>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
              m.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-900'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-xs text-purple-400">작성 중...</div>
        )}
      </div>

      {/* STATUS */}
      {favorabilityState && (
        <div className="px-4 pb-2">
          <div className={`p-3 border rounded-xl flex justify-between ${
            favorabilityState === 'down'
              ? 'border-red-300'
              : favorabilityState === 'up'
              ? 'border-green-300'
              : 'border-gray-300'
          }`}>
            <span className="text-xs font-bold">
              {favorabilityState === 'up' && '호감도 상승'}
              {favorabilityState === 'down' && '호감도 하락'}
              {favorabilityState === 'neutral' && '변화 없음'}
            </span>

            {favorabilityState === 'down' && (
              <button
                onClick={() =>
                  navigate(`/episode/${selectedEpisode?.episode_id}`, {
                    state: { from: 'roleplay' }
                  })
                }
                className="text-xs text-red-500"
              >
                우수사례
              </button>
            )}
          </div>
        </div>
      )}

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 border rounded-lg px-3 py-2"
        />

        <button
          onClick={() => handleSend()}
          className="bg-purple-600 text-white px-4 rounded-lg"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default RoleplayPanel;
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import soloCharacter from '../solo.png';

const GROUPS = {
  Common: {
    label: 'Common',
    color: '#6366F1',
    fill: '#6366F1',
    border: 'border-indigo-100',
    title: 'text-indigo-700',
    skills: ["디지털 리터러시", "전략적 커뮤니케이션", "자기주도적 성과관리", "프로페셔널 매너"],
  },
  Basic: {
    label: 'Basic',
    color: '#10B981',
    fill: '#10B981',
    border: 'border-emerald-100',
    title: 'text-emerald-700',
    skills: ["제/상품 및 시공 절차", "시장 및 산업 인사이트", "현장 대응 및 문제해결", "고객관계 구축"],
  },
  Curator: {
    label: 'Curator',
    color: '#8B5CF6',
    fill: '#8B5CF6',
    border: 'border-violet-100',
    title: 'text-violet-700',
    skills: ["통합 솔루션 제안", "가치 창출 크로스셀링", "전략적 시장 리딩", "파트너십 매니지먼트"],
  },
};

const GroupRadarChart = ({ group, data, color, fill }) => (
  <ResponsiveContainer width="100%" height={240}>
    <RadarChart
      outerRadius="75%"
      data={data}
      margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
    >
      <PolarGrid stroke="#e5e7eb" />
      <PolarAngleAxis
        dataKey="subject"
        tick={{ fontSize: 10, fill: '#6b7280' }}
      />
      <PolarRadiusAxis
        angle={30}
        domain={[0, 100]}
        tick={{ fontSize: 9, fill: '#9ca3af' }}
        tickCount={4}
      />
      <Radar
        dataKey="score"
        stroke={color}
        fill={fill}
        fillOpacity={0.35}
        strokeWidth={2}
      />
    </RadarChart>
  </ResponsiveContainer>
);

export const CompeAnalysis = () => {
  const [memo, setMemo] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!memo.trim()) return alert("메모를 입력해주세요!");

    setLoading(true);
    setAnalysisResult(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '서버 오류');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("분석 실패:", err);
      alert("분석 중 오류가 발생했습니다: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 그룹별 레이더 차트용 데이터 변환
  const toChartData = (groupKey) =>
    GROUPS[groupKey].skills.map((skill) => ({
      subject: skill,
      score: analysisResult?.[groupKey]?.[skill] ?? 0,
      fullMark: 100,
    }));

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">오늘의 역량분석</h1>

      {/* Solo 캐릭터 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 mb-8 flex items-center gap-4">
        <img src={soloCharacter} alt="솔로 캐릭터" className="w-20 h-20" />
        <div>
          <h2 className="text-lg font-bold">오늘의 영업은 어땠나요?</h2>
          <p className="text-sm text-gray-500">
            세일즈 메모를 넣으면 Solo가 당신의{' '}
            <span className="text-indigo-600 font-bold">12가지 핵심 역량</span>을 분석해드릴게요!
          </p>
        </div>
      </div>

      {/* 입력 */}
      <textarea
        className="w-full h-40 p-4 rounded-2xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-400 outline-none resize-none text-sm"
        placeholder="Q&A 형식의 세일즈 메모를 붙여넣으세요..."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            분석 중...
          </span>
        ) : '분석 시작하기'}
      </button>

      {/* 분석 결과 */}
      {analysisResult && (
        <div className="mt-8 space-y-6">

          {/* 그룹별 레이더 차트 3개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(GROUPS).map(([groupKey, group]) => (
              <div key={groupKey} className={`bg-white rounded-2xl border ${group.border} shadow-sm p-4`}>
                <h3 className={`font-bold text-sm mb-2 ${group.title}`}>{group.label} 역량</h3>
                <GroupRadarChart
                  group={groupKey}
                  data={toChartData(groupKey)}
                  color={group.color}
                  fill={group.fill}
                />
                {/* 점수 목록 */}
                <div className="mt-2 space-y-1.5">
                  {GROUPS[groupKey].skills.map((skill) => (
                    <div key={skill} className="flex justify-between text-[11px]">
                      <span className="text-gray-500 truncate mr-2">{skill}</span>
                      <span className="font-bold text-gray-700 flex-shrink-0">
                        {analysisResult[groupKey]?.[skill] ?? 0}점
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Solo 피드백 */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex gap-4 items-start">
            <img src={soloCharacter} alt="솔로" className="w-12 h-12 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-indigo-800 mb-1">Solo의 코칭 리포트</h4>
              <p className="text-sm text-indigo-700 leading-relaxed">{analysisResult.Feedback}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};


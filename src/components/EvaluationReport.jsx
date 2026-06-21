import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const EvaluationReport = ({ reportData }) => {
  // 1. 데이터가 없을 경우 기본값 설정 (기본 30점)
  const defaultScores = { '신뢰/관계': 30, '니즈 파악': 30, '솔루션 제안': 30, '매너': 30 };
  const scores = reportData?.scores || defaultScores;
  
  // 차트용 데이터 형식 변환
  const data = Object.keys(scores).map(key => ({
    subject: key,
    A: scores[key],
    fullMark: 100,
  }));

  // 2. 내용 가져오기 (데이터 없으면 빈 배열)
  const 핵심노하우 = reportData?.핵심노하우 || ["대화 분석을 통해 맞춤형 노하우가 생성됩니다."];
  const 주의점 = reportData?.주의점 || ["대화를 분석 중입니다."];

  return (
    <div className="space-y-6">
      {/* 레이더 차트 */}
      <div className="h-64 w-full bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* 항목별 점수 */}
<div className="grid grid-cols-2 gap-3">
  {Object.entries(scores).map(([key, value]) => (
    <div key={key} className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{key}</p>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-purple-700">{value}</span>
        <span className="text-xs text-gray-400 mb-1">/ 100</span>
      </div>
      {/* 점수 바 */}
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
       const getScoreColor = (score) => {
  if (score >= 70) return 'bg-green-400';
  if (score >= 40) return 'bg-purple-400';
  return 'bg-red-400';
};
        <div
          className="h-full rounded-full bg-purple-400 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  ))}
</div>
      
      {/* 핵심 노하우 영역 */}
      <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
        <h3 className="font-bold text-purple-900 mb-3 text-lg">핵심 노하우</h3>
        <ul className="space-y-2">
          {핵심노하우.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start">
              <span className="text-purple-500 mr-2">•</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 주의점 (꿀Tip에서 변경) 영역 */}
      <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 shadow-sm">
        <h3 className="font-bold text-yellow-800 mb-3 text-lg">💡 이 점을 주의하세요!</h3>
        <ul className="space-y-2">
          {주의점.map((item, i) => (
            <li key={i} className="text-sm text-yellow-700 flex items-start">
              <span className="text-yellow-500 mr-2">!</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EvaluationReport;

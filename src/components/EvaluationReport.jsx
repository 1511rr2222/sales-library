import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

function EvaluationReport({ reportData }) {

  const chartData = [
    { subject: '신뢰/관계', A: reportData?.scores?.신뢰 || 0 },
    { subject: '니즈 파악', A: reportData?.scores?.니즈파악 || 0 },
    { subject: '솔루션 제안', A: reportData?.scores?.솔루션 || 0 },
    { subject: '매너', A: reportData?.scores?.매너 || 0 },
  ];

  return (
 <div className="p-6 bg-white rounded-2xl shadow-sm border border-purple-100">
      {/* 1. 성공/실패 뱃지 */}
      <div className="text-center mb-6">
        <span className={`px-4 py-2 rounded-full font-bold ${reportData.status === '성공' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {reportData.status === '성공' ? '🎉 성공적인 상담!' : '더 나은 제안을 위한 연습'}
        </span>
      </div>

      {/* 2. 가시적인 그래프 */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <Radar name="능력" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. 핵심 노하우 */}
      <div className="mb-6 p-4 bg-purple-50 rounded-xl">
        <h3 className="font-bold text-purple-900 mb-2">핵심 노하우</h3>
        <p className="text-sm text-purple-700">{reportData.노하우}</p>
      </div>

      {/* 4. 꿀 Tip! */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
        <h3 className="font-bold text-yellow-800 mb-2">💡 꿀 Tip!</h3>
        <p className="text-sm text-yellow-700">{reportData.꿀팁}</p>
      </div>
    </div>
  );
}

export default EvaluationReport;
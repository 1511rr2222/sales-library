import React, { useState, useEffect } from 'react';

const CompeAnalysis = () => {
  const [memo, setMemo] = useState('');
  const [competences, setCompetences] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. 시트에서 역량 데이터 로드
  useEffect(() => {
    fetch('/api/competences')
      .then(res => res.json())
      .then(data => setCompetences(data))
      .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  // 2. 메모 분석 요청
  const handleAnalyze = async () => {
    setLoading(true);
    // 여기서 AI 분석을 위한 API 호출 (역량 데이터와 메모를 함께 전달)
    // 실제 구현 시에는 이 로직을 백엔드 AI 호출 로직으로 연결하세요.
    setTimeout(() => {
      setAnalysisResult({
        Common: { "디지털 리터러시": 85, "전략적 커뮤니케이션": 70, "자기주도적 성과관리": 90, "프로페셔널 매너": 75 },
        Basic: { "제/상품 및 시공 절차": 80, "시장 및 산업 인사이트": 65, "현장 대응 및 문제해결": 85, "고객관계 구축": 95 },
        Curator: { "통합 솔루션 제안": 60, "가치 창출 크로스셀링": 70, "전략적 시장 리딩": 55, "파트너십 매니지먼트": 80 },
        Feedback: "오늘 메모는 '고객관계 구축' 역량이 매우 훌륭합니다. 특히 도입 반대 의견에 대한 Q4 대응이 탁월했습니다!"
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">오늘의 역량분석</h1>
      
      {/* Solo 캐릭터 응원 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 mb-8 flex items-center gap-4">
        <div className="text-5xl">🐱</div>
        <div>
          <h2 className="text-lg font-bold">오늘의 영업은 어땠나요?</h2>
          <p className="text-sm text-gray-500">
            세일즈 메모를 넣으면 Solo가 당신의 <span className="text-indigo-600 font-bold">12가지 핵심 역량</span>을 분석해드릴게요! 
          </p>
        </div>
      </div>

      <textarea 
        className="w-full h-32 p-4 rounded-2xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
        placeholder="Q&A 형식의 세일즈 메모를 붙여넣으세요..."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <button 
        onClick={handleAnalyze}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
      >
        {loading ? "분석 중..." : "분석 시작하기"}
      </button>

      {/* 분석 결과 카드 */}
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {["Common", "Basic", "Curator"].map((group) => (
            <div key={group} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">{group} 역량</h3>
              {Object.entries(analysisResult[group]).map(([name, score]) => (
                <div key={name} className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="truncate mr-2">{name}</span>
                    <span>{score}점</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="col-span-full mt-4 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h4 className="font-bold text-indigo-800 mb-2">Solo의 코칭 레포트</h4>
            <p className="text-sm text-indigo-700">{analysisResult.Feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompeAnalysis;
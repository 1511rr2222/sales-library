import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompetencies, getEpisodes } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import RoleplayPanel from '../components/RoleplayPanel';
import AboutPage from '../components/AboutPage';
import CompetencyInfo from '../components/CompetencyInfo';

function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  
  const location = useLocation();
  const [competencies, setCompetencies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [view, setView] = useState('competency');   
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [selectedSituation, setSelectedSituation] = useState('All');  
  const navigate = useNavigate();

  useEffect(() => {
    // 롤플레잉 페이지에서 돌아왔을 때 탭 자동 전환
    if (location.state?.from === 'roleplay') {
      setView('roleplay');
    }
  }, [location]);

  useEffect(() => {
    Promise.all([
      getCompetencies().then(setCompetencies),
      getEpisodes().then(setEpisodes)
    ]).then(() => setLoading(false));
  }, []);

  const customerTypes = [...new Set(episodes.flatMap(e => [e.고객유형_01, e.고객유형_02]).filter(Boolean))];
  const situations = [...new Set(episodes.flatMap(e => [e.문제상황_01, e.문제상황_02]).filter(Boolean))];  

  const areas = [
    { name: 'Common', subtitle: '영업을 위한 기본적인 스킬', color: 'border-gray-500', light: 'bg-white' },
    { name: 'Basic', subtitle: '단계별 영업 핵심 스킬', color: 'border-blue-500', light: 'bg-blue-50' },
    { name: 'Curator', subtitle: '고객 맞춤형 큐레이션 스킬', color: 'border-green-500', light: 'bg-green-50' },
  ];

  const filteredEpisodes = episodes.filter(e => 
  (selectedCustomer === 'All' || e.고객유형_01 === selectedCustomer || e.고객유형_02 === selectedCustomer) &&
  (selectedSituation === 'All' || e.문제상황_01 === selectedSituation || e.문제상황_02 === selectedSituation)
  );

  const filteredCompetencies = competencies;

  if (loading) return <LoadingSpinner />;

  return (
<div className="flex min-h-screen bg-gray-50">
    {/* 좌측 패널 (사이드바) */}
    <div className={`transition-all duration-300 bg-white border-r h-screen flex flex-col ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 w-full">
        <div className="space-y-1.5 flex flex-col items-center">
          <div className="w-6 h-0.5 bg-gray-600"></div>
          <div className="w-6 h-0.5 bg-gray-600"></div>
          <div className="w-6 h-0.5 bg-gray-600"></div>
        </div>
      </button>

      {/* 펼쳐졌을 때만 보이는 메뉴 */}
      {isSidebarOpen && (
        <nav className="flex-1 mt-4 px-2">
          <button onClick={() => setView('AboutPage')} className="block w-full text-left p-3 hover:bg-gray-100 rounded">Sales Library 설명</button>
          <button onClick={() => setView('CompetencyInfo')} className="block w-full text-left p-3 hover:bg-gray-100 rounded">역량별 설명</button>
        </nav>
      )}

      {/* 로고 영역 (사이드바 하단에 항상 고정) */}
      <div className="mt-auto p-4 border-t flex flex-col items-center justify-center">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
      </div>
    </div>
    
      {/* PAGE CONTAINER */}
      <div className="max-w-4xl w-full mx-auto flex-1 px-4 py-4 md:p-8">
        <Header />

        {/* SWITCH */}
        <div className="mt-6 mb-8">
          <div className="relative inline-flex w-[360px] bg-gray-200 rounded-full p-1">
            <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(33.33%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
            view === 'roleplay' ? 'translate-x-[100%]' : view === 'allEpisodes' ? 'translate-x-[200%]' : 'translate-x-0'
              }`}
            />
            <button onClick={() => setView('competency')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'competency' ? 'text-gray-800' : 'text-gray-500'}`}>
              역량
            </button>
            <button onClick={() => setView('roleplay')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'roleplay' ? 'text-gray-800' : 'text-gray-500'}`}>
              롤플레잉
            </button>
            <button onClick={() => setView('allEpisodes')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'allEpisodes' ? 'text-gray-800' : 'text-gray-500'}`}>
              전체 에피소드
            </button>
          </div>
        </div>

        {/* VIEW AREA */}
<div className="relative min-h-[600px]">
<div className={`transition-all duration-300 ${view === 'allEpisodes' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
    <h3 className="font-bold text-lg mb-4 text-blue-800">모든 에피소드 ({episodes.length}건)</h3>
    <div className="grid gap-3">
      {episodes.map(e => (
        <div 
          key={e.episode_id} 
          onClick={() => navigate(`/episode/${e.episode_id}`)}
          className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-blue-400"
        >
          <p className="font-bold text-base text-gray-900">{e.제목}</p>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{e.개요 || "상세 설명이 없습니다."}</p>
        </div>
      ))}
    </div>
  </div>
  {/* COMPETENCY VIEW */}
<div className={`transition-all duration-300 ${view === 'competency' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute inset-0'}`}>
  
  <div className="flex gap-4 mb-8">
    <select className="flex-1 p-3 rounded-xl border border-gray-200 text-sm" onChange={(e) => setSelectedCustomer(e.target.value)}>
      <option value="All">고객 유형 전체</option>
      {customerTypes.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
    <select className="flex-1 p-3 rounded-xl border border-gray-200 text-sm" onChange={(e) => setSelectedSituation(e.target.value)}>
      <option value="All">문제 상황 전체</option>
      {situations.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  </div>

  {/* ABOUT PAGE VIEW */} 
  <div className={`transition-all duration-300 ${view === 'about' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute inset-0'}`}>
    <AboutPage /> </div>
  {/* COMPETENCY INFO VIEW */}
  <div className={`transition-all duration-300 ${view === 'info' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute inset-0'}`}>
  <CompetencyInfo /></div>


  {/* // [수정] 필터가 선택되었는지 확인 (All이 아니면 필터링 모드) */}
  {(selectedCustomer !== 'All' || selectedSituation !== 'All') ? (
    <div className="mb-10">
      <h3 className="font-bold text-lg mb-4 text-purple-800">
        검색된 에피소드 ({filteredEpisodes.length}건)
        </h3>
      <div className="grid gap-3">
      {filteredEpisodes.map(e => (
        <div 
          key={e.episode_id} 
          onClick={() => navigate(`/episode/${e.episode_id}`)} 
          className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-purple-400"
        >
          {/* // [수정: EpisodePage 코드의 'episode.제목'과 일치시킴] */}
          <p className="font-bold text-base text-gray-900">{e.제목}</p>
          
          {/* // [수정: EpisodePage 코드의 'episode.개요'와 일치시킴] */}
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {e.개요 || "상세 설명이 없습니다."}
          </p>
          
          {/* // [선택] 태그 영역을 넣고 싶다면 여기 e.competency_id_1 등을 활용하세요 */}
        </div>
      ))}
    </div>
  </div>
) : ( 
    /* // [수정] 필터가 없을 때만 기존 역량 리스트를 보여줌 */
    areas.map(area => (
      <div key={area.name} className="mb-10">
        <div className={`mb-4 border-l-4 ${area.color} pl-3`}>
          <h2 className="text-xl font-bold leading-tight">{area.name}</h2>
          {area.subtitle && <p className="text-xs text-gray-400 mt-0.5">{area.subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {competencies
            .filter(c => c.영역 === area.name)
            .map(competency => (
              <div
                key={competency.competency_id}
                onClick={() => navigate(`/skill/${competency.competency_id}`)}
                className={`${area.light} rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 border border-gray-100`}
              >
                <div className="text-4xl mb-4">{competency.아이콘}</div>
                <div className="font-bold text-sm text-gray-900 mb-1.5">{competency.역량명}</div>
                <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                  {competency.설명 || "역량 학습 페이지로 이동"}
                </p>
              </div>
            ))}
        </div>
      </div>
    ))
  )}
</div>

  {/* ROLEPLAY VIEW */}
  {view === 'roleplay' && (
    <div className="transition-all duration-300 opacity-100">
      <RoleplayPanel 
      episodes={episodes} 
      competencies={competencies}
      selectedCustomer={selectedCustomer}
      selectedSituation={selectedSituation}
       />
    </div>
  )}
</div>
      </div>
      <Footer />
    </div>
  );
}

export default MainPage;
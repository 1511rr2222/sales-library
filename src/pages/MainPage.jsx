import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompetencies, getEpisodes, getMentors } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import RoleplayPanel from '../components/RoleplayPanel';
import { AboutPage } from '../components/AboutPage';
import { CompetencyInfo } from '../components/CompetencyInfo';
import Avatar from 'boring-avatars';

function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [competencies, setCompetencies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [view, setView] = useState('competency');
  const [loading, setLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [selectedSituation, setSelectedSituation] = useState('All');
  const navigate = useNavigate();

  const getColor = (name) => {
    if (['디지털 리터러시', '전략적 커뮤니케이션', '자기주도적 성과관리', '프로페셔널 매너'].includes(name))
      return 'bg-gray-100 text-gray-600';
    if (['제/상품 및 시공절차', '시장 및 산업 인사이트', '현장대응 및 문제해결', '고객관계 구축'].includes(name))
      return 'bg-blue-50 text-blue-600';
    if (['통합솔루션', '가치 창출 크로스셀링', '전략적 시장리딩', '파트너십 매니지먼트'].includes(name))
      return 'bg-green-50 text-green-700';
    return 'bg-indigo-50 text-indigo-500';
  };

  useEffect(() => {
    if (location.state?.from === 'roleplay') {
      setView('roleplay');
    }
  }, [location]);

  useEffect(() => {
    Promise.all([
      getCompetencies().then(setCompetencies),
      getEpisodes().then(setEpisodes),
      getMentors().then(setMentors)
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ✅ 수정: 모바일에서 사이드바 열렸을 때 dimmed backdrop - 클릭 시 닫힘 */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ✅ 수정: 모바일에서 fixed overlay, 데스크탑에서 기존 방식 유지 */}
      <div className={`
        fixed md:relative z-40
        transition-all duration-300
        bg-white border-r h-screen flex flex-col
        ${isSidebarOpen ? 'w-48' : 'w-0 md:w-16 overflow-hidden'}
      `}>
        {/* 데스크탑 전용 햄버거 버튼 */}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block p-4 w-full">
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-6 h-0.5 bg-gray-600"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
          </div>
        </button>
        {isSidebarOpen && (
          <nav className="flex-1 mt-4 px-2 pt-10 md:pt-0">
            <button onClick={() => { setView('AboutPage'); setIsSidebarOpen(false); }} className="block w-full text-left p-3 hover:bg-gray-100 rounded">Sales Library 설명</button>
            <button onClick={() => { setView('CompetencyInfo'); setIsSidebarOpen(false); }} className="block w-full text-left p-3 hover:bg-gray-100 rounded">역량별 설명</button>
          </nav>
        )}
      </div>

      {/* PAGE CONTAINER */}
      {/* ✅ 수정: 모바일에서 전체 너비 사용 (사이드바가 fixed라 공간 차지 안 함) */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* ✅ 수정: 모바일 전용 햄버거 버튼 - 헤더 왼쪽에 고정 */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-5 h-0.5 bg-gray-600"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
          </div>
        </button>

        <div className="py-3 md:py-5">
          <Header />
        </div>
        <main className="flex-grow max-w-4xl w-full mx-auto flex-1 px-4 py-2 md:p-6">
          {/* SWITCH */}
          {!isSidebarOpen && (
          <div className="mt-6 mb-8">
            <div className="relative inline-flex w-[360px] bg-gray-200 rounded-full p-1">
              <div className={`absolute top-1 bottom-1 left-1 w-[calc(33.33%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                  view === 'roleplay' ? 'translate-x-[100%]' : view === 'allEpisodes' ? 'translate-x-[200%]' : 'translate-x-0' }`}
              />
              <button onClick={() => setView('competency')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'competency' ? 'text-gray-800' : 'text-gray-500'}`}>
                역량</button>
              <button onClick={() => setView('roleplay')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'roleplay' ? 'text-gray-800' : 'text-gray-500'}`}>
                롤플레잉</button>
              <button onClick={() => setView('allEpisodes')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'allEpisodes' ? 'text-gray-800' : 'text-gray-500'}`}>
                전체 에피소드</button>
            </div>
          </div>
          )}

          {/* VIEW AREA */}
          <div className="relative min-h-[100vh]">

            {/* 전체에피소드 목록 view */}
            <div className={`transition-all duration-300 ${view === 'allEpisodes' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
              <h3 className="font-bold text-lg mb-4 text-blue-800">모든 에피소드 ({episodes.length}건)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {episodes.map(episode => {
                  const mentor = mentors.find(m => String(m.mentor_id) === String(episode.mentor_id));
                  return (
                    <div key={episode.episode_id} className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                      <h1 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">
                        {episode.제목}
                      </h1>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {[
                          episode.competency_id_1,
                          episode.competency_id_2,
                          episode.competency_id_3,
                          episode.competency_id_4
                        ]
                          .filter(Boolean)
                          .map(id => {
                            const competency = competencies.find(c => String(c.competency_id) === String(id));
                            return competency ? (
                              <span
                                key={id}
                                onClick={() => navigate(`/skill/${competency.competency_id}`)}
                                className={`${getColor(competency.역량명)} text-[10px] px-2 py-0.5 rounded cursor-pointer`}
                              >
                                #{competency.역량명}
                              </span>
                            ) : null;
                          })}
                      </div>
                      {mentor && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            size={20}
                            name={mentor.mentor_id}
                            variant="beam"
                            colors={["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1", "#96CEB4"]}
                          />
                          <div className="text-[10px] font-medium text-gray-400 truncate">
                            {mentor.팀} | {mentor['담당 상품']}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

              {(selectedCustomer !== 'All' || selectedSituation !== 'All') ? (
                <div className="mb-10">
                  <h3 className="font-bold text-lg mb-4 text-purple-800">
                    검색된 에피소드 ({filteredEpisodes.length}건)
                  </h3>
                  <div className="space-y-4">
                    {filteredEpisodes.map(e => {
                      const mentor = mentors.find(m => String(m.mentor_id) === String(e.mentor_id));
                      return (
                        <div
                          key={e.episode_id}
                          onClick={() => navigate(`/episode/${e.episode_id}`)}
                          className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all border-l-4 border-l-purple-400"
                        >
                          <h1 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
                            {e.제목}
                          </h1>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {[
                              e.competency_id_1,
                              e.competency_id_2,
                              e.competency_id_3,
                              e.competency_id_4
                            ]
                              .filter(Boolean)
                              .map(id => {
                                const competency = competencies.find(c => String(c.competency_id) === String(id));
                                return competency ? (
                                  <span
                                    key={id}
                                    onClick={(ev) => { ev.stopPropagation(); navigate(`/skill/${competency.competency_id}`); }}
                                    className={`${getColor(competency.역량명)} text-xs px-3 py-1 rounded-md cursor-pointer`}
                                  >
                                    #{competency.역량명}
                                  </span>
                                ) : null;
                              })}
                          </div>
                          {mentor && (
                            <div className="flex items-center gap-3">
                              <Avatar
                                size={32}
                                name={mentor.mentor_id}
                                variant="beam"
                                colors={["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1", "#96CEB4"]}
                              />
                              <div className="text-xs md:text-sm font-medium text-gray-400">
                                {mentor.팀} | {mentor['담당 상품']}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
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
                          <div key={competency.competency_id}
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
            <div className={`transition-all duration-300 ${view === 'roleplay' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute inset-0'}`}>
              <RoleplayPanel
                episodes={episodes}
                competencies={competencies}
                selectedCustomer={selectedCustomer}
                selectedSituation={selectedSituation}
              />
            </div>

            {/* ABOUT PAGE VIEW */}
            <div className={`transition-all duration-300 ${view === 'AboutPage' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute inset-0'}`}>
              <AboutPage />
            </div>

            {/* COMPETENCY INFO VIEW */}
            <div className={`transition-all duration-300 ${view === 'CompetencyInfo' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute inset-0'}`}>
              <CompetencyInfo />
            </div>

          </div>
          {/* VIEW AREA 끝 */}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default MainPage;

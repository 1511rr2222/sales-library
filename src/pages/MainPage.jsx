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
import { CompeAnalysis } from '../components/CompeAnalysis';
import Avatar from 'boring-avatars';
import { BookOpen, Award, BarChart2 } from 'lucide-react';

function MainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [competencies, setCompetencies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [view, setView] = useState('competency');
  const [loading, setLoading] = useState(true);
  const [hoveredMenu, setHoveredMenu] = useState(null);

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

  const viewClass = (name) =>
    view === name
      ? 'transition-all duration-300 opacity-100'
      : 'transition-all duration-300 opacity-0 pointer-events-none absolute inset-0 h-0 overflow-hidden';

  // 사이드바 메뉴 목록
  const menuItems = [
    { key: 'AboutPage', label: 'Sales Library 설명', icon: BookOpen },
    { key: 'CompetencyInfo', label: '역량별 설명', icon: Award },
    { key: 'CompeAnalysis', label: '오늘의 역량', icon: BarChart2 },
  ];

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">

      {/* 모바일 dimmed backdrop */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── 사이드바 ── */}
      {/* 모바일: fixed 오버레이 / 데스크탑: fixed w-16 항상 표시 */}
      <div className={`
        fixed z-40 h-full bg-white border-r flex flex-col
        transition-all duration-300
        ${isSidebarOpen ? 'w-48' : 'w-0 md:w-16'}
        overflow-hidden
      `}>

        {/* 데스크탑 햄버거 */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex p-4 w-full items-center justify-center"
        >
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-6 h-0.5 bg-gray-600" />
            <div className="w-6 h-0.5 bg-gray-600" />
            <div className="w-6 h-0.5 bg-gray-600" />
          </div>
        </button>

        {/* 모바일: 열렸을 때 상단 닫기 여백 */}
        <div className="md:hidden h-14" />

        {/* 메뉴 아이템 */}
        <nav className="flex-1 px-2 flex flex-col gap-1">
          {menuItems.map(({ key, label, icon: Icon }) => (
            <div key={key} className="relative group">
              <button
                onClick={() => { setView(key); setIsSidebarOpen(false); }}
                onMouseEnter={() => setHoveredMenu(key)}
                onMouseLeave={() => setHoveredMenu(null)}
                className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded text-left"
              >
                {/* 아이콘: 항상 표시 */}
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${view === key ? 'text-indigo-600' : 'text-gray-500'}`}
                />
                {/* 텍스트: 사이드바 열렸을 때만 표시 */}
                <span className={`
                  text-sm whitespace-nowrap overflow-hidden
                  transition-all duration-200
                  ${isSidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}
                  ${view === key ? 'text-indigo-600 font-medium' : 'text-gray-700'}
                `}>
                  {label}
                </span>
              </button>

              {/* 데스크탑 닫힌 상태 툴팁 */}
              {!isSidebarOpen && hoveredMenu === key && (
                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50">
                  <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    {label}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* ── PAGE CONTAINER ── */}
      {/* 데스크탑: 사이드바(w-16) 고정 공간만큼 pl-16 확보 */}
      <div className="flex-1 min-h-0 overflow-y-auto md:pl-16">
        <div className="flex flex-col">

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="w-5 h-0.5 bg-gray-600" />
              <div className="w-5 h-0.5 bg-gray-600" />
              <div className="w-5 h-0.5 bg-gray-600" />
            </div>
          </button>

          <div className="py-3 md:py-5">
            <Header />
          </div>

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-2 md:p-6">

            {/* SWITCH */}
            <div className="mt-6 mb-8">
              <div className="relative inline-flex w-[360px] bg-gray-200 rounded-full p-1">
                <div className={`absolute top-1 bottom-1 left-1 w-[calc(33.33%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                  view === 'roleplay' ? 'translate-x-[100%]' : view === 'allEpisodes' ? 'translate-x-[200%]' : 'translate-x-0'
                }`} />
                <button onClick={() => setView('competency')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'competency' ? 'text-gray-800' : 'text-gray-500'}`}>역량</button>
                <button onClick={() => setView('roleplay')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'roleplay' ? 'text-gray-800' : 'text-gray-500'}`}>롤플레잉</button>
                <button onClick={() => setView('allEpisodes')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'allEpisodes' ? 'text-gray-800' : 'text-gray-500'}`}>전체 에피소드</button>
              </div>
            </div>

            {/* VIEW AREA */}
            <div className="relative">

              {/* 전체 에피소드 */}
              <div className={viewClass('allEpisodes')}>
                <h3 className="font-bold text-lg mb-4 text-blue-800">모든 에피소드 ({episodes.length}건)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {episodes.map(episode => {
                    const mentor = mentors.find(m => String(m.mentor_id) === String(episode.mentor_id));
                    return (
                      <div key={episode.episode_id} 
                      onClick={() => navigate(`/episode/${episode.episode_id}`)} 
                       className="bg-gray-50 rounded-lg p-3 border border-gray-300 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all" 
                      >  
                  <h1 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2">{episode.제목}</h1>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {[episode.competency_id_1, episode.competency_id_2, episode.competency_id_3, episode.competency_id_4]
                            .filter(Boolean)
                            .map(id => {
                              const competency = competencies.find(c => String(c.competency_id) === String(id));
                              return competency ? (
                                <span
                                  key={id}
                                  onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigate(`/skill/${competency.competency_id}`); 
                                  }}
                                  className={`${getColor(competency.역량명)} text-[10px] px-2 py-0.5 rounded cursor-pointer`}
                                >
                                  #{competency.역량명}
                                </span>
                              ) : null;
                            })}
                        </div>
                        {mentor && (
                          <div className="flex items-center gap-2">
                            <Avatar size={20} name={mentor.mentor_id} variant="beam" colors={["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1", "#96CEB4"]} />
                            <div className="text-[10px] font-medium text-gray-400 truncate">{mentor.팀} | {mentor['담당 상품']}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMPETENCY VIEW */}
              <div className={viewClass('competency')}>
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
                    <h3 className="font-bold text-lg mb-4 text-purple-800">검색된 에피소드 ({filteredEpisodes.length}건)</h3>
                    <div className="space-y-4">
                      {filteredEpisodes.map(e => {
                        const mentor = mentors.find(m => String(m.mentor_id) === String(e.mentor_id));
                        return (
                          <div
                            key={e.episode_id}
                            onClick={() => navigate(`/episode/${e.episode_id}`)}
                            className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all border-l-4 border-l-purple-400"
                          >
                            <h1 className="text-lg md:text-xl font-bold text-gray-800 mb-3">{e.제목}</h1>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {[e.competency_id_1, e.competency_id_2, e.competency_id_3, e.competency_id_4]
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
                                <Avatar size={32} name={mentor.mentor_id} variant="beam" colors={["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1", "#96CEB4"]} />
                                <div className="text-xs md:text-sm font-medium text-gray-400">{mentor.팀} | {mentor['담당 상품']}</div>
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
              <div className={viewClass('roleplay')}>
                <RoleplayPanel
                  episodes={episodes}
                  competencies={competencies}
                  selectedCustomer={selectedCustomer}
                  selectedSituation={selectedSituation}
                />
              </div>

              {/* ABOUT PAGE VIEW */}
              <div className={viewClass('AboutPage')}>
                <AboutPage />
              </div>

              {/* COMPETENCY INFO VIEW */}
              <div className={viewClass('CompetencyInfo')}>
                <CompetencyInfo />
              </div>

              {/* COMPE ANALYSIS VIEW */}
              <div className={viewClass('CompeAnalysis')}>
                <CompeAnalysis />
              </div>

            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
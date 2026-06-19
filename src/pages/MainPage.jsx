import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompetencies, getEpisodes } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import RoleplayPanel from '../components/RoleplayPanel';

function MainPage() {
  const location = useLocation();
  const [competencies, setCompetencies] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [view, setView] = useState('competency'); // 기본 탭
  const [loading, setLoading] = useState(true);

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

  const areas = [
    { name: 'Common', subtitle: '영업을 위한 기본적인 스킬', color: 'border-gray-500', light: 'bg-white' },
    { name: 'Basic', subtitle: '단계별 영업 핵심 스킬', color: 'border-blue-500', light: 'bg-blue-50' },
    { name: 'Curator', subtitle: '고객 맞춤형 큐레이션 스킬', color: 'border-green-500', light: 'bg-green-50' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* PAGE CONTAINER */}
      <div className="max-w-4xl w-full mx-auto flex-1 px-4 py-4 md:p-8">
        <Header />

        {/* SWITCH */}
        <div className="mt-6 mb-8">
          <div className="relative inline-flex w-52 bg-gray-200 rounded-full p-1">
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                view === 'roleplay' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            <button onClick={() => setView('competency')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'competency' ? 'text-gray-800' : 'text-gray-500'}`}>
              역량
            </button>
            <button onClick={() => setView('roleplay')} className={`relative z-10 flex-1 py-2 text-sm text-center ${view === 'roleplay' ? 'text-gray-800' : 'text-gray-500'}`}>
              롤플레잉
            </button>
          </div>
        </div>

        {/* VIEW AREA */}
        <div className="relative min-h-[600px]">
          {/* COMPETENCY VIEW */}
          <div className={`transition-all duration-300 ${view === 'competency' ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-4 absolute inset-0'}`}>
            {areas.map(area => (
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
                        className={`${area.light} rounded-xl p-5 shadow-sm hover:shadow-lg cursor-pointer transition`}
                      >
                        <div className="text-3xl mb-3">{competency.아이콘}</div>
                        <div className="font-semibold text-sm">{competency.역량명}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* ROLEPLAY VIEW */}
          {view === 'roleplay' && (
            <div className="transition-all duration-300 opacity-100">
              <RoleplayPanel episodes={episodes} competencies={competencies} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MainPage;
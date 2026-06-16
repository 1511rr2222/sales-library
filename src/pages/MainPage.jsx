import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMentors, getCompetencies } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import Avatar from 'boring-avatars';

function MainPage() {
  const [competencies, setCompetencies] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [view, setView] = useState('competency');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      getCompetencies().then(setCompetencies),
      getMentors().then(setMentors)
    ]).then(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'mentor') {
      setView('mentor');
    }
  }, [location]);

  const areas = [
    { name: 'Common', color: 'border-gray-500', light: 'bg-white' },
    { name: 'Basic', color: 'border-blue-500', light: 'bg-blue-50' },
    { name: 'Curator', color: 'border-green-500', light: 'bg-green-50' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* PAGE CONTAINER */}
      <div className="max-w-4xl mx-auto w-full flex-1 p-8">

          {/* HEADER (통일 기준) */}
          <Header />

          {/* SWITCH */}
          <div className="mt-6 mb-8">
            <div className="relative inline-flex bg-gray-200 rounded-full p-1">
              <div
                className={`absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ${
                  view === 'competency'
                    ? 'left-1 right-[calc(50%+2px)]'
                    : 'left-[calc(50%+2px)] right-1'
                }`}
              />
              <button
                onClick={() => setView('competency')}
                className={`relative z-10 px-6 py-2 text-sm ${
                  view === 'competency' ? 'text-gray-800' : 'text-gray-500'
                }`}
              >
                역량
              </button>
              <button
                onClick={() => setView('mentor')}
                className={`relative z-10 px-6 py-2 text-sm ${
                  view === 'mentor' ? 'text-gray-800' : 'text-gray-500'
                }`}
              >
                멘토
              </button>
            </div>
          </div>

          {/* VIEW AREA */}
          <div className="relative min-h-[600px]">

            {/* COMPETENCY VIEW */}
            <div
              className={`transition-all duration-300 ${
                view === 'competency'
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 pointer-events-none translate-x-4'
              }`}
            >
              {areas.map(area => (
                <div key={area.name} className="mb-10">
                  <h2 className={`text-xl font-bold mb-4 border-l-4 ${area.color} pl-3`}>
                    {area.name}
                  </h2>

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
                          <div className="font-semibold text-sm">
                            {competency.역량명}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* MENTOR VIEW */}
            <div
              className={`absolute inset-0 transition-all duration-300 ${
                view === 'mentor'
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 pointer-events-none -translate-x-4'
              }`}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mentors.map(mentor => (
                  <div
                    key={mentor.mentor_id}
                    onClick={() => navigate(`/mentor/${mentor.mentor_id}`)}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg cursor-pointer transition"
                  >
                    <div className="mb-3 flex justify-center">
                      <Avatar
                        size={64}
                        name={mentor.mentor_id}
                        variant="beam"
                        colors={["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1", "#96CEB4"]}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">
                        {mentor.이름} {mentor.직책}
                      </div>
                      <div className="text-xs text-gray-400">
                        {mentor.팀} | {mentor['담당 상품']}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default MainPage;
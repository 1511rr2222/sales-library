import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';import Header from '../components/Header';
import { getEpisodes, getMentors, getCompetencies } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatBot from '../components/ChatBot';
import Footer from '../components/Footer';
import RichText from '../components/RichText';
import Avatar from 'boring-avatars';

function EpisodePage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [episode, setEpisode] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true); // 로딩 시작 명시
    Promise.all([
      getEpisodes().then(data => {
        const found = data.find(e => String(e.episode_id) === String(episodeId));

        if (found) {
        setEpisode(found);
        return getMentors().then(mentors => {
            setMentor(mentors.find(m => m.mentor_id === found.mentor_id));
          });
        } else {
          console.error("에피소드를 찾을 수 없습니다. ID:", episodeId);
        }
      }),
      getCompetencies().then(data => setCompetencies(data))
    ]).then(() => setLoading(false));
  }, [episodeId]);


  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto">

        {location.state?.from === 'roleplay' && (
          <button 
            onClick={() => navigate('/roleplay')} 
            className="mb-4 flex items-center text-sm font-bold text-gray-500 hover:text-gray-800"
          >
            &lt; 롤플레잉으로 돌아가기
          </button>
        )}

        <Header />

        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm">

          {/* ============================================ */}
          {/* 상단 블록: 제목 + 역량 태그 + 멘토           */}
          {/* ============================================ */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-400">

            {/* 제목 */}
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-5">
              {episode.제목}
            </h1>

            {/* 역량 태그 */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                episode.competency_id_1,
                episode.competency_id_2,
                episode.competency_id_3,
                episode.competency_id_4
              ]
              .filter(Boolean)
              .map(id => {
                const competency = competencies.find(
                  c => String(c.competency_id) === String(id)
                );
                return competency ? (
                  <span
                    key={id}
                    onClick={() => navigate(`/skill/${competency.competency_id}`)}
                    className={`${getColor(competency.역량명)} text-xs px-3 py-1 rounded-md cursor-pointer`}
                  >
                    #{competency.역량명}
                  </span>
                ) : null;
              })}
            </div>

            {/* 멘토 */}
            {mentor && (
              <div className="flex items-center gap-3">
                <Avatar
                  size={36}
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
          {/* ============================================ */}
          {/* 상단 블록 끝                                 */}
          {/* ============================================ */}


          {/* 개요 — SITUATION 바로 위 */}
          {episode.개요 && (
            <p className="text-base md:text-lg font-semibold text-gray-700 mb-6 leading-relaxed">
              {episode.개요}
            </p>
          )}


          {/* SITUATION */}
          <div className="mb-6">
            <h2 className="text-base md:text-lg font-bold text-indigo-600 mb-2">
              SITUATION
            </h2>
            <RichText
              text={episode['상황(SITUATION)']}
              highlights={episode['하이라이트_SITUATION']}
            />
          </div>

          {/* WHY IT MATTERS */}
          <div className="mb-6">
            <h2 className="text-base md:text-lg font-bold text-indigo-600 mb-2">
              WHY IT MATTERS
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {episode['Why It Matters']}
            </p>
          </div>

          {/* SALES TIP */}
          <div className="mb-6">
            <h2 className="text-base md:text-lg font-bold text-indigo-600 mb-2">
              SALES TIP
            </h2>
            <RichText
              text={episode['세일즈팁(SALES TIP)']}
              highlights={episode['하이라이트_SALES TIP']}
            />
          </div>

          {/* STAR */}
          <div className="mb-6">
            <h2 className="text-base md:text-lg font-bold text-indigo-600 mb-2">
              STAR 분석
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['상황', episode['STAR-상황']],
                ['과제', episode['STAR-과제']],
                ['행동', episode['STAR-행동']],
                ['결과', episode['STAR-결과']]
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <span className="text-xs font-bold text-indigo-600">{label}</span>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{value}</p>
                </div>
              ))}
            </div>
          </div>

{/* Checklist 영역 시작 */}
{episode.Checklist && (
  <div>
    <h2 className="text-base md:text-lg font-bold text-indigo-600 mb-2">
      Sales Checklist
    </h2>
    <div className="bg-indigo-50 rounded-xl p-4">
      {episode.Checklist.split('\n').map((tip, index) => (
        <div key={index} className="flex gap-2 text-sm mb-2">
          <span className="text-indigo-400">&#9634;</span>
          <span>{tip}</span>
        </div>
      ))}
    </div>
  </div>
)}
{/* Checklist 영역 끝 */}

        </div>
      </div>

      <ChatBot episode={episode} />
      <Footer />
    </div>
  );
}

export default EpisodePage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getEpisodes, getMentors, getCompetencies } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatBot from '../components/ChatBot';
import Footer from '../components/Footer';
import RichText from '../components/RichText';
import Avatar from 'boring-avatars';

function EpisodePage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEpisodes().then(data => {
        const found = data.find(e => e.episode_id === episodeId);
        setEpisode(found);

        if (found) {
          return getMentors().then(mentors => {
            setMentor(
              mentors.find(
                m => m.mentor_id === found.mentor_id
              )
            );
          });
        }
      }),

      getCompetencies().then(data =>
        setCompetencies(data)
      )
    ])
    .then(() => setLoading(false));
  }, [episodeId]);


  if (loading) return <LoadingSpinner />;


  return (
    <div
      className="
        min-h-screen
        bg-gray-50
        px-4
        py-4
        md:p-8
      "
    >

      <div
        className="
          max-w-3xl
          w-full
          mx-auto
        "
      >

        <Header />


        <div
          className="
            bg-white
            rounded-2xl
            p-5
            md:p-8
            shadow-sm
          "
        >

          {/* 제목 */}
          <h1
            className="
              text-xl
              md:text-3xl
              font-bold
              text-gray-800
              mb-2
            "
          >
            {episode.제목}
          </h1>


          {/* 개요 */}
          {episode.개요 && (
            <p
              className="
                text-sm
                md:text-base
                text-gray-500
                opacity-80
                mb-4 md:mb-6
                leading-relaxed
              "
            >
              {episode.개요}
            </p>
          )}


          {/* 역량 */}
          <div
            className="
              flex
              flex-wrap
              gap-2
              mb-5 md:mb-6
            "
          >
            {[
              episode.competency_id_1,
              episode.competency_id_2,
              episode.competency_id_3,
              episode.competency_id_4
            ]
            .filter(Boolean)
            .map(id => {
              const competency =
                competencies.find(
                  c => c.competency_id === id
                );

              return competency ? (
                <span
                  key={id}
                  onClick={() =>
                    navigate(
                      `/skill/${competency.competency_id}`
                    )
                  }
                  className="
                    bg-indigo-50
                    text-indigo-500
                    text-xs
                    px-3
                    py-1
                    rounded-md
                    cursor-pointer
                  "
                >
                  #{competency.역량명}
                </span>
              ) : null;
            })}
          </div>


          {/* 멘토 */}
          {mentor && (
            <div
              onClick={() =>
                navigate(`/mentor/${mentor.mentor_id}`)
              }
              className="
                flex
                items-center
                gap-3
                mt-4
                mb-5
                cursor-pointer
              "
            >

              <Avatar
                size={36}
                name={mentor.mentor_id}
                variant="beam"
                colors={[
                  "#FF6B6B",
                  "#FFE66D",
                  "#4ECDC4",
                  "#45B7D1",
                  "#96CEB4"
                ]}
              />

              <div>
                <div className="text-sm font-medium text-gray-800">
                  {mentor.이름}
                </div>

                <div className="text-xs text-gray-400">
                  {mentor.직책} | {mentor.팀} | 경력 {mentor.경력}년
                </div>

              </div>
            </div>
          )}


          {/* SITUATION */}
          <div className="mb-6">
            <h2
              className="
                text-base
                md:text-lg
                font-bold
                text-indigo-600
                mb-2
              "
            >
              SITUATION
            </h2>

            <RichText
              text={episode['상황(SITUATION)']}
              highlights={episode['하이라이트_SITUATION']}
            />
          </div>


          {/* WHY IT MATTERS */}
          <div className="mb-6">
            <h2
              className="
                text-base
                md:text-lg
                font-bold
                text-indigo-600
                mb-2
              "
            >
              WHY IT MATTERS
            </h2>

            <p
              className="
                text-gray-700
                leading-relaxed
                whitespace-pre-line
              "
            >
              {episode['Why It Matters']}
            </p>
          </div>


          {/* SALES TIP */}
          <div className="mb-6">
            <h2
              className="
                text-base
                md:text-lg
                font-bold
                text-indigo-600
                mb-2
              "
            >
              SALES TIP
            </h2>

            <RichText
              text={episode['세일즈팁(SALES TIP)']}
              highlights={episode['하이라이트_SALES TIP']}
            />
          </div>


          {/* STAR */}
          <div className="mb-6">

            <h2
              className="
                text-base
                md:text-lg
                font-bold
                text-indigo-600
                mb-2
              "
            >
              STAR 분석
            </h2>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-3
            ">

              {[
                ['상황', episode['STAR-상황']],
                ['과제', episode['STAR-과제']],
                ['행동', episode['STAR-행동']],
                ['결과', episode['STAR-결과']]
              ]
              .map(([label, value]) => (

                <div
                  key={label}
                  className="
                    bg-gray-50
                    rounded-xl
                    p-4
                  "
                >

                  <span
                    className="
                      text-xs
                      font-bold
                      text-indigo-600
                    "
                  >
                    {label}
                  </span>

                  <p className="
                    text-sm
                    text-gray-700
                    mt-2
                    whitespace-pre-line
                  ">
                    {value}
                  </p>

                </div>

              ))}

            </div>
          </div>


          {/* Checklist */}
          <div>

            <h2
              className="
                text-base
                md:text-lg
                font-bold
                text-indigo-600
                mb-2
              "
            >
              Sales Checklist
            </h2>

            <div
              className="
                bg-indigo-50
                rounded-xl
                p-4
              "
            >

              {episode.Checklist
                .split('\n')
                .map((tip, index) => (

                <div
                  key={index}
                  className="
                    flex
                    gap-2
                    text-sm
                    mb-2
                  "
                >
                  <span className="text-indigo-400">
                    ▢
                  </span>

                  <span>
                    {tip}
                  </span>

                </div>
              ))}

            </div>
          </div>


        </div>
      </div>


      <ChatBot episode={episode} />
      <Footer />

    </div>
  );
}

export default EpisodePage;
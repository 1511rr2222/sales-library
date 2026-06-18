import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMentors, getEpisodes, getCompetencies } from '../api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import Avatar from 'boring-avatars';

function MentorPage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [competencies, setCompetencies] = useState([]);

  useEffect(() => {
    Promise.all([
      getMentors().then(data => {
        setMentor(
          data.find(m => m.mentor_id === mentorId)
        );
      }),

      getEpisodes().then(data => {
        setEpisodes(
          data.filter(
            e =>
              e.mentor_id === mentorId &&
              e.공개여부 === 'TRUE'
          )
        );
      }),

      getCompetencies().then(data =>
        setCompetencies(data)
      )
    ])
    .then(() => setLoading(false));

  }, [mentorId]);


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


        {/* 프로필 */}
        <div
          className="
            bg-white
            rounded-2xl
            p-5
            md:p-8
            shadow-sm
            mb-5
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              items-center
              md:items-center
              gap-4
              mb-4
            "
          >

            <Avatar
              size={56}
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


            <div className="text-center md:text-left">

              <h1
                className="
                  text-xl
                  md:text-2xl
                  font-bold
                  text-gray-800
                "
              >
                {mentor.이름}
              </h1>


              <div
                className="
                  text-sm
                  text-gray-500
                "
              >
                {mentor.직책}
                {" | "}
                {mentor['담당 상품']}
                {" | "}
                {mentor.팀}
              </div>


              <div
                className="
                  text-xs
                  text-gray-400
                  mt-1
                "
              >
                경력 {mentor.경력}년 · {mentor.주고객유형}
              </div>

            </div>

          </div>


          {/* 업무 철학 */}
          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <div
              className="
                text-xs
                font-bold
                text-indigo-400
                mb-1
              "
            >
              업무 철학
            </div>

            <div
              className="
                text-sm
                md:text-base
                text-gray-700
                leading-relaxed
              "
            >
              {mentor.업무철학}
            </div>

          </div>

        </div>


        {/* 관련 에피소드 */}
        <h2
          className="
            text-base
            md:text-xl
            font-bold
            text-gray-800
            mb-3
          "
        >
          관련 에피소드
        </h2>


        <div
          className="
            flex
            flex-col
            gap-3
          "
        >

          {episodes.map(episode => (

            <div
              key={episode.episode_id}
              onClick={() =>
                navigate(`/episode/${episode.episode_id}`)
              }
              className="
                bg-white
                rounded-xl
                p-4
                md:p-6
                shadow-sm
                cursor-pointer
                border
                border-gray-100
                hover:border-indigo-300
              "
            >

              <h3
                className="
                  text-sm
                  md:text-base
                  font-bold
                  text-gray-800
                  mb-2
                "
              >
                {episode.제목}
              </h3>


              <div
                className="
                  flex
                  flex-wrap
                  gap-2
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
                      className="
                        bg-indigo-50
                        text-indigo-500
                        text-xs
                        px-3
                        py-1
                        rounded-md
                      "
                    >
                      #{competency.역량명}
                    </span>

                  ) : null;

                })}

              </div>

            </div>

          ))}


          {episodes.length === 0 && (

            <div
              className="
                text-center
                text-gray-400
                py-8
                text-sm
              "
            >
              등록된 에피소드가 없습니다.
            </div>

          )}

        </div>

      </div>


      <Footer />

    </div>
  );
}

export default MentorPage;
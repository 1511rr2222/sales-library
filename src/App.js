import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import SkillPage from './pages/SkillPage';
import EpisodePage from './pages/EpisodePage';
import MentorPage from './pages/MentorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/skill/:competencyId" element={<SkillPage />} />
        <Route path="/episode/:episodeId" element={<EpisodePage />} />
        <Route path="/mentor/:mentorId" element={<MentorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
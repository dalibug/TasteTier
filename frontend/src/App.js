import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TierLists from './pages/TierLists';
import CommunityTierLists from './pages/CommunityTierLists';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/tierlists" element={<TierLists />} />
      <Route path="/community-tierlists" element={<CommunityTierLists />} />
    </Routes>
  );
}

export default App;

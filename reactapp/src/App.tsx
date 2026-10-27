import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api'; 
import Login from './pages/Login';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Patient from './pages/Patient';
import RenderDemo from './pages/RenderDemo';

const App: React.FC = () => {
  useEffect(() => {
    api.get('/auth/csrf-token').catch(err => console.error("CSRF setup failed", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/render-demo" element={<RenderDemo />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import StudentInterface from './components/StudentInterface';
import EmbedWidget from './components/EmbedWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { isAdminAuthenticated } from './utils/auth';

const App: React.FC = () => {
  const [authKey, setAuthKey] = useState(0);
  const forceUpdate = () => setAuthKey(prev => prev + 1);

  return (
    <Router>
      <div className="App" key={authKey}>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Student Interface is the default route */}
          <Route path="/" element={<StudentInterface />} />

          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={
              isAdminAuthenticated() ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={forceUpdate} />
            } 
          />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route path="" element={<AdminDashboard onLogout={forceUpdate} />} />
          </Route>

          {/* Embed Route for all batches */}
          <Route path="/embed/batches" element={<EmbedWidget type="batches" />} />
          
          {/* Fallback for any other path to the student interface */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

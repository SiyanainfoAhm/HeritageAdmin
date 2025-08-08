import React, { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Marketing from './pages/Marketing';
import Verification from './pages/Verification';
import Reports from './pages/Reports';
import Manage from './pages/Manage';
import AccessControl from './pages/AccessControl';
import CRM from './pages/CRM';
import AddNewHeritage from './pages/AddNewHeritage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'notifications':
        return <Notifications onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'marketing':
        return <Marketing onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'verification':
        return <Verification onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'reports':
        return <Reports onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'manage':
        return <Manage onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'access-control':
        return <AccessControl onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'crm':
        return <CRM onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'add-new-heritage':
        return <AddNewHeritage onLogout={handleLogout} onPageChange={handlePageChange} />;
      case 'dashboard':
      default:
        return <Dashboard onLogout={handleLogout} onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        renderPage()
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

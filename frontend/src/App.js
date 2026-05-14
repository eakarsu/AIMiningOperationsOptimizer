import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OreGrades from './pages/OreGrades';
import DrillPatterns from './pages/DrillPatterns';
import SafetyIncidents from './pages/SafetyIncidents';
import EquipmentPage from './pages/EquipmentPage';
import EnvironmentalCompliance from './pages/EnvironmentalCompliance';
import ProductionLogs from './pages/ProductionLogs';
import Workforce from './pages/Workforce';
import CostAnalysisPage from './pages/CostAnalysis';
import GeologyMaps from './pages/GeologyMaps';
import HaulingLogistics from './pages/HaulingLogistics';
import Analytics from './pages/Analytics';
import AlertsPage from './pages/AlertsPage';
import ShiftSchedulePage from './pages/ShiftSchedulePage';
import AuditLogPage from './pages/AuditLogPage';
import UserManagement from './pages/UserManagement';
import MaintenanceScheduler from './pages/MaintenanceScheduler';
import InventoryPage from './pages/InventoryPage';
import SearchPage from './pages/SearchPage';
import ReportsPage from './pages/ReportsPage';
import ExportPage from './pages/ExportPage';
import AIToolsPage from './pages/AIToolsPage';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const authRoute = (Component) => (
    isAuthenticated ? <Layout user={user} onLogout={handleLogout}><Component /></Layout> : <Navigate to="/login" />
  );

  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/" element={authRoute(Dashboard)} />
          <Route path="/ore-grades" element={authRoute(OreGrades)} />
          <Route path="/drill-patterns" element={authRoute(DrillPatterns)} />
          <Route path="/safety-incidents" element={authRoute(SafetyIncidents)} />
          <Route path="/equipment" element={authRoute(EquipmentPage)} />
          <Route path="/environmental" element={authRoute(EnvironmentalCompliance)} />
          <Route path="/production-logs" element={authRoute(ProductionLogs)} />
          <Route path="/workforce" element={authRoute(Workforce)} />
          <Route path="/cost-analysis" element={authRoute(CostAnalysisPage)} />
          <Route path="/geology-maps" element={authRoute(GeologyMaps)} />
          <Route path="/hauling" element={authRoute(HaulingLogistics)} />
          <Route path="/analytics" element={authRoute(Analytics)} />
          <Route path="/alerts" element={authRoute(AlertsPage)} />
          <Route path="/shift-schedules" element={authRoute(ShiftSchedulePage)} />
          <Route path="/audit-logs" element={authRoute(AuditLogPage)} />
          <Route path="/user-management" element={authRoute(UserManagement)} />
          <Route path="/maintenance" element={authRoute(MaintenanceScheduler)} />
          <Route path="/inventory" element={authRoute(InventoryPage)} />
          <Route path="/search" element={authRoute(SearchPage)} />
          <Route path="/reports" element={authRoute(ReportsPage)} />
          <Route path="/export" element={authRoute(ExportPage)} />
          <Route path="/ai-tools" element={authRoute(AIToolsPage)} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BackbonePage from './pages/BackbonePage';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModelRouterPage from './pages/ModelRouterPage';
import RAGPage from './pages/RAGPage';
import LogsPage from './pages/LogsPage';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="backbone"  element={<BackbonePage />} />
          <Route path="chat"      element={<ChatPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="models"    element={<ModelRouterPage />} />
          <Route path="rag"       element={<RAGPage />} />
          <Route path="logs"      element={<LogsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
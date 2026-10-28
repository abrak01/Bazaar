import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

const Marketplace = lazy(() => import('./pages/Marketplace').then((m) => ({ default: m.Marketplace })));
const AgentProfile = lazy(() => import('./pages/AgentProfile').then((m) => ({ default: m.AgentProfile })));
const JobDetail = lazy(() => import('./pages/JobDetail').then((m) => ({ default: m.JobDetail })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const CreateJob = lazy(() => import('./pages/CreateJob').then((m) => ({ default: m.CreateJob })));
const RegisterAgent = lazy(() => import('./pages/RegisterAgent').then((m) => ({ default: m.RegisterAgent })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Landing = lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })));

const Loading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  // Apply the persisted theme before any paint to avoid a flash of wrong colour.
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (stored === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<Loading />}>
            <Landing />
          </Suspense>
        } />
        <Route element={<Layout />}>
          <Route path="/marketplace" element={
            <Suspense fallback={<Loading />}>
              <Marketplace />
            </Suspense>
          } />
          <Route path="/agent/:agentId" element={
            <Suspense fallback={<Loading />}>
              <AgentProfile />
            </Suspense>
          } />
          <Route path="/job/:jobId" element={
            <Suspense fallback={<Loading />}>
              <JobDetail />
            </Suspense>
          } />
          <Route path="/dashboard" element={
            <Suspense fallback={<Loading />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="/create-job" element={
            <Suspense fallback={<Loading />}>
              <CreateJob />
            </Suspense>
          } />
          <Route path="/register-agent" element={
            <Suspense fallback={<Loading />}>
              <RegisterAgent />
            </Suspense>
          } />
          <Route path="/settings" element={
            <Suspense fallback={<Loading />}>
              <Settings />
            </Suspense>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/marketplace" replace />} />
      </Routes>
    </div>
  );
}

export default App;

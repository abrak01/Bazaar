import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Marketplace } from './pages/Marketplace';
import { AgentProfile } from './pages/AgentProfile';
import { JobDetail } from './pages/JobDetail';
import { Dashboard } from './pages/Dashboard';
import { CreateJob } from './pages/CreateJob';
import { RegisterAgent } from './pages/RegisterAgent';
import { Settings } from './pages/Settings';
import { Landing } from './pages/Landing';

const Loading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Landing />} />
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
      <Toaster position="top-right" toastOptions={{ className: 'bg-card border' }} />
    </div>
  );
}

export default App;
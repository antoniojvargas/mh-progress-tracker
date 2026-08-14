import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { useAuth } from './hooks/use-auth';
import { DashboardPage } from './pages/dashboard-page';
import { LoginPage } from './pages/login-page';
const App = () => { const { user, loading } = useAuth(); if (loading) return <div className="loading">Abriendo tu espacio…</div>; return user && location.pathname === '/dashboard' ? <DashboardPage user={user}/> : <LoginPage/>; };
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);


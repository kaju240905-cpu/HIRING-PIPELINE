import { useState, useEffect } from 'react';

const API_BASE = '/api';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('login');
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setView('dashboard');
        }
      })
      .catch(() => {});
  }, []);

  const login = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e.target.email.value, password: e.target.password.value })
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setView('dashboard');
    } else {
      alert(data.error);
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    setUser(null);
    setView('login');
  };

  const loadDashboard = async () => {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (res.ok) {
      setDashboard(await res.json());
    }
  };

  const exportCsv = () => {
    window.open(`${API_BASE}/csv`, '_blank');
  };

  useEffect(() => {
    if (view === 'dashboard' && user) {
      loadDashboard();
    }
  }, [view, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={login} className="p-8 bg-white shadow rounded space-y-4">
          <h1 className="text-xl font-bold">Login</h1>
          <input name="email" type="email" placeholder="Email" className="block w-full border p-2" required />
          <input name="password" type="password" placeholder="Password" className="block w-full border p-2" required />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <nav className="flex justify-between items-center bg-white p-4 shadow rounded mb-4">
        <div className="font-bold text-xl">Hiring Pipeline</div>
        <div className="flex gap-4">
          <button onClick={() => setView('dashboard')} className="hover:underline">Dashboard</button>
          <button onClick={logout} className="text-red-500">Logout ({user.role})</button>
        </div>
      </nav>

      {view === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <button onClick={exportCsv} className="bg-green-500 text-white px-4 py-2 rounded">Export CSV</button>
          </div>

          {dashboard && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 shadow rounded">
                <div className="text-gray-500">Total Applications</div>
                <div className="text-3xl">{dashboard.totalApplications}</div>
              </div>
              {user.role === 'RECRUITER' && (
                <div className="bg-white p-4 shadow rounded">
                  <div className="text-gray-500">Stalled Applications</div>
                  <div className="text-3xl text-red-500">{dashboard.stalledCount}</div>
                </div>
              )}
              {user.role === 'RECRUITER' && (
                <div className="bg-white p-4 shadow rounded">
                  <div className="text-gray-500">Open Jobs</div>
                  <div className="text-3xl">{dashboard.openJobs}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

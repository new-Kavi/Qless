import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import {
  fetchAdminAnalytics,
  fetchAllUsers,
  fetchAllServices,
  toggleUserSuspension,
  toggleServiceSuspension,
} from '../services/api';
import { Users, Building2, TrendingUp, CheckCircle, XCircle, Activity, ShieldAlert } from 'lucide-react';
import './AdminPanel.css';

const initialLogs = [
  { id: 1, time: '10:45 AM', event: 'New user registration detected.', type: 'info' },
  { id: 2, time: '10:42 AM', event: 'Appointment marked as Completed.', type: 'success' },
  { id: 3, time: '10:28 AM', event: 'Emergency Jump Queue processed ($150.00).', type: 'warning' },
  { id: 4, time: '09:15 AM', event: 'Service status changed to BUSY.', type: 'info' },
  { id: 5, time: '08:00 AM', event: 'System daily cron executed. Time slots generated.', type: 'info' },
];

const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminAnalytics(), fetchAllUsers(), fetchAllServices()])
      .then(([analyticsRes, usersRes, servicesRes]) => {
        setAnalytics(analyticsRes.data);
        setUsers(usersRes.data);
        setProviders(servicesRes.data);
      })
      .catch((err) => console.error('Admin data load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleProvider = async (id) => {
    try {
      const { data } = await toggleServiceSuspension(id);
      setProviders((prev) =>
        prev.map((p) => (p._id === id ? { ...p, systemSuspended: data.service.systemSuspended } : p))
      );
      // Update analytics count
      setAnalytics((prev) => ({
        ...prev,
        activeProviders: data.service.systemSuspended
          ? prev.activeProviders - 1
          : prev.activeProviders + 1,
      }));
    } catch (err) {
      console.error('Toggle provider error:', err);
    }
  };

  const handleToggleUser = async (id) => {
    try {
      const { data } = await toggleUserSuspension(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: data.user.status } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user.');
    }
  };

  if (loading) return <div className="loading-state">Loading Admin Dashboard...</div>;

  return (
    <>
      <Navbar />
      <div className="admin-container animate-slide-down">
        <div className="admin-header">
          <div>
            <h1>System Administration</h1>
            <p className="admin-subtitle">Platform health, provider management, and live analytics.</p>
          </div>
          <div className="admin-badge">
            <ShieldAlert size={18} /> Master Control
          </div>
        </div>

        {/* Analytics Row */}
        <div className="admin-stats-row">
          <div className="astat-card revenue-card">
            <div className="astat-icon-wrap"><TrendingUp size={24} /></div>
            <div className="astat-info">
              <span className="astat-val">${analytics?.totalRevenue?.toFixed(2) || '0.00'}</span>
              <span className="astat-lbl">Today's Platform Revenue</span>
            </div>
          </div>
          <div className="astat-card">
            <div className="astat-icon-wrap"><Building2 size={24} /></div>
            <div className="astat-info">
              <span className="astat-val">{analytics?.activeProviders} / {analytics?.totalProviders}</span>
              <span className="astat-lbl">Active Service Providers</span>
            </div>
          </div>
          <div className="astat-card">
            <div className="astat-icon-wrap"><Users size={24} /></div>
            <div className="astat-info">
              <span className="astat-val">{analytics?.totalUsers?.toLocaleString()}</span>
              <span className="astat-lbl">Registered End-Users</span>
            </div>
          </div>
        </div>

        <div className="admin-grid-layout">
          <div className="admin-main-column">

            {/* Provider Management Table */}
            <div className="admin-card">
              <div className="acard-header">
                <h2>Service Partners Directory</h2>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>Category</th>
                      <th>Queue</th>
                      <th>System Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p._id} className={p.systemSuspended ? 'row-suspended' : ''}>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="cat-pill">{p.category}</span></td>
                        <td>{p.allowsInstantQueue ? `${p.queueSize} waiting` : 'Appts. Only'}</td>
                        <td>
                          {p.systemSuspended ? (
                            <span className="status-badge closed"><XCircle size={14} /> Suspended</span>
                          ) : (
                            <span className="status-badge open"><CheckCircle size={14} /> Verified</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={`toggle-btn ${p.systemSuspended ? 'reactivate' : 'suspend'}`}
                            onClick={() => handleToggleProvider(p._id)}
                          >
                            {p.systemSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Management Table */}
            <div className="admin-card">
              <div className="acard-header">
                <h2>User Accounts Directory</h2>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email Address</th>
                      <th>System Role</th>
                      <th>Registered</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.email}</td>
                        <td><span className={`role-pill role-${u.role}`}>{u.role.toUpperCase()}</span></td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={u.status === 'active' ? 'txt-success' : 'txt-danger'}>
                            {u.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`toggle-btn ${u.status === 'suspended' ? 'reactivate' : 'suspend'}`}
                            onClick={() => handleToggleUser(u._id)}
                            disabled={u.role === 'admin'}
                          >
                            {u.status === 'active' ? 'Ban' : 'Unban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="admin-side-column">
            <div className="admin-card logs-card">
              <div className="acard-header" style={{ marginBottom: '1rem' }}>
                <h2><Activity size={20} style={{ verticalAlign: 'bottom', marginRight: '0.4rem' }} /> Live System Log</h2>
              </div>
              <div className="logs-container">
                {initialLogs.map((log) => (
                  <div key={log.id} className={`log-item log-${log.type}`}>
                    <div className="log-time">{log.time}</div>
                    <div className="log-event">{log.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;

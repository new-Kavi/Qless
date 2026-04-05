import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import {
  fetchMyServices,
  getServiceQueue,
  callNextInQueue,
  markNoShow,
  fetchServiceBookings,
  completeBooking,
  updateService,
} from '../services/api';
import { Users, Clock, CalendarDays, CheckCircle, XCircle, Settings, PhoneForwarded, RefreshCw, AlertTriangle } from 'lucide-react';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // Load seller's services on mount
  useEffect(() => {
    fetchMyServices()
      .then(res => {
        setServices(res.data);
        if (res.data.length > 0) setSelectedService(res.data[0]);
      })
      .catch(err => console.error('Failed to load services:', err));
  }, []);

  // Load queue + appointments whenever selected service changes
  useEffect(() => {
    if (!selectedService) return;
    loadQueueAndAppts(selectedService._id);
  }, [selectedService]);

  const loadQueueAndAppts = async (serviceId) => {
    setLoadingQueue(true);
    setLoadingAppts(true);

    try {
      const [queueRes, apptRes] = await Promise.all([
        getServiceQueue(serviceId),
        fetchServiceBookings(serviceId),
      ]);
      setQueue(queueRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingQueue(false);
      setLoadingAppts(false);
    }
  };

  const handleCallNext = async () => {
    if (!selectedService || queue.length === 0) return;
    try {
      const res = await callNextInQueue(selectedService._id);
      alert(`Calling ${res.data.entry.tokenNumber} — ${res.data.entry.user?.name || 'customer'} to the desk!`);
      // Remove called person from local state
      setQueue(prev => prev.filter(q => q._id !== res.data.entry._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to call next.');
    }
  };

  const handleNoShow = async (tokenId) => {
    try {
      await markNoShow(tokenId);
      setQueue(prev => prev.filter(q => q._id !== tokenId));
    } catch (err) {
      console.error('No-show error:', err);
    }
  };

  const handleMarkAppointmentDone = async (bookingId) => {
    try {
      await completeBooking(bookingId);
      setAppointments(prev =>
        prev.map(a => a._id === bookingId ? { ...a, status: 'completed' } : a)
      );
    } catch (err) {
      console.error('Complete booking error:', err);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!selectedService) return;
    try {
      const res = await updateService(selectedService._id, { status: newStatus });
      setSelectedService(res.data);
      setServices(prev => prev.map(s => s._id === res.data._id ? res.data : s));
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleRefresh = () => {
    if (selectedService) loadQueueAndAppts(selectedService._id);
  };

  const avgWait = selectedService
    ? queue.length * (selectedService.averageWaitTimePerPerson || 5)
    : 0;

  return (
    <>
      <Navbar />
      <div className="container dashboard-container animate-slide-down">

        {/* Service Selector (if seller has multiple services) */}
        {services.length > 1 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, marginRight: '0.75rem' }}>Managing:</label>
            <select
              value={selectedService?._id || ''}
              onChange={e => {
                const svc = services.find(s => s._id === e.target.value);
                setSelectedService(svc);
              }}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            >
              {services.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Header & Status Control */}
        <div className="seller-header">
          <div>
            <h1>{selectedService?.name || 'Dashboard'} Control</h1>
            <p className="subtitle">Manage your live virtual queue and scheduled time slots.</p>
          </div>
          <div className="status-control">
            <Settings size={18} className="settings-icon" />
            <label>Service Status Override:</label>
            <select
              value={selectedService?.status || 'Open'}
              onChange={handleStatusChange}
              className={`status-select status-${(selectedService?.status || 'Open').toLowerCase()}`}
            >
              <option value="Open">🟢 Accepting Walk-ins (Open)</option>
              <option value="Busy">🟠 High Traffic (Busy)</option>
              <option value="Closed">🔴 Stop New Joins (Closed)</option>
            </select>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="analytics-row">
          <div className="stat-card">
            <Users size={32} className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{queue.length}</span>
              <span className="stat-label">Currently in Line</span>
            </div>
          </div>
          <div className="stat-card highlight-card">
            <Clock size={32} className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">~{avgWait}m</span>
              <span className="stat-label">Estimated Wait Time</span>
            </div>
          </div>
          <div className="stat-card">
            <CalendarDays size={32} className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{appointments.filter(a => a.status === 'pending').length}</span>
              <span className="stat-label">Upcoming Slots Today</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">

          {/* Live Virtual Queue Management */}
          <section className="dashboard-section live-queue-section">
            <div className="section-header">
              <h2>Instant Virtual Queue</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleRefresh} className="action-icon-btn" title="Refresh" style={{ color: 'var(--color-primary)' }}>
                  <RefreshCw size={18} />
                </button>
                {queue.length > 0 && (
                  <Button onClick={handleCallNext} className="call-next-btn">
                    <PhoneForwarded size={16} /> Call Next Ticket
                  </Button>
                )}
              </div>
            </div>

            <div className="queue-list">
              {loadingQueue ? (
                <div className="empty-state">Loading queue...</div>
              ) : queue.length === 0 ? (
                <div className="empty-state">No one is currently waiting in the live queue.</div>
              ) : (
                queue.map((entry, idx) => (
                  <div key={entry._id} className={`queue-item ${idx === 0 ? 'next-up' : ''} ${entry.isEmergency ? 'emergency-item' : ''}`}>
                    <div className="person-info">
                      <div className={`token-badge ${entry.isEmergency ? 'emg-badge' : ''}`}>
                        {entry.isEmergency && <AlertTriangle size={12} />}
                        {entry.tokenNumber}
                      </div>
                      <div>
                        <h4>{entry.user?.name || 'Anonymous'}</h4>
                        {entry.isEmergency ? (
                          <span className="wait-time-text" style={{ color: 'var(--color-danger)' }}>
                            ⚠️ Emergency: {entry.emergencyReason}
                          </span>
                        ) : (
                          <span className="wait-time-text">
                            Waiting since {new Date(entry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    {idx !== 0 && (
                      <div className="queue-actions">
                        <button
                          onClick={() => handleNoShow(entry._id)}
                          className="action-icon-btn danger"
                          title="Mark No-Show"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Time Slot Appointments Management */}
          <section className="dashboard-section appointments-section">
            <div className="section-header">
              <h2>Pre-Booked Time Slots</h2>
            </div>

            <div className="appointment-list">
              {loadingAppts ? (
                <div className="empty-state">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="empty-state">No time slots scheduled for today.</div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt._id} className={`appointment-item status-${apt.status}`}>
                    <div className="apt-time">{apt.slotTimeDisplay}</div>
                    <div className="apt-details">
                      <h4>{apt.user?.name || 'Customer'}</h4>
                      <span className="apt-type">{apt.user?.email}</span>
                      <span className="apt-type" style={{ display: 'block', fontWeight: 600, marginTop: '0.2rem' }}>
                        ${apt.price?.toFixed(2)}
                      </span>
                    </div>
                    <div className="apt-actions">
                      {apt.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkAppointmentDone(apt._id)}
                          className="action-icon-btn success"
                          title="Mark Completed"
                        >
                          <CheckCircle size={22} />
                        </button>
                      ) : (
                        <span className="completed-badge">Done</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default SellerDashboard;

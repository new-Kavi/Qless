import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { fetchServiceById } from '../services/api';
import { MapPin, Clock, Users, CalendarDays, Info, CalendarClock, AlertTriangle } from 'lucide-react';
import './ServiceDetails.css';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);

  // Tab State: 'queue' | 'booking'
  const [activeTab, setActiveTab] = useState('booking'); // default to booking for safety
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Emergency Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');

  useEffect(() => {
    fetchServiceById(id)
      .then(res => {
        const found = res.data;
        setService(found);
        if (found.allowsInstantQueue) {
          setActiveTab('queue');
        }
      })
      .catch(() => setService(null));
  }, [id]);

  if (!service) return <div className="loading-state">Loading...</div>;

  const estimatedWait = service.queueSize * service.averageWaitTimePerPerson;
  const currentDay = new Date().getDay();
  const isClosedToday = service.closedDays.includes(currentDay);

  const handleJoinQueue = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/queue/${service._id}`);
    }, 800);
  };

  const handleProceedToBooking = () => {
    if (!selectedSlot) return;
    navigate(`/checkout/${service._id}/${selectedSlot.id}`, { state: { slot: selectedSlot, service } });
  };

  const submitEmergency = () => {
    if (emergencyReason.trim() === '') {
      alert('Please describe your emergency.');
      return;
    }
    navigate(`/checkout/${service._id}/emergency?reason=${encodeURIComponent(emergencyReason)}`, { state: { service } });
  };

  // Generate time slots dynamically from service config (matching backend model)
  const generateSlots = () => {
    if (!service.timings) return [];
    const now = new Date();
    const slots = [];
    // Parse timings "09:00 AM - 05:00 PM"
    const [startStr, endStr] = service.timings.split(' - ');
    const parseTime = (str) => {
      const [time, period] = str.trim().split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const d = new Date(); d.setHours(h, m, 0, 0);
      return d;
    };
    let slotTime = parseTime(startStr);
    const endTime = parseTime(endStr);
    const duration = service.slotDurationMins || 30;
    let slotIdx = 1;
    while (slotTime < endTime) {
      const timeDisplay = slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isPast = slotTime <= now;
      const rand = Math.random();
      let status = 'available';
      if (isPast) status = 'passed';
      else if (rand > 0.8) status = 'booked';
      else if (rand > 0.6) status = 'limited';
      slots.push({
        id: `slot_${slotIdx}`,
        timeRange: timeDisplay,
        status,
        price: service.slotPrice || 0,
        absoluteTime: slotTime.getTime(),
        slotTimeISO: slotTime.toISOString(),
      });
      slotTime = new Date(slotTime.getTime() + duration * 60000);
      slotIdx++;
    }
    return slots;
  };

  const slots = generateSlots();

  return (
    <>
      <Navbar />
      <div className="container page-wrapper animate-slide-down">
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back to Search
        </button>

        <div className="details-container">

          {/* Left Column: Service Info */}
          <div className="details-card">
            <div className="details-header">
              <div className="title-area">
                <span className="category-badge">{service.category}</span>
                <h1>{service.name}</h1>
                <span className={`status-badge ${service.status.toLowerCase()}`}>
                  {service.status}
                </span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-block">
                <MapPin className="info-icon" size={20} />
                <div>
                  <h4>Location</h4>
                  <p>{service.location}</p>
                </div>
              </div>

              <div className="info-block">
                <CalendarDays className="info-icon" size={20} />
                <div>
                  <h4>Working Hours</h4>
                  <p>{service.timings}</p>
                </div>
              </div>

              <div className="info-block desc-block">
                <Info className="info-icon" size={20} />
                <div>
                  <h4>About</h4>
                  <p>{service.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="action-card">

            {/* Mode Selection Tabs */}
            <div className="mode-tabs">
              {service.allowsInstantQueue && (
                <button
                  className={`mode-tab ${activeTab === 'queue' ? 'active' : ''}`}
                  onClick={() => setActiveTab('queue')}
                >
                  <Users size={16} /> Instant Queue
                </button>
              )}
              <button
                className={`mode-tab ${activeTab === 'booking' ? 'active' : ''}`}
                onClick={() => setActiveTab('booking')}
              >
                <CalendarClock size={16} /> Book Time Slot
              </button>
            </div>

            {/* Instant Queue Content */}
            {activeTab === 'queue' && service.allowsInstantQueue && (
              <div className="tab-content animate-fade-in">
                <h2>Live Queue Status</h2>

                <div className="live-stats">
                  <div className="stat-box">
                    <Users size={28} className="stat-icon" />
                    <span className="stat-value">{service.queueSize}</span>
                    <span className="stat-label">People Ahead</span>
                  </div>

                  <div className="stat-box primary-stat">
                    <Clock size={28} className="stat-icon" />
                    <span className="stat-value">~{estimatedWait} <span className="stat-unit">mins</span></span>
                    <span className="stat-label">Estimated Wait</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  className="join-btn"
                  onClick={handleJoinQueue}
                  disabled={loading || service.status === 'Closed'}
                >
                  {loading ? 'Joining...' : 'Join Queue Now'}
                </Button>

                {service.status === 'Closed' && (
                  <p className="closed-notice">This service is currently closed.</p>
                )}

                <p className="calm-note">
                  Join virtually to hold your spot without standing in line.
                </p>

                {/* EMERGENCY ACCESS SECTION */}
                {service.hasEmergencyAccess && (
                  <div className="emergency-module">
                    <div className="em-header">
                      <AlertTriangle size={18} /> Does this require immediate attention?
                    </div>
                    <p>Priority access is available for critical situations. A jump fee will apply.</p>
                    <button className="em-btn" onClick={() => setShowEmergencyModal(true)}>
                      Declare Emergency & Jump Queue
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Time Slot Booking Content */}
            {activeTab === 'booking' && (
              <div className="tab-content animate-fade-in">
                <h2>Select a Time Slot</h2>
                <p className="calm-note" style={{ marginBottom: '1.5rem', marginTop: 0 }}>
                  Choose a predefined time window for predictability.
                </p>

                {isClosedToday ? (
                  <div className="empty-state">
                    <CalendarClock size={48} style={{ margin: '0 auto 1rem', color: 'var(--color-text-muted)', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Closed Today</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>This service provider is not operating today.</p>
                  </div>
                ) : (
                  <>
                    <div className="slot-legend">
                      <span className="legend-item"><span className="dot dot-avail"></span> Available</span>
                      <span className="legend-item"><span className="dot dot-limited"></span> Limited</span>
                      <span className="legend-item"><span className="dot dot-booked"></span> Full or Passed</span>
                    </div>

                    <div className="slots-grid">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => (slot.status !== 'booked' && slot.status !== 'passed') && setSelectedSlot(slot)}
                          className={`slot-badge status-${slot.status} ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                          disabled={slot.status === 'booked' || slot.status === 'passed'}
                        >
                          <span className="slot-time">{slot.timeRange}</span>
                          {slot.price > 0 && <span className="slot-price">${slot.price.toFixed(2)}</span>}
                          {slot.status === 'passed' && <span className="slot-price" style={{ fontSize: '0.65rem' }}>Passed</span>}
                        </button>
                      ))}
                    </div>

                    <div className="booking-summary-footer">
                      {selectedSlot ? (
                        <Button fullWidth className="join-btn" onClick={handleProceedToBooking}>
                          Proceed to Checkout
                        </Button>
                      ) : (
                        <div className="slot-helper-text">Select an available slot above.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Emergency Modal Overlay */}
        {showEmergencyModal && (
          <div className="modal-overlay">
            <div className="emergency-modal animate-slide-down">
              <h2><AlertTriangle size={24} /> Priority Emergency Override</h2>
              <p className="em-warning-txt">
                Falsely claiming a medical emergency may result in a ban from the platform.
                Emergency jumps incur a mandatory Priority Processing Fee.
              </p>

              <div className="form-group">
                <label>Please describe your emergency concisely:</label>
                <textarea
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="e.g., Severe chest pain, broken arm, allergic reaction..."
                  rows={4}
                />
              </div>

              <div className="em-modal-actions">
                <button className="cancel-btn" onClick={() => setShowEmergencyModal(false)}>Cancel</button>
                <Button onClick={submitEmergency} disabled={!emergencyReason} style={{ backgroundColor: '#E53E3E' }}>
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default ServiceDetails;

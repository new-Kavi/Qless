import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { joinQueue, joinEmergencyQueue, getQueueStatus, fetchServiceById } from '../services/api';
import { RefreshCw, LogOut, BellRing, MapPin } from 'lucide-react';
import './QueueStatus.css';

const QueueStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEmergencyActive = location.state?.isEmergency || false;

  const [service, setService] = useState(null);
  const [queueEntry, setQueueEntry] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [initialSize, setInitialSize] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const hasJoined = useRef(false);

  // On mount: fetch service then join (or check status if emergency)
  useEffect(() => {
    const init = async () => {
      try {
        const svcRes = await fetchServiceById(id);
        setService(svcRes.data);
      } catch {
        setError('Could not load service info.');
        return;
      }

      if (hasJoined.current) return;
      hasJoined.current = true;

      // Emergency path was already handled in BookingConfirmation (payment gate)
      // So here we just check status (user already paid the fee)
      if (isEmergencyActive) {
        // Emergency bypass — just show the priority screen
        return;
      }

      try {
        setIsJoining(true);
        const res = await joinQueue(id);
        const { entry, position, estimatedWait: wait } = res.data;
        setQueueEntry(entry);
        setPeopleAhead(position - 1); // position 1 = no one ahead
        setInitialSize(position);
        setEstimatedWait(wait);
      } catch (err) {
        // May already be in queue — try fetching status
        if (err.response?.status === 400 && err.response?.data?.entry) {
          const existing = err.response.data.entry;
          setQueueEntry(existing);
          await refreshStatus();
        } else {
          setError(err.response?.data?.message || 'Failed to join queue.');
        }
      } finally {
        setIsJoining(false);
      }
    };

    init();
  }, [id]);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await getQueueStatus(id);
      const { peopleAhead: ahead, estimatedWait: wait } = res.data;
      setPeopleAhead(ahead);
      setEstimatedWait(wait);
    } catch {
      // Queue entry might be done
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => refreshStatus();

  const handleLeaveQueue = () => {
    if (window.confirm('Are you sure you want to leave the queue? You will lose your spot.')) {
      navigate('/');
    }
  };

  const progressPercent = initialSize > 0
    ? ((initialSize - peopleAhead) / initialSize) * 100
    : isEmergencyActive ? 100 : 0;

  let notificationMessage = 'Waiting patiently...';
  let statusClass = 'status-normal';

  if (isEmergencyActive) {
    notificationMessage = 'EMERGENCY PRIORITY. PROCEED DIRECTLY TO STAFF DESK.';
    statusClass = 'status-approaching';
  } else if (peopleAhead === 0 && !isJoining) {
    notificationMessage = "It's your turn! Please proceed to the service desk.";
    statusClass = 'status-ready';
  } else if (peopleAhead <= 2 && !isJoining) {
    notificationMessage = 'You are almost there! Make your way to the location.';
    statusClass = 'status-approaching';
  }

  if (isJoining) return <div className="loading-state">Joining queue, please wait...</div>;
  if (!service) return <div className="loading-state">Loading Queue Info...</div>;

  const displayToken = isEmergencyActive
    ? `EMG-${String(Math.floor(Math.abs(Date.now()) % 999)).padStart(3, '0')}`
    : queueEntry?.tokenNumber || (isJoining ? '...' : '—');

  return (
    <>
      <Navbar />
      <div className="container page-wrapper queue-wrapper animate-slide-down">

        {error && (
          <div className="error-banner">{error}</div>
        )}

        <div className="queue-status-card">

          <div className="qs-header">
            <h2>{service.name}</h2>
            <div className="location-row">
              <MapPin size={14} /> <span>{service.location}</span>
            </div>
          </div>

          <div className="token-display">
            <span className="token-label">Your Token Number</span>
            <div
              className="token-number"
              style={isEmergencyActive ? { color: 'var(--color-danger)' } : {}}
            >
              {displayToken}
            </div>
          </div>

          <div className="progress-section">
            <ProgressBar
              progress={isEmergencyActive ? 100 : progressPercent}
              label={isEmergencyActive ? 'Priority Placed' : `People Ahead: ${peopleAhead}`}
              hint={isEmergencyActive ? 'Instant Front of Line Access' : `Started at position ${initialSize}`}
            />

            <div className="time-estimate">
              <span className="time-label">Estimated Wait Remaining:</span>
              <span className="time-value">
                {isEmergencyActive ? 'IMMEDIATE' : `~${estimatedWait} mins`}
              </span>
            </div>
          </div>

          <div className={`notification-prompt ${statusClass}`}>
            <BellRing size={20} className="bell-icon" />
            <span>{notificationMessage}</span>
          </div>

          <div className="qs-actions">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isRefreshing || isEmergencyActive}
              className="action-btn"
            >
              <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>

            <Button
              variant="outline"
              onClick={handleLeaveQueue}
              className="action-btn leave-btn"
            >
              <LogOut size={16} />
              Leave Queue
            </Button>
          </div>

        </div>
      </div>
    </>
  );
};

export default QueueStatus;

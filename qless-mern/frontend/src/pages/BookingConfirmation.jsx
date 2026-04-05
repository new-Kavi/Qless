import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/api';
import { CalendarCheck, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { serviceId, slotId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const emergencyReason = queryParams.get('reason');
  const isEmergency = slotId === 'emergency';

  // Service & slot come from router state (passed from ServiceDetails)
  const stateService = location.state?.service;
  const stateSlot = location.state?.slot;

  const [service, setService] = useState(stateService || null);
  const [slot] = useState(stateSlot || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!service || (!slot && !isEmergency)) return <div className="loading-state">Loading Checkout Details...</div>;

  const emergencyFee = 150.00;
  const cost = isEmergency ? emergencyFee : slot.price;
  const timeDisplay = isEmergency ? 'IMMEDIATE (Emergency Bypass)' : slot.timeRange;

  const handlePaymentAndConfirm = async () => {
    setIsProcessing(true);
    setError('');

    try {
      if (isEmergency) {
        setIsProcessing(false);
        navigate(`/queue/${serviceId}`, { state: { isEmergency: true } });
        return;
      }

      // Call real API to create booking
      const { data } = await createBooking({
        serviceId: service._id,
        slotTime: slot.slotTimeISO,
        slotTimeDisplay: slot.timeRange,
        price: slot.price,
      });

      // Also persist in local bookings for the countdown widget
      addBooking({
        id: data.bookingId,
        serviceName: service.name,
        serviceLocation: service.location,
        time: slot.timeRange,
        date: new Date().toLocaleDateString(),
        absoluteTime: slot.absoluteTime,
        price: slot.price,
        status: 'active',
      });

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <div className="container page-wrapper success-wrapper animate-slide-down">
          <div className="success-card">
            <CheckCircle2 size={64} className="success-icon" />
            <h1>Booking Confirmed!</h1>
            <p className="success-msg">Your time slot has been successfully reserved.</p>
            
            <div className="receipt-box">
              <div className="receipt-row">
                <span>Service</span>
                <strong>{service.name}</strong>
              </div>
              <div className="receipt-row">
                <span>Reserved Time</span>
                <strong>{slot.timeRange}</strong>
              </div>
              <div className="receipt-row">
                <span>Amount Paid</span>
                <strong>${slot.price.toFixed(2)}</strong>
              </div>
            </div>

            <p className="calm-note" style={{marginBottom: '2rem'}}>
              Please arrive 5–10 minutes before your scheduled time slot.
            </p>

            <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container page-wrapper checkout-wrapper animate-slide-down">
        
        <div className="checkout-layout">
          {/* Summary Column */}
          <div className="checkout-summary">
            <div className="summary-header">
              <h2>{isEmergency ? 'Priority Emergency Summary' : 'Review Your Booking'}</h2>
              {isEmergency ? <AlertTriangle size={24} color="var(--color-danger)" /> : <CalendarCheck size={24} color="var(--color-primary)" />}
            </div>

            <div className="summary-details">
              <h3>{service.name}</h3>
              <p className="summary-location">{service.location}</p>
              
              <div className={`summary-slot-card ${isEmergency ? 'em-card' : ''}`}>
                <span className={`sc-label ${isEmergency ? 'em-label' : ''}`}>{isEmergency ? 'Action:' : 'Selected Time Slot:'}</span>
                <span className={`sc-time ${isEmergency ? 'em-time' : ''}`}>{timeDisplay}</span>
              </div>
              
              {isEmergency && (
                 <div className="em-reason-box">
                   <strong>Reported Reason:</strong> {emergencyReason}
                 </div>
              )}
            </div>
            
            <div className="summary-cost">
              <div className="cost-row">
                <span>{isEmergency ? 'Priority Jump Fee' : 'Booking Fee'}</span>
                <span>${cost.toFixed(2)}</span>
              </div>
              <div className="cost-row">
                <span>Taxes & Fees</span>
                <span>$0.00</span>
              </div>
              <div className="cost-row total-row">
                <span>Total Due</span>
                <span>${cost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Column */}
          <div className="payment-column">
            <h2>Payment Details</h2>
            <div className="payment-simulation-box">
               <ShieldCheck size={48} className="shield-icon" />
               <p>Quick & Secure Payments</p>
               <span className="fake-card-hint">
                 For this demo, we've bypassed the credit card forms. Just click below to instantly process your payment.
               </span>
            </div>

            <Button 
               fullWidth 
               variant="primary" 
               className="pay-btn"
               onClick={handlePaymentAndConfirm}
               disabled={isProcessing}
               style={isEmergency ? {backgroundColor: 'var(--color-danger)'} : {}}
            >
              {isProcessing ? 'Processing Payment...' : `Pay $${cost.toFixed(2)} & ${isEmergency ? 'Join Now' : 'Confirm'}`}
            </Button>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default BookingConfirmation;

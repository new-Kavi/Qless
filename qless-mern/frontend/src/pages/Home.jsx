import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';
import CountdownTimer from '../components/CountdownTimer';
import { useAuth } from '../context/AuthContext';
import { fetchServices } from '../services/api';
import { Search, CalendarDays, MapPin } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user, bookings } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    fetchServices()
      .then(res => setServices(res.data))
      .catch(err => console.error('Failed to load services:', err))
      .finally(() => setLoadingServices(false));
  }, []);

  const filteredServices = services.filter(service => {
    return (
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <Navbar />
      <div className="home-container">
        
        {/* Hero / Search Section */}
        <section className="hero-section animate-slide-down">
          <div className="hero-content">
            <h1 className="hero-title">Skip the waiting room.</h1>
            <p className="hero-subtitle">
              Join virtual queues for hospitals, banks, and more from the comfort of your home.
            </p>
            
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input"
                placeholder="Search nearby hospitals, banks, services..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Upcoming Bookings Section */}
        {bookings && bookings.length > 0 && (
          <section className="bookings-section animate-slide-down">
            <div className="container">
              <h2 className="section-heading">Your Upcoming Bookings</h2>
              <div className="bookings-grid">
                {bookings.map((booking, idx) => (
                  <div key={idx} className="booking-card">
                    <div className="booking-header">
                      <span className="booking-id">{booking.id}</span>
                      <span className="booking-status active">Active</span>
                    </div>
                    <h3>{booking.serviceName}</h3>
                    <div className="booking-meta">
                      <span className="meta-item"><CalendarDays size={14} /> {booking.date} at {booking.time}</span>
                      <span className="meta-item"><MapPin size={14} /> {booking.serviceLocation}</span>
                      
                      {booking.absoluteTime && (
                         <div style={{ marginTop: '0.75rem' }}>
                           <CountdownTimer targetTimeMs={booking.absoluteTime} />
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services List Section */}
        <section className="services-section">
          <div className="container">
            <h2 className="section-heading">Nearby Services</h2>
            
            {loadingServices ? (
              <div className="empty-state"><p>Loading services...</p></div>
            ) : filteredServices.length > 0 ? (
              <div className="services-grid">
                {filteredServices.map(service => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No services found matching "{searchTerm}"</p>
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;

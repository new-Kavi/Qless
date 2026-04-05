import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import Button from './Button';
import './ServiceCard.css';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const estimatedWait = service.queueSize * service.averageWaitTimePerPerson;

  return (
    <div className="service-card animate-fade-in">
      <div className="card-header">
        <span className="category-badge">{service.category}</span>
        <span className={`status-badge ${service.status.toLowerCase()}`}>
          {service.status}
        </span>
      </div>

      <h3 className="service-name">{service.name}</h3>

      <div className="service-details-grid">
        <div className="detail-item">
          <MapPin size={16} className="detail-icon" />
          <span>{service.location}</span>
        </div>

        <div className="detail-row-bottom">
          <div className="detail-item highlight-wait">
            <Clock size={16} className="detail-icon wait-icon" />
            <span className="wait-time-text">~{estimatedWait} mins wait</span>
          </div>

          <div className="detail-item queue-size">
            <Users size={16} className="detail-icon" />
            <span>{service.queueSize} in queue</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate(`/service/${service._id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;

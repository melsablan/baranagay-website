import React from 'react';

const ServiceItem = ({ icon, label, onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className="service-item clickable"
      style={{ cursor: 'pointer' }}
    >
      <div className="service-icon">
        {icon}
      </div>
      <span className="service-label">{label}</span>
    </div>
  );
};

export default ServiceItem;

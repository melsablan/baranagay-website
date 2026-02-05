import React, { useState, useEffect } from 'react';
import { X, Calendar, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const AppointmentBookingForm = ({ onClose, preselectedService }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: preselectedService || '',
    date: '',
    time: '',
    healthConcern: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const services = [
    'Health Center Services',
    'Vaccination Services',
    'General Checkup',
    'Vaccination',
    'Prenatal Care',
    'Dental Service',
    'Mental Health',
    'Other'
  ];

  // Map service names for compatibility with database ENUM
  const mapServiceName = (serviceName) => {
    const serviceMap = {
      'Health Center Services': 'General Checkup',
      'Vaccination Services': 'Vaccination'
    };
    return serviceMap[serviceName] !== undefined ? serviceMap[serviceName] : serviceName;
  };

  // Update formData if preselectedService changes
  useEffect(() => {
    if (preselectedService) {
      const mappedService = mapServiceName(preselectedService);
      setFormData(prev => ({
        ...prev,
        serviceType: mappedService
      }));
    }
  }, [preselectedService]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Load available slots when date or service changes
    if (e.target.name === 'date' || e.target.name === 'serviceType') {
      const newFormData = { ...formData, [e.target.name]: e.target.value };
      if (newFormData.date && newFormData.serviceType) {
        loadAvailableSlots(newFormData.date, newFormData.serviceType);
      }
    }
  };

  const loadAvailableSlots = async (date, service) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/available-slots?date=${date}&service=${encodeURIComponent(service)}`
      );
      const data = await response.json();
      
      // Convert time format from 24hr to 12hr for display
      const formattedSlots = data.availableSlots.map(slot => {
        const [hours, minutes] = slot.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return {
          value: slot,
          display: `${displayHour}:${minutes} ${ampm}`
        };
      });
      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Map service name before sending
      const submissionData = {
        ...formData,
        serviceType: mapServiceName(formData.serviceType) || formData.serviceType
      };

      const response = await fetch(`${API_BASE_URL}/appointments/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      const data = await response.json();
      setSubmitStatus('success');
      setTrackingId(data.trackingId);
      
      setTimeout(() => {
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          serviceType: '', 
          date: '', 
          time: '', 
          healthConcern: '' 
        });
        setSubmitStatus(null);
        onClose();
      }, 5000);

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <div className="form-header">
          <div className="form-header-content">
            <div className="form-icon-wrapper">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="form-title">Book Health Appointment</h2>
              <p className="form-subtitle">Schedule your visit to the health center</p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {/* Personal Information */}
          <div className="form-section-title">Personal Information</div>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="juan@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="09171234567"
                required
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="form-section-title">Appointment Details</div>

          <div className="form-group">
            <label htmlFor="serviceType" className="form-label">
              Service <span className="required">*</span>
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Date and Time Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                Preferred Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                min={getMinDate()}
                max={getMaxDate()}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time" className="form-label">
                Preferred Time <span className="required">*</span>
              </label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="form-input"
                required
                disabled={!formData.date || !formData.serviceType || loadingSlots}
              >
                <option value="">
                  {loadingSlots ? 'Loading slots...' : 
                   !formData.date || !formData.serviceType ? 'Select date & service first' : 
                   'Select time'}
                </option>
                {availableSlots.map(slot => (
                  <option key={slot.value} value={slot.value}>{slot.display}</option>
                ))}
              </select>
              {availableSlots.length === 0 && formData.date && formData.serviceType && !loadingSlots && (
                <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                  No available slots for this date. Please choose another date.
                </small>
              )}
            </div>
          </div>

          {/* Health Concern */}
          <div className="form-group">
            <label htmlFor="healthConcern" className="form-label">
              Health Concern (Optional)
            </label>
            <textarea
              id="healthConcern"
              name="healthConcern"
              value={formData.healthConcern}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Please describe your health concern..."
              rows="4"
            />
          </div>

          {/* Submit Status Messages */}
          {submitStatus === 'success' && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <div>
                <strong>Appointment booked successfully!</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Your tracking ID: <strong>{trackingId}</strong>
                  <br />We'll confirm your schedule soon. Check your email for details.
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>Failed to book appointment. Please try again.</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Book Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBookingForm;
import React, { useState } from 'react';
import { Search, FileText, Calendar, CheckCircle, Clock, XCircle, Download, AlertCircle } from 'lucide-react';
import { certificateAPI, appointmentAPI } from '../config/api';
import './StatusTracking.css';

const StatusTracking = () => {
  const [trackingType, setTrackingType] = useState('certificate');
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setResult(null);
    setIsSearching(true);

    try {
      let data;
      if (trackingType === 'certificate') {
        data = await certificateAPI.track(trackingId);
      } else {
        data = await appointmentAPI.track(trackingId);
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error tracking:', err);
      setError('No record found. Please check your tracking ID and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
      case 'confirmed':
      case 'ready_for_pickup':
        return <CheckCircle size={24} className="status-icon-success" />;
      case 'pending':
      case 'processing':
        return <Clock size={24} className="status-icon-pending" />;
      case 'rejected':
      case 'cancelled':
      case 'no_show':
        return <XCircle size={24} className="status-icon-rejected" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved':
      case 'confirmed':
      case 'ready_for_pickup':
        return 'success';
      case 'pending':
      case 'processing':
        return 'pending';
      case 'rejected':
      case 'cancelled':
      case 'no_show':
        return 'rejected';
      default:
        return '';
    }
  };

  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="status-tracking-page">
      {/* Hero Section */}
      <section className="tracking-hero">
        <div className="container">
          <h1 className="tracking-hero-title">Track Your Request</h1>
          <p className="tracking-hero-subtitle">
            Enter your tracking ID to check the status of your certificate or appointment
          </p>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="tracking-form-section">
        <div className="container">
          <div className="tracking-form-wrapper">
            {/* Type Selector */}
            <div className="tracking-type-selector">
              <button
                className={`type-btn ${trackingType === 'certificate' ? 'active' : ''}`}
                onClick={() => {
                  setTrackingType('certificate');
                  setResult(null);
                  setError('');
                  setTrackingId('');
                }}
              >
                <FileText size={20} />
                <span>Certificate Request</span>
              </button>
              <button
                className={`type-btn ${trackingType === 'appointment' ? 'active' : ''}`}
                onClick={() => {
                  setTrackingType('appointment');
                  setResult(null);
                  setError('');
                  setTrackingId('');
                }}
              >
                <Calendar size={20} />
                <span>Health Appointment</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="tracking-search">
              <input
                type="text"
                placeholder={`Enter your tracking ID (e.g., ${trackingType === 'certificate' ? 'CERT' : 'APPT'}-20241222-1234)`}
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && trackingId && handleSearch()}
              />
              <button onClick={handleSearch} disabled={!trackingId || isSearching}>
                {isSearching ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Track</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="tracking-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="tracking-result">
                <div className="result-header">
                  <div className="result-status">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="result-title">
                        {trackingType === 'certificate' ? result.type : result.service}
                      </h3>
                      <p className="result-id">Tracking ID: #{result.id}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusClass(result.status)}`}>
                    {getStatusDisplay(result.status)}
                  </span>
                </div>

                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{result.name}</span>
                  </div>
                  
                  {trackingType === 'certificate' ? (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Date Submitted:</span>
                        <span className="detail-value">{result.dateSubmitted}</span>
                      </div>
                      {result.dateProcessed && (
                        <div className="detail-row">
                          <span className="detail-label">Date Processed:</span>
                          <span className="detail-value">{result.dateProcessed}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Appointment Date:</span>
                        <span className="detail-value">{result.date}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{result.time}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">Remarks:</span>
                    <span className="detail-value">{result.remarks}</span>
                  </div>
                </div>

                {result.status === 'approved' && trackingType === 'certificate' && (
                  <button className="btn-download">
                    <Download size={18} />
                    <span>Download Certificate</span>
                  </button>
                )}
              </div>
            )}


          </div>
        </div>
      </section>
    </div>
  );
};

export default StatusTracking;
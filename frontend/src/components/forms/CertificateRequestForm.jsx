import React, { useState } from 'react';
import { X, FileText, Send, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const CertificateRequestForm = ({ onClose, preselectedCertificate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idType: '',
    idNumber: '',
    certificateType: preselectedCertificate || '',
    purpose: '',
    dateNeeded: ''
  });
  
  const [idFile, setIdFile] = useState(null);
  const [idFilePreview, setIdFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [trackingId, setTrackingId] = useState('');

  const certificateTypes = [
    'Barangay Clearance',
    'Certificate of Indigency',
    'Certificate of Residency',
    'Business Permit Clearance'
  ];

  const idTypes = [
    'Driver\'s License',
    'Passport',
    'SSS ID',
    'PhilHealth ID',
    'Voter\'s ID',
    'National ID',
    'Postal ID',
    'TIN ID',
    'PRC ID',
    'Other Government ID'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      
      setIdFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setIdFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setIdFile(null);
    setIdFilePreview(null);
    const fileInput = document.getElementById('idFile');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData to handle file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Append file if exists
      if (idFile) {
        submitData.append('idFile', idFile);
      }

      // Don't set Content-Type header for FormData - browser will set it automatically
      const response = await fetch(`${API_BASE_URL}/certificates/public`, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit request');
      }

      const data = await response.json();
      setSubmitStatus('success');
      setTrackingId(data.trackingId || data.tracking_id);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          idType: '', 
          idNumber: '', 
          certificateType: '', 
          purpose: '', 
          dateNeeded: '' 
        });
        setIdFile(null);
        setIdFilePreview(null);
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

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <div className="form-header">
          <div className="form-header-content">
            <div className="form-icon-wrapper">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="form-title">Request Certificate</h2>
              <p className="form-subtitle">Fill out the form below to request a certificate</p>
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

          {/* Valid ID Information */}
          <div className="form-section-title">Valid ID Information</div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idType" className="form-label">
                ID Type <span className="required">*</span>
              </label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select ID type</option>
                {idTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="idNumber" className="form-label">
                ID Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter ID number"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="idFile" className="form-label">
              Upload Valid ID <span className="required">*</span>
            </label>
            <p className="form-help-text">Upload a clear photo or scan of your valid ID (JPG, PNG, or PDF, max 5MB)</p>
            
            {!idFile ? (
              <div className="file-upload-area">
                <input
                  type="file"
                  id="idFile"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  required
                />
                <label htmlFor="idFile" className="file-upload-label">
                  <Upload size={32} />
                  <span className="file-upload-text">Click to upload or drag and drop</span>
                  <span className="file-upload-subtext">JPG, PNG or PDF (max. 5MB)</span>
                </label>
              </div>
            ) : (
              <div className="file-preview">
                {idFilePreview ? (
                  <img src={idFilePreview} alt="ID preview" className="file-preview-image" />
                ) : (
                  <div className="file-preview-pdf">
                    <FileText size={48} />
                    <span>{idFile.name}</span>
                  </div>
                )}
                <div className="file-preview-info">
                  <span className="file-name">{idFile.name}</span>
                  <span className="file-size">{(idFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button type="button" onClick={removeFile} className="btn-remove-file">
                  <X size={16} /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Certificate Details */}
          <div className="form-section-title">Certificate Details</div>

          <div className="form-group">
            <label htmlFor="certificateType" className="form-label">
              Certificate Type <span className="required">*</span>
            </label>
            <select
              id="certificateType"
              name="certificateType"
              value={formData.certificateType}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select certificate type</option>
              {certificateTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purpose" className="form-label">
              Purpose <span className="required">*</span>
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Please state the purpose of your request..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateNeeded" className="form-label">
              Date Needed (Optional)
            </label>
            <input
              type="date"
              id="dateNeeded"
              name="dateNeeded"
              value={formData.dateNeeded}
              onChange={handleChange}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Submit Status Messages */}
          {submitStatus === 'success' && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <div>
                <strong>Request submitted successfully!</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Your tracking ID: <strong>{trackingId}</strong>
                  <br />Please save this ID to track your request. We'll also send it to your email.
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>Failed to submit request. Please try again.</span>
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
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateRequestForm;
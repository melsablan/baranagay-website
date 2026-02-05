import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Calendar, Building2, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import CertificateRequestForm from '../components/forms/CertificateRequestForm';
import AppointmentBookingForm from '../components/forms/AppointmentBookingForm';
import './Services.css';

const Services = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Handle URL parameters for category selection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get('category');
    if (category && ['certificates', 'permits', 'health', 'community'].includes(category)) {
      setSelectedCategory(category);
    }
  }, [location.search]);

  const services = [
    {
      id: 1,
      category: 'certificates',
      icon: <FileText size={32} />,
      title: 'Barangay Clearance',
      description: 'Official clearance for employment, business, or travel purposes',
      fee: 'FREE (₱30 walk-in)',
      processing: '3-5 business days',
      requirements: [
        'Valid government-issued ID',
        'Proof of residency (utility bill or lease contract)',
        'Cedula or Community Tax Certificate',
        'Passport-size photo (1 copy)'
      ],
      canRequestOnline: true
    },
    {
      id: 2,
      category: 'certificates',
      icon: <FileText size={32} />,
      title: 'Certificate of Indigency',
      description: 'For medical, educational, or financial assistance purposes',
      fee: 'FREE (₱30 walk-in)',
      processing: '3-5 business days',
      requirements: [
        'Valid government-issued ID',
        'Proof of residency',
        'Letter explaining the purpose',
        'Supporting documents (medical records, school enrollment, etc.)'
      ],
      canRequestOnline: true
    },
    {
      id: 3,
      category: 'certificates',
      icon: <FileText size={32} />,
      title: 'Certificate of Residency',
      description: 'Proof of residency in Barangay NIT',
      fee: 'FREE (₱30 walk-in)',
      processing: '2-3 business days',
      requirements: [
        'Valid government-issued ID',
        'Utility bill or lease contract',
        'Passport-size photo (1 copy)'
      ],
      canRequestOnline: true
    },
    {
      id: 4,
      category: 'permits',
      icon: <Building2 size={32} />,
      title: 'Business Permit',
      description: 'Required for operating a business within the barangay',
      fee: 'Varies',
      processing: '5-7 business days',
      requirements: [
        'Barangay Clearance',
        'DTI/SEC Registration',
        'Lease contract or proof of ownership',
        'Tax Identification Number (TIN)',
        'Location clearance/sketch'
      ],
      canRequestOnline: false
    },
    {
      id: 5,
      category: 'permits',
      icon: <Building2 size={32} />,
      title: 'Building Permit Clearance',
      description: 'Clearance for construction or renovation projects',
      fee: 'FREE (₱30 walk-in)',
      processing: '3-5 business days',
      requirements: [
        'Barangay Clearance',
        'Architectural/Engineering plans',
        'Lot title or proof of ownership',
        'Tax declaration of property'
      ],
      canRequestOnline: true
    },
    {
      id: 6,
      category: 'health',
      icon: <Calendar size={32} />,
      title: 'Health Center Services',
      description: 'Medical consultations and health services',
      fee: 'FREE',
      processing: 'Walk-in or by appointment',
      requirements: [
        'Valid ID',
        'PhilHealth card (if available)',
        'Previous medical records (if applicable)'
      ],
      canRequestOnline: true,
      isHealthService: true
    },
    {
      id: 7,
      category: 'health',
      icon: <Calendar size={32} />,
      title: 'Vaccination Services',
      description: 'Immunization and vaccination programs',
      fee: 'FREE',
      processing: 'By appointment',
      requirements: [
        'Valid ID',
        'Immunization record/card',
        'Birth certificate (for children)'
      ],
      canRequestOnline: true,
      isHealthService: true
    },
    {
      id: 8,
      category: 'community',
      icon: <Users size={32} />,
      title: 'Resident Registration',
      description: 'Register as a resident of Barangay NIT',
      fee: 'FREE',
      processing: 'Same day',
      requirements: [
        'Valid government-issued ID',
        'Proof of residency (lease contract or utility bill)',
        'Filled-out registration form'
      ],
      canRequestOnline: false
    }
  ];

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'permits', label: 'Permits' },
    { id: 'health', label: 'Health Services' },
    { id: 'community', label: 'Community' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const handleRequestNow = (service) => {
    if (service.canRequestOnline) {
      // Check if it's a health service
      if (service.isHealthService) {
        setSelectedService(service);
        setIsAppointmentFormOpen(true);
      } else {
        // It's a certificate service
        setSelectedService(service);
        setIsFormOpen(true);
      }
    } else {
      alert('This service requires an in-person visit. Please come to the Barangay Hall during office hours.');
    }
  };

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <h1 className="services-hero-title">Our Services</h1>
          <p className="services-hero-subtitle">
            Comprehensive services to meet your needs efficiently and professionally
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="services-filter-section">
        <div className="container">
          <div className="services-categories">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Notice */}
      <section className="pricing-notice-section">
        <div className="container">
          <div className="pricing-notice">
            <h3>💡 Pricing Information</h3>
            <p><strong>Online Requests:</strong> FREE - Submit your certificate request through this website at no cost!</p>
            <p><strong>Walk-in at Barangay Hall:</strong> ₱30 - Direct requests made at the barangay office</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="container">
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon-wrapper">
                  {service.icon}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                
                <div className="service-details">
                  <div className="service-detail-item">
                    <span className="detail-label">Fee:</span>
                    <span className="detail-value">{service.fee}</span>
                  </div>
                  <div className="service-detail-item">
                    <span className="detail-label">Processing:</span>
                    <span className="detail-value">{service.processing}</span>
                  </div>
                </div>

                <div className="service-requirements">
                  <h4 className="requirements-title">Requirements:</h4>
                  <ul className="requirements-list">
                    {service.requirements.map((req, idx) => (
                      <li key={idx}>
                        <CheckCircle size={16} />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className="btn-request"
                  onClick={() => handleRequestNow(service)}
                >
                  Request Now <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Hours CTA */}
      <section className="services-cta">
        <div className="container">
          <div className="cta-content">
            <Clock size={48} />
            <h2 className="cta-title">Office Hours</h2>
            <p className="cta-text">Monday to Friday: 8:00 AM - 5:00 PM</p>
            <p className="cta-subtext">Visit us during office hours for faster processing</p>
          </div>
        </div>
      </section>

      {/* Certificate Request Form Modal */}
      {isFormOpen && selectedService && (
        <CertificateRequestForm 
          onClose={() => {
            setIsFormOpen(false);
            setSelectedService(null);
          }}
          preselectedCertificate={selectedService.title}
        />
      )}

      {/* Appointment Booking Form Modal */}
      {isAppointmentFormOpen && selectedService && (
        <AppointmentBookingForm 
          onClose={() => {
            setIsAppointmentFormOpen(false);
            setSelectedService(null);
          }}
          preselectedService={selectedService.title}
        />
      )}
    </div>
  );
};

export default Services;
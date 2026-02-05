import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Car, Building2, 
  Landmark, Home as HomeIcon, MessageSquare, FileText, Calendar, X,
  Target, Eye, Award, Users, Tag, ChevronRight, TrendingUp, Heart, Shield
} from 'lucide-react';
import ServiceItem from '../components/public/ServiceItem';
import BarangayChatBot from '../components/chat/BarangayChatBot';
import CertificateRequestForm from '../components/forms/CertificateRequestForm';
import AppointmentBookingForm from '../components/forms/AppointmentBookingForm';
import { newsAPI } from '../config/api';
import './Home.css';
import './StatsSection.css';
import '../components/forms/Forms.css';
import backgroundImage from '../background.jpg';

const Home = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCertificateFormOpen, setIsCertificateFormOpen] = useState(false);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [latestNews, setLatestNews] = useState([]);
  
  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://127.0.0.1:5000${imageUrl}`;
  };

  // Fetch latest news
  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const data = await newsAPI.getAll('all');
        setLatestNews(data.slice(0, 3)); // Get only 3 latest news
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };
    fetchLatestNews();
  }, []);

  const stats = [
    { icon: <Users size={40} />, value: '15,000+', label: 'Residents' },
    { icon: <TrendingUp size={40} />, value: '500+', label: 'Monthly Services' },
    { icon: <Heart size={40} />, value: '95%', label: 'Satisfaction Rate' },
    { icon: <Shield size={40} />, value: '24/7', label: 'Emergency Response' }
  ];

  const achievements = [
    { icon: <Award size={28} />, title: 'Excellence Award', description: '2023 Outstanding Barangay' },
    { icon: <Users size={28} />, title: 'Community First', description: '95% Satisfaction Rate' },
    { icon: <Target size={28} />, title: 'Zero Hunger', description: '500+ Families Supported' }
  ];

  return (
    <div className="home-page">
      {/* --- Hero Section --- */}
      <header className="hero">
        <div className="hero-bg">
          <img 
            src={backgroundImage} 
            alt="Crowd Background" 
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="container hero-content">
          {/* Center Content */}
          <div className="hero-text-col">
            <div className="subtitle-wrapper">
              <span className="subtitle">
                <span className="subtitle-line"></span>
                Welcome to Our Community
              </span>
            </div>
            
            <h1 className="hero-title">
              Barangay NIT
            </h1>
            
            <p className="hero-tagline">A Hub of Innovation, Service & Community</p>
            
            <p className="hero-desc">
              Experience excellent public service, transparent governance, and a thriving community where your needs come first.
            </p>
            
            <button className="btn-hero" onClick={() => navigate('/about')}>
              <span>Learn More</span>
              <ArrowRight size={18} />
            </button>
         
          </div>
        </div>
      </header>

      {/* --- Services Icon Bar --- */}
      <div className="services-section">
        <div className="container">
          <div className="services-grid">
            {/* Barangay Hall - Navigate to Contact */}
            <div onClick={() => navigate('/contact')} className="service-item clickable">
              <div className="service-icon">
                <Landmark size={28}/>
              </div>
              <span className="service-label">Barangay Hall</span>
            </div>
            
            {/* Interactive Service Cards */}
            <div onClick={() => setIsCertificateFormOpen(true)} className="service-item clickable">
              <div className="service-icon">
                <FileText size={28}/>
              </div>
              <span className="service-label">Request Certificate</span>
            </div>

            <div onClick={() => setIsAppointmentFormOpen(true)} className="service-item clickable">
              <div className="service-icon">
                <Calendar size={28}/>
              </div>
              <span className="service-label">Book Health Appointment</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Statistics Section --- */}
      <section 
        style={{
          background: 'linear-gradient(135deg, #A100FF 0%, #8B00E0 100%)',
          padding: '5rem 0',
          position: 'relative',
          zIndex: 10,
          marginTop: '-1px',
          width: '100%'
        }}
      >
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div 
                key={index}
                style={{
                  background: 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: '#ffffff',
                  boxShadow: 'none',
                  borderRadius: '0'
                }}
              >
                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100px',
                    height: '100px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '1.5rem',
                    marginBottom: '2rem',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    color: '#ffffff',
                    boxShadow: 'none'
                  }}
                >
                  {stat.icon}
                </div>
                <h3 
                  style={{
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: '0 0 0.75rem 0',
                    lineHeight: '1',
                    letterSpacing: '-0.02em',
                    textShadow: 'none'
                  }}
                >
                  {stat.value}
                </h3>
                <p 
                  style={{
                    fontSize: '1.125rem',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontWeight: '400',
                    letterSpacing: '0.01em',
                    margin: '0'
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- About Preview Section --- */}
      <section className="about-preview-section">
        <div className="container">
          <div className="about-preview-grid">
            <div className="about-preview-image">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800" 
                alt="Community"
              />
            </div>
            <div className="about-preview-content">
              <div className="section-badge">About Us</div>
              <h2 className="section-title">Serving the Community Since 2010</h2>
              <p className="section-description">
                Barangay NIT was established as part of Accenture's community development initiative. 
                We've grown into a vibrant community of professionals, families, and innovators, committed to 
                excellent public service and transparent governance.
              </p>
              
              <div className="mv-cards-mini">
                <div className="mv-card-mini">
                  <Target size={24} color="#A100FF" />
                  <div>
                    <h4>Our Mission</h4>
                    <p>Provide excellent public service with transparency and efficiency</p>
                  </div>
                </div>
                <div className="mv-card-mini">
                  <Eye size={24} color="#A100FF" />
                  <div>
                    <h4>Our Vision</h4>
                    <p>A progressive, peaceful, and prosperous community for all</p>
                  </div>
                </div>
              </div>

              <button className="btn-primary-outline" onClick={() => navigate('/about')}>
                <span>Learn More About Us</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Achievements Section --- */}
      <section className="achievements-home-section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-badge">Our Achievements</div>
            <h2 className="section-title">Recognized for Excellence</h2>
            <p className="section-subtitle">We're proud of what we've accomplished together</p>
          </div>
          
          <div className="achievements-grid-home">
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-card-home">
                <div className="achievement-icon-home">{achievement.icon}</div>
                <h3 className="achievement-title-home">{achievement.title}</h3>
                <p className="achievement-desc-home">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Latest News Section --- */}
      <section className="news-preview-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-badge">Latest Updates</div>
              <h2 className="section-title">News & Announcements</h2>
            </div>
            <button className="btn-secondary-outline" onClick={() => navigate('/news')}>
              View All News <ArrowRight size={16} />
            </button>
          </div>

          {latestNews.length > 0 ? (
            <div className="news-preview-grid">
              {latestNews.map((article) => (
                <article key={article.id} className="news-preview-card">
                  <div className="news-preview-image">
                    <img src={getImageUrl(article.image_url)} alt={article.title} />
                  </div>
                  <div className="news-preview-content">
                    <div className="news-meta">
                      <span className="news-category">
                        <Tag size={14} />
                        {article.category}
                      </span>
                      <span className="news-date">
                        <Calendar size={14} />
                        {new Date(article.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="news-preview-title">{article.title}</h3>
                    <p className="news-preview-excerpt">{article.excerpt}</p>
                    <button className="news-read-more">
                      Read More <ChevronRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="news-placeholder">
              <p>No news available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- Call to Action Section --- */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Need Assistance?</h2>
            <p className="cta-description">
              Our office is open Monday to Friday, 8:00 AM - 5:00 PM. Visit us or request services online.
            </p>
            <div className="cta-buttons">
              <button className="btn-cta-primary" onClick={() => navigate('/services')}>
                Browse Services
              </button>
              <button className="btn-cta-secondary" onClick={() => navigate('/contact')}>
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Chat Widget Floating Button --- */}
      <div className="chat-btn-wrapper">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="chat-toggle-btn"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      {/* --- Modals --- */}
      {isChatOpen && <BarangayChatBot onClose={() => setIsChatOpen(false)} />}
      {isCertificateFormOpen && <CertificateRequestForm onClose={() => setIsCertificateFormOpen(false)} />}
      {isAppointmentFormOpen && <AppointmentBookingForm onClose={() => setIsAppointmentFormOpen(false)} />}
    </div>
  );
};

export default Home;

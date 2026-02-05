import React from 'react';
import { Users, Target, Eye, Award, MapPin, Phone, Mail, Clock } from 'lucide-react';
import './About.css';

const About = () => {
  const officials = [
    { name: 'Kapitan Mel Sablan', position: 'Barangay Captain', image: '/capt.png' },
    { name: 'Ann Sheryll Tiu', position: 'Kagawad - Health', image: '/kagawad-anne.png' },
    { name: 'Lennen Lumbre', position: 'Kagawad - Education', image: '/kagawad-len.png' },
    { name: 'Nestlie Laguidao', position: 'Kagawad - Peace & Order', image: '/kagawad-nes.png' },
    { name: 'Cristine Pelare ', position: 'SK Chairman', image: '/kagawad-tine.png' },
  ];

  const achievements = [
    { icon: <Award size={32} />, title: 'Excellence in Governance', description: '2023 Outstanding Barangay Award' },
    { icon: <Users size={32} />, title: 'Community Engagement', description: '95% Resident Satisfaction Rate' },
    { icon: <Target size={32} />, title: 'Zero Hunger Program', description: 'Successfully fed 500+ families' },
    { icon: <Eye size={32} />, title: 'Transparency', description: 'Full Budget Disclosure & Public Audits' },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="container about-hero-content">
          <h1 className="about-hero-title">About Barangay NIT</h1>
          <p className="about-hero-subtitle">Serving the community with transparency, efficiency, and compassion</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision-section">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">
                <Target size={40} />
              </div>
              <h2 className="mv-title">Our Mission</h2>
              <p className="mv-text">
                To provide excellent public service and promote the general welfare of all residents through transparent governance, 
                efficient delivery of basic services, and active community participation in local development programs.
              </p>
            </div>

            <div className="mv-card">
              <div className="mv-icon">
                <Eye size={40} />
              </div>
              <h2 className="mv-title">Our Vision</h2>
              <p className="mv-text">
                A progressive, peaceful, and prosperous Barangay NIT where every resident enjoys quality services, 
                sustainable development, and a safe community conducive to growth and harmony.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="history-section">
        <div className="container">
          <h2 className="section-title">Our History</h2>
          <div className="history-content">
            <div className="history-text">
              <p>
                Barangay NIT was established in 2010 as part of Accenture's community development initiative. 
                What started as a small settlement has grown into a vibrant community of professionals, families, and innovators.
              </p>
              <p>
                Over the years, we've built essential infrastructure including our Health Center, Multi-Purpose Hall, 
                and Digital Services Hub. Our community has been recognized for excellence in governance and citizen engagement.
              </p>
              <p>
                Today, Barangay NIT stands as a model for modern barangay governance, combining traditional community values 
                with innovative technology to serve our residents better.
              </p>
            </div>
            <div className="history-image">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800" 
                alt="Community gathering"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements-section">
        <div className="container">
          <h2 className="section-title">Our Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-desc">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Officials Section */}
      <section className="officials-section">
        <div className="container">
          <h2 className="section-title">Barangay Officials</h2>
          <p className="section-subtitle">Meet the dedicated leaders serving our community</p>
          <div className="officials-grid">
            {officials.map((official, index) => (
              <div key={index} className="official-card">
                <div className="official-image">
                  <img src={official.image} alt={official.name} />
                </div>
                <div className="official-info">
                  <h3 className="official-name">{official.name}</h3>
                  <p className="official-position">{official.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            <div className="contact-info-card">
              <MapPin size={24} />
              <div>
                <h3>Address</h3>
                <p>NIT Barangay Hall, Accenture Campus</p>
              </div>
            </div>
            <div className="contact-info-card">
              <Phone size={24} />
              <div>
                <h3>Phone</h3>
                <p>(02) 8123-4567</p>
              </div>
            </div>
            <div className="contact-info-card">
              <Mail size={24} />
              <div>
                <h3>Email</h3>
                <p>brgynit@gmail.com</p>
              </div>
            </div>
            <div className="contact-info-card">
              <Clock size={24} />
              <div>
                <h3>Office Hours</h3>
                <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
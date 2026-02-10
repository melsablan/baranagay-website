import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  Facebook, Clock, ChevronDown, ArrowRight, Menu, X 
} from 'lucide-react';
import logonit from './logonit.png';
import ScrollToTop from './components/common/ScrollToTop';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Services from './pages/Services';
import StatusTracking from './pages/StatusTracking';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

// Styles
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Main Layout Component with Navigation
const Layout = ({ children }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-wrapper">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-red"></div>
        <div className="top-bar-blue">
          <div className="icon-text-row">
            <Clock size={14} />
            <span>Open Hours of Barangay NIT Mon - Fri: 8.00 am - 5.00 pm</span>
          </div>
          <div className="icon-text-row" style={{paddingRight: '1rem'}}>
            <button className="social-link" onClick={() => window.open('https://facebook.com', '_blank')}>
              <Facebook size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          
          {/* Logo Area */}
          <Link to="/" className="logo-area">
            <div className="logo-circle">
              <img 
                src={logonit} 
                alt="Seal" 
                className="logo-img"
                onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='BN'}}
              />
            </div>
            <div className="logo-text hidden-mobile">
              <h1>Barangay NIT</h1>
              <p>Lungsod ng Accenture</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <div className="dropdown-container">
              <span>Services</span>
              <ChevronDown size={14} />
              <div className="dropdown-menu">
                <Link to="/services" className="dropdown-item">All Services</Link>
                <Link to="/services?category=health" className="dropdown-item">Health Center</Link>
                <Link to="/services?category=certificates" className="dropdown-item">Certificate & Clearance</Link>
              </div>
            </div>
            <Link to="/news" className="nav-link">News</Link>
            <Link to="/faq" className="nav-link">FAQ</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            
            <Link to="/status" className="btn-touch">
              <span>Track Status</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn flex-mobile" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-dropdown flex-mobile">
            <div className="mobile-nav-list">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{color: '#A100FF', fontWeight: 500}}>Home</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
              <Link to="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
              <Link to="/news" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
              <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
              <Link to="/status" onClick={() => setIsMobileMenuOpen(false)} className="btn-mobile-touch">Track Status</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            {/* About Column */}
            <div className="footer-column">
              <h3 className="footer-title">Barangay NIT</h3>
              <p className="footer-text">
                Serving the community with transparency, efficiency, and compassion since 2010.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/news">News</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-column">
              <h3 className="footer-title">Services</h3>
              <ul className="footer-links">
                <li><Link to="/services">Certificate Requests</Link></li>
                <li><Link to="/services">Health Appointments</Link></li>
                <li><Link to="/services">Business Permits</Link></li>
                <li><Link to="/status">Track Status</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-column">
              <h3 className="footer-title">Contact Us</h3>
              <ul className="footer-contact">
                <li>NIT Barangay Hall</li>
                <li>Accenture Campus</li>
                <li>(02) 8123-4567</li>
                <li>brgynit@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Barangay NIT. All rights reserved.</p>
            <div className="footer-links-bottom">
              <Link to="/admin/login">Admin</Link>
              <span>|</span>
              <button onClick={() => window.scrollTo(0, 0)} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline'}}>Privacy Policy</button>
              <span>|</span>
              <button onClick={() => window.scrollTo(0, 0)} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline'}}>Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/status" element={<Layout><StatusTracking /></Layout>} />

        {/* Admin Routes (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Redirect /admin to /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* 404 Page */}
        <Route path="*" element={
          <Layout>
            <div style={{padding: '5rem 2rem', textAlign: 'center', minHeight: '60vh'}}>
              <h1 style={{fontSize: '3rem', marginBottom: '1rem'}}>404</h1>
              <p style={{color: '#6b7280', marginBottom: '2rem'}}>Page not found</p>
              <Link to="/" style={{color: '#A100FF', fontWeight: 600}}>Go back home</Link>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

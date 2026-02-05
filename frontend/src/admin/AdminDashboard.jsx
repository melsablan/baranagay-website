import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Calendar, Users, Settings, Bell,
  Search, ChevronDown, Eye, Check, X, Clock, TrendingUp,
  ClipboardList, Activity, ChevronRight, Newspaper, Plus, Edit, Trash2,
  UserPlus, MapPin, Phone, Mail, AlertCircle, Loader, LogOut, Download, MessageSquare, Upload
} from 'lucide-react';
import './AdminDashboard.css';
import './DashboardFix.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [isResidentFormOpen, setIsResidentFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    requests: false,
    appointments: false,
    news: false,
    residents: false,
    messages: false,
    stats: false
  });

  // Error states
  const [errors, setErrors] = useState({});

  // Data from database
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [residents, setResidents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    appointments: 0,
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch functions
  const fetchRequests = async () => {
    setLoading(prev => ({ ...prev, requests: true }));
    setErrors(prev => ({ ...prev, requests: null }));
    
    try {
      const response = await fetch(`${API_URL}/certificates/all`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      
      // Transform data to match frontend format
      const transformedData = data.map(cert => ({
        id: cert.id,
        name: `${cert.first_name} ${cert.last_name}`,
        type: cert.certificate_type,
        date: new Date(cert.created_at).toISOString().split('T')[0],
        status: cert.status,
        purpose: cert.purpose,
        email: cert.email,
        phone: cert.phone,
        trackingId: cert.tracking_id,
        id_type: cert.id_type,
        id_number: cert.id_number,
        id_file_path: cert.id_file_path
      }));
      
      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setErrors(prev => ({ ...prev, requests: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  };

  const fetchAppointments = async () => {
    setLoading(prev => ({ ...prev, appointments: true }));
    setErrors(prev => ({ ...prev, appointments: null }));
    
    try {
      const response = await fetch(`${API_URL}/appointments/all`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      
      // Transform data to match frontend format
      const transformedData = data.map(appt => ({
        id: appt.id,
        name: `${appt.first_name} ${appt.last_name}`,
        service: appt.service_type,
        date: new Date(appt.appointment_date).toISOString().split('T')[0],
        time: appt.appointment_time,
        status: appt.status,
        phone: appt.phone || 'N/A',
        concern: appt.health_concern,
        trackingId: appt.tracking_id
      }));
      
      setAppointments(transformedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setErrors(prev => ({ ...prev, appointments: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  const fetchNews = async () => {
    setLoading(prev => ({ ...prev, news: true }));
    setErrors(prev => ({ ...prev, news: null }));
    
    try {
      const response = await fetch(`${API_URL}/news`);

      if (!response.ok) throw new Error('Failed to fetch news');
      
      const data = await response.json();
      
      // Transform data to match frontend format
      const transformedData = data.map(article => ({
        id: article.id,
        title: article.title,
        category: article.category,
        date: new Date(article.created_at).toISOString().split('T')[0],
        featured: article.featured || false,
        status: article.published ? 'published' : 'draft',
        excerpt: article.excerpt,
        content: article.content,
        image_url: article.image_url
      }));
      
      setNewsArticles(transformedData);
    } catch (error) {
      console.error('Error fetching news:', error);
      setErrors(prev => ({ ...prev, news: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  };

  const fetchMessages = async () => {
    setLoading(prev => ({ ...prev, messages: true }));
    setErrors(prev => ({ ...prev, messages: null }));
    
    try {
      const response = await fetch(`${API_URL}/contact/messages`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      
      // Transform data to match frontend format
      const transformedData = data.map(msg => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone || 'N/A',
        subject: msg.subject,
        message: msg.message,
        date: new Date(msg.created_at).toISOString().split('T')[0],
        time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: msg.status || 'unread'
      }));
      
      setMessages(transformedData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrors(prev => ({ ...prev, messages: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  const fetchStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      
      setStats({
        pending: data.pendingCertificates || 0,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        appointments: data.todayAppointments || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchRequests();
    fetchAppointments();
    fetchNews();
    fetchMessages();
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView]);

  // Update stats when requests change
  useEffect(() => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const todayAppointments = appointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.date === today && a.status === 'confirmed';
    }).length;
    
    setStats({
      pending,
      approved,
      rejected,
      appointments: todayAppointments
    });
    
    // Debug log
    console.log('Dashboard Stats Updated:', { pending, approved, rejected, appointments: todayAppointments });
  }, [requests, appointments]);

  // Handle request actions
  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${API_URL}/certificates/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          remarks: 'Certificate approved and ready for pickup'
        })
      });

      if (!response.ok) throw new Error('Failed to approve request');

      // Refresh requests
      await fetchRequests();
      setSelectedRequest(null);
      alert('Certificate approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve certificate. Please try again.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`${API_URL}/certificates/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Failed to reject request');

      // Refresh requests
      await fetchRequests();
      setSelectedRequest(null);
      alert('Certificate rejected successfully.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject certificate. Please try again.');
    }
  };

  const handleConfirmAppointment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to confirm appointment');

      // Refresh appointments
      await fetchAppointments();
      setSelectedRequest(null);
      alert('Appointment confirmed successfully!');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment. Please try again.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  // Filter requests
  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-badge">BN</div>
            <div>
              <h2 className="sidebar-title">Barangay NIT</h2>
              <p className="sidebar-subtitle">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-section-title">Main Menu</p>
            <div 
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveView('requests')}
            >
              <FileText size={20} />
              <span>Certificate Requests</span>
              {stats.pending > 0 && <span className="nav-badge">{stats.pending}</span>}
            </div>
            <div 
              className={`nav-item ${activeView === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveView('appointments')}
            >
              <Calendar size={20} />
              <span>Health Appointments</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'news' ? 'active' : ''}`}
              onClick={() => setActiveView('news')}
            >
              <Newspaper size={20} />
              <span>News & Announcements</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveView('messages')}
            >
              <MessageSquare size={20} />
              <span>Messages</span>
              {messages.filter(m => m.status === 'unread').length > 0 && (
                <span className="nav-badge">{messages.filter(m => m.status === 'unread').length}</span>
              )}
            </div>
          </div>

          <div className="nav-section">
            <p className="nav-section-title">Management</p>
            <div 
              className={`nav-item ${activeView === 'residents' ? 'active' : ''}`}
              onClick={() => setActiveView('residents')}
            >
              <Users size={20} />
              <span>Residents</span>
            </div>
            <div className="nav-item">
              <Activity size={20} />
              <span>Reports</span>
            </div>
            <div className="nav-item">
              <Settings size={20} />
              <span>Settings</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h1>
              {activeView === 'dashboard' && 'Dashboard Overview'}
              {activeView === 'requests' && 'Certificate Requests'}
              {activeView === 'appointments' && 'Health Center Appointments'}
              {activeView === 'news' && 'News & Announcements'}
              {activeView === 'messages' && 'Contact Messages'}
              {activeView === 'residents' && 'Resident Management'}
            </h1>
            <p className="breadcrumb">
              <span>Home</span> <ChevronRight size={14} style={{display: 'inline', verticalAlign: 'middle'}} /> <span>{activeView}</span>
            </p>
          </div>
          <div className="top-bar-right">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="notification-btn">
              <Bell size={20} />
              {stats.pending > 0 && <span className="notification-dot"></span>}
            </button>
            <div className="admin-profile" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <div className="admin-avatar">AD</div>
                <div className="admin-info">
                  <div className="admin-name">Admin User</div>
                  <div className="admin-role">Administrator</div>
                </div>
                <ChevronDown size={16} />
              </div>
              <button 
                className="logout-button" 
                onClick={handleLogout}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  zIndex: 1000
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeView === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card pending">
                  <div className="stat-header">
                    <div>
                      <div className="stat-number">
                        {loading.stats ? <Loader className="spinning" size={24} /> : stats.pending}
                      </div>
                      <div className="stat-label">Pending Requests</div>
                    </div>
                    <div className="stat-icon pending">
                      <Clock size={24} />
                    </div>
                  </div>
                  <div className="stat-change positive">
                    <TrendingUp size={14} /> Requires attention
                  </div>
                </div>

                <div className="stat-card approved">
                  <div className="stat-header">
                    <div>
                      <div className="stat-number">
                        {loading.stats ? <Loader className="spinning" size={24} /> : stats.approved}
                      </div>
                      <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-icon approved">
                      <Check size={24} />
                    </div>
                  </div>
                  <div className="stat-change positive">
                    <TrendingUp size={14} /> This month
                  </div>
                </div>

                <div className="stat-card rejected">
                  <div className="stat-header">
                    <div>
                      <div className="stat-number">
                        {loading.stats ? <Loader className="spinning" size={24} /> : stats.rejected}
                      </div>
                      <div className="stat-label">Rejected</div>
                    </div>
                    <div className="stat-icon rejected">
                      <X size={24} />
                    </div>
                  </div>
                  <div className="stat-change negative">
                    This month
                  </div>
                </div>

                <div className="stat-card appointments">
                  <div className="stat-header">
                    <div>
                      <div className="stat-number">
                        {loading.stats ? <Loader className="spinning" size={24} /> : stats.appointments}
                      </div>
                      <div className="stat-label">Appointments Today</div>
                    </div>
                    <div className="stat-icon appointments">
                      <Calendar size={24} />
                    </div>
                  </div>
                  <div className="stat-change positive">
                    <TrendingUp size={14} /> Confirmed
                  </div>
                </div>
              </div>

              {/* Recent Requests */}
              <div style={{marginTop: '1.5rem'}}>
                {loading.requests ? (
                  <div className="loading-state">
                    <Loader className="spinning" size={32} />
                    <p>Loading requests...</p>
                  </div>
                ) : errors.requests ? (
                  <div className="error-state">
                    <AlertCircle size={32} />
                    <p>Error loading requests: {errors.requests}</p>
                    <button onClick={fetchRequests} className="btn btn-primary">Retry</button>
                  </div>
                ) : (
                  <RequestsTable 
                    requests={requests.slice(0, 5)} 
                    onView={setSelectedRequest}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    showTitle={true}
                  />
                )}
              </div>
            </>
          )}

          {activeView === 'requests' && (
            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">All Certificate Requests</h2>
                <div className="table-actions">
                  <button 
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('pending')}
                  >
                    <Clock size={16} /> Pending
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('approved')}
                  >
                    <Check size={16} /> Approved
                  </button>
                  <button 
                    className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('rejected')}
                  >
                    <X size={16} /> Rejected
                  </button>
                </div>
              </div>
              {loading.requests ? (
                <div className="loading-state">
                  <Loader className="spinning" size={32} />
                  <p>Loading requests...</p>
                </div>
              ) : (
                <RequestsTable 
                  requests={filteredRequests}
                  onView={setSelectedRequest}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  showTitle={false}
                />
              )}
            </div>
          )}

          {activeView === 'appointments' && (
            loading.appointments ? (
              <div className="loading-state">
                <Loader className="spinning" size={32} />
                <p>Loading appointments...</p>
              </div>
            ) : (
              <AppointmentsTable 
                appointments={appointments}
                onView={setSelectedRequest}
                onConfirm={handleConfirmAppointment}
              />
            )
          )}

          {activeView === 'news' && (
            loading.news ? (
              <div className="loading-state">
                <Loader className="spinning" size={32} />
                <p>Loading news...</p>
              </div>
            ) : (
              <NewsManagement 
                articles={newsArticles}
                onAdd={() => {
                  setEditingNews(null);
                  setIsNewsFormOpen(true);
                }}
                onEdit={(article) => {
                  setEditingNews(article);
                  setIsNewsFormOpen(true);
                }}
                onDelete={async (id) => {
                  if (window.confirm('Are you sure you want to delete this article?')) {
                    try {
                      const response = await fetch(`${API_URL}/news/${id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${getAuthToken()}`
                        }
                      });
                      
                      if (response.ok) {
                        await fetchNews();
                        alert('News article deleted successfully');
                      } else {
                        alert('Failed to delete news article');
                      }
                    } catch (error) {
                      console.error('Error deleting news article:', error);
                      alert('Error deleting news article. Please try again.');
                    }
                  }
                }}
              />
            )
          )}

          {activeView === 'messages' && (
            loading.messages ? (
              <div className="loading-state">
                <Loader className="spinning" size={32} />
                <p>Loading messages...</p>
              </div>
            ) : (
              <MessagesManagement 
                messages={messages}
                onView={(message) => setSelectedRequest(message)}
                onDelete={async (id) => {
                  if (window.confirm('Are you sure you want to delete this message?')) {
                    try {
                      const response = await fetch(`${API_URL}/contact/messages/${id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${getAuthToken()}`
                        }
                      });
                      if (response.ok) {
                        await fetchMessages();
                        alert('Message deleted successfully');
                      }
                    } catch (error) {
                      console.error('Error deleting message:', error);
                      alert('Failed to delete message');
                    }
                  }
                }}
                onMarkRead={async (id) => {
                  try {
                    const response = await fetch(`${API_URL}/contact/messages/${id}/mark-read`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                      }
                    });
                    if (response.ok) {
                      await fetchMessages();
                    }
                  } catch (error) {
                    console.error('Error marking message as read:', error);
                  }
                }}
              />
            )
          )}

          {activeView === 'residents' && (
            <ResidentManagement 
              residents={residents}
              onAdd={() => {
                setEditingResident(null);
                setIsResidentFormOpen(true);
              }}
              onEdit={(resident) => {
                setEditingResident(resident);
                setIsResidentFormOpen(true);
              }}
              onView={(resident) => {
                setSelectedRequest(resident);
              }}
              onDelete={(id) => {
                if (window.confirm('Are you sure you want to delete this resident?')) {
                  // Add delete API call here
                  setResidents(residents.filter(r => r.id !== id));
                }
              }}
              onApprove={(id) => {
                // Add approve API call here
                setResidents(residents.map(r => 
                  r.id === id ? { ...r, status: 'active' } : r
                ));
              }}
            />
          )}
        </div>
      </main>

      {/* Modal for Request Details */}
      {selectedRequest && selectedRequest.type && (
        <RequestModal 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Modal for Appointment Details */}
      {selectedRequest && selectedRequest.service && (
        <AppointmentModal 
          appointment={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onConfirm={handleConfirmAppointment}
        />
      )}

      {/* News Form Modal */}
      {isNewsFormOpen && (
        <NewsFormModal 
          article={editingNews}
          onClose={() => {
            setIsNewsFormOpen(false);
            setEditingNews(null);
          }}
          onSave={async (article) => {
            try {
              const token = getAuthToken();
              
              if (editingNews) {
                // Update existing article
                const response = await fetch(`${API_URL}/news/${editingNews.id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(article)
                });
                
                if (response.ok) {
                  await fetchNews();
                  alert('News article updated successfully!');
                } else {
                  alert('Failed to update news article');
                }
              } else {
                // Create new article
                const response = await fetch(`${API_URL}/news`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(article)
                });
                
                if (response.ok) {
                  await fetchNews();
                  alert('News article created successfully!');
                } else {
                  alert('Failed to create news article');
                }
              }
              
              setIsNewsFormOpen(false);
              setEditingNews(null);
            } catch (error) {
              console.error('Error saving news article:', error);
              alert('Error saving news article. Please try again.');
            }
          }}
        />
      )}

      {/* Resident Form Modal */}
      {isResidentFormOpen && (
        <ResidentFormModal 
          resident={editingResident}
          onClose={() => {
            setIsResidentFormOpen(false);
            setEditingResident(null);
          }}
          onSave={(resident) => {
            // Add save API call here
            if (editingResident) {
              setResidents(residents.map(r => 
                r.id === editingResident.id ? { ...resident, id: editingResident.id } : r
              ));
            } else {
              const newResident = {
                ...resident,
                id: residents.length > 0 ? Math.max(...residents.map(r => r.id)) + 1 : 1,
                dateRegistered: new Date().toISOString().split('T')[0],
                status: 'pending'
              };
              setResidents([newResident, ...residents]);
            }
            setIsResidentFormOpen(false);
            setEditingResident(null);
          }}
        />
      )}

      {/* Resident Details Modal */}
      {selectedRequest && selectedRequest.address && (
        <ResidentModal 
          resident={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={(id) => {
            setResidents(residents.map(r => 
              r.id === id ? { ...r, status: 'active' } : r
            ));
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Message Details Modal */}
      {selectedRequest && selectedRequest.subject && (
        <MessageModal 
          message={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

// Loading State Component
const LoadingState = ({ message = 'Loading...' }) => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <Loader className="spinning" size={48} style={{ margin: '0 auto 1rem' }} />
    <p style={{ color: '#6b7280' }}>{message}</p>
  </div>
);

// Resident Management Component (same as before)
const ResidentManagement = ({ residents, onAdd, onEdit, onView, onDelete, onApprove }) => (
  <div className="table-card">
    <div className="table-header">
      <h2 className="table-title">Registered Residents</h2>
      <button className="btn btn-primary" onClick={onAdd}>
        <UserPlus size={16} /> Add Resident
      </button>
    </div>
    {residents.length > 0 ? (
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Date Registered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {residents.map(resident => (
            <tr key={resident.id}>
              <td>#{resident.id.toString().padStart(4, '0')}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{resident.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{resident.email}</div>
              </td>
              <td>{resident.age}</td>
              <td>{resident.gender}</td>
              <td>{resident.address}</td>
              <td>{resident.contact}</td>
              <td>{resident.dateRegistered}</td>
              <td>
                <span className={`status-badge ${resident.status}`}>
                  <span className="status-dot"></span>
                  {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn view" onClick={() => onView(resident)}>
                    <Eye size={16} />
                  </button>
                  {resident.status === 'pending' && (
                    <button className="action-btn approve" onClick={() => onApprove(resident.id)}>
                      <Check size={16} />
                    </button>
                  )}
                  <button className="action-btn edit" onClick={() => onEdit(resident)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn reject" onClick={() => onDelete(resident.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="empty-state">
        <div className="empty-icon">
          <Users size={32} />
        </div>
        <h3 className="empty-title">No registered residents yet</h3>
        <p className="empty-desc">Add your first resident to get started.</p>
        <button className="btn btn-primary" onClick={onAdd} style={{ marginTop: '1rem' }}>
          <UserPlus size={16} /> Add Resident
        </button>
      </div>
    )}
  </div>
);

// Resident Form Modal Component (same as before)
const ResidentFormModal = ({ resident, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    name: resident?.name || '',
    age: resident?.age || '',
    gender: resident?.gender || 'Male',
    address: resident?.address || '',
    contact: resident?.contact || '',
    email: resident?.email || '',
    emergencyContact: resident?.emergencyContact || '',
    emergencyName: resident?.emergencyName || '',
    status: resident?.status || 'pending'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h3 className="modal-title">{resident ? 'Edit Resident' : 'Register New Resident'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section-title">Personal Information</div>
            
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  min="1"
                  max="150"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="Block 1 Lot 5"
              />
            </div>

            <div className="form-section-title">Contact Information</div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                  placeholder="09171234567"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="juan@example.com"
                />
              </div>
            </div>

            <div className="form-section-title">Emergency Contact</div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  placeholder="Maria Dela Cruz"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="09181234567"
                />
              </div>
            </div>

            {resident && (
              <div className="form-group">
                <label className="form-label">Status <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <Check size={16} /> {resident ? 'Update' : 'Register'} Resident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Resident Details Modal
const ResidentModal = ({ resident, onClose, onApprove }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3 className="modal-title">Resident Details</h3>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        <div className="detail-row">
          <span className="detail-label">Resident ID:</span>
          <span className="detail-value">#{resident.id.toString().padStart(4, '0')}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Full Name:</span>
          <span className="detail-value">{resident.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Age:</span>
          <span className="detail-value">{resident.age} years old</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gender:</span>
          <span className="detail-value">{resident.gender}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">
            <MapPin size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Address:
          </span>
          <span className="detail-value">{resident.address}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">
            <Phone size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Contact:
          </span>
          <span className="detail-value">{resident.contact}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">
            <Mail size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email:
          </span>
          <span className="detail-value">{resident.email}</span>
        </div>
        {resident.emergencyName && (
          <div className="detail-row">
            <span className="detail-label">Emergency Contact:</span>
            <span className="detail-value">{resident.emergencyName} - {resident.emergencyContact}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Date Registered:</span>
          <span className="detail-value">{resident.dateRegistered}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="detail-value">
            <span className={`status-badge ${resident.status}`}>
              <span className="status-dot"></span>
              {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
            </span>
          </span>
        </div>
      </div>
      {resident.status === 'pending' && (
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-success" onClick={() => onApprove(resident.id)}>
            <Check size={16} /> Approve Registration
          </button>
        </div>
      )}
    </div>
  </div>
);

// Sub-components
const RequestsTable = ({ requests, onView, onApprove, onReject, showTitle }) => (
  <div className="table-card">
    {showTitle && (
      <div className="table-header">
        <h2 className="table-title">Recent Certificate Requests</h2>
      </div>
    )}
    {requests.length > 0 ? (
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id}>
              <td>#{request.id.toString().padStart(4, '0')}</td>
              <td>{request.name}</td>
              <td>{request.type}</td>
              <td>{request.date}</td>
              <td>
                <span className={`status-badge ${request.status}`}>
                  <span className="status-dot"></span>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn view" onClick={() => onView(request)}>
                    <Eye size={16} />
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button className="action-btn approve" onClick={() => onApprove(request.id)}>
                        <Check size={16} />
                      </button>
                      <button className="action-btn reject" onClick={() => onReject(request.id)}>
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="empty-state">
        <div className="empty-icon">
          <ClipboardList size={32} />
        </div>
        <h3 className="empty-title">No requests found</h3>
        <p className="empty-desc">There are no certificate requests at the moment.</p>
      </div>
    )}
  </div>
);

const AppointmentsTable = ({ appointments, onView, onConfirm }) => (
  <div className="table-card">
    <div className="table-header">
      <h2 className="table-title">All Appointments</h2>
    </div>
    {appointments.length > 0 ? (
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient Name</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => (
            <tr key={appointment.id}>
              <td>#{appointment.id.toString().padStart(4, '0')}</td>
              <td>{appointment.name}</td>
              <td>{appointment.service}</td>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>
                <span className={`status-badge ${appointment.status}`}>
                  <span className="status-dot"></span>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn view" onClick={() => onView(appointment)}>
                    <Eye size={16} />
                  </button>
                  {appointment.status === 'pending' && (
                    <button className="action-btn approve" onClick={() => onConfirm(appointment.id)}>
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="empty-state">
        <div className="empty-icon">
          <Calendar size={32} />
        </div>
        <h3 className="empty-title">No appointments scheduled</h3>
        <p className="empty-desc">There are no health center appointments at the moment.</p>
      </div>
    )}
  </div>
);

const RequestModal = ({ request, onClose, onApprove, onReject }) => {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [imageData, setImageData] = React.useState(null);
  
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Extract filename from path
  const getFilename = (filePath) => {
    if (!filePath) return null;
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1];
  };

  const filename = getFilename(request.id_file_path);

  // Fetch image with authentication
  React.useEffect(() => {
    if (!filename) {
      setImageLoading(false);
      setImageError(true);
      return;
    }

    const fetchImage = async () => {
      try {
        const response = await fetch(`${API_URL}/uploads/${filename}`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageData(imageUrl);
        setImageLoading(false);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageError(true);
        setImageLoading(false);
      }
    };

    fetchImage();

    // Cleanup
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [filename]);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h3 className="modal-title">Certificate Request Details</h3>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="detail-section">
              <h4 className="section-title">Request Information</h4>
              
              <div className="detail-row">
                <span className="detail-label">Request ID:</span>
                <span className="detail-value">#{request.id.toString().padStart(4, '0')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tracking ID:</span>
                <span className="detail-value">{request.trackingId || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{request.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Certificate Type:</span>
                <span className="detail-value">{request.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Purpose:</span>
                <span className="detail-value">{request.purpose}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date Submitted:</span>
                <span className="detail-value">{request.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span className={`status-badge ${request.status}`}>
                    <span className="status-dot"></span>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="section-title">Contact Information</h4>
              
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{request.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{request.phone}</span>
              </div>
            </div>

            {(request.id_type || request.id_number || filename) && (
              <div className="detail-section">
                <h4 className="section-title">Identification</h4>
                
                {request.id_type && (
                  <div className="detail-row">
                    <span className="detail-label">ID Type:</span>
                    <span className="detail-value">{request.id_type}</span>
                  </div>
                )}
                {request.id_number && (
                  <div className="detail-row">
                    <span className="detail-label">ID Number:</span>
                    <span className="detail-value">{request.id_number}</span>
                  </div>
                )}
                
                {filename && (
                  <div className="detail-row" style={{ display: 'block' }}>
                    <span className="detail-label">Uploaded ID:</span>
                    <div className="id-image-container">
                      {imageLoading && !imageError && (
                        <div className="image-loading">
                          <Loader className="spinning" size={24} />
                          <span>Loading image...</span>
                        </div>
                      )}
                      {imageError && (
                        <div className="image-error">
                          <AlertCircle size={24} />
                          <span>Image not available</span>
                        </div>
                      )}
                      {!imageError && imageData && (
                        <>
                          <img 
                            src={imageData}
                            alt="Uploaded ID"
                            className="id-thumbnail"
                            style={{ display: imageLoading ? 'none' : 'block' }}
                          />
                          {!imageLoading && (
                            <div className="image-actions">
                              <button 
                                className="image-action-btn"
                                onClick={() => setShowImageModal(true)}
                                title="View Full Size"
                              >
                                <Eye size={16} /> View Full Size
                              </button>
                              <a 
                                href={imageData}
                                download={filename}
                                className="image-action-btn"
                                title="Download"
                              >
                                <Download size={16} /> Download
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {request.status === 'pending' && (
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => onReject(request.id)}>
                <X size={16} /> Reject
              </button>
              <button className="btn btn-success" onClick={() => onApprove(request.id)}>
                <Check size={16} /> Approve
              </button>
            </div>
          )}
        </div>
      </div>

      {showImageModal && imageData && (
        <div className="modal-overlay image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowImageModal(false)}>
              <X size={24} />
            </button>
            <img 
              src={imageData}
              alt="Uploaded ID Full Size"
              className="id-full-image"
            />
            <div className="image-modal-actions">
              <a 
                href={imageData}
                download={filename}
                className="btn btn-primary"
              >
                <Download size={16} /> Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AppointmentModal = ({ appointment, onClose, onConfirm }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3 className="modal-title">Appointment Details</h3>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        <div className="detail-row">
          <span className="detail-label">Appointment ID:</span>
          <span className="detail-value">#{appointment.id.toString().padStart(4, '0')}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Tracking ID:</span>
          <span className="detail-value">{appointment.trackingId || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Patient Name:</span>
          <span className="detail-value">{appointment.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Service:</span>
          <span className="detail-value">{appointment.service}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Health Concern:</span>
          <span className="detail-value">{appointment.concern}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{appointment.phone}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{appointment.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Time:</span>
          <span className="detail-value">{appointment.time}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="detail-value">
            <span className={`status-badge ${appointment.status}`}>
              <span className="status-dot"></span>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </span>
        </div>
      </div>
      {appointment.status === 'pending' && (
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={() => onConfirm(appointment.id)}>
            <Check size={16} /> Confirm Appointment
          </button>
        </div>
      )}
    </div>
  </div>
);

// News Management Component
const NewsManagement = ({ articles, onAdd, onEdit, onDelete }) => (
  <div className="table-card">
    <div className="table-header">
      <h2 className="table-title">News Articles</h2>
      <button className="btn btn-primary" onClick={onAdd}>
        <Plus size={16} /> Add News
      </button>
    </div>
    {articles.length > 0 ? (
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(article => (
            <tr key={article.id}>
              <td>
                <div style={{ maxWidth: '300px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{article.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {article.excerpt}
                  </div>
                </div>
              </td>
              <td>
                <span className="category-badge">{article.category}</span>
              </td>
              <td>{article.date}</td>
              <td>
                <span className={`status-badge ${article.status}`}>
                  <span className="status-dot"></span>
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
              </td>
              <td>
                {article.featured ? (
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ Featured</span>
                ) : (
                  <span style={{ color: '#9ca3af' }}>-</span>
                )}
              </td>
              <td>
                <div className="action-buttons">
                  <button className="action-btn edit" onClick={() => onEdit(article)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn reject" onClick={() => onDelete(article.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="empty-state">
        <div className="empty-icon">
          <Newspaper size={32} />
        </div>
        <h3 className="empty-title">No news articles yet</h3>
        <p className="empty-desc">Create your first news article to get started.</p>
        <button className="btn btn-primary" onClick={onAdd} style={{ marginTop: '1rem' }}>
          <Plus size={16} /> Add News Article
        </button>
      </div>
    )}
  </div>
);

// News Form Modal Component
const NewsFormModal = ({ article, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    title: article?.title || '',
    category: article?.category || 'Announcements',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    imageUrl: article?.image_url || '',
    featured: article?.featured || false,
    status: article?.status || 'draft'
  });
  
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(article?.image_url || null);

  const categories = ['Announcements', 'Events', 'Health', 'Safety', 'Education', 'Environment'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG and PNG images are allowed');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(article?.image_url || null);
    const fileInput = document.getElementById('newsImageFile');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let finalImageUrl = imagePreview || formData.imageUrl;
      
      // If there's a new image file, upload it first
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const uploadResponse = await fetch(`${API_URL}/news/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: imageFormData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          finalImageUrl = uploadData.imageUrl;
        } else {
          alert('Failed to upload image');
          return;
        }
      }
      
      // Now save the article with the image URL
      onSave({
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        image_url: finalImageUrl,
        featured: formData.featured,
        status: formData.status
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving article. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h3 className="modal-title">{article ? 'Edit News Article' : 'Create News Article'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter article title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status <span className="required">*</span></label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Article Image <span className="required">*</span></label>
              <p className="form-help-text">Upload an image for your article (JPG or PNG, max 5MB)</p>
              
              {!imagePreview ? (
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="newsImageFile"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="file-input"
                    required={!article}
                  />
                  <label htmlFor="newsImageFile" className="file-upload-label">
                    <Upload size={32} />
                    <span className="file-upload-text">Click to upload or drag and drop</span>
                    <span className="file-upload-subtext">JPG or PNG (max. 5MB)</span>
                  </label>
                </div>
              ) : (
                <div className="file-preview">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="file-preview-image"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem' }}
                  />
                  <div className="file-preview-info">
                    <span className="file-name">{imageFile ? imageFile.name : 'Current image'}</span>
                    {imageFile && <span className="file-size">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>}
                  </div>
                  <button type="button" onClick={removeImage} className="btn-remove-file">
                    <X size={16} /> Remove
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                required
                rows="3"
                placeholder="Brief summary of the article..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows="10"
                placeholder="Full article content..."
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <span>Mark as Featured Article</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <Check size={16} /> {article ? 'Update' : 'Create'} Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Messages Management Component
const MessagesManagement = ({ messages, onView, onDelete, onMarkRead }) => {
  const [filterStatus, setFilterStatus] = React.useState('all');
  
  const filteredMessages = filterStatus === 'all' 
    ? messages 
    : messages.filter(m => m.status === filterStatus);
  
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <h2 className="table-title">Contact Messages</h2>
          {unreadCount > 0 && (
            <span style={{ 
              marginLeft: '1rem', 
              padding: '0.25rem 0.75rem', 
              background: '#ef4444', 
              color: 'white', 
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="table-actions">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterStatus('unread')}
          >
            <Mail size={16} /> Unread
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'read' ? 'active' : ''}`}
            onClick={() => setFilterStatus('read')}
          >
            <Check size={16} /> Read
          </button>
        </div>
      </div>
      {filteredMessages.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>From</th>
              <th>Subject</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map(message => (
              <tr 
                key={message.id} 
                style={{ 
                  background: message.status === 'unread' ? '#fef3c7' : 'transparent',
                  fontWeight: message.status === 'unread' ? 600 : 400
                }}
              >
                <td>#{message.id.toString().padStart(4, '0')}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{message.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                    {message.email}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    <Phone size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                    {message.phone}
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {message.subject}
                  </div>
                </td>
                <td>
                  <div>{message.date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{message.time}</div>
                </td>
                <td>
                  <span className={`status-badge ${message.status}`}>
                    <span className="status-dot"></span>
                    {message.status === 'unread' ? 'New' : 'Read'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view" 
                      onClick={() => {
                        if (message.status === 'unread') {
                          onMarkRead(message.id);
                        }
                        onView(message);
                      }}
                      title="View Message"
                    >
                      <Eye size={16} />
                    </button>
                    {message.status === 'unread' && (
                      <button 
                        className="action-btn approve" 
                        onClick={() => onMarkRead(message.id)}
                        title="Mark as Read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      className="action-btn reject" 
                      onClick={() => onDelete(message.id)}
                      title="Delete Message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <MessageSquare size={32} />
          </div>
          <h3 className="empty-title">No messages found</h3>
          <p className="empty-desc">
            {filterStatus === 'all' 
              ? 'No contact messages have been received yet.' 
              : `No ${filterStatus} messages.`}
          </p>
        </div>
      )}
    </div>
  );
};

// Message Details Modal
const MessageModal = ({ message, onClose }) => {
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [replyError, setReplyError] = React.useState('');
  const [replySuccess, setReplySuccess] = React.useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setReplyError('Please enter a reply message');
      return;
    }

    setSending(true);
    setReplyError('');

    try {
      const response = await fetch(`${API_URL}/contact/messages/${message.id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      setReplySuccess(true);
      setReplyText('');
      
      setTimeout(() => {
        setReplySuccess(false);
        setShowReplyForm(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyError('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Message Details</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h4 className="section-title">Sender Information</h4>
            
            <div className="detail-row">
              <span className="detail-label">Message ID:</span>
              <span className="detail-value">#{message.id.toString().padStart(4, '0')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{message.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <Mail size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email:
              </span>
              <span className="detail-value">
                <a href={`mailto:${message.email}`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                  {message.email}
                </a>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">
                <Phone size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Phone:
              </span>
              <span className="detail-value">
                <a href={`tel:${message.phone}`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                  {message.phone}
                </a>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date & Time:</span>
              <span className="detail-value">{message.date} at {message.time}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">Message Content</h4>
            
            <div className="detail-row" style={{ display: 'block', marginBottom: '1rem' }}>
              <span className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Subject:</span>
              <div style={{ 
                padding: '0.75rem', 
                background: '#f3f4f6', 
                borderRadius: '0.5rem',
                fontWeight: 600
              }}>
                {message.subject}
              </div>
            </div>
            
            <div className="detail-row" style={{ display: 'block' }}>
              <span className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Message:</span>
              <div style={{ 
                padding: '1rem', 
                background: '#f9fafb', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                minHeight: '100px'
              }}>
                {message.message}
              </div>
            </div>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="detail-section" style={{ marginTop: '1.5rem', borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
              <h4 className="section-title" style={{ color: '#3b82f6' }}>✉️ Compose Reply</h4>
              
              {replySuccess && (
                <div style={{
                  padding: '1rem',
                  background: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Check size={20} />
                  <span>Reply sent successfully! Email has been delivered to {message.name}.</span>
                </div>
              )}

              {replyError && (
                <div style={{
                  padding: '1rem',
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={20} />
                  <span>{replyError}</span>
                </div>
              )}

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 600, 
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>Your Reply:</label>
                <textarea
                  className="form-textarea"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="6"
                  disabled={sending || replySuccess}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '150px'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
                💡 This will send an email to <strong>{message.email}</strong> with your reply and the original message for context.
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                    setReplyError('');
                  }}
                  disabled={sending}
                  style={{ opacity: sending ? 0.5 : 1 }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim() || replySuccess}
                  style={{ opacity: (sending || !replyText.trim() || replySuccess) ? 0.5 : 1 }}
                >
                  {sending ? (
                    <>
                      <Loader className="spinning" size={16} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {!showReplyForm ? (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => setShowReplyForm(true)}
              >
                <Mail size={16} /> Reply to Message
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

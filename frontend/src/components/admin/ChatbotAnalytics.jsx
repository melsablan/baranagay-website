import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAnalytics, getAllConversations, getAllFeedback, exportTrainingData, clearAllData } from '../../services/chatbot-feedback';

const ChatbotAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    const data = getAnalytics();
    setAnalytics(data);
  }, []);

  const handleExport = () => {
    const data = exportTrainingData();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `chatbot-training-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setExportMessage('✓ Data exported successfully!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will delete all feedback and conversation data.')) {
      clearAllData();
      setAnalytics({ totalInteractions: 0, totalFeedback: 0, helpfulCount: 0, notHelpfulCount: 0, helpfulRate: '0%' });
      alert('Data cleared!');
    }
  };

  if (!analytics) return <div style={{ padding: '1rem' }}>Loading analytics...</div>;

  const feedbackData = [
    { name: 'Helpful', value: analytics.helpfulCount, fill: '#10b981' },
    { name: 'Not Helpful', value: analytics.notHelpfulCount, fill: '#ef4444' }
  ];

  const topQuestions = () => {
    const questionCounts = {};
    analytics.conversations.forEach(conv => {
      const q = conv.user.substring(0, 50);
      questionCounts[q] = (questionCounts[q] || 0) + 1;
    });
    return Object.entries(questionCounts)
      .map(([q, count]) => ({ question: q, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>🤖 Chatbot Analytics Dashboard</h1>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Interactions</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#A100FF' }}>{analytics.totalInteractions}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Feedback</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{analytics.totalFeedback}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Helpful Rate</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{analytics.helpfulRate}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Helpful Responses</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{analytics.helpfulCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          {['overview', 'conversations', 'feedback'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: activeTab === tab ? '2px solid #A100FF' : 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: activeTab === tab ? '600' : '500',
                color: activeTab === tab ? '#A100FF' : '#6b7280',
                transition: 'all 0.2s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Feedback Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={feedbackData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {feedbackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Top Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topQuestions().map((q, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ fontSize: '0.9rem', color: '#374151', maxWidth: '75%' }}>{q.question}...</span>
                    <span style={{ backgroundColor: '#A100FF', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>{q.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Conversations ({analytics.conversations.length})</h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {analytics.conversations.slice().reverse().map((conv, i) => (
                <div key={i} style={{ paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{new Date(conv.timestamp).toLocaleString()}</p>
                  <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Q: {conv.user}</p>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>A: {conv.bot.substring(0, 150)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>User Feedback ({analytics.feedback.length})</h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {analytics.feedback.slice().reverse().map((fb, i) => (
                <div key={i} style={{ paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{new Date(fb.timestamp).toLocaleString()}</p>
                    <p style={{ color: '#374151' }}>{fb.message.substring(0, 80)}...</p>
                  </div>
                  <span style={{ backgroundColor: fb.feedback === 'helpful' ? '#d1fae5' : '#fee2e2', color: fb.feedback === 'helpful' ? '#065f46' : '#991b1b', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                    {fb.feedback === 'helpful' ? '👍 Helpful' : '👎 Not Helpful'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export & Actions */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleExport}
            style={{
              backgroundColor: '#A100FF',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            📥 Export Training Data
          </button>
          <button
            onClick={handleClearData}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            🗑️ Clear All Data
          </button>
        </div>

        {exportMessage && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.5rem', textAlign: 'center' }}>
            {exportMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotAnalytics;

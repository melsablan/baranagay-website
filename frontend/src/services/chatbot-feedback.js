/**
 * Chatbot Feedback & Learning System
 * Tracks user feedback and conversations for continuous improvement
 */

export const saveFeedback = (message, feedback, timestamp = new Date()) => {
  try {
    const feedbackData = {
      message,
      feedback, // 'helpful', 'not-helpful', or custom
      timestamp,
      sessionId: getSessionId()
    };

    // Save to localStorage
    const allFeedback = JSON.parse(localStorage.getItem('chatbot-feedback') || '[]');
    allFeedback.push(feedbackData);
    localStorage.setItem('chatbot-feedback', JSON.stringify(allFeedback));

    // Also send to backend for persistent storage (optional)
    sendFeedbackToBackend(feedbackData);
    
    return true;
  } catch (error) {
    console.error('Error saving feedback:', error);
    return false;
  }
};

export const saveConversation = (userMessage, botResponse, timestamp = new Date()) => {
  try {
    const conversation = {
      user: userMessage,
      bot: botResponse,
      timestamp,
      sessionId: getSessionId()
    };

    // Save to localStorage
    const allConversations = JSON.parse(localStorage.getItem('chatbot-conversations') || '[]');
    allConversations.push(conversation);
    localStorage.setItem('chatbot-conversations', JSON.stringify(allConversations));

    // Send to backend for analytics
    sendConversationToBackend(conversation);

    return true;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return false;
  }
};

export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('chatbot-session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chatbot-session-id', sessionId);
  }
  return sessionId;
};

export const sendFeedbackToBackend = async (feedbackData) => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${apiUrl}/api/chatbot/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
  } catch (error) {
    console.error('Error sending feedback to backend:', error);
  }
};

export const sendConversationToBackend = async (conversationData) => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${apiUrl}/api/chatbot/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversationData)
    });
  } catch (error) {
    console.error('Error sending conversation to backend:', error);
  }
};

export const getAllFeedback = () => {
  try {
    return JSON.parse(localStorage.getItem('chatbot-feedback') || '[]');
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    return [];
  }
};

export const getAllConversations = () => {
  try {
    return JSON.parse(localStorage.getItem('chatbot-conversations') || '[]');
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    return [];
  }
};

export const getAnalytics = () => {
  const feedback = getAllFeedback();
  const conversations = getAllConversations();

  const totalInteractions = conversations.length;
  const helpfulCount = feedback.filter(f => f.feedback === 'helpful').length;
  const notHelpfulCount = feedback.filter(f => f.feedback === 'not-helpful').length;
  const helpfulRate = totalInteractions > 0 ? ((helpfulCount / totalInteractions) * 100).toFixed(1) : 0;

  return {
    totalInteractions,
    totalFeedback: feedback.length,
    helpfulCount,
    notHelpfulCount,
    helpfulRate: `${helpfulRate}%`,
    feedback,
    conversations
  };
};

export const exportTrainingData = () => {
  const data = {
    feedback: getAllFeedback(),
    conversations: getAllConversations(),
    analytics: getAnalytics(),
    exportedAt: new Date()
  };

  return JSON.stringify(data, null, 2);
};

export const clearAllData = () => {
  localStorage.removeItem('chatbot-feedback');
  localStorage.removeItem('chatbot-conversations');
  sessionStorage.removeItem('chatbot-session-id');
};

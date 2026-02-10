import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import knowledgeBaseData from '../../data/chatbot-knowledge.json';
import { saveConversation, saveFeedback } from '../../services/chatbot-feedback';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";

// Learning system - tracks topics discussed
class ChatbotLearner {
  constructor() {
    this.topicsDiscussed = new Set();
    this.userPreferences = {};
    this.conversationHistory = [];
    this.followUpSuggestions = [];
  }

  addTopic(topic) {
    this.topicsDiscussed.add(topic);
  }

  getContextualResponse(userMessage, baseResponse, topic) {
    // Add personality based on conversation history
    const conversationLength = this.conversationHistory.length;
    
    // Make bot friendlier if user has asked multiple questions
    if (conversationLength > 3) {
      return `${baseResponse}\n\n😊 I see you're interested in ${topic}! Feel free to ask follow-up questions.`;
    }
    
    return baseResponse;
  }

  suggestFollowUp(topic) {
    const suggestions = {
      'barangay_clearance': ['How much does it cost?', 'What documents do I need?', 'Can I do it online?'],
      'health_services': ['How do I book an appointment?', 'Are vaccines free?', 'What are your hours?'],
      'building_permit': ['How long does it take?', 'What documents are needed?', 'Can I apply online?'],
    };
    return suggestions[topic] || [];
  }

  recordConversation(user, bot, topic) {
    this.conversationHistory.push({ user, bot, topic, timestamp: new Date() });
    this.addTopic(topic);
  }

  getLastTopics(n = 3) {
    return this.conversationHistory.slice(-n).map(c => c.topic);
  }
}

const learner = new ChatbotLearner();

const BarangayChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: 'Mabuhay! 👋 I\'m Kapitan Bot, your Barangay NIT assistant. I\'m here to help and learn from you! Ask me anything about certificates, permits, health, or our barangay. The more you talk to me, the better I get! 😊', 
      id: `msg-${Date.now()}` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(new Set());
  const [showLearning, setShowLearning] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Create varied, human-like responses
  const createHumanResponse = (baseResponse, topic, userMessage) => {
    const greetings = ['Great question!', 'Good to know you\'re asking!', 'Let me help you with that.', 'Perfect question!', 'I\'d be happy to explain!'];
    const closers = ['Hope this helps! 😊', 'Does that answer your question?', 'Let me know if you need more details!', 'Any other questions? I\'m here to help!'];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const randomCloser = closers[Math.floor(Math.random() * closers.length)];
    
    return `${randomGreeting}\n\n${baseResponse}\n\n${randomCloser}`;
  };

  // Check if user query matches knowledge base
  const findMatchingResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [topic, kb] of Object.entries(knowledgeBaseData)) {
      let score = 0;
      for (const keyword of kb.keywords) {
        if (lowerQuery.includes(keyword)) {
          score += keyword.length; // Longer keywords score higher
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { response: kb.response, topic };
      }
    }
    
    return bestMatch;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    const userMsgId = `msg-user-${Date.now()}`;
    const botMsgId = `msg-bot-${Date.now()}`;
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg, id: userMsgId }]);
    setInput('');
    setIsLoading(true);

    try {
      // First check if we have a direct answer from knowledge base
      const match = findMatchingResponse(userMsg);
      
      if (match) {
        // Use knowledge base response but make it more conversational
        let botReply = createHumanResponse(match.response, match.topic, userMsg);
        
        // Add contextual follow-up based on what they asked
        const followUpSuggestions = learner.suggestFollowUp(match.topic);
        if (followUpSuggestions.length > 0 && Math.random() > 0.5) {
          botReply += `\n\n💡 **You might also want to know:**\n• ${followUpSuggestions[0]}\n• ${followUpSuggestions[1]}`;
        }
        
        setMessages(prev => [...prev, { role: 'assistant', text: botReply, id: botMsgId }]);
        saveConversation(userMsg, botReply);
        learner.recordConversation(userMsg, botReply, match.topic);
        setIsLoading(false);
        return;
      }

      // If no API key, provide helpful fallback
      if (!apiKey || apiKey.trim() === "") {
        const fallbackMsg = `I'm still learning! For questions I don't know yet, please:\n\n📞 Call us: (02) 8123-4567\n🏢 Visit: NIT Barangay Hall, Accenture Campus\n📧 Email: brgynit@gmail.com\n\nMon-Fri, 8 AM - 5 PM\n\n(The more you chat with me, the smarter I get! 🧠)`;
        setMessages(prev => [...prev, { role: 'assistant', text: fallbackMsg, id: botMsgId }]);
        saveConversation(userMsg, fallbackMsg);
        setIsLoading(false);
        return;
      }

      // For other questions, use Gemini with context about what we've discussed
      const recentTopics = learner.getLastTopics(3).join(', ');
      const contextInfo = recentTopics ? `\nRecent topics discussed: ${recentTopics}` : '';
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
          systemInstruction: { parts: [{ text: `You are Kapitan Bot, a friendly, intelligent AI assistant for Barangay NIT. You're learning from conversations and getting smarter!

**YOUR PERSONALITY:**
- Speak like a helpful friend, not a robot
- Be warm, conversational, and understanding
- Remember what users care about
- Ask follow-up questions to show you're listening
- Use simple, clear language
- Include relevant emojis to be friendly
- Vary your responses - don't repeat the same phrases

**CORE FACTS:**
- Barangay Captain: **Kapitan Mel Sablan**
- Location: NIT Barangay Hall, Accenture Campus
- Phone: (02) 8123-4567 | Email: brgynit@gmail.com
- Hours: Mon-Fri, 8 AM - 5 PM
- Emergency services: 24/7

**SERVICES:**
1. Barangay Clearance (Free online, ₱30 walk-in, 3-5 days)
2. Certificate of Indigency (Free online, ₱30 walk-in, 3-5 days)
3. Certificate of Residency (Free online, ₱30 walk-in, 2-3 days)
4. Business Permit (Varies, 5-7 days, in-person only)
5. Health Services (24/7 emergency, free vaccines)
6. Dental Services (Tue & Thu, 9 AM - 4 PM)

**COMMUNICATION STYLE:**
- If unsure, ask clarifying questions
- Explain WHY things take time (e.g., document verification)
- Give examples when possible
- Acknowledge their concerns
- Offer alternatives
- Be encouraging about using our services

**LEARNING APPROACH:**
- Users have been discussing: ${contextInfo}
- Use this context to personalize responses
- If they ask follow-up questions, reference what they said before
- Show genuine interest in helping

**TONE:**
Sound like a helpful neighbor who knows the barangay well, not an automated system!` }] }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm learning! Could you rephrase that? Or call us at (02) 8123-4567.";
      
      setMessages(prev => [...prev, { role: 'assistant', text: botReply, id: botMsgId }]);
      saveConversation(userMsg, botReply);
      learner.recordConversation(userMsg, botReply, 'custom');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = `Oops! I'm having trouble thinking right now. 🤔\n\nBut don't worry! You can reach our team directly:\n\n📞 (02) 8123-4567\n🏢 Barangay Hall\n📧 brgynit@gmail.com\n\nMon-Fri: 8 AM - 5 PM\n\n(I'll keep learning to serve you better!)`;
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg, id: botMsgId }]);
      saveConversation(userMsg, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick reply suggestions based on conversation
  const showQuickReplies = messages.length === 1; // Show only on first load
  const quickReplies = [
    { text: '📋 Barangay Clearance', query: 'Tell me about Barangay Clearance' },
    { text: '🕒 Office Hours', query: 'What are your office hours?' },
    { text: '🏥 Health Appointment', query: 'How do I book a health appointment?' },
    { text: '📞 Contact Info', query: 'How can I contact the barangay?' }
  ];

  // Handle feedback on responses
  const handleFeedback = (messageId, isHelpful) => {
    setFeedbackGiven(prev => new Set([...prev, messageId]));
    
    // Get the message to save feedback
    const message = messages.find(m => m.id === messageId);
    if (message) {
      saveFeedback(message.text, isHelpful ? 'helpful' : 'not-helpful');
      
      // Show learning indicator
      if (isHelpful) {
        setShowLearning(true);
        setTimeout(() => setShowLearning(false), 2000);
      }
    }
  };

  const handleQuickReply = (query) => {
    const userMsgId = `msg-quick-${Date.now()}`;
    const botMsgId = `msg-bot-${Date.now()}`;
    
    setMessages(prev => [...prev, { role: 'user', text: query, id: userMsgId }]);
    setInput('');
    setIsLoading(true);

    // Simulate sending the quick reply
    setTimeout(() => {
      const match = findMatchingResponse(query);
      if (match) {
        let botReply = createHumanResponse(match.response, match.topic, query);
        const followUpSuggestions = learner.suggestFollowUp(match.topic);
        if (followUpSuggestions.length > 0 && Math.random() > 0.5) {
          botReply += `\n\n💡 **You might also want to know:**\n• ${followUpSuggestions[0]}\n• ${followUpSuggestions[1]}`;
        }
        setMessages(prev => [...prev, { role: 'assistant', text: botReply, id: botMsgId }]);
        saveConversation(query, botReply);
        learner.recordConversation(query, botReply, match.topic);
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-title">
          <div style={{width: '2rem', height: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <MessageSquare size={16} />
          </div>
          <span>Kapitan Bot</span>
        </div>
        {showLearning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
            ✨ Learning...
          </div>
        )}
        <button onClick={onClose} className="close-btn"><X size={18} /></button>
      </div>
      
      <div ref={scrollRef} className="chat-body">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`msg-row ${m.role === 'user' ? 'user' : 'bot'}`}>
            <div className={`msg-bubble ${m.role === 'user' ? 'user' : 'bot'}`} style={{ whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>
            
            {/* Feedback buttons for assistant messages */}
            {m.role === 'assistant' && !feedbackGiven.has(m.id) && (
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', marginLeft: '0.5rem' }}>
                <button
                  onClick={() => handleFeedback(m.id, true)}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    padding: '0.125rem 0.35rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.15rem',
                    fontSize: '0.65rem',
                    color: '#6b7280',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }}
                  title="This was helpful"
                >
                  <ThumbsUp size={10} /> Helpful
                </button>
                <button
                  onClick={() => handleFeedback(m.id, false)}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    padding: '0.125rem 0.35rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.15rem',
                    fontSize: '0.65rem',
                    color: '#6b7280',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }}
                  title="This wasn't helpful"
                >
                  <ThumbsDown size={10} /> Not helpful
                </button>
              </div>
            )}
            
            {/* Show that feedback was given */}
            {m.role === 'assistant' && feedbackGiven.has(m.id) && (
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', marginLeft: '0.5rem' }}>
                ✓ Thanks for your feedback!
              </div>
            )}
          </div>
        ))}
        
        {/* Quick replies on first load */}
        {showQuickReplies && (
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply.query)}
                style={{
                  backgroundColor: 'rgba(161, 0, 255, 0.1)',
                  border: '1px solid rgba(161, 0, 255, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  color: '#A100FF',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(161, 0, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(161, 0, 255, 0.1)';
                }}
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="msg-row bot">
            <div className="msg-bubble bot" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Loader2 size={16} className="animate-spin" style={{color: '#A100FF'}} />
              <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>Typing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything about the barangay..."
          className="chat-input"
        />
        <button onClick={handleSend} disabled={isLoading} className="send-btn">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default BarangayChatBot;
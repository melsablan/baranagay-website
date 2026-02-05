import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, X } from 'lucide-react';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";

const BarangayChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Mabuhay! I am your Barangay NIT AI Assistant. How can I help you today? (e.g., Office hours, Clearances, Health Center)' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
          systemInstruction: { parts: [{ text: `You are a helpful, polite, and official AI assistant for Barangay NIT in Accenture. 
          Your goal is to assist residents with questions about barangay services.
          Facts: 
          - Office Hours: Mon-Fri, 8:00 AM - 5:00 PM.
          - Services: Barangay Clearance, Certificate of Indigency, Health Center Consultations, Dispute Resolution (Lupon).
          - Location: NIT Barangay Hall.
          - Tone: Professional, warm, helpful. You can speak in English or Taglish.
          - Disclaimer: If you don't know the answer, politely ask them to visit the hall or call the hotline.` }] }
        })
      });
      
      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Pasensya na, hindi ko nakuha iyon. Maaari mo bang ulitin?";
      
      setMessages(prev => [...prev, { role: 'assistant', text: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-title">
          <div style={{width: '2rem', height: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <MessageSquare size={16} />
          </div>
          <span>Kapitan Bot </span>
        </div>
        <button onClick={onClose} className="close-btn"><X size={18} /></button>
      </div>
      
      <div ref={scrollRef} className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : 'bot'}`}>
            <div className={`msg-bubble ${m.role === 'user' ? 'user' : 'bot'}`}>
              {m.text}
            </div>
          </div>
        ))}
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
          placeholder="Ask about clearance, hours..."
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
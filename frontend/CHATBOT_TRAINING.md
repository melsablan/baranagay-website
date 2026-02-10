# 🤖 Chatbot Training System

## Overview
The Barangay NIT Chatbot now has a complete training and analytics system to continuously improve responses based on user feedback.

## System Components

### 1. **Knowledge Base (`chatbot-knowledge.json`)**
- Centralized Q&A repository with 20+ topics
- Easy to update without touching code
- Keywords automatically matched to responses
- Instant replies without API delays

**Location:** `frontend/src/data/chatbot-knowledge.json`

**How to add new Q&A:**
```json
{
  "new_topic": {
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "response": "Your answer here. Can use emojis and **markdown** for bold."
  }
}
```

### 2. **Feedback System (`chatbot-feedback.js`)**
Automatically tracks:
- ✅ Helpful responses
- ❌ Not helpful responses  
- 💬 All conversations
- 📊 Analytics & metrics

**Location:** `frontend/src/services/chatbot-feedback.js`

**Features:**
- Stores data in browser localStorage
- Sends data to backend for persistence
- Session tracking for user identification
- Export training data as JSON

### 3. **Analytics Dashboard (`ChatbotAnalytics.jsx`)**
View and manage all training data.

**Features:**
- 📈 KPI Overview (total interactions, helpful rate, etc.)
- 📊 Feedback distribution charts
- 💬 Conversation history
- 🔝 Top questions asked
- 📥 Export training data
- 🗑️ Clear all data

**Location:** `frontend/src/components/admin/ChatbotAnalytics.jsx`

## How Users Train the Chatbot

### Step 1: User Asks Question
User types: "Tell me about barangay clearance"

### Step 2: Bot Responds
Chatbot checks knowledge base and responds

### Step 3: User Gives Feedback
Click 👍 (Helpful) or 👎 (Not Helpful)

### Step 4: System Learns
- Feedback is saved to localStorage
- Sent to backend for persistent storage
- Used to improve future responses

## Viewing Training Data

### Browser Console
```javascript
// View all feedback
import { getAllFeedback } from './services/chatbot-feedback';
console.log(getAllFeedback());

// View all conversations
import { getAllConversations } from './services/chatbot-feedback';
console.log(getAllConversations());

// Get analytics
import { getAnalytics } from './services/chatbot-feedback';
console.log(getAnalytics());
```

### Analytics Dashboard
1. Import the component in your admin page
2. Visit `/admin/chatbot-analytics` (if configured)

```jsx
import ChatbotAnalytics from '../components/admin/ChatbotAnalytics';

export default function AdminPage() {
  return <ChatbotAnalytics />;
}
```

## Improving Responses

### Method 1: Direct Knowledge Base Update
Edit `chatbot-knowledge.json` with better responses based on user feedback.

```bash
# After editing, restart React dev server
npm start
```

### Method 2: Analyze Feedback & Train
1. View analytics dashboard
2. Check "Not Helpful" feedback
3. Find corresponding questions
4. Improve answers in knowledge base
5. Re-test chatbot

### Method 3: Add New Topics
If users ask about topics not in the knowledge base:

1. Keep conversations exported as reference
2. Extract missing topics from conversation history
3. Create Q&A pairs
4. Add to `chatbot-knowledge.json`

Example: If users frequently ask "Can I apply online?", add:
```json
{
  "online_application": {
    "keywords": ["apply online", "online application", "can i apply online"],
    "response": "Yes! You can apply for most services online including..."
  }
}
```

## Backend Integration (Optional)

### Save Feedback to Database
Create an API endpoint:

```python
# Flask example
@app.route('/api/chatbot/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    # Save to database
    # data contains: message, feedback, timestamp, sessionId
    return {'status': 'ok'}

@app.route('/api/chatbot/conversation', methods=['POST'])
def save_conversation():
    data = request.json
    # Save to database
    # data contains: user, bot, timestamp, sessionId
    return {'status': 'ok'}
```

## Best Practices

✅ **Do:**
- Regularly export and review training data
- Keep knowledge base up-to-date with current information
- Test chatbot with various question formats
- Monitor "Not Helpful" feedback for improvement areas
- Use emojis and formatting in responses for clarity

❌ **Don't:**
- Leave outdated information in knowledge base
- Ignore user feedback patterns
- Add vague or incomplete answers
- Overload responses with too much text

## Quick Stats

- **Current Topics:** 20+
- **Keywords Tracked:** 100+
- **Data Storage:** Browser localStorage + Backend
- **Export Format:** JSON (portable, analyzable)

## Useful Functions

```javascript
// View helpful rate
import { getAnalytics } from './services/chatbot-feedback';
const stats = getAnalytics();
console.log(`Helpful Rate: ${stats.helpfulRate}`);

// Export all training data
import { exportTrainingData } from './services/chatbot-feedback';
const data = exportTrainingData();
const blob = new Blob([data], { type: 'application/json' });
// Download blob...

// Clear training data
import { clearAllData } from './services/chatbot-feedback';
clearAllData(); // ⚠️ Cannot be undone!
```

## Troubleshooting

**Q: Feedback not saving?**
A: Check browser console for errors. Ensure localStorage is enabled.

**Q: Changes not showing?**
A: Hard refresh browser (Ctrl+Shift+R). Clear React cache if needed.

**Q: Analytics page not accessible?**
A: Add the component to your admin/dashboard page as shown above.

---

Built with ❤️ for Barangay NIT. Happy training! 🚀

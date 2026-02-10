"""
Chatbot Feedback API Endpoints
Add these to your Flask backend (application.py) for persistent feedback storage
"""

from flask import request, jsonify
from datetime import datetime
import json

# Mock database - replace with your actual DB
chatbot_feedback_db = []
chatbot_conversations_db = []

# ============================================
# CHATBOT FEEDBACK & ANALYTICS ENDPOINTS
# ============================================

@app.route('/api/chatbot/feedback', methods=['POST'])
def save_chatbot_feedback():
    """
    Save user feedback on chatbot responses
    
    Request body:
    {
        "message": "The actual response text",
        "feedback": "helpful" or "not-helpful",
        "timestamp": "2026-02-10T...",
        "sessionId": "session-xxx"
    }
    """
    try:
        data = request.json
        feedback_entry = {
            'id': len(chatbot_feedback_db) + 1,
            'message': data.get('message'),
            'feedback': data.get('feedback'),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'sessionId': data.get('sessionId'),
            'created_at': datetime.now().isoformat()
        }
        
        # Save to database (replace with your DB)
        chatbot_feedback_db.append(feedback_entry)
        
        # Optional: Save to file for backup
        with open('chatbot_feedback_backup.json', 'a') as f:
            f.write(json.dumps(feedback_entry) + '\n')
        
        return jsonify({'status': 'success', 'id': feedback_entry['id']}), 201
    
    except Exception as error:
        print(f"Error saving feedback: {error}")
        return jsonify({'status': 'error', 'message': str(error)}), 500


@app.route('/api/chatbot/conversation', methods=['POST'])
def save_chatbot_conversation():
    """
    Save chatbot conversation for training
    
    Request body:
    {
        "user": "User's question",
        "bot": "Bot's response",
        "timestamp": "2026-02-10T...",
        "sessionId": "session-xxx"
    }
    """
    try:
        data = request.json
        conversation_entry = {
            'id': len(chatbot_conversations_db) + 1,
            'user': data.get('user'),
            'bot': data.get('bot'),
            'timestamp': data.get('timestamp', datetime.now().isoformat()),
            'sessionId': data.get('sessionId'),
            'created_at': datetime.now().isoformat()
        }
        
        # Save to database (replace with your DB)
        chatbot_conversations_db.append(conversation_entry)
        
        # Optional: Save to file for backup
        with open('chatbot_conversations_backup.json', 'a') as f:
            f.write(json.dumps(conversation_entry) + '\n')
        
        return jsonify({'status': 'success', 'id': conversation_entry['id']}), 201
    
    except Exception as error:
        print(f"Error saving conversation: {error}")
        return jsonify({'status': 'error', 'message': str(error)}), 500


@app.route('/api/chatbot/analytics', methods=['GET'])
def get_chatbot_analytics():
    """
    Get chatbot analytics and statistics
    """
    try:
        total_conversations = len(chatbot_conversations_db)
        total_feedback = len(chatbot_feedback_db)
        helpful_count = sum(1 for f in chatbot_feedback_db if f['feedback'] == 'helpful')
        not_helpful_count = sum(1 for f in chatbot_feedback_db if f['feedback'] == 'not-helpful')
        
        helpful_rate = (helpful_count / total_feedback * 100) if total_feedback > 0 else 0
        
        # Top questions
        question_counts = {}
        for conv in chatbot_conversations_db:
            q = conv['user'][:50]
            question_counts[q] = question_counts.get(q, 0) + 1
        
        top_questions = sorted(question_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return jsonify({
            'totalConversations': total_conversations,
            'totalFeedback': total_feedback,
            'helpfulCount': helpful_count,
            'notHelpfulCount': not_helpful_count,
            'helpfulRate': round(helpful_rate, 1),
            'topQuestions': [{'question': q, 'count': count} for q, count in top_questions]
        }), 200
    
    except Exception as error:
        print(f"Error getting analytics: {error}")
        return jsonify({'status': 'error', 'message': str(error)}), 500


@app.route('/api/chatbot/feedback', methods=['GET'])
def get_chatbot_feedback():
    """
    Get all chatbot feedback (with optional filters)
    
    Query params:
    - feedback: "helpful" or "not-helpful" (filter by type)
    - sessionId: filter by session
    - limit: max results (default 100)
    """
    try:
        limit = request.args.get('limit', 100, type=int)
        feedback_type = request.args.get('feedback')
        session_id = request.args.get('sessionId')
        
        results = chatbot_feedback_db
        
        if feedback_type:
            results = [f for f in results if f['feedback'] == feedback_type]
        
        if session_id:
            results = [f for f in results if f['sessionId'] == session_id]
        
        results = results[-limit:]  # Get last N records
        
        return jsonify(results), 200
    
    except Exception as error:
        print(f"Error getting feedback: {error}")
        return jsonify({'status': 'error', 'message': str(error)}), 500


@app.route('/api/chatbot/conversations', methods=['GET'])
def get_chatbot_conversations():
    """
    Get all chatbot conversations
    
    Query params:
    - sessionId: filter by session
    - limit: max results (default 100)
    """
    try:
        limit = request.args.get('limit', 100, type=int)
        session_id = request.args.get('sessionId')
        
        results = chatbot_conversations_db
        
        if session_id:
            results = [c for c in results if c['sessionId'] == session_id]
        
        results = results[-limit:]  # Get last N records
        
        return jsonify(results), 200
    
    except Exception as error:
        print(f"Error getting conversations: {error}")
        return jsonify({'status': 'error', 'message': str(error)}), 500


@app.route('/api/chatbot/export', methods=['GET'])
def export_chatbot_data():
    """
    Export all chatbot training data as JSON
    """
    try:
        export_data = {
            'exportedAt': datetime.now().isoformat(),
            'feedback': chatbot_feedback_db,
            'conversations': chatbot_conversations_db,
            'stats': {
                'totalConversations': len(chatbot_conversations_db),
                'totalFeedback': len(chatbot_feedback_db),
                'helpful': sum(1 for f in chatbot_feedback_db if f['feedback'] == 'helpful'),
                'notHelpful': sum(1 for f in chatbot_feedback_db if f['feedback'] == 'not-helpful')
            }
        }
        
        # Return as downloadable JSON
        from flask import send_file
        from io import BytesIO
        
        json_data = json.dumps(export_data, indent=2)
        bytes_data = BytesIO(json_data.encode())
        
        return send_file(
            bytes_data,
            mimetype='application/json',
            as_attachment=True,
            download_name=f"chatbot-training-{datetime.now().strftime('%Y-%m-%d')}.json"
        )
    
    except Exception as error:
        print(f"Error exporting data: {error}")
        return jsonify({'status': 'error', 'message': str(error)}), 500


@app.route('/api/chatbot/clear', methods=['DELETE'])
def clear_chatbot_data():
    """
    Clear all chatbot training data (admin only)
    ⚠️ WARNING: This cannot be undone!
    """
    try:
        # Optional: Add authentication check
        # if not is_admin():
        #     return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
        global chatbot_feedback_db, chatbot_conversations_db
        chatbot_feedback_db = []
        chatbot_conversations_db = []
        
        return jsonify({'status': 'success', 'message': 'All training data cleared'}), 200
    
    except Exception as error:
        print(f"Error clearing data: {error}")
        return jsonify({'status': 'error', 'message': str(error)}), 500


# ============================================
# DATABASE SCHEMA (If using MySQL/PostgreSQL)
# ============================================

"""
CREATE TABLE chatbot_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message LONGTEXT NOT NULL,
    feedback ENUM('helpful', 'not-helpful') NOT NULL,
    session_id VARCHAR(255),
    timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(session_id),
    INDEX(feedback),
    INDEX(created_at)
);

CREATE TABLE chatbot_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_message LONGTEXT NOT NULL,
    bot_response LONGTEXT NOT NULL,
    session_id VARCHAR(255),
    timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(session_id),
    INDEX(created_at)
);
"""

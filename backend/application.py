from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
import os
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from email_utils import send_certificate_approval_email, send_certificate_rejection_email, send_appointment_confirmation_email, send_message_reply, send_certificate_request_received_email, send_appointment_request_received_email
from pdf_generator import generate_certificate

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], "allow_headers": ["Content-Type", "Authorization"]}})

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads/ids'
app.config['NEWS_UPLOAD_FOLDER'] = 'uploads/news'
jwt = JWTManager(app)

# Create upload folders if they don't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])
if not os.path.exists(app.config['NEWS_UPLOAD_FOLDER']):
    os.makedirs(app.config['NEWS_UPLOAD_FOLDER'])

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database Configuration
from dotenv import load_dotenv
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '010724'),
    'database': os.getenv('DB_NAME', 'barangay_nit')
}

# Add SSL for cloud databases (like Aiven)
if 'aivencloud.com' in DB_CONFIG['host']:
    DB_CONFIG['ssl_disabled'] = False

# Update JWT secret from environment
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')

# Database Connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Helper function to execute queries
def execute_query(query, params=None, fetch=False):
    connection = get_db_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if fetch:
            result = cursor.fetchall()
            cursor.close()
            connection.close()
            return result
        else:
            connection.commit()
            last_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return last_id
    except Error as e:
        print(f"Error executing query: {e}")
        return None

# ============================================
# HEALTH CHECK & ROOT ENDPOINTS
# ============================================

@app.route('/')
def index():
    """Root endpoint - API information"""
    return jsonify({
        'message': 'Barangay NIT Backend API',
        'status': 'running',
        'version': '1.0',
        'endpoints': {
            'health': '/health',
            'api': '/api/*'
        }
    }), 200

@app.route('/health')
def health():
    """Health check endpoint for Elastic Beanstalk"""
    try:
        # Test database connection
        conn = get_db_connection()
        if conn:
            conn.close()
            db_status = "connected"
        else:
            db_status = "disconnected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    health_status = {
        'status': 'healthy' if db_status == "connected" else 'unhealthy',
        'database': db_status,
        'timestamp': datetime.now().isoformat(),
        'environment': {
            'host': DB_CONFIG['host'],
            'port': DB_CONFIG['port'],
            'database': DB_CONFIG['database']
        }
    }
    
    status_code = 200 if db_status == "connected" else 503
    return jsonify(health_status), status_code

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user exists
    existing_user = execute_query(
        "SELECT id FROM users WHERE email = %s",
        (data['email'],),
        fetch=True
    )
    
    if existing_user:
        return jsonify({'message': 'Email already registered'}), 400
    
    # Hash password
    hashed_password = generate_password_hash(data['password'])
    
    # Insert new user
    user_id = execute_query(
        """INSERT INTO users (email, password, first_name, last_name, phone, role)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (data['email'], hashed_password, data['firstName'], data['lastName'], 
         data.get('phone', ''), data.get('role', 'resident'))
    )
    
    if user_id:
        return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201
    return jsonify({'message': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    
    user = execute_query(
        "SELECT * FROM users WHERE email = %s",
        (data['email'],),
        fetch=True
    )
    
    if not user or not check_password_hash(user[0]['password'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user[0]['id'])
    
    return jsonify({
        'token': access_token,
        'user': {
            'id': user[0]['id'],
            'email': user[0]['email'],
            'firstName': user[0]['first_name'],
            'lastName': user[0]['last_name'],
            'role': user[0]['role']
        }
    }), 200

# ============================================
# CERTIFICATE REQUESTS ENDPOINTS
# ============================================

@app.route('/api/certificates', methods=['POST'])
@jwt_required()
def create_certificate_request():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    tracking_id = generate_tracking_id('CERT')
    
    cert_id = execute_query(
        """INSERT INTO certificate_requests 
           (user_id, tracking_id, certificate_type, purpose, status, date_needed)
           VALUES (%s, %s, %s, %s, 'pending', %s)""",
        (user_id, tracking_id, data['certificateType'], 
         data['purpose'], data.get('dateNeeded'))
    )
    
    if cert_id:
        return jsonify({
            'message': 'Certificate request submitted successfully',
            'trackingId': tracking_id,
            'requestId': cert_id
        }), 201
    return jsonify({'message': 'Failed to submit request'}), 500

@app.route('/api/certificates/all', methods=['GET'])
@jwt_required()
def get_all_certificates():
    certificates = execute_query(
        """SELECT cr.*, u.first_name, u.last_name, u.email, u.phone
           FROM certificate_requests cr
           JOIN users u ON cr.user_id = u.id
           ORDER BY cr.created_at DESC""",
        fetch=True
    )
    
    # Convert dates to strings for JSON serialization
    if certificates:
        for cert in certificates:
            if 'created_at' in cert and cert['created_at'] is not None:
                cert['created_at'] = cert['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if 'processed_at' in cert and cert['processed_at'] is not None:
                cert['processed_at'] = cert['processed_at'].strftime('%Y-%m-%d %H:%M:%S')
            if 'date_needed' in cert and cert['date_needed'] is not None:
                cert['date_needed'] = cert['date_needed'].strftime('%Y-%m-%d')
    
    return jsonify(certificates), 200

@app.route('/api/certificates/track/<tracking_id>', methods=['GET'])
def track_certificate(tracking_id):
    result = execute_query(
        """SELECT cr.*, u.first_name, u.last_name, u.email
           FROM certificate_requests cr
           JOIN users u ON cr.user_id = u.id
           WHERE cr.tracking_id = %s""",
        (tracking_id,),
        fetch=True
    )
    
    if not result:
        return jsonify({'message': 'Certificate not found'}), 404
    
    cert = result[0]
    return jsonify({
        'id': cert['tracking_id'],
        'type': cert['certificate_type'],
        'name': f"{cert['first_name']} {cert['last_name']}",
        'dateSubmitted': cert['created_at'].strftime('%Y-%m-%d'),
        'status': cert['status'],
        'dateProcessed': cert['processed_at'].strftime('%Y-%m-%d') if cert['processed_at'] else None,
        'remarks': cert['remarks'] or 'Under review'
    }), 200

@app.route('/api/certificates/user', methods=['GET'])
@jwt_required()
def get_user_certificates():
    user_id = get_jwt_identity()
    
    certificates = execute_query(
        """SELECT * FROM certificate_requests 
           WHERE user_id = %s 
           ORDER BY created_at DESC""",
        (user_id,),
        fetch=True
    )
    
    return jsonify(certificates), 200

@app.route('/api/certificates/<int:cert_id>/approve', methods=['POST'])
@jwt_required()
def approve_certificate(cert_id):
    """Approve certificate and send email with PDF"""
    data = request.get_json()
    
    # Get certificate details
    cert = execute_query(
        """SELECT cr.*, u.first_name, u.last_name, u.email
           FROM certificate_requests cr
           JOIN users u ON cr.user_id = u.id
           WHERE cr.id = %s""",
        (cert_id,),
        fetch=True
    )
    
    if not cert:
        return jsonify({'message': 'Certificate not found'}), 404
    
    cert_data = cert[0]
    
    try:
        # Update status to approved
        execute_query(
            """UPDATE certificate_requests 
               SET status = 'approved', remarks = %s, processed_at = NOW()
               WHERE id = %s""",
            (data.get('remarks', 'Certificate approved'), cert_id)
        )
        
        # Generate PDF certificate
        full_name = f"{cert_data['first_name']} {cert_data['last_name']}"
        pdf_data = {
            'name': full_name,
            'purpose': cert_data['purpose'],
            'tracking_id': cert_data['tracking_id'],
            'address': data.get('address', 'Barangay NIT, Accenture Campus')
        }
        
        pdf_path = generate_certificate(cert_data['certificate_type'], pdf_data)
        
        # Send email with PDF attachment
        email_sent = send_certificate_approval_email(
            recipient_email=cert_data['email'],
            recipient_name=full_name,
            certificate_type=cert_data['certificate_type'],
            tracking_id=cert_data['tracking_id'],
            pdf_path=pdf_path
        )
        
        if email_sent:
            return jsonify({
                'message': 'Certificate approved and email sent successfully',
                'pdfPath': pdf_path
            }), 200
        else:
            return jsonify({
                'message': 'Certificate approved but email failed to send',
                'pdfPath': pdf_path
            }), 200
            
    except Exception as e:
        print(f"Error approving certificate: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/certificates/<int:cert_id>/reject', methods=['POST'])
@jwt_required()
def reject_certificate(cert_id):
    """Reject certificate and send email notification"""
    data = request.get_json()
    
    # Get certificate details
    cert = execute_query(
        """SELECT cr.*, u.first_name, u.last_name, u.email
           FROM certificate_requests cr
           JOIN users u ON cr.user_id = u.id
           WHERE cr.id = %s""",
        (cert_id,),
        fetch=True
    )
    
    if not cert:
        return jsonify({'message': 'Certificate not found'}), 404
    
    cert_data = cert[0]
    
    try:
        # Update status to rejected
        reason = data.get('reason', 'Please contact the barangay office for more information')
        execute_query(
            """UPDATE certificate_requests 
               SET status = 'rejected', remarks = %s, processed_at = NOW()
               WHERE id = %s""",
            (reason, cert_id)
        )
        
        # Send rejection email
        full_name = f"{cert_data['first_name']} {cert_data['last_name']}"
        email_sent = send_certificate_rejection_email(
            recipient_email=cert_data['email'],
            recipient_name=full_name,
            certificate_type=cert_data['certificate_type'],
            tracking_id=cert_data['tracking_id'],
            reason=reason
        )
        
        if email_sent:
            return jsonify({'message': 'Certificate rejected and email sent successfully'}), 200
        else:
            return jsonify({'message': 'Certificate rejected but email failed to send'}), 200
            
    except Exception as e:
        print(f"Error rejecting certificate: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/certificates/<int:cert_id>', methods=['PUT'])
@jwt_required()
def update_certificate_status(cert_id):
    data = request.get_json()
    
    execute_query(
        """UPDATE certificate_requests 
           SET status = %s, remarks = %s, processed_at = NOW()
           WHERE id = %s""",
        (data['status'], data.get('remarks', ''), cert_id)
    )
    
    return jsonify({'message': 'Certificate status updated'}), 200

# PUBLIC CERTIFICATE REQUEST (No login required)
@app.route('/api/certificates/public', methods=['POST'])
def create_public_certificate_request():
    try:
        # Get form data instead of JSON
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        id_type = request.form.get('idType')
        id_number = request.form.get('idNumber')
        certificate_type = request.form.get('certificateType')
        purpose = request.form.get('purpose')
        date_needed = request.form.get('dateNeeded') or None
        
        # Validate required fields
        if not all([name, email, phone, id_type, id_number, certificate_type, purpose]):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Handle file upload
        id_file_path = None
        if 'idFile' in request.files:
            file = request.files['idFile']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Create unique filename
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_filename = f"{timestamp}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                id_file_path = file_path
        
        tracking_id = generate_tracking_id('CERT')
        
        # Create or get user by email
        user = execute_query(
            "SELECT id FROM users WHERE email = %s",
            (email,),
            fetch=True
        )
        
        if user:
            user_id = user[0]['id']
        else:
            # Create new user for public request
            name_parts = name.split()
            first_name = name_parts[0]
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            user_id = execute_query(
                """INSERT INTO users (email, first_name, last_name, phone, role)
                   VALUES (%s, %s, %s, %s, 'resident')""",
                (email, first_name, last_name, phone)
            )
        
        # Insert certificate request with ID info, file path, and fee info
        cert_id = execute_query(
            """INSERT INTO certificate_requests 
               (user_id, tracking_id, certificate_type, purpose, status, date_needed, 
                id_type, id_number, id_file_path, request_type, fee_amount)
               VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s, %s, 'online', 0.00)""",
            (user_id, tracking_id, certificate_type, purpose, date_needed,
             id_type, id_number, id_file_path)
        )
        
        if cert_id:
            # Send confirmation email
            try:
                send_certificate_request_received_email(
                    recipient_email=email,
                    recipient_name=name,
                    certificate_type=certificate_type,
                    tracking_id=tracking_id
                )
                print(f"Confirmation email sent to {email}")
            except Exception as e:
                print(f"Error sending confirmation email: {e}")
                # Don't fail the request if email fails
            
            return jsonify({
                'message': 'Certificate request submitted successfully',
                'trackingId': tracking_id,
                'requestId': cert_id
            }), 201
        return jsonify({'message': 'Failed to submit request'}), 500
        
    except Exception as e:
        print(f"Error in create_public_certificate_request: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

# ============================================
# APPOINTMENT ENDPOINTS
# ============================================

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    tracking_id = generate_tracking_id('APPT')
    
    appt_id = execute_query(
        """INSERT INTO appointments 
           (user_id, tracking_id, service_type, appointment_date, 
            appointment_time, health_concern, status)
           VALUES (%s, %s, %s, %s, %s, %s, 'pending')""",
        (user_id, tracking_id, data['serviceType'], data['date'],
         data['time'], data.get('healthConcern', ''))
    )
    
    if appt_id:
        return jsonify({
            'message': 'Appointment booked successfully',
            'trackingId': tracking_id,
            'appointmentId': appt_id
        }), 201
    return jsonify({'message': 'Failed to book appointment'}), 500

@app.route('/api/appointments/<int:appt_id>/confirm', methods=['POST'])
@jwt_required()
def confirm_appointment(appt_id):
    """Confirm appointment and send email"""
    # Get appointment details
    appt = execute_query(
        """SELECT a.*, u.first_name, u.last_name, u.email
           FROM appointments a
           JOIN users u ON a.user_id = u.id
           WHERE a.id = %s""",
        (appt_id,),
        fetch=True
    )
    
    if not appt:
        return jsonify({'message': 'Appointment not found'}), 404
    
    appt_data = appt[0]
    
    try:
        # Update status to confirmed
        execute_query(
            """UPDATE appointments 
               SET status = 'confirmed', remarks = 'Appointment confirmed'
               WHERE id = %s""",
            (appt_id,)
        )
        
        # Send confirmation email
        full_name = f"{appt_data['first_name']} {appt_data['last_name']}"
        email_sent = send_appointment_confirmation_email(
            recipient_email=appt_data['email'],
            recipient_name=full_name,
            service_type=appt_data['service_type'],
            date=appt_data['appointment_date'].strftime('%B %d, %Y'),
            time=str(appt_data['appointment_time']),
            tracking_id=appt_data['tracking_id']
        )
        
        if email_sent:
            return jsonify({'message': 'Appointment confirmed and email sent successfully'}), 200
        else:
            return jsonify({'message': 'Appointment confirmed but email failed to send'}), 200
            
    except Exception as e:
        print(f"Error confirming appointment: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/appointments/all', methods=['GET'])
@jwt_required()
def get_all_appointments():
    """Get all appointments for admin dashboard"""
    appointments = execute_query(
        """SELECT a.*, u.first_name, u.last_name, u.email, u.phone
           FROM appointments a
           JOIN users u ON a.user_id = u.id
           ORDER BY a.appointment_date DESC, a.appointment_time DESC""",
        fetch=True
    )
    
    # Convert timedelta to string for JSON serialization
    if appointments:
        for appt in appointments:
            if 'appointment_time' in appt and appt['appointment_time'] is not None:
                # Convert timedelta to string format HH:MM:SS
                total_seconds = int(appt['appointment_time'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                appt['appointment_time'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            
            # Convert dates to string
            if 'appointment_date' in appt and appt['appointment_date'] is not None:
                appt['appointment_date'] = appt['appointment_date'].strftime('%Y-%m-%d')
            if 'created_at' in appt and appt['created_at'] is not None:
                appt['created_at'] = appt['created_at'].strftime('%Y-%m-%d %H:%M:%S')
    
    return jsonify(appointments), 200

@app.route('/api/appointments/track/<tracking_id>', methods=['GET'])
def track_appointment(tracking_id):
    result = execute_query(
        """SELECT a.*, u.first_name, u.last_name
           FROM appointments a
           JOIN users u ON a.user_id = u.id
           WHERE a.tracking_id = %s""",
        (tracking_id,),
        fetch=True
    )
    
    if not result:
        return jsonify({'message': 'Appointment not found'}), 404
    
    appt = result[0]
    return jsonify({
        'id': appt['tracking_id'],
        'service': appt['service_type'],
        'name': f"{appt['first_name']} {appt['last_name']}",
        'date': appt['appointment_date'].strftime('%Y-%m-%d'),
        'time': str(appt['appointment_time']),
        'status': appt['status'],
        'remarks': appt['remarks'] or 'Awaiting confirmation'
    }), 200

# PUBLIC APPOINTMENT BOOKING (No login required)
@app.route('/api/appointments/public', methods=['POST'])
def create_public_appointment():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all([data.get('name'), data.get('email'), data.get('phone'), 
                   data.get('serviceType'), data.get('date'), data.get('time')]):
            return jsonify({'message': 'Missing required fields'}), 400
        
        tracking_id = generate_tracking_id('APPT')
        
        # Create or get user by email
        user = execute_query(
            "SELECT id FROM users WHERE email = %s",
            (data['email'],),
            fetch=True
        )
        
        if user:
            user_id = user[0]['id']
        else:
            # Create new user for public request
            name_parts = data['name'].split()
            first_name = name_parts[0]
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            user_id = execute_query(
                """INSERT INTO users (email, first_name, last_name, phone, role)
                   VALUES (%s, %s, %s, %s, 'resident')""",
                (data['email'], first_name, last_name, data.get('phone', ''))
            )
        
        # Insert appointment
        appt_id = execute_query(
            """INSERT INTO appointments 
               (user_id, tracking_id, service_type, appointment_date, 
                appointment_time, health_concern, status)
               VALUES (%s, %s, %s, %s, %s, %s, 'pending')""",
            (user_id, tracking_id, data['serviceType'], data['date'],
             data['time'], data.get('healthConcern', ''))
        )
        
        if appt_id:
            # Send confirmation email
            try:
                send_appointment_request_received_email(
                    recipient_email=data['email'],
                    recipient_name=data['name'],
                    service_type=data['serviceType'],
                    date=data['date'],
                    time=data['time'],
                    tracking_id=tracking_id
                )
                print(f"Appointment confirmation email sent to {data['email']}")
            except Exception as e:
                print(f"Error sending confirmation email: {e}")
                # Don't fail the request if email fails
            
            return jsonify({
                'message': 'Appointment booked successfully',
                'trackingId': tracking_id,
                'appointmentId': appt_id
            }), 201
        return jsonify({'message': 'Failed to book appointment'}), 500
        
    except Exception as e:
        print(f"Error in create_public_appointment: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/appointments/available-slots', methods=['GET'])
def get_available_slots():
    date = request.args.get('date')
    service = request.args.get('service')
    
    # Maximum appointments per time slot per service
    MAX_APPOINTMENTS_PER_SLOT = 3
    
    # Get booked slots with count
    booked = execute_query(
        """SELECT appointment_time, COUNT(*) as count 
           FROM appointments 
           WHERE appointment_date = %s AND service_type = %s 
           AND status != 'cancelled'
           GROUP BY appointment_time""",
        (date, service),
        fetch=True
    )
    
    # Create dictionary of booked times with their counts
    booked_counts = {str(slot['appointment_time']): slot['count'] for slot in booked}
    
    # Generate all possible slots (9 AM to 4 PM)
    all_slots = []
    for hour in range(9, 17):
        all_slots.append(f"{hour:02d}:00:00")
        all_slots.append(f"{hour:02d}:30:00")
    
    # Filter slots - only include if less than MAX_APPOINTMENTS_PER_SLOT bookings
    available = [slot for slot in all_slots if booked_counts.get(slot, 0) < MAX_APPOINTMENTS_PER_SLOT]
    
    return jsonify({'availableSlots': available}), 200

# ============================================
# NEWS & ANNOUNCEMENTS ENDPOINTS
# ============================================

@app.route('/api/news', methods=['GET'])
def get_news():
    category = request.args.get('category')
    
    if category and category != 'all':
        news = execute_query(
            """SELECT * FROM news_articles 
               WHERE category = %s AND published = TRUE
               ORDER BY created_at DESC""",
            (category,),
            fetch=True
        )
    else:
        news = execute_query(
            """SELECT * FROM news_articles 
               WHERE published = TRUE
               ORDER BY created_at DESC""",
            fetch=True
        )
    
    return jsonify(news), 200

@app.route('/api/news/<int:news_id>', methods=['GET'])
def get_news_by_id(news_id):
    news = execute_query(
        "SELECT * FROM news_articles WHERE id = %s",
        (news_id,),
        fetch=True
    )
    
    if not news:
        return jsonify({'message': 'News article not found'}), 404
    
    return jsonify(news[0]), 200

@app.route('/api/news', methods=['POST'])
@jwt_required()
def create_news_article():
    """Create a new news article"""
    data = request.get_json()
    
    try:
        # Insert news article
        news_id = execute_query(
            """INSERT INTO news_articles 
               (title, category, excerpt, content, image_url, featured, published, created_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())""",
            (data['title'], data['category'], data['excerpt'], data['content'],
             data['image_url'], data.get('featured', False), 
             data['status'] == 'published')
        )
        
        if news_id:
            return jsonify({
                'message': 'News article created successfully',
                'id': news_id
            }), 201
        return jsonify({'message': 'Failed to create news article'}), 500
        
    except Exception as e:
        print(f"Error creating news article: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/news/<int:news_id>', methods=['PUT'])
@jwt_required()
def update_news_article(news_id):
    """Update an existing news article"""
    data = request.get_json()
    
    try:
        execute_query(
            """UPDATE news_articles 
               SET title = %s, category = %s, excerpt = %s, content = %s,
                   image_url = %s, featured = %s, published = %s
               WHERE id = %s""",
            (data['title'], data['category'], data['excerpt'], data['content'],
             data['image_url'], data.get('featured', False),
             data['status'] == 'published', news_id)
        )
        
        return jsonify({'message': 'News article updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating news article: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/news/<int:news_id>', methods=['DELETE'])
@jwt_required()
def delete_news_article(news_id):
    """Delete a news article"""
    try:
        execute_query(
            "DELETE FROM news_articles WHERE id = %s",
            (news_id,)
        )
        
        return jsonify({'message': 'News article deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting news article: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/news/upload-image', methods=['POST'])
@jwt_required()
def upload_news_image():
    """Upload image for news article"""
    try:
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
        if file.content_type not in allowed_types:
            return jsonify({'message': 'Only JPG and PNG images are allowed'}), 400
        
        # Create unique filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        
        # Save file
        file_path = os.path.join(app.config['NEWS_UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Return the file path (relative URL)
        file_url = f"/uploads/news/{unique_filename}"
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'imageUrl': file_url
        }), 200
        
    except Exception as e:
        print(f"Error uploading image: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

# ============================================
# CONTACT FORM ENDPOINT
# ============================================

@app.route('/api/contact', methods=['POST'])
def submit_contact_form():
    data = request.get_json()
    
    contact_id = execute_query(
        """INSERT INTO contact_messages 
           (name, email, phone, subject, message)
           VALUES (%s, %s, %s, %s, %s)""",
        (data['name'], data['email'], data.get('phone', ''),
         data['subject'], data['message'])
    )
    
    if contact_id:
        return jsonify({'message': 'Message sent successfully'}), 201
    return jsonify({'message': 'Failed to send message'}), 500

# ============================================
# UTILITY FUNCTIONS
# ============================================

def generate_tracking_id(prefix):
    import random
    import string
    timestamp = datetime.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{timestamp}-{random_str}"

# ============================================
# ADMIN ENDPOINTS
# ============================================

@app.route('/api/admin/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    stats = {
        'totalCertificates': execute_query(
            "SELECT COUNT(*) as count FROM certificate_requests",
            fetch=True
        )[0]['count'],
        'pendingCertificates': execute_query(
            "SELECT COUNT(*) as count FROM certificate_requests WHERE status = 'pending'",
            fetch=True
        )[0]['count'],
        'totalAppointments': execute_query(
            "SELECT COUNT(*) as count FROM appointments",
            fetch=True
        )[0]['count'],
        'todayAppointments': execute_query(
            "SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()",
            fetch=True
        )[0]['count']
    }
    
    return jsonify(stats), 200

# ============================================
# CONTACT MESSAGES ENDPOINTS
# ============================================

@app.route('/api/contact/messages', methods=['GET'])
@jwt_required()
def get_all_messages():
    """Get all contact messages for admin dashboard"""
    messages = execute_query(
        """SELECT * FROM contact_messages 
           ORDER BY created_at DESC""",
        fetch=True
    )
    
    # Convert datetime to string for JSON serialization
    if messages:
        for msg in messages:
            if 'created_at' in msg and msg['created_at'] is not None:
                msg['created_at'] = msg['created_at'].strftime('%Y-%m-%d %H:%M:%S')
    
    return jsonify(messages), 200

@app.route('/api/contact/messages/<int:message_id>/mark-read', methods=['PUT'])
@jwt_required()
def mark_message_read(message_id):
    """Mark a contact message as read"""
    execute_query(
        """UPDATE contact_messages 
           SET status = 'read' 
           WHERE id = %s""",
        (message_id,)
    )
    
    return jsonify({'message': 'Message marked as read'}), 200

@app.route('/api/contact/messages/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """Delete a contact message"""
    execute_query(
        """DELETE FROM contact_messages 
           WHERE id = %s""",
        (message_id,)
    )
    
    return jsonify({'message': 'Message deleted successfully'}), 200

@app.route('/api/contact/messages/<int:message_id>/reply', methods=['POST'])
@jwt_required()
def reply_to_message(message_id):
    """Send a reply to a contact message"""
    data = request.get_json()
    
    # Get the original message
    message = execute_query(
        """SELECT * FROM contact_messages WHERE id = %s""",
        (message_id,),
        fetch=True
    )
    
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    
    msg = message[0]
    
    try:
        # Send reply email
        email_sent = send_message_reply(
            recipient_email=msg['email'],
            recipient_name=msg['name'],
            subject=f"Re: {msg['subject']}",
            message_body=data['reply'],
            original_message=msg['message']
        )
        
        if email_sent:
            # Mark message as read after reply
            execute_query(
                """UPDATE contact_messages 
                   SET status = 'read' 
                   WHERE id = %s""",
                (message_id,)
            )
            return jsonify({'message': 'Reply sent successfully'}), 200
        else:
            return jsonify({'message': 'Failed to send reply'}), 500
            
    except Exception as e:
        print(f"Error sending reply: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

# ============================================
# FILE SERVING ENDPOINTS
# ============================================

@app.route('/api/uploads/<path:filename>', methods=['GET'])
@jwt_required()
def serve_uploaded_file(filename):
    """Serve uploaded ID files for admin viewing"""
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path)
        return jsonify({'message': 'File not found'}), 404
    except Exception as e:
        print(f"Error serving file: {e}")
        return jsonify({'message': 'Error serving file'}), 500

@app.route('/uploads/news/<path:filename>', methods=['GET'])
def serve_news_image(filename):
    """Serve news images (public, no auth required)"""
    try:
        file_path = os.path.join(app.config['NEWS_UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path)
        return jsonify({'message': 'Image not found'}), 404
    except Exception as e:
        print(f"Error serving news image: {e}")
        return jsonify({'message': 'Error serving image'}), 500

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

# For Elastic Beanstalk
application = app

if __name__ == '__main__':
    app.run(debug=True, port=5000)

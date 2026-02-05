"""
Email utility for sending notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os
from dotenv import load_dotenv

load_dotenv()

# Email configuration
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USER = os.getenv('EMAIL_USER', 'your-email@gmail.com')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', 'your-app-password')
EMAIL_FROM = os.getenv('EMAIL_FROM', 'Barangay NIT <noreply@barangaynit.com>')

def send_email(to_email, subject, html_content, attachments=None):
    """
    Send email with optional PDF attachment
    
    Args:
        to_email (str): Recipient email address
        subject (str): Email subject
        html_content (str): HTML content of email
        attachments (list): List of file paths to attach
    
    Returns:
        bool: True if sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Add attachments if any
        if attachments:
            for file_path in attachments:
                if os.path.exists(file_path):
                    with open(file_path, 'rb') as file:
                        part = MIMEApplication(file.read(), Name=os.path.basename(file_path))
                        part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
                        msg.attach(part)
        
        # Send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_certificate_approval_email(recipient_email, recipient_name, certificate_type, tracking_id, pdf_path):
    """Send certificate approval notification with PDF attachment"""
    
    subject = f"Certificate Approved - {certificate_type}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #A100FF, #6B00B8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; }}
            .footer {{ background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }}
            .button {{ display: inline-block; background-color: #A100FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .info-box {{ background: white; padding: 15px; border-left: 4px solid #A100FF; margin: 20px 0; }}
            h1 {{ margin: 0; font-size: 24px; }}
            h2 {{ color: #A100FF; font-size: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Certificate Approved!</h1>
            </div>
            <div class="content">
                <h2>Dear {recipient_name},</h2>
                <p>Great news! Your certificate request has been <strong>approved</strong> and is now ready.</p>
                
                <div class="info-box">
                    <strong>Certificate Details:</strong><br>
                    <strong>Type:</strong> {certificate_type}<br>
                    <strong>Tracking ID:</strong> {tracking_id}<br>
                    <strong>Status:</strong> <span style="color: #10b981;">Approved</span>
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ul>
                    <li>Your certificate is attached to this email as a PDF file</li>
                    <li>You can download and print it immediately</li>
                    <li>Or visit the Barangay Hall to claim the official copy</li>
                </ul>
                
                <p><strong>Office Hours:</strong><br>
                Monday to Friday: 8:00 AM - 5:00 PM</p>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p>Thank you for using our online service!</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>Barangay NIT</strong><br>
                    Lungsod ng Accenture
                </p>
            </div>
            <div class="footer">
                <p>Barangay NIT - Lungsod ng Accenture</p>
                <p>📞 (02) 8123-4567 | 📧 barangaynit@accenture.com</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content, [pdf_path] if pdf_path else None)

def send_certificate_rejection_email(recipient_email, recipient_name, certificate_type, tracking_id, reason):
    """Send certificate rejection notification"""
    
    subject = f"Certificate Request Update - {certificate_type}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; }}
            .footer {{ background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }}
            .info-box {{ background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }}
            h1 {{ margin: 0; font-size: 24px; }}
            h2 {{ color: #ef4444; font-size: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Certificate Request Update</h1>
            </div>
            <div class="content">
                <h2>Dear {recipient_name},</h2>
                <p>We regret to inform you that your certificate request requires additional attention.</p>
                
                <div class="info-box">
                    <strong>Request Details:</strong><br>
                    <strong>Type:</strong> {certificate_type}<br>
                    <strong>Tracking ID:</strong> {tracking_id}<br>
                    <strong>Status:</strong> <span style="color: #ef4444;">Requires Revision</span>
                </div>
                
                <p><strong>Reason:</strong></p>
                <p style="background: white; padding: 15px; border-radius: 5px;">{reason}</p>
                
                <p><strong>What to do next?</strong></p>
                <ul>
                    <li>Please visit the Barangay Hall during office hours</li>
                    <li>Bring the necessary documents</li>
                    <li>Our staff will assist you with the process</li>
                </ul>
                
                <p><strong>Office Hours:</strong><br>
                Monday to Friday: 8:00 AM - 5:00 PM</p>
                
                <p>We apologize for any inconvenience. We're here to help!</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>Barangay NIT</strong><br>
                    Lungsod ng Accenture
                </p>
            </div>
            <div class="footer">
                <p>Barangay NIT - Lungsod ng Accenture</p>
                <p>📞 (02) 8123-4567 | 📧 barangaynit@accenture.com</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content)

def send_appointment_confirmation_email(recipient_email, recipient_name, service_type, date, time, tracking_id):
    """Send appointment confirmation email"""
    
    subject = f"Appointment Confirmed - {service_type}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; }}
            .footer {{ background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }}
            .info-box {{ background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }}
            h1 {{ margin: 0; font-size: 24px; }}
            h2 {{ color: #10b981; font-size: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Appointment Confirmed!</h1>
            </div>
            <div class="content">
                <h2>Dear {recipient_name},</h2>
                <p>Your health center appointment has been confirmed!</p>
                
                <div class="info-box">
                    <strong>Appointment Details:</strong><br>
                    <strong>Service:</strong> {service_type}<br>
                    <strong>Date:</strong> {date}<br>
                    <strong>Time:</strong> {time}<br>
                    <strong>Tracking ID:</strong> {tracking_id}
                </div>
                
                <p><strong>Important Reminders:</strong></p>
                <ul>
                    <li>Please arrive 10 minutes before your scheduled time</li>
                    <li>Bring a valid ID and your tracking ID</li>
                    <li>Bring any relevant medical records</li>
                    <li>Wear a face mask</li>
                </ul>
                
                <p><strong>Health Center Location:</strong><br>
                Barangay NIT Health Center<br>
                Accenture Campus</p>
                
                <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>Barangay NIT Health Center</strong>
                </p>
            </div>
            <div class="footer">
                <p>Barangay NIT - Lungsod ng Accenture</p>
                <p>📞 (02) 8123-4567 | 📧 barangaynit@accenture.com</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content)

def send_message_reply(recipient_email, recipient_name, subject, message_body, original_message):
    """Send reply to contact message"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; }}
            .footer {{ background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }}
            .message-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; line-height: 1.8; }}
            .original-message {{ background: #f3f4f6; padding: 15px; border-left: 4px solid #9ca3af; margin: 20px 0; font-size: 14px; }}
            h1 {{ margin: 0; font-size: 24px; }}
            h2 {{ color: #3b82f6; font-size: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 Message from Barangay NIT</h1>
            </div>
            <div class="content">
                <h2>Dear {recipient_name},</h2>
                <p>Thank you for contacting Barangay NIT. Here is our response to your inquiry:</p>
                
                <div class="message-box">
                    {message_body.replace(chr(10), '<br>')}
                </div>
                
                <div class="original-message">
                    <strong>Your Original Message:</strong><br><br>
                    {original_message.replace(chr(10), '<br>')}
                </div>
                
                <p>If you have any additional questions, please feel free to contact us.</p>
                
                <p><strong>Contact Information:</strong><br>
                📞 (02) 8123-4567<br>
                📧 brgynit@gmail.com<br>
                📍 Barangay NIT, Accenture Campus</p>
                
                <p><strong>Office Hours:</strong><br>
                Monday to Friday: 8:00 AM - 5:00 PM</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>Barangay NIT</strong><br>
                    Lungsod ng Accenture
                </p>
            </div>
            <div class="footer">
                <p>Barangay NIT - Lungsod ng Accenture</p>
                <p>📞 (02) 8123-4567 | 📧 brgynit@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content)

def send_certificate_request_received_email(recipient_email, recipient_name, certificate_type, tracking_id):
    """Send confirmation email when certificate request is received"""
    
    subject = f"Certificate Request Received - {certificate_type}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #A100FF, #6B00B8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; }}
            .footer {{ background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }}
            .info-box {{ background: white; padding: 15px; border-left: 4px solid #A100FF; margin: 20px 0; }}
            .tracking-box {{ background: #A100FF; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }}
            .tracking-id {{ font-size: 24px; font-weight: bold; letter-spacing: 2px; }}
            h1 {{ margin: 0; font-size: 24px; }}
            h2 {{ color: #A100FF; font-size: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Request Received!</h1>
            </div>
            <div class="content">
                <h2>Dear {recipient_name},</h2>
                <p>Thank you for submitting your certificate request online. We have received your application and it is now being processed.</p>
                
                <div class="info-box">
                    <strong>Request Details:</strong><br>
                    <strong>Certificate Type:</strong> {certificate_type}<br>
                    <strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span><br>
                    <strong>Submitted:</strong> Just now
                </div>
                
                <div class="tracking-box">
                    <p style="margin: 0 0 10px 0; font-size: 14px;">Your Tracking ID:</p>
                    <div class="tracking-id">{tracking_id}</div>
                    <p style="margin: 10px 0 0 0; font-size: 12px;">Save this ID to track your request</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Our team will review your request within 3-5 business days</li>
                    <li>You'll receive an email once your certificate is approved</li>
                    <li>Track your request anytime using your tracking ID</li>
                </ul>
                
                <p><strong>Track Your Request:</strong><br>
                Visit our website and enter your tracking ID in the "Track Request" section.</p>
                
                <p><strong>Processing Time:</strong> 3-5 business days<br>
                <strong>Fee:</strong> FREE (online request)</p>
                
                <p><strong>Need Help?</strong><br>
                Contact us during office hours:<br>
                Monday to Friday: 8:00 AM - 5:00 PM<br>
                📞 (02) 8123-4567 | 📧 barangaynit@accenture.com</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>Barangay NIT</strong><br>
                    Lungsod ng Accenture
                </p>
            </div>
            <div class="footer">
                <p>Barangay NIT - Lungsod ng Accenture</p>
                <p>📞 (02) 8123-4567 | 📧 barangaynit@accenture.com</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content)

def send_appointment_request_received_email(recipient_email, recipient_name, service_type, date, time, tracking_id):
    """Send confirmation email when appointment request is received"""
    
    subject = f"Appointment Request Received - {service_type}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; }}
            .footer {{ background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }}
            .info-box {{ background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }}
            .tracking-box {{ background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }}
            .tracking-id {{ font-size: 24px; font-weight: bold; letter-spacing: 2px; }}
            h1 {{ margin: 0; font-size: 24px; }}
            h2 {{ color: #3b82f6; font-size: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Appointment Request Received!</h1>
            </div>
            <div class="content">
                <h2>Dear {recipient_name},</h2>
                <p>Thank you for booking an appointment with Barangay NIT Health Center. We have received your request and it is pending confirmation.</p>
                
                <div class="info-box">
                    <strong>Appointment Details:</strong><br>
                    <strong>Service:</strong> {service_type}<br>
                    <strong>Requested Date:</strong> {date}<br>
                    <strong>Requested Time:</strong> {time}<br>
                    <strong>Status:</strong> <span style="color: #f59e0b;">Pending Confirmation</span>
                </div>
                
                <div class="tracking-box">
                    <p style="margin: 0 0 10px 0; font-size: 14px;">Your Tracking ID:</p>
                    <div class="tracking-id">{tracking_id}</div>
                    <p style="margin: 10px 0 0 0; font-size: 12px;">Save this ID to track your appointment</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Our health center staff will review your appointment request</li>
                    <li>You'll receive a confirmation email within 24 hours</li>
                    <li>Track your appointment status anytime using your tracking ID</li>
                </ul>
                
                <p><strong>Important Reminders:</strong></p>
                <ul>
                    <li>Please wait for confirmation before visiting</li>
                    <li>Bring a valid ID when you visit</li>
                    <li>Arrive 10 minutes before your scheduled time</li>
                    <li>Wear a face mask</li>
                </ul>
                
                <p><strong>Health Center Location:</strong><br>
                Barangay NIT Health Center<br>
                Accenture Campus</p>
                
                <p><strong>Need to Reschedule?</strong><br>
                Contact us at:<br>
                📞 (02) 8123-4567 | 📧 barangaynit@accenture.com<br>
                Monday to Friday: 8:00 AM - 5:00 PM</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>Barangay NIT Health Center</strong>
                </p>
            </div>
            <div class="footer">
                <p>Barangay NIT - Lungsod ng Accenture</p>
                <p>📞 (02) 8123-4567 | 📧 barangaynit@accenture.com</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content)

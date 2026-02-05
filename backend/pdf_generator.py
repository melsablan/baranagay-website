"""
PDF Certificate Generator using ReportLab
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from datetime import datetime
import os

# Create certificates directory if it doesn't exist
CERTIFICATES_DIR = 'certificates'
if not os.path.exists(CERTIFICATES_DIR):
    os.makedirs(CERTIFICATES_DIR)

def generate_barangay_clearance(data):
    """Generate Barangay Clearance Certificate"""
    filename = f"{CERTIFICATES_DIR}/Barangay_Clearance_{data['tracking_id']}.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Header - Logo and Title
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, height - 120, width, 120, fill=True, stroke=False)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 50, "BARANGAY NIT")
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, height - 70, "Lungsod ng Accenture")
    c.drawCentredString(width/2, height - 90, "Tel: (02) 8123-4567 | Email: brgynit@gmail.com")
    
    # Certificate Title
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height - 160, "BARANGAY CLEARANCE")
    
    # Certificate Number
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 190, f"Certificate No: {data['tracking_id']}")
    c.drawString(50, height - 205, f"Date Issued: {datetime.now().strftime('%B %d, %Y')}")
    
    # Body
    y_position = height - 260
    c.setFont("Helvetica", 12)
    
    # TO WHOM IT MAY CONCERN
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, y_position, "TO WHOM IT MAY CONCERN")
    y_position -= 40
    
    # Content
    c.setFont("Helvetica", 12)
    content = f"""
        This is to certify that {data['name']}, of legal age, Filipino citizen, 
    and a resident of {data.get('address', 'Barangay NIT, Accenture Campus')}, is personally known 
    to me and is of good moral character and reputation in the community.
    """
    
    lines = content.strip().split('\n')
    for line in lines:
        c.drawString(80, y_position, line.strip())
        y_position -= 20
    
    y_position -= 20
    
    # Purpose
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, f"PURPOSE: {data.get('purpose', 'For whatever legal purpose it may serve')}")
    y_position -= 40
    
    # Validity
    c.setFont("Helvetica", 11)
    c.drawString(80, y_position, "This clearance is valid for Six (6) months from the date of issue unless")
    y_position -= 15
    c.drawString(80, y_position, "revoked or cancelled for any violation of existing laws or ordinances.")
    y_position -= 60
    
    # Signatures
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Issued by:")
    c.drawString(400, y_position, "Certified by:")
    y_position -= 40
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, "_____________________________")
    c.drawString(400, y_position, "_____________________________")
    y_position -= 15
    
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Barangay Secretary")
    c.drawString(400, y_position, "Barangay Captain")
    y_position -= 5
    c.drawString(80, y_position, "MARIA T. SANTOS")
    c.drawString(400, y_position, "JUAN D. DELA CRUZ")
    
    # Footer
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, 0, width, 50, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 25, "This is a computer-generated certificate. No signature required.")
    c.drawCentredString(width/2, 15, f"Tracking ID: {data['tracking_id']}")
    
    # Watermark
    c.setFillColorRGB(0.9, 0.9, 0.9)
    c.setFont("Helvetica-Bold", 60)
    c.saveState()
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, "OFFICIAL")
    c.restoreState()
    
    c.save()
    return filename

def generate_certificate_of_indigency(data):
    """Generate Certificate of Indigency"""
    filename = f"{CERTIFICATES_DIR}/Certificate_Indigency_{data['tracking_id']}.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, height - 120, width, 120, fill=True, stroke=False)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 50, "BARANGAY NIT")
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, height - 70, "Lungsod ng Accenture")
    c.drawCentredString(width/2, height - 90, "Office of the Barangay Captain")
    
    # Title
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height - 160, "CERTIFICATE OF INDIGENCY")
    
    # Certificate Number
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 190, f"Certificate No: {data['tracking_id']}")
    c.drawString(50, height - 205, f"Date Issued: {datetime.now().strftime('%B %d, %Y')}")
    
    # Body
    y_position = height - 260
    
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, y_position, "TO WHOM IT MAY CONCERN")
    y_position -= 40
    
    c.setFont("Helvetica", 12)
    content = f"""
        This is to certify that {data['name']}, of legal age, Filipino, 
    and a bonafide resident of Barangay NIT, Accenture Campus, belongs to the indigent 
    families of this Barangay as per record of the Barangay Social Welfare Office.
    """
    
    lines = content.strip().split('\n')
    for line in lines:
        c.drawString(80, y_position, line.strip())
        y_position -= 20
    
    y_position -= 20
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, f"PURPOSE: {data.get('purpose', 'Medical/Educational/Financial Assistance')}")
    y_position -= 40
    
    c.setFont("Helvetica", 11)
    c.drawString(80, y_position, "Issued upon the request of the above-named person for whatever legal")
    y_position -= 15
    c.drawString(80, y_position, "purpose it may serve.")
    y_position -= 60
    
    # Signatures
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Issued by:")
    c.drawString(400, y_position, "Certified by:")
    y_position -= 40
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, "_____________________________")
    c.drawString(400, y_position, "_____________________________")
    y_position -= 15
    
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Barangay Social Welfare Officer")
    c.drawString(400, y_position, "Barangay Captain")
    
    # Footer
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, 0, width, 50, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 25, "This is a computer-generated certificate.")
    c.drawCentredString(width/2, 15, f"Tracking ID: {data['tracking_id']}")
    
    # Watermark
    c.setFillColorRGB(0.9, 0.9, 0.9)
    c.setFont("Helvetica-Bold", 60)
    c.saveState()
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, "OFFICIAL")
    c.restoreState()
    
    c.save()
    return filename

def generate_certificate_of_residency(data):
    """Generate Certificate of Residency"""
    filename = f"{CERTIFICATES_DIR}/Certificate_Residency_{data['tracking_id']}.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, height - 120, width, 120, fill=True, stroke=False)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 50, "BARANGAY NIT")
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, height - 70, "Lungsod ng Accenture")
    c.drawCentredString(width/2, height - 90, "Office of the Barangay Captain")
    
    # Title
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height - 160, "CERTIFICATE OF RESIDENCY")
    
    # Certificate Number
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 190, f"Certificate No: {data['tracking_id']}")
    c.drawString(50, height - 205, f"Date Issued: {datetime.now().strftime('%B %d, %Y')}")
    
    # Body
    y_position = height - 260
    
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, y_position, "TO WHOM IT MAY CONCERN")
    y_position -= 40
    
    c.setFont("Helvetica", 12)
    content = f"""
        This is to certify that {data['name']}, of legal age, Filipino citizen, 
    is a bonafide resident of Barangay NIT, {data.get('address', 'Accenture Campus')} 
    as shown in the records of this Barangay.
    """
    
    lines = content.strip().split('\n')
    for line in lines:
        c.drawString(80, y_position, line.strip())
        y_position -= 20
    
    y_position -= 20
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, f"PURPOSE: {data.get('purpose', 'For whatever legal purpose it may serve')}")
    y_position -= 40
    
    c.setFont("Helvetica", 11)
    c.drawString(80, y_position, "Issued upon the request of the above-named person this")
    y_position -= 15
    c.drawString(80, y_position, f"{datetime.now().strftime('%d day of %B, %Y')} at Barangay NIT, Accenture Campus.")
    y_position -= 60
    
    # Signatures
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Issued by:")
    c.drawString(400, y_position, "Certified by:")
    y_position -= 40
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, "_____________________________")
    c.drawString(400, y_position, "_____________________________")
    y_position -= 15
    
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Barangay Secretary")
    c.drawString(400, y_position, "Barangay Captain")
    
    # Footer
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, 0, width, 50, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 25, "This is a computer-generated certificate.")
    c.drawCentredString(width/2, 15, f"Tracking ID: {data['tracking_id']}")
    
    # Watermark
    c.setFillColorRGB(0.9, 0.9, 0.9)
    c.setFont("Helvetica-Bold", 60)
    c.saveState()
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, "OFFICIAL")
    c.restoreState()
    
    c.save()
    return filename

def generate_business_permit_clearance(data):
    """Generate Business Permit Clearance"""
    filename = f"{CERTIFICATES_DIR}/Business_Clearance_{data['tracking_id']}.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, height - 120, width, 120, fill=True, stroke=False)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 50, "BARANGAY NIT")
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, height - 70, "Lungsod ng Accenture")
    c.drawCentredString(width/2, height - 90, "Business Permits and Licensing Office")
    
    # Title
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height - 160, "BUSINESS PERMIT CLEARANCE")
    
    # Certificate Number
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 190, f"Clearance No: {data['tracking_id']}")
    c.drawString(50, height - 205, f"Date Issued: {datetime.now().strftime('%B %d, %Y')}")
    
    # Body
    y_position = height - 260
    
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, y_position, "TO WHOM IT MAY CONCERN")
    y_position -= 40
    
    c.setFont("Helvetica", 12)
    content = f"""
        This is to certify that {data['name']} has been cleared to operate 
    a business within the jurisdiction of Barangay NIT, Accenture Campus, subject to 
    compliance with all applicable laws, ordinances, and regulations.
    """
    
    lines = content.strip().split('\n')
    for line in lines:
        c.drawString(80, y_position, line.strip())
        y_position -= 20
    
    y_position -= 20
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, f"PURPOSE: {data.get('purpose', 'Business Registration and Permit Application')}")
    y_position -= 40
    
    c.setFont("Helvetica", 11)
    c.drawString(80, y_position, "This clearance is valid for one (1) year from the date of issue.")
    y_position -= 60
    
    # Signatures
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Approved by:")
    c.drawString(400, y_position, "Noted by:")
    y_position -= 40
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y_position, "_____________________________")
    c.drawString(400, y_position, "_____________________________")
    y_position -= 15
    
    c.setFont("Helvetica", 10)
    c.drawString(80, y_position, "Business Permits Officer")
    c.drawString(400, y_position, "Barangay Captain")
    
    # Footer
    c.setFillColor(colors.HexColor('#A100FF'))
    c.rect(0, 0, width, 50, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, 25, "This is a computer-generated clearance.")
    c.drawCentredString(width/2, 15, f"Tracking ID: {data['tracking_id']}")
    
    # Watermark
    c.setFillColorRGB(0.9, 0.9, 0.9)
    c.setFont("Helvetica-Bold", 60)
    c.saveState()
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, "OFFICIAL")
    c.restoreState()
    
    c.save()
    return filename

def generate_certificate(certificate_type, data):
    """
    Generate certificate based on type
    
    Args:
        certificate_type (str): Type of certificate
        data (dict): Certificate data including name, purpose, tracking_id, etc.
    
    Returns:
        str: Path to generated PDF file
    """
    certificate_generators = {
        'Barangay Clearance': generate_barangay_clearance,
        'Certificate of Indigency': generate_certificate_of_indigency,
        'Certificate of Residency': generate_certificate_of_residency,
        'Business Permit Clearance': generate_business_permit_clearance
    }
    
    generator = certificate_generators.get(certificate_type)
    
    if generator:
        return generator(data)
    else:
        raise ValueError(f"Unknown certificate type: {certificate_type}")

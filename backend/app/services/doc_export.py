import io
from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def generate_pdf_buffer(content_text: str) -> io.BytesIO:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Split text into lines to avoid running off the page
    textobject = c.beginText()
    textobject.setTextOrigin(50, 750)
    textobject.setFont("Helvetica", 12)
    
    lines = content_text.split('\n')
    for line in lines:
        textobject.textLine(line)
        
    c.drawText(textobject)
    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer

def generate_docx_buffer(content_text: str) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = Document()
    
    for line in content_text.split('\n'):
        doc.add_paragraph(line)
        
    doc.save(buffer)
    buffer.seek(0)
    return buffer

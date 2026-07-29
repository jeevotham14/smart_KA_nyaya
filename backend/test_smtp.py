import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()
msg = EmailMessage()
msg.set_content('Test email from Smart Nyaya.')
msg['Subject'] = 'Test'
msg['From'] = os.getenv('SMTP_USER')
msg['To'] = os.getenv('SMTP_USER')

try:
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASS'))
    server.send_message(msg)
    print('SUCCESS')
except Exception as e:
    print('ERROR:', e)

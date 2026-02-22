import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from dotenv import load_dotenv  # <-- ДОДАНО: Імпорт бібліотеки

# Налаштування логування
logger = logging.getLogger(__name__)

# <-- ДОДАНО: Явне завантаження .env файлу
load_dotenv()

# Отримуємо дані з .env
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("EMAIL_USER")
SENDER_PASSWORD = os.getenv("EMAIL_PASSWORD")

async def send_price_alert(to_email: str, route_info: str, current_price: float, target_price: float):
    """
    Реальна відправка Email через Gmail SMTP.
    """
    # Перевірка наявності логіна/пароля
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        logger.error("❌ Email credentials not found in .env file! Check if EMAIL_USER and EMAIL_PASSWORD are set.")
        return False

    try:
        # 1. Формування листа
        subject = f"✈️ Dobra cena! Lot {route_info} za {current_price} PLN"
        
        # HTML шаблон
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #0052cc; text-align: center;">🔥 Znaleziono super ofertę!</h2>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p>Witaj,</p>
              <p>Mamy dobre wieści! Cena obserwowanego przez Ciebie lotu spadła.</p>
              
              <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Trasa:</strong> {route_info}</p>
                <p><strong>Aktualna cena:</strong> <span style="color: #2e7d32; font-size: 18px; font-weight: bold;">{current_price} PLN</span></p>
                <p><strong>Twoja cena docelowa:</strong> {target_price} PLN</p>
              </div>

              <p style="text-align: center;">
                <a href="http://localhost:5173" style="background-color: #ff5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sprawdź w aplikacji</a>
              </p>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #888; text-align: center;">Flight Price Monitor Team © 2026</p>
            </div>
          </body>
        </html>
        """

        msg = MIMEMultipart()
        msg["From"] = f"FlightMonitor <{SENDER_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_content, "html"))

        # 2. Відправка
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()

        logger.info(f"✅ EMAIL SENT successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"❌ FAILED to send email: {e}")
        return False
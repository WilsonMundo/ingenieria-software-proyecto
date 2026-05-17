import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def enviar_correo(destinatario: str, asunto: str, contenido_html: str):
    if not settings.EMAIL_ENABLED:
        print("========================================")
        print("CORREO SIMULADO")
        print("========================================")
        print(f"Para: {destinatario}")
        print(f"Asunto: {asunto}")
        print("Contenido HTML:")
        print(contenido_html)
        print("========================================")
        return

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    mensaje["To"] = destinatario

    parte_html = MIMEText(contenido_html, "html", "utf-8")
    mensaje.attach(parte_html)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as servidor:
        servidor.starttls()
        servidor.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        servidor.sendmail(
            settings.SMTP_FROM_EMAIL,
            destinatario,
            mensaje.as_string()
        )
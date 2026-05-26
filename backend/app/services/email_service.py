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

def enviar_correo_recuperacion_password(
    email_destino: str,
    nombre_usuario: str,
    token: str
):
    enlace = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    asunto = "Recuperación de contraseña - Liga Mundial"

    contenido_html = f"""
    <html>
      <body>
        <h2>Recuperación de contraseña</h2>

        <p>Hola {nombre_usuario},</p>

        <p>
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        </p>

        <p>
          Para crear una nueva contraseña, ingresa al siguiente enlace:
        </p>

        <p>
          <a href="{enlace}">
            Restablecer contraseña
          </a>
        </p>

        <p>
          Este enlace tiene validez limitada. Si no solicitaste este cambio,
          puedes ignorar este correo.
        </p>
      </body>
    </html>
    """

    enviar_correo(
        destinatario=email_destino,
        asunto=asunto,
        contenido_html=contenido_html
    )

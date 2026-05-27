import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def _imprimir_correo_simulado(destinatario: str, asunto: str, contenido_html: str):
    print("========================================")
    print("CORREO SIMULADO")
    print("========================================")
    print(f"Para: {destinatario}")
    print(f"Asunto: {asunto}")
    print("Contenido HTML:")
    print(contenido_html)
    print("========================================")


def _smtp_configurado() -> bool:
    return all([
        settings.SMTP_HOST,
        settings.SMTP_USER,
        settings.SMTP_PASSWORD,
        settings.SMTP_FROM_EMAIL
    ])


def enviar_correo(destinatario: str, asunto: str, contenido_html: str):
    if not settings.EMAIL_ENABLED or not _smtp_configurado():
        _imprimir_correo_simulado(destinatario, asunto, contenido_html)
        return False

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    mensaje["To"] = destinatario

    parte_html = MIMEText(contenido_html, "html", "utf-8")
    mensaje.attach(parte_html)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as servidor:
            servidor.starttls()
            servidor.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            servidor.sendmail(
                settings.SMTP_FROM_EMAIL,
                destinatario,
                mensaje.as_string()
            )
        return True
    except (smtplib.SMTPException, OSError) as exc:
        print(f"No se pudo enviar el correo por SMTP: {exc}")
        _imprimir_correo_simulado(destinatario, asunto, contenido_html)
        return False

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

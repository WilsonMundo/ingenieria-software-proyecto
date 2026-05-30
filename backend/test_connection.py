from sqlalchemy import text
from app.database.connection import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database();"))
        database_name = result.scalar()

        print("Conexión exitosa a PostgreSQL")
        print("Base de datos conectada:", database_name)

except Exception as error:
    print("Error al conectar con PostgreSQL")
    print(error)

from BD import Base  
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Boolean  
from sqlalchemy.sql import func  
from sqlalchemy.orm import relationship

class Usuario(Base):
    __tablename__ = "usuario"  
    id_usuario = Column(Integer, primary_key=True, index=True)  
    nombre_completo = Column(String(100), nullable=False)  
    email = Column(String(120), unique=True, nullable=False)  
    password_hash = Column(String(255), nullable=False)
    estado = Column(String(20))
    id_rol = Column(Integer)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    
    
    vaticinios = relationship(
        "Vaticinio", 
        back_populates="usuario",
        primaryjoin="Usuario.id_usuario == Vaticinio.id_liga_miembro",
        viewonly=True
    )

class Partido(Base):
    __tablename__ = "partido"  
    id_partido = Column(Integer, primary_key=True, index=True)
    id_torneo = Column(Integer)
    id_fase = Column(Integer)
    id_grupo = Column(Integer, nullable=True)
    id_estadio = Column(Integer)
    id_equipo_local = Column(Integer)
    id_equipo_visitante = Column(Integer)
    fecha_hora_inicio = Column(DateTime(timezone=True), nullable=False)
    estado_partido = Column(String(20))
    
    vaticinios = relationship("Vaticinio", back_populates="partido")

class Vaticinio(Base):  
    __tablename__ = "vaticinio"  
    
    id_vaticinio = Column(Integer, primary_key=True, index=True)  
    id_liga_miembro = Column(Integer, nullable=False)
    id_partido = Column(Integer, ForeignKey("partido.id_partido"), nullable=False)  
    
    goles_local_pred = Column(Integer, nullable=False)  
    goles_visitante_pred = Column(Integer, nullable=False)  
    
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())  
    fecha_modificacion = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    
    usuario = relationship(
        "Usuario", 
        back_populates="vaticinios", 
        primaryjoin="Vaticinio.id_liga_miembro == Usuario.id_usuario", 
        foreign_keys=[id_liga_miembro],
        remote_side="Usuario.id_usuario",
        viewonly=True
    )
    
    partido = relationship("Partido", back_populates="vaticinios")
    puntaje = relationship("Puntaje", back_populates="vaticinio", uselist=False)

class Puntaje(Base):
    __tablename__ = "puntaje"
    id_puntaje = Column(Integer, primary_key=True, index=True)
    id_vaticinio = Column(Integer, ForeignKey("vaticinio.id_vaticinio"), unique=True, nullable=False)
    puntos = Column(Integer, default=0, nullable=False)
    acerto_resultado = Column(Boolean, default=False, nullable=False)
    acerto_marcador = Column(Boolean, default=False, nullable=False)

    vaticinio = relationship("Vaticinio", back_populates="puntaje")


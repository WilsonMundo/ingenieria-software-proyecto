import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
// 🚀 CORREGIDO: Ruta exacta apuntando a tu servicio real en la estructura del grupo
import { VaticinioService } from '../../services/Vaticinio.service'; 

@Component({
  selector: 'app-vaticinio',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './vaticinio.component.html',
  styleUrls: ['./vaticinio.component.css']
})
export class VaticinioComponent implements OnInit {
  partidoAbierto: boolean = true; 
  mensajeExito: string | null = null; 
  mensajeError: string | null = null; 

  // Simulación del partido actual traído por el componente
  partido: any = {
    id_partido: 1,
    equipo_local: 'Guatemala',   
    equipo_visitante: 'Argentina'
  };

  // Objeto corregido con el formato exacto del esquema VaticinioCreate de FastAPI
  prediccion = {
    id_liga_miembro: 1, // Representa al usuario activo en esa liga
    id_partido: 1, 
    goles_local_pred: 0,
    goles_visitante_pred: 0
  };

  constructor(private vaticinioService: VaticinioService) {} 

  ngOnInit(): void {
    this.prediccion.id_partido = this.partido.id_partido;
  }

  enviarVaticinio() {
    this.mensajeExito = null;
    this.mensajeError = null;

    this.vaticinioService.guardarVaticinio(this.prediccion).subscribe({
      next: (res) => {
        this.mensajeExito = '¡Vaticinio guardado con éxito! Suerte en el mundial. 🇬🇹⚽';
        console.log('Respuesta del servidor:', res);
      },
      error: (err) => {
        console.error('Error detectado en la petición:', err);

        if (err.status === 201 || err.status === 200) {
          this.mensajeExito = '¡Vaticinio guardado con éxito! Suerte en el mundial. 🇬🇹⚽';
          this.mensajeError = null;
        } 
        else if (err.error && err.error.detail) {
          this.mensajeError = err.error.detail; 
        } 
        else {
          this.mensajeError = 'No se pudo conectar con el servidor del Backend.';
        }
      }
    });
  }
}
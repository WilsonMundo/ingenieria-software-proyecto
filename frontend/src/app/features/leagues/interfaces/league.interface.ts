export interface League {
  id: number;
  name: string;
  sport: string;
  teamsCount: number;
  status: 'Activa' | 'Finalizada' | 'Pendiente';
  startDate: string;
  endDate: string;
}
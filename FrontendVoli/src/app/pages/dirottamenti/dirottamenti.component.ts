import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dirottamenti',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard Dirottamenti</h1>
        <p class="dashboard-subtitle">Panoramica dettagliata dei voli dirottati e delle destinazioni raggiunte</p>
      </header>

      <div class="stats-container">
        <div class="stat-card">
          <i class="fas fa-plane-departure"></i>
          <div class="stat-content">
            <h3>Totale Voli</h3>
            <p>{{ formatNumber(totalFlights) }}</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-random"></i>
          <div class="stat-content">
            <h3>Dirottamenti</h3>
            <p>{{ formatNumber(diverted) }}</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <div class="stat-content">
            <h3>Destinazione Raggiunta</h3>
            <p>{{ formatNumber(reachedDest) }}</p>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h2>Stato dei Voli Dirottati</h2>
          <div class="chart-wrapper">
            <canvas id="divertedPieChart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h2>Proporzione Dirottamenti Totali</h2>
          <div class="chart-wrapper">
            <canvas id="deviatedLandingsChart"></canvas>
          </div>
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <i class="fas fa-route"></i>
          <div class="stat-content">
            <h3>Volo con percentuale di dirottamenti massima</h3>
            <p>{{ maxDivertedRoute?.OriginCityName }} → {{ maxDivertedRoute?.DestCityName }} ({{ maxDivertedRoute?.Percentage }}%)</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-route"></i>
          <div class="stat-content">
            <h3>Volo con percentuale di dirottamenti minima</h3>
            <p>{{ minDivertedRoute?.OriginCityName }} → {{ minDivertedRoute?.DestCityName }} ({{ minDivertedRoute?.Percentage }}%)</p>
          </div>
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <i class="fas fa-plane"></i>
          <div class="stat-content">
            <h3>Volo con più dirottamenti</h3>
            <p>{{ maxDivertedCountRoute?.OriginCityName }} → {{ maxDivertedCountRoute?.DestCityName }} ({{ maxDivertedCountRoute?.Diverted }} dirottamenti)</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-plane"></i>
          <div class="stat-content">
            <h3>Volo con meno dirottamenti</h3>
            <p>{{ minDivertedCountRoute?.OriginCityName }} → {{ minDivertedCountRoute?.DestCityName }} ({{ minDivertedCountRoute?.Diverted }} dirottamenti)</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`

    .dashboard-container {
      padding: 2rem;
      background-color: #f5f7fa;
      min-height: calc(100vh - 64px);
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .dashboard-subtitle {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .chart-card:hover {
      transform: translateY(-5px);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card i {
      font-size: 2.5rem;
      color: #3498db;
      margin-right: 1rem;
    }

    .stat-content h3 {
      color: #7f8c8d;
      font-size: 1rem;
      margin: 0;
    }

    .stat-content p {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0.5rem 0 0 0;
    }

    .charts-grid {
      display: flex;
      justify-content: space-between;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 2rem;
    }

    .chart-card {
      display: flex;
      flex-direction: column; /* Dispone il titolo sopra il grafico */
      justify-content: center; /* Centra verticalmente il contenuto */
      align-items: center; /* Centra orizzontalmente il contenuto */
      width: 48%; /* Imposta una larghezza per le card */
      height: 400px;
      padding: 20px;
      border-radius: 10px;
      background-color: #fff; /* Puoi scegliere il colore di sfondo */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Aggiungi un'ombra leggera */
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .chart-card h2 {
      color: #2c3e50;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }


    .chart-wrapper {
      width: 100%;
      height: 80%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 1rem;
      }
    }
  `]
})
export class DirottamentiComponent implements OnInit, OnDestroy {
  private charts: Chart[] = [];
  totalFlights = 0;
  diverted = 0;
  reachedDest = 0;

  maxDivertedRoute: any;
  minDivertedRoute: any;
  maxDivertedCountRoute: any;
  minDivertedCountRoute: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchFlightStats();
    this.fetchDiversionRoutes();
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('it-IT').format(num);
  }

  private fetchFlightStats(): void {
    this.http.get<any[]>('http://localhost:8080/api/flights/routes-number-reached')
      .subscribe(data => {
        if (data.length > 0) {
          this.totalFlights = data[0].Total;
          this.diverted = data[0].Diverted;
          this.reachedDest = data[0].DivReachedDest;
          this.createDivertedPieChart();
          this.createDeviatedLandingsPieChart();
        }
      });
  }

  private fetchDiversionRoutes(): void {
    this.http.get<any[]>('http://localhost:8080/api/flights/routes-number-diverted')
      .subscribe(data => {
        if (data.length > 0) {
          this.maxDivertedRoute = data.reduce((max, route) => route.Percentage > max.Percentage ? route : max, data[0]);
          this.minDivertedRoute = data.reduce((min, route) => route.Percentage < min.Percentage ? route : min, data[0]);

          this.maxDivertedCountRoute = data.reduce((max, route) => route.Diverted > max.Diverted ? route : max, data[0]);
          this.minDivertedCountRoute = data.reduce((min, route) => route.Diverted < min.Diverted ? route : min, data[0]);
        }
      });
  }

  private createDivertedPieChart(): void {
    const ctx = document.getElementById('divertedPieChart') as HTMLCanvasElement;
    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Raggiunta Destinazione', 'Non Raggiunta Destinazione'],
        datasets: [{
          data: [this.reachedDest, this.diverted - this.reachedDest],
          backgroundColor: ['#2ecc71', '#e74c3c']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom' // Posiziona la legenda sotto il grafico
          }
        }
      }
    }));
  }

  private createDeviatedLandingsPieChart(): void {
    const ctx = document.getElementById('deviatedLandingsChart') as HTMLCanvasElement;
    this.charts.push(new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Atterraggi Dirottati', 'Atterraggi Regolari'],
        datasets: [{
          data: [this.diverted, this.totalFlights - this.diverted],
          backgroundColor: ['#f39c12', '#3498db']
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom' // Posiziona la legenda sotto il grafico
          }
        }
      }
    }));
  }
}

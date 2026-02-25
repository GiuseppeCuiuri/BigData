import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-voli-mensili',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <header class="dashboard-header">
        <h1>Dashboard Voli Mensili</h1>
        <p class="dashboard-subtitle">Panoramica dettagliata dei voli mensili</p>
      </header>

      <div class="grid">
        <div *ngFor="let month of monthlyData" class="card"
             [class.highlight]="month.isMaxFlights || month.isMinFlights || month.isMaxDelay || month.isMinDelay">
          <h3>{{ month.name }}</h3>
          <p class="data">✈️ Voli: {{ month.flights }}</p>
          <p class="data">⏳ Ritardo: {{ month.delay | number:'1.2-2' }}%</p>
          <p *ngIf="month.isMaxFlights">📈 Mese con più voli!</p>
          <p *ngIf="month.isMinFlights">📉 Mese con meno voli!</p>
          <p *ngIf="month.isMaxDelay">⏱️ Maggiori ritardi!</p>
          <p *ngIf="month.isMinDelay">🚀 Minori ritardi!</p>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h2>Numero di voli per mese</h2>
          <div class="chart-wrapper">
            <canvas id="barChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background-color: #f5f7fa;
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

    .grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      justify-items: center;
      margin-top: 20px;
    }

    .card {
      width: 200px;
      padding: 20px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

    .highlight {
      background-color: #ffeb3b;
      font-weight: bold;
    }

    .charts-grid {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .chart-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 700px;
      height: 400px;
      padding: 20px;
      border-radius: 10px;
      background-color: #fff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .chart-wrapper {
      width: 100%;
      height: 80%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    @media (max-width: 1200px) {
      .grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 992px) {
      .grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class VoliMensiliComponent implements OnInit {
  monthlyData: { name: string, flights: number, delay: number, isMaxFlights?: boolean, isMinFlights?: boolean, isMaxDelay?: boolean, isMinDelay?: boolean }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMonthlyData();
  }

  loadMonthlyData() {
    let flightsPerMonth: any[] = [];
    let delaysPerMonth: any[] = [];

    this.http.get<any[]>('http://localhost:8080/api/flights/count-per-month')
      .subscribe(flightsData => {
        flightsPerMonth = flightsData;
        this.http.get<any[]>('http://localhost:8080/api/flights/delay-percentage-per-month')
          .subscribe(delaysData => {
            delaysPerMonth = delaysData;
            this.processData(flightsPerMonth, delaysPerMonth);
          });
      });
  }

  processData(flightsData: any[], delaysData: any[]) {
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

    this.monthlyData = monthNames.map((name, index) => {
      const flights = flightsData[index]?.count || 0;
      const delay = delaysData[index]?.DelayPercentage || 0;
      return {
        name,
        flights,
        delay,
        isMaxFlights: flights === Math.max(...flightsData.map(item => item.count)),
        isMinFlights: flights === Math.min(...flightsData.map(item => item.count)),
        isMaxDelay: delay === Math.max(...delaysData.map(item => item.percentage)),
        isMinDelay: delay === Math.min(...delaysData.map(item => item.percentage))
      };
    });

    this.createBarChart();
  }

  createBarChart() {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.monthlyData.map(month => month.name),
        datasets: [{
          label: 'Numero di Voli',
          data: this.monthlyData.map(month => month.flights),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { display: false } }
        }
      }
    });
  }
}

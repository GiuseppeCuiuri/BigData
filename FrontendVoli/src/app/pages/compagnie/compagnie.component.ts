import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-compagnie',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="container">
      <header class="dashboard-header">
        <h1>Dashboard Compagnie</h1>
        <p class="dashboard-subtitle">Informazioni sulle compagnie aeree</p>
      </header>

      <div class="grid two-columns wider">
        <div class="card">
          <h2>Numero Voli per Compagnia</h2>
          <ngx-charts-bar-vertical
            *ngIf="barChartData.length > 0"
            [results]="barChartData"
            [scheme]="'cool'"
            [gradient]="false"
            [view]="[550, 400]"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showDataLabel]="true"
            [showGridLines]="false">
          </ngx-charts-bar-vertical>
        </div>

        <div class="card">
          <h2>Voli Medi Giornalieri per Compagnia</h2>
          <ngx-charts-bar-vertical
            *ngIf="averageDailyFlightsData.length > 0"
            [results]="averageDailyFlightsData"
            [scheme]="'cool'"
            [gradient]="false"
            [view]="[550, 400]"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showDataLabel]="true"
            [showGridLines]="false">
          </ngx-charts-bar-vertical>
        </div>
      </div>

      <h2>Voli per Compagnia: Cancellazioni vs Effettuati</h2>
      <div *ngIf="airlineData.length > 0" class="charts-container">
        <div *ngFor="let company of airlineData" class="chart-box">
          <h3>{{ company.name }}</h3>
          <ngx-charts-pie-chart
            *ngIf="company.chartData && company.chartData.length > 0"
            [results]="company.chartData"
            [view]="[160, 160]"
            [doughnut]="true"
            [legend]="false"
            [labels]="false"
            [arcWidth]="0.3"
            [animations]="true"
            [tooltipDisabled]="false">
          </ngx-charts-pie-chart>
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
      gap: 16px;
      justify-items: center;
      margin-top: 10px;
    }

    .two-columns.wider {
      grid-template-columns: repeat(2, 40%);
      justify-content: center;
      width: 120%;
    }

    .charts-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr); /* 8 colonne per riga */
      gap: 20px;
      justify-items: center;
      margin-top: 20px;
      width: 70%;
    }

    .card {
      width: 100%;
      max-width: 600px;
      padding: 20px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .chart-box {
      width: 100%;
      max-width:200px;
      max-height: 300px;
      padding: 20px;
      margin: 20px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .card:hover, .chart-box:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class CompagnieComponent implements OnInit {
  airlineData: { name: string, chartData: { name: string, value: number }[] }[] = [];
  barChartData: { name: string, value: number }[] = [];
  averageDailyFlightsData: { name: string, value: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAirlineData();
    this.loadFlightsPerAirline();
    this.loadAverageDailyFlights();
  }

  loadAirlineData() {
    this.http.get<any[]>('http://localhost:8080/api/flights/cancellation-rate-per-airline')
      .subscribe(data => {
        this.airlineData = data.map(airline => ({
          name: airline.Reporting_Airline,
          chartData: [
            { name: 'Effettuati', value: 100 - airline.CancellationRate || 0 },
            { name: 'Cancellati', value: airline.CancellationRate || 0 }
          ]
        }));
      });
  }

  loadFlightsPerAirline() {
    this.http.get<any[]>('http://localhost:8080/api/flights/flights-per-airline')
      .subscribe(data => {
        this.barChartData = data.map(airline => ({
          name: airline.Reporting_Airline,
          value: airline.TotalFlights
        }));
      });
  }

  loadAverageDailyFlights() {
    this.http.get<any[]>('http://localhost:8080/api/flights/average-flights-per-airline')
      .subscribe(data => {
        this.averageDailyFlightsData = data.map(airline => ({
          name: airline.Reporting_Airline,
          value: Math.floor(airline.AverageDailyFlights)
        }));
      });
  }

  getTooltipText(chartData: { name: string, value: number }[]) {
    // Trova i dati per "Effettuati" e "Cancellati"
    const effettuati = chartData.find(item => item.name === 'Effettuati');
    const cancellati = chartData.find(item => item.name === 'Cancellati');

    // Calcola le percentuali
    const effettuatiPercentage = effettuati ? (effettuati.value).toFixed(2) + '%' : '0%';
    const cancellatiPercentage = cancellati ? (cancellati.value).toFixed(2) + '%' : '0%';

    // Restituisci il testo per il tooltip
    return `Effettuati: ${effettuatiPercentage} Cancellati: ${cancellatiPercentage}`;
  }



}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-ritardi',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="container">
      <header class="dashboard-header">
        <h1>Dashboard Ritardi</h1>
        <p class="dashboard-subtitle">Informazioni sui ritardi dei voli</p>
      </header>

      <div class="grid two-columns wider">
        <div class="card">
          <h2>Rotta con Ritardo Medio Massimo/Minimo</h2>
          <p>✈️ Massimo: {{ maxAvgDelay?.Origin || '-' }} → {{ maxAvgDelay?.Dest || '-' }} ({{ maxAvgDelay?.Delay || 0 | number:'1.2-2' }} min)</p>
          <p>🛬 Minimo: {{ minAvgDelay?.Origin || '-' }} → {{ minAvgDelay?.Dest || '-' }} ({{ minAvgDelay?.Delay || 0 | number:'1.2-2' }} min)</p>
        </div>

        <div class="card">
          <h2>Rotta con Percentuale Massima/Minima di Ritardi</h2>
          <p>📈 Massimo: {{ maxPercDelay?.Origin || '-' }} → {{ maxPercDelay?.Dest || '-' }} ({{ maxPercDelay?.Percentage || 0 | number:'1.2-2' }}%)</p>
          <p>📉 Minimo: {{ minPercDelay?.Origin || '-' }} → {{ minPercDelay?.Dest || '-' }} ({{ minPercDelay?.Percentage || 0 | number:'1.2-2' }}%)</p>
        </div>
      </div>

      <h2>Ritardi per Causa</h2>
      <div *ngIf="delayData.length > 0" class="grid seven-columns centered">
        <div *ngFor="let cause of delayData" class="card-below">
          <h3>{{ cause.name }} ({{ cause.percentage | number:'1.2-2' }}%)</h3>
          <ngx-charts-pie-chart
            [results]="cause.chartData"
            [view]="[150, 150]"
            [doughnut]="true"
            [legend]="false"
            [labels]="false"
            [arcWidth]="0.2"
            [animations]="true"
            [tooltipDisabled]="true"
          >
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

    .seven-columns.centered {
      grid-template-columns: repeat(5, 1fr); /* Cambia il numero di colonne a 5 */
      justify-items: center;
      width: 100%;
    }

    .card {
      width: 100%; /* Aggiungi questa riga per fare in modo che i riquadri si adattino alla larghezza */
      max-width: 600px; /* Limita la larghezza massima per evitare che si espandano troppo */
      padding: 20px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card-below {
      width: 100%; /* Aggiungi questa riga per fare in modo che i riquadri si adattino alla larghezza */
      max-width: 200px; /* Limita la larghezza massima per evitare che si espandano troppo */
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

    .card-below:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

  `]
})
export class RitardiComponent implements OnInit {
  maxAvgDelay: any;
  minAvgDelay: any;
  maxPercDelay: any;
  minPercDelay: any;
  delayData: { name: string, percentage: number, chartData: { name: string, value: number }[] }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRouteDelays();
    this.loadDelayReasons();
  }

  loadRouteDelays() {
    this.http.get<any[]>('http://localhost:8080/api/flights/routes-average-delay')
      .subscribe(data => {
        if (data.length > 0) {
          this.maxAvgDelay = data[0];
          this.minAvgDelay = data[data.length - 1];
        }
      });

    this.http.get<any[]>('http://localhost:8080/api/flights/routes-number-delay')
      .subscribe(data => {
        if (data.length > 0) {
          this.maxPercDelay = data[0];
          this.minPercDelay = data[data.length - 1];
        }
      });
  }

  loadDelayReasons() {
    this.http.get<any[]>('http://localhost:8080/api/flights/reasons-delay-average')
      .subscribe(data => {
        if (data.length > 0) {
          const delayReasons = data[0];
          const causes = Object.keys(delayReasons);
          this.delayData = causes.map(cause => {
            const causeData = delayReasons[cause];
            return {
              name: cause,
              percentage: causeData.Percentage,
              chartData: [
                { name: cause, value: causeData.Percentage },
                { name: 'Rest', value: 100 - causeData.Percentage }
              ]
            };
          });
        }
      });
  }
}

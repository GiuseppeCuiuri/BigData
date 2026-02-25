import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import * as L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconUrl: 'assets/images/marker-icon.png',
  iconRetinaUrl: 'assets/images/marker-icon-2x.png',
  shadowUrl: 'assets/images/marker-shadow.png', // Solo se la usi
});

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard Voli Aerei</h1>
        <p class="dashboard-subtitle">Panoramica dei voli e delle rotte aeree</p>
      </header>

      <div class="stats-container">
        <div class="stat-card">
          <i class="fas fa-plane"></i>
          <div class="stat-content">
            <h3>Aereo con più/meno viaggi</h3>
            <p><strong>{{ selectedAirplane.Tail_Number }}</strong> ha effettuato <strong>{{ selectedAirplane.count }}</strong> voli</p>
            <div class="button-container">
              <div class="button-wrapper">
                <button (click)="toggleAirplane(true)">🔝 Massimo</button>
              </div>
              <div class="button-wrapper">
                <button (click)="toggleAirplane(false)">🔽 Minimo</button>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-route"></i>
          <div class="stat-content">
            <h3>Rotta più/meno percorsa</h3>
            <p>{{ selectedRoute.Origin }} → {{ selectedRoute.Dest }} con <strong>{{ selectedRoute.count }}</strong> voli</p>
            <div class="button-container">
              <div class="button-wrapper">
                <button (click)="toggleRoute(true)">🔝 Massimo</button>
              </div>
              <div class="button-wrapper">
                <button (click)="toggleRoute(false)">🔽 Minimo</button>
              </div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-ruler-horizontal"></i>
          <div class="stat-content">
            <h3>Rotta più lunga/corta</h3>
            <p>{{ selectedDistance.Origin }} → {{ selectedDistance.Dest }} con <strong>{{ selectedDistance.Distance }}</strong> km</p>
            <div class="button-container">
              <div class="button-wrapper">
                <button (click)="toggleDistance(true)">📏 Massimo</button>
              </div>
              <div class="button-wrapper">
                <button (click)="toggleDistance(false)">📐 Minimo</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h2>Numero di voli per compagnia</h2>
          <div class="chart-wrapper">
            <canvas #airlinesChart></canvas>
          </div>
        </div>
      </div>

      <div class="map-wrapper">
        <!-- Scritta sopra la mappa -->
        <div class="map-title">Mappa</div>

        <!-- Contenitore della mappa -->
        <div class="map-container">
          <div #map class="map"></div>
        </div>
      </div>


    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      background-color: #f5f7fa;
      min-height: 100vh;
    }

    /* Contenitore che include la scritta e la mappa */
    .map-wrapper {
      margin-top: 40px; /* Distanza dalla parte superiore della pagina */
      width: 100%;
      text-align: center;
    }

    /* Scritta sopra la mappa */
    .map-title {
      width: 80%;
      margin: 0 auto 15px auto;
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px; /* Spazio tra la scritta e la mappa */
      background: rgba(255, 255, 255, 0.7); /* Sfondo semitrasparente */
      padding: 5px 10px;
      border-radius: 4px;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    }

    /* Contenitore per la mappa */
    .map-container {
      width: 80%; /* Imposta la larghezza della mappa */
      height: 500px; /* Imposta l'altezza della mappa */
      margin: 0 auto;
      position: relative;
      border: 2px solid #ccc; /* Bordo per la mappa */
      border-radius: 8px; /* Bordo arrotondato */
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* Ombra per la mappa */
    }

    /* Stile della mappa */
    .map {
      width: 100%;
      height: 100%;
      border-radius: 8px; /* Bordo arrotondato anche per la mappa */
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

    .button-container {
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .button-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
      width: 100%;
    }

    button:hover {
      background: #0056b3;
    }

    .charts-grid {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 2rem;
    }

    .chart-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 48%;
      height: 400px;
      padding: 20px;
      border-radius: 10px;
      background-color: #fff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .stat-card {
        padding: 1rem;
      }
    }
  `]
})
export class HomepageComponent implements OnInit {
  datasetRows = 0;
  datasetColumns = 0;

  airplanes = { max: { Tail_Number: '', count: 0 }, min: { Tail_Number: '', count: 0 } };
  selectedAirplane = this.airplanes.max;

  routes = { max: { Origin: '', Dest: '', OriginCityName: '', DestCityName: '', count: 0 }, min: { Origin: '', Dest: '', OriginCityName: '', DestCityName: '', count: 0 } };
  selectedRoute = this.routes.max;

  distances = { max: { Origin: '', Dest: '', OriginCityName: '', DestCityName: '', Distance: 0 }, min: { Origin: '', Dest: '', OriginCityName: '', DestCityName: '', Distance: 0 } };
  selectedDistance = this.distances.max;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    Chart.register(...registerables);

    this.loadDatasetInfo();
    this.loadMostTravelledAirplane();
    this.loadFlightTravels();
    this.loadRouteDistances();
    this.loadFlightsPerAirline();
  }

  ngAfterViewInit() {
    this.loadAirportsData();
  }

  loadDatasetInfo() {
    this.http.get<{ columns: number, rows: number }>('http://localhost:8080/api/flights/dataset-dimensions')
      .subscribe(data => {
        this.datasetRows = data.rows;
        this.datasetColumns = data.columns;
      });
  }

  loadMostTravelledAirplane() {
    this.http.get<any[]>('http://localhost:8080/api/flights/most-travels-airplane')
      .subscribe(data => {
        if (data.length > 0) {
          this.airplanes.max = data[0];
          this.airplanes.min = data[data.length - 1];
          this.selectedAirplane = this.airplanes.max;
        }
      });
  }

  loadFlightTravels() {
    this.http.get<any[]>('http://localhost:8080/api/flights/flight-travels')
      .subscribe(data => {
        if (data.length > 0) {
          this.routes.max = data[0];
          this.routes.min = data[data.length - 1];
          this.selectedRoute = this.routes.max;
        }
      });
  }

  loadRouteDistances() {
    this.http.get<any[]>('http://localhost:8080/api/flights/route-distances')
      .subscribe(data => {
        if (data.length > 0) {
          this.distances.max = data[0];
          this.distances.min = data[data.length - 1];
          this.selectedDistance = this.distances.max;
        }
      });
  }

  @ViewChild('airlinesChart') airlinesChart!: ElementRef;

  loadFlightsPerAirline() {
    this.http.get<any[]>('http://localhost:8080/api/flights/flights-per-airline')
      .subscribe(data => {
        const airlineData = data.map((entry: any) => ({
          label: entry.Reporting_Airline,
          value: entry.TotalFlights
        }));
        const airlines = airlineData.map(entry => entry.label);
        const flights = airlineData.map(entry => entry.value);

        new Chart(this.airlinesChart.nativeElement, {
          type: 'bar',
          data: {
            labels: airlines,
            datasets: [{
              label: 'Voli per Compagnia',
              data: flights,
              backgroundColor: 'rgba(52, 152, 219, 0.6)',
              borderColor: 'rgba(52, 152, 219, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  display: false
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });
  }

  toggleAirplane(isMax: boolean) {
    this.selectedAirplane = isMax ? this.airplanes.max : this.airplanes.min;
  }

  toggleRoute(isMax: boolean) {
    this.selectedRoute = isMax ? this.routes.max : this.routes.min;
  }

  toggleDistance(isMax: boolean) {
    this.selectedDistance = isMax ? this.distances.max : this.distances.min;
  }

  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  loadAirportsData() {
    this.http.get<any[]>('http://localhost:8080/api/flights/airports-coordinates')
      .subscribe(data => {
        const coordinates = new Set<string>();  // Usa un Set di stringhe per evitare duplicati

        // Estrai le coordinate di origine e destinazione
        data.forEach(flight => {
          const originCoords = `${flight.origin_latitude},${flight.origin_longitude}`;
          const destCoords = `${flight.dest_latitude},${flight.dest_longitude}`;
          coordinates.add(originCoords);
          coordinates.add(destCoords);

          // Associa anche il nome della città per ogni coordinata
          flight.originCoords = originCoords;
          flight.destCoords = destCoords;
        });

        // Passiamo l'array di coordinate uniche alla funzione loadMap
        this.loadMap(Array.from(coordinates) as string[], data);
      });
  }

  loadMap(coordinates: string[], data: any[]) {
    if (this.mapElement && this.mapElement.nativeElement) {
      const map = L.map(this.mapElement.nativeElement).setView([51.505, -0.09], 2); // Impostiamo la vista iniziale

      // Modifica il tile layer per uno stile diverso
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://carto.com/attributions">CartoDB</a>',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = new L.Icon({
        iconUrl: 'assets/images/marker-icon.png',
        iconRetinaUrl: 'assets/images/marker-icon-2x.png',
        shadowUrl: 'assets/images/marker-shadow.png', // Opzionale
        iconSize: [10, 20], // La dimensione dell'icona
        iconAnchor: [12, 41], // Dove l'ancora dell'icona è posizionata rispetto al marker
        popupAnchor: [1, -34], // Dove il popup si ancorerà rispetto al marker
        shadowSize: [10, 10] // Dimensione dell'ombra
      });

      // Aggiungi marker per ogni coordinata con l'icona personalizzata e il nome della città nel tooltip
      coordinates.forEach(coord => {
        const [lat, lon] = coord.split(',').map(Number);

        // Trova i dati relativi alla città da associare
        const flight = data.find(f => `${f.origin_latitude},${f.origin_longitude}` === coord || `${f.dest_latitude},${f.dest_longitude}` === coord);

        if (flight) {
          const cityName = flight.origin_latitude === coord.split(',')[0] ? flight.OriginCityName : flight.DestCityName;

          const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);

          // Aggiungi un tooltip che appare al passaggio del mouse
          marker.bindTooltip(cityName, {
            permanent: false,  // Il tooltip appare solo quando il mouse passa sopra
            direction: 'top',  // Posizione sopra il marker
          });
        }
      });
    } else {
      console.error('Elemento della mappa non trovato!');
    }
  }

}

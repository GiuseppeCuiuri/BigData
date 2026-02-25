import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, startWith, map } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-voli-mensili',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        <header class="dashboard-header">
          <h1>Ricerca Voli</h1>
          <p class="dashboard-subtitle">Cerca voli tra aeroporti specifici</p>
        </header>

        <div class="form-container">
          <div class="form-card">
            <div class="form-content">
              <form [formGroup]="form">
                <div class="form-row">
                  <mat-form-field class="full-width" appearance="outline">
                    <mat-label>Aeroporto di origine</mat-label>
                    <input type="text" matInput formControlName="origine"
                           [matAutocomplete]="autoOrigine">
                    <mat-autocomplete #autoOrigine="matAutocomplete"
                                      (optionSelected)="selezionaOrigine($event.option.value)">
                      <mat-option *ngFor="let aeroporto of aeroportiFiltratiOrigine | async" [value]="aeroporto">
                        {{ aeroporto }}
                      </mat-option>
                    </mat-autocomplete>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field class="full-width" appearance="outline">
                    <mat-label>Aeroporto di destinazione</mat-label>
                    <input type="text" matInput formControlName="destinazione"
                           [matAutocomplete]="autoDestinazione">
                    <mat-autocomplete #autoDestinazione="matAutocomplete"
                                      (optionSelected)="selezionaDestinazione($event.option.value)">
                      <mat-option *ngFor="let aeroporto of aeroportiFiltratiDestinazione | async" [value]="aeroporto">
                        {{ aeroporto }}
                      </mat-option>
                    </mat-autocomplete>
                  </mat-form-field>
                </div>

                <div class="button-container">
                  <button [disabled]="form.invalid"
                          (click)="cerca()"
                          class="search-button">
                    Cerca
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div *ngIf="erroreVoloNonTrovato" class="alert-container">
            <div class="alert-card">
              Nessun volo trovato per la rotta da {{ form.get('origine')?.value }} a {{ form.get('destinazione')?.value }}. 🚫✈️
            </div>
          </div>

          <div *ngIf="datiVolo" class="result-container">
            <div class="info-card">
              <h2 class="result-title">Dettagli Volo</h2>
              <div class="result-content">
                <div class="result-item">
                  <span class="result-label">Numero di Voli:</span>
                  <span class="result-value">{{ datiVolo.numeroVoli }}</span>
                </div>
                <div class="result-item">
                  <span class="result-label">Ritardi Totali:</span>
                  <span class="result-value">{{ datiVolo.ritardiTotali }}</span>
                </div>
                <div class="result-item">
                  <span class="result-label">Percentuale di Ritardi:</span>
                  <span class="result-value percentage">{{ datiVolo.percentualeRitardi }}%</span>
                </div>
                <div class="result-item">
                  <span class="result-label">Distanza:</span>
                  <span class="result-value">{{ datiVolo.distanza }} km</span>
                </div>
                <div class="result-item">
                  <span class="result-label">Ritardo Medio:</span>
                  <span class="result-value">{{ datiVolo.ritardoMedio | number:'1.2-2' }} minuti</span>
                </div>
              </div>
            </div>

            <div class="map-card">
              <h2 class="result-title">Mappa della Rotta</h2>
              <div id="map"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
      padding: 40px 20px;
    }

    .content-wrapper {
      max-width: 800px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      font-size: 2.8rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .dashboard-subtitle {
      color: #7f8c8d;
      font-size: 1.2rem;
      font-weight: 400;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .form-card:hover {
      transform: translateY(-5px);
    }

    .form-content {
      padding: 2rem;
    }

    .form-row {
      margin-bottom: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .button-container {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .search-button {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
      padding: 15px 40px;
      font-size: 1.2rem;
      border-radius: 30px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }

    .search-button:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    }

    .search-button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .alert-container {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .alert-card {
      background: #fff3f3;
      color: #e74c3c;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
      text-align: center;
      font-weight: 500;
      width: 100%;
      max-width: 600px;
    }

    .result-container {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .info-card, .map-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      padding: 2rem;
      flex: 1;
      min-width: 300px;
      transition: transform 0.3s ease;
    }

    .info-card:hover, .map-card:hover {
      transform: translateY(-5px);
    }

    .info-card {
      max-width: 400px;
    }

    .map-card {
      flex: 2;
      min-height: 400px;
    }

    .result-title {
      font-size: 1.8rem;
      color: #2980b9;
      margin-bottom: 1.5rem;
      text-align: center;
      font-weight: 600;
    }

    .result-content {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .result-label {
      font-weight: 600;
      color: #2c3e50;
    }

    .result-value {
      color: #2980b9;
      font-weight: 700;
    }

    #map {
      width: 100%;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 20px 10px;
      }

      .dashboard-header h1 {
        font-size: 2.2rem;
      }

      .result-container {
        flex-direction: column;
      }

      .info-card, .map-card {
        width: 100%;
        max-width: none;
      }
    }
  `]
})
export class RicercaVoliComponent implements OnInit {
  private http = inject(HttpClient);

  aeroportiOrigine: string[] = [];
  aeroportiDestinazione: string[] = [];
  erroreVoloNonTrovato: boolean = false;

  form: FormGroup;

  aeroportiFiltratiOrigine!: Observable<string[]>;
  aeroportiFiltratiDestinazione!: Observable<string[]>;

  // Variabile per visualizzare i dati del volo
  datiVolo: any;

  constructor() {
    this.form = new FormGroup({
      origine: new FormControl('', [Validators.required, this.validaAeroporto.bind(this)]),
      destinazione: new FormControl('', [Validators.required, this.validaAeroporto.bind(this)]),
    });
  }

  ngOnInit() {
    this.http.get<{ Origin: string; Dest: string }[]>('http://localhost:8080/api/flights/routes-average-delay')
      .subscribe(data => {
        this.aeroportiOrigine = [...new Set(data.map(f => f.Origin).filter(a => a))];
        this.aeroportiDestinazione = [...new Set(data.map(f => f.Dest).filter(a => a))];
        this.setupFiltri();
        this.form.updateValueAndValidity();
      });
  }

  private setupFiltri() {
    this.aeroportiFiltratiOrigine = this.form.get('origine')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtraAeroporti(value ?? '', this.aeroportiOrigine))
    );

    this.aeroportiFiltratiDestinazione = this.form.get('destinazione')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtraAeroporti(value ?? '', this.aeroportiDestinazione))
    );
  }

  private filtraAeroporti(valore: string, lista: string[]): string[] {
    const filtro = valore?.toLowerCase() ?? '';
    return lista.filter(aeroporto => aeroporto?.toLowerCase().includes(filtro));
  }

  private validaAeroporto(control: AbstractControl): ValidationErrors | null {
    if (!this.aeroportiOrigine.length) return null;
    const valore = control.value;
    return (this.aeroportiOrigine.includes(valore) || this.aeroportiDestinazione.includes(valore))
      ? null
      : { invalidAeroporto: true };
  }

  selezionaOrigine(aeroporto: string) {
    this.form.get('origine')!.setValue(aeroporto);
    this.validaAeroporti();
  }

  selezionaDestinazione(aeroporto: string) {
    this.form.get('destinazione')!.setValue(aeroporto);
    this.validaAeroporti();
  }

  validaAeroporti() {
    const origine = this.form.get('origine')!.value ?? '';
    const destinazione = this.form.get('destinazione')!.value ?? '';

    const origineValida = this.aeroportiOrigine.includes(origine);
    const destinazioneValida = this.aeroportiDestinazione.includes(destinazione);

    this.form.get('origine')!.setErrors(origineValida ? null : { invalid: true });
    this.form.get('destinazione')!.setErrors(destinazioneValida ? null : { invalid: true });

    this.form.updateValueAndValidity();
  }

  cerca() {
    if (this.form.valid) {
      const origine = this.form.value.origine;
      const destinazione = this.form.value.destinazione;
      this.erroreVoloNonTrovato = false;

      this.http.get<any[]>(`http://localhost:8080/api/flights/routes-number-delay?origin=${origine}&dest=${destinazione}`).subscribe(
        (numeroVoliList) => {
          const numeroVoli = numeroVoliList.find(volo => volo.Origin === origine && volo.Dest === destinazione);

          if (numeroVoli) {
            this.http.get<any[]>(`http://localhost:8080/api/flights/route-distances?origin=${origine}&dest=${destinazione}`).subscribe(
              (distanzeList) => {
                const distanza = distanzeList.find(d => d.Origin === origine && d.Dest === destinazione);
                if (distanza) {
                  this.http.get<any[]>(`http://localhost:8080/api/flights/routes-average-delay?origin=${origine}&dest=${destinazione}`).subscribe(
                    (ritardiMedioList) => {
                      const ritardoMedio = ritardiMedioList.find(r => r.Origin === origine && r.Dest === destinazione);
                      if (ritardoMedio) {
                        this.datiVolo = {
                          numeroVoli: numeroVoli.Total,
                          ritardiTotali: numeroVoli.Delay,
                          percentualeRitardi: numeroVoli.Percentage,
                          distanza: distanza.Distance,
                          ritardoMedio: ritardoMedio.Delay
                        };
                        this.extractCoordinates(origine, destinazione);
                      } else {
                        this.datiVolo = null;
                        this.erroreVoloNonTrovato = true;
                      }
                    },
                    () => {
                      this.erroreVoloNonTrovato = true;
                    }
                  );
                } else {
                  this.datiVolo = null;
                  this.erroreVoloNonTrovato = true;
                }
              },
              () => {
                this.erroreVoloNonTrovato = true;
              }
            );
          } else {
            this.datiVolo = null;
            this.erroreVoloNonTrovato = true;
          }
        },
        () => {
          this.datiVolo = null;
          this.erroreVoloNonTrovato = true;
        }
      );
    }
  }

  extractCoordinates(origine: string, destinazione: string) {
    this.http.get<any[]>('http://localhost:8080/api/flights/airports-coordinates')
      .subscribe(data => {
        const flight = data.find(f => f.Origin === origine && f.Dest === destinazione);

        if (flight) {
          const coordinates = {
            origin_latitude: flight.origin_latitude,
            origin_longitude: flight.origin_longitude,
            dest_latitude: flight.dest_latitude,
            dest_longitude: flight.dest_longitude
          };

          console.log('Coordinate estratte:', coordinates);

          this.initMap(coordinates);
        } else {
          console.warn('Nessuna corrispondenza trovata per i codici aeroportuali forniti.');
        }
      });
  }

  map: any; // Aggiungi questa proprietà nella classe

  initMap(coordinates: { origin_latitude: number, origin_longitude: number, dest_latitude: number, dest_longitude: number }) {
    setTimeout(() => {
      // Se la mappa esiste già, rimuovila prima di crearne una nuova
      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('map');

      // Aggiungi un layer di base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      const defaultIcon = L.icon({
        iconUrl: 'assets/images/marker-icon.png',
        shadowUrl: 'assets/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      // Aggiungi marker per origine e destinazione
      L.marker([coordinates.origin_latitude, coordinates.origin_longitude], { icon: defaultIcon }).addTo(this.map)
        .bindPopup('Aeroporto di partenza').openPopup();
      L.marker([coordinates.dest_latitude, coordinates.dest_longitude], { icon: defaultIcon }).addTo(this.map)
        .bindPopup('Aeroporto di arrivo').openPopup();

      // Disegna il percorso tra i due punti
      const latlngs: [number, number][] = [
        [coordinates.origin_latitude, coordinates.origin_longitude],
        [coordinates.dest_latitude, coordinates.dest_longitude]
      ];
      L.polyline(latlngs, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(this.map);

      // Imposta la vista per includere entrambi i punti con margine extra
      const bounds = L.latLngBounds(latlngs);
      this.map.fitBounds(bounds, { padding: [50, 50] }); // Padding per evitare che siano ai bordi

      // Icona per l'aereo
      const airplaneIcon = L.icon({
        iconUrl: 'assets/images/airplane.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const airplaneMarker = L.marker([coordinates.origin_latitude, coordinates.origin_longitude], { icon: airplaneIcon }).addTo(this.map);

      let i = 0;
      const steps = 200;
      const delay = 100;

      function moveAirplane() {
        if (i <= steps) {
          const lat = Number(coordinates.origin_latitude) + (coordinates.dest_latitude - coordinates.origin_latitude) * (i / steps);
          const lng = Number(coordinates.origin_longitude) + (coordinates.dest_longitude - coordinates.origin_longitude) * (i / steps);

          airplaneMarker.setLatLng([lat, lng]);

          i++;
          setTimeout(moveAirplane, delay);
        }
      }

      moveAirplane();

    }, 0);
  }




}

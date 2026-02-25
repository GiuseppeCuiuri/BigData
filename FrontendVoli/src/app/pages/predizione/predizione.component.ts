import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-predizione',
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
          <h1>Predizione Ritardi</h1>
          <p class="dashboard-subtitle">Seleziona una rotta per prevedere i ritardi</p>
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
                          (click)="prevedi()"
                          class="search-button">
                    Prevedi
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div *ngIf="errorePredizioneNonTrovata" class="alert-container">
            <div class="alert-card">
              Nessuna predizione disponibile per la rotta da {{ form.get('origine')?.value }} a {{ form.get('destinazione')?.value }}. 🚫✈️
            </div>
          </div>

          <div *ngIf="datiPredizione" class="result-container">
            <div class="result-card">
              <h2 class="result-title">Risultato della Predizione</h2>
              <div class="result-content">
                <div class="result-item">
                  <span class="result-label">Stima del ritardo:</span>
                  <span class="result-value">{{ datiPredizione.minutiRitardi }} minuti</span>
                </div>
              </div>
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

    .result-container {
      margin-top: 2rem;
    }

    .result-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }

    .result-title {
      font-size: 1.8rem;
      color: #2980b9;
      text-align: center;
      margin-bottom: 1.5rem;
      font-weight: 600;
    }

    .result-content {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }

    .result-label {
      font-weight: 600;
      color: #2c3e50;
    }

    .result-value {
      color: #2980b9;
      font-size: 1.2rem;
      font-weight: 700;
    }

    @media (max-width: 600px) {
      .page-container {
        padding: 20px 10px;
      }

      .dashboard-header h1 {
        font-size: 2.2rem;
      }

      .form-content {
        padding: 1.5rem;
      }

      .result-card {
        padding: 1.5rem;
      }
    }

    .alert-container {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: 2rem;
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
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

  `]
})
export class PredizioneComponent implements OnInit {
  private http = inject(HttpClient);

  errorePredizioneNonTrovata: boolean = false;

  aeroportiOrigine: string[] = [];
  aeroportiDestinazione: string[] = [];
  datiPredizione: any = null;

  form: FormGroup;
  aeroportiFiltratiOrigine!: Observable<string[]>;
  aeroportiFiltratiDestinazione!: Observable<string[]>;

  constructor() {
    this.form = new FormGroup({
      origine: new FormControl('', [Validators.required, this.validaAeroporto.bind(this)]),
      destinazione: new FormControl('', [Validators.required, this.validaAeroporto.bind(this)]),
    });
  }

  ngOnInit() {
    this.http.get<{ Origin: string; Dest: string }[]>('http://localhost:8080/api/flights/delay-predictions')
      .subscribe(data => {
        this.aeroportiOrigine = [...new Set(data.map(f => f.Origin))];
        this.aeroportiDestinazione = [...new Set(data.map(f => f.Dest))];
        this.setupFiltri();
      });
  }

  private setupFiltri() {
    this.aeroportiFiltratiOrigine = this.form.get('origine')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtraAeroporti(value, this.aeroportiOrigine))
    );
    this.aeroportiFiltratiDestinazione = this.form.get('destinazione')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtraAeroporti(value, this.aeroportiDestinazione))
    );
  }

  private filtraAeroporti(valore: string, lista: string[]): string[] {
    const filtro = valore.toLowerCase();
    return lista.filter(aeroporto => aeroporto.toLowerCase().includes(filtro));
  }

  private validaAeroporto(control: AbstractControl): ValidationErrors | null {
    return (this.aeroportiOrigine.includes(control.value) || this.aeroportiDestinazione.includes(control.value))
      ? null : { invalidAeroporto: true };
  }

  selezionaOrigine(aeroporto: string) { this.form.get('origine')!.setValue(aeroporto); }
  selezionaDestinazione(aeroporto: string) { this.form.get('destinazione')!.setValue(aeroporto); }

  prevedi() {
    if (this.form.valid) {
      const origine = this.form.get('origine')!.value;
      const destinazione = this.form.get('destinazione')!.value;

      this.http.get<any[]>('http://localhost:8080/api/flights/delay-predictions')
        .subscribe(data => {
          const risultato = data.find(item => item.Origin === origine && item.Dest === destinazione);

          if (risultato) {
            this.datiPredizione = { minutiRitardi: risultato.prediction.toFixed(2) };
            this.errorePredizioneNonTrovata = false;
          } else {
            this.datiPredizione = null;
            this.errorePredizioneNonTrovata = true;
          }
        });
    }
  }

}

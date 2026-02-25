import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="top-bar">
      <div class="nav-container">
        <div class="logo">
          <a routerLink="/homepage">✈️ Flight Stats</a>
        </div>
        <div class="nav-links">
          <a routerLink="/homepage" routerLinkActive="active">
            <i class="fas fa-home"></i>
            <span>Homepage</span>
          </a>
          <a routerLink="/voli-mensili" routerLinkActive="active">
            <i class="fas fa-calendar-alt"></i>
            <span>Voli Mensili</span>
          </a>
          <a routerLink="/ritardi" routerLinkActive="active">
            <i class="fas fa-clock"></i>
            <span>Ritardi</span>
          </a>
          <a routerLink="/dirottamenti" routerLinkActive="active">
            <i class="fas fa-plane-arrival"></i>
            <span>Dirottamenti</span>
          </a>
          <a routerLink="/ricerca-voli" routerLinkActive="active">
            <i class="fas fa-search"></i>
            <span>Ricerca Voli</span>
          </a>
          <a routerLink="/compagnie" routerLinkActive="active">
            <i class="fas fa-building"></i>
            <span>Compagnie</span>
          </a>
          <a routerLink="/predizione" routerLinkActive="active">
            <i class="fas fa-chart-line"></i>
            <span>Predizione</span>
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .top-bar {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      padding: 0.5rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo a {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: bold;
      padding: 0.5rem 0;
    }

    .nav-links {
      display: flex;
      gap: 1rem;
    }

    .nav-links a {
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-links a:hover {
      background-color: rgba(255,255,255,0.1);
      transform: translateY(-2px);
      color: white;
    }

    .nav-links a.active {
      background-color: rgba(255,255,255,0.15);
      color: white;
      font-weight: 500;
    }

    .nav-links i {
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .nav-container {
        flex-direction: column;
        padding: 1rem 0;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 1rem;
      }

      .nav-links a {
        font-size: 0.9rem;
      }

      .nav-links span {
        display: none;
      }

      .nav-links i {
        font-size: 1.2rem;
      }
    }
  `]
})
export class TopBarComponent {}

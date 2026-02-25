import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { TopBarComponent } from './top-bar/top-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet, TopBarComponent],
  template: `
    <app-top-bar></app-top-bar>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'FrontendVoli';
}

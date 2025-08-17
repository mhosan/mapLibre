import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { MapaComponent } from './mapa/mapa.component';

@Component({
  selector: 'app-root',
  imports: [MapaComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'mapLibre';
}

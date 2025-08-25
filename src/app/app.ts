import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { MapaComponent } from './core/map/components/mapa.component';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  imports: [MapaComponent, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'mapLibre';
}

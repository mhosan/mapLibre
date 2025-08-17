import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Map, NavigationControl, type StyleSpecification, type IControl } from 'maplibre-gl';

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map?: Map;
  base: 'osm' | 'sat' = 'osm';

  ngOnInit(): void {
    const style: StyleSpecification = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
        esriWorldImagery: {
          type: 'raster',
          tiles: [
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution:
            'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        },
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
        },
        {
          id: 'satellite-tiles',
          type: 'raster',
          source: 'esriWorldImagery',
          layout: { visibility: 'none' },
        },
      ],
    };

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style,
      center: [-58.3816, -34.6037],
      zoom: 5,
    });

    this.map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    // Add integrated MapLibre control to toggle base layer
    const self = this;
    let ctrlContainer: HTMLElement | undefined;
    const baseToggleControl: IControl = {
      onAdd() {
        const container = document.createElement('div');
        container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

  const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = 'Cambiar capa base (OSM/Satélite)';
        btn.setAttribute('aria-label', 'Cambiar capa base');
        btn.textContent = self.base === 'osm' ? 'Sat' : 'OSM';

  // Make the button wider horizontally for better readability
  btn.style.width = 'auto';
  btn.style.minWidth = '64px';
  btn.style.padding = '0 12px';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.fontSize = '13px';

        btn.addEventListener('click', () => {
          const next = self.base === 'osm' ? 'sat' : 'osm';
          self.switchBase(next);
          btn.textContent = next === 'osm' ? 'Sat' : 'OSM';
        });

        container.appendChild(btn);
        ctrlContainer = container;
        return container;
      },
      onRemove() {
        if (ctrlContainer && ctrlContainer.parentNode) {
          ctrlContainer.parentNode.removeChild(ctrlContainer);
        }
        ctrlContainer = undefined;
      },
    };
    this.map.addControl(baseToggleControl, 'top-left');
  }

  switchBase(next: 'osm' | 'sat') {
    if (!this.map) return;
    this.base = next;
    const showOsm = next === 'osm' ? 'visible' : 'none';
    const showSat = next === 'sat' ? 'visible' : 'none';
    this.map.setLayoutProperty('osm-tiles', 'visibility', showOsm);
    this.map.setLayoutProperty('satellite-tiles', 'visibility', showSat);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}

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
  base: 'osm' | 'esri' | 'google' = 'osm';

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
        googleSatellite: {
          type: 'raster',
          tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
          tileSize: 256,
          maxzoom: 21,
          attribution: '© Google Maps',
        },
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
        },
        {
          id: 'esri-satellite-tiles',
          type: 'raster',
          source: 'esriWorldImagery',
          layout: { visibility: 'none' },
        },
        {
          id: 'google-satellite-tiles',
          type: 'raster',
          source: 'googleSatellite',
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

    // Add integrated MapLibre control with dropdown for base layers
    const self = this;
    let ctrlContainer: HTMLElement | undefined;
    let currentDropdown: HTMLSelectElement | undefined;
    
    const baseToggleControl: IControl = {
      onAdd() {
        const container = document.createElement('div');
        container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

        const select = document.createElement('select');
        select.title = 'Seleccionar capa base';
        select.setAttribute('aria-label', 'Seleccionar capa base');
        
        // Options for the dropdown
        const options = [
          { value: 'osm', text: 'OpenStreetMap' },
          { value: 'esri', text: 'Satélite (Esri)' },
          { value: 'google', text: 'Satélite (Google)' }
        ];
        
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.text;
          option.selected = opt.value === self.base;
          select.appendChild(option);
        });

        // Styling for dropdown
        select.style.width = 'auto';
        select.style.minWidth = '140px';
        select.style.padding = '4px 8px';
        select.style.fontSize = '12px';
        select.style.border = 'none';
        select.style.background = 'white';
        select.style.cursor = 'pointer';

        select.addEventListener('change', () => {
          const next = select.value as 'osm' | 'esri' | 'google';
          self.switchBase(next);
        });

        container.appendChild(select);
        ctrlContainer = container;
        currentDropdown = select;
        return container;
      },
      onRemove() {
        if (ctrlContainer && ctrlContainer.parentNode) {
          ctrlContainer.parentNode.removeChild(ctrlContainer);
        }
        ctrlContainer = undefined;
        currentDropdown = undefined;
      },
    };
    this.map.addControl(baseToggleControl, 'top-left');
  }

  switchBase(next: 'osm' | 'esri' | 'google') {
    if (!this.map) return;
    this.base = next;
    
    // Hide all layers first
    this.map.setLayoutProperty('osm-tiles', 'visibility', 'none');
    this.map.setLayoutProperty('esri-satellite-tiles', 'visibility', 'none');
    this.map.setLayoutProperty('google-satellite-tiles', 'visibility', 'none');
    
    // Show selected layer
    if (next === 'osm') {
      this.map.setLayoutProperty('osm-tiles', 'visibility', 'visible');
    } else if (next === 'esri') {
      this.map.setLayoutProperty('esri-satellite-tiles', 'visibility', 'visible');
    } else if (next === 'google') {
      this.map.setLayoutProperty('google-satellite-tiles', 'visibility', 'visible');
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}

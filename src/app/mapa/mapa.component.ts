import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Map, NavigationControl, type StyleSpecification, type IControl } from 'maplibre-gl';
import { MapLayersService } from './map-layers.service';
import { type LayerMetadata } from '../models/map-layer.interfaces';

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})
export class MapaComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map?: Map;
  private currentLayerId: string = '';
  private availableLayers: LayerMetadata[] = [];

  constructor(private layersService: MapLayersService) {}

  ngOnInit(): void {
    this.availableLayers = this.layersService.getAvailableLayers();
    this.currentLayerId = this.layersService.getDefaultLayer();
    
    const style = this.layersService.getMapStyle();

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
        const options = self.availableLayers.map(layer => ({
          value: layer.id,
          text: layer.displayName
        }));
        
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.text;
          option.selected = opt.value === self.currentLayerId;
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
          const nextLayerId = select.value;
          self.switchToLayer(nextLayerId);
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

  switchToLayer(layerId: string) {
    if (!this.map) return;
    
    // Hide all layers
    this.availableLayers.forEach(layer => {
      this.map!.setLayoutProperty(layer.id, 'visibility', 'none');
    });
    
    // Show selected layer
    this.map.setLayoutProperty(layerId, 'visibility', 'visible');
    this.currentLayerId = layerId;
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}

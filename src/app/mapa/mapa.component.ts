import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Map, NavigationControl, Popup, type StyleSpecification, type IControl } from 'maplibre-gl';
import { MapLayersService } from './map-layers.service';
import { type LayerMetadata, type OverlayMetadata } from '../models/map-layer.interfaces';

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
  private availableOverlays: OverlayMetadata[] = [];

  constructor(private layersService: MapLayersService) {}

  ngOnInit(): void {
  this.availableLayers = this.layersService.getAvailableLayers();
  // Filtrar overlays para que no aparezcan rutas nacionales ni provinciales
  this.availableOverlays = this.layersService.getAvailableOverlays().filter(o => o.id !== 'red-vial-nacional' && o.id !== 'red-vial-provincial');
  this.currentLayerId = this.layersService.getDefaultLayer();
    
  this.initializeMap();
  }

  private async initializeMap(): Promise<void> {
    const style = await this.layersService.getMapStyleWithTransforms();

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style,
      center: [-58.3816, -34.6037],
      zoom: 5,
    });

    this.map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');

    // Evento click general para cualquier capa vectorial visible
    this.map.on('click', (e) => {
      // Obtener solo las capas vectoriales activas (circle, line, fill) y visibles
      const vectorLayerIds = this.availableOverlays
        .filter(o => this.map!.getLayoutProperty(o.id, 'visibility') === 'visible')
        .map(o => o.id);

      if (vectorLayerIds.length === 0) return;

      const features = this.map!.queryRenderedFeatures(e.point, { layers: vectorLayerIds });
      if (!features.length) return;
      const feature = features[0];
      const properties = feature.properties;
      let html = '<table>';
      for (const key in properties) {
        html += `<tr><th style="text-align:left; padding-right:8px;">${key}</th><td>${properties[key]}</td></tr>`;
      }
      html += '</table>';
      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(this.map!);
    });
    
    
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

        // Agregar checkboxes para overlays
        if (self.availableOverlays.length > 0) {
          const overlayContainer = document.createElement('div');
          overlayContainer.style.marginTop = '8px';
          overlayContainer.style.padding = '4px 8px';
          overlayContainer.style.background = 'white';
          overlayContainer.style.borderTop = '1px solid #ccc';

          const overlayTitle = document.createElement('div');
          overlayTitle.textContent = 'Capas superpuestas:';
          overlayTitle.style.fontSize = '11px';
          overlayTitle.style.fontWeight = 'bold';
          overlayTitle.style.marginBottom = '4px';
          overlayContainer.appendChild(overlayTitle);

          self.availableOverlays.forEach(overlay => {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            checkboxContainer.style.marginBottom = '2px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `overlay-${overlay.id}`;
            checkbox.checked = overlay.visible;
            checkbox.style.marginRight = '6px';

            const label = document.createElement('label');
            label.setAttribute('for', `overlay-${overlay.id}`);
            label.textContent = overlay.displayName;
            label.style.fontSize = '11px';
            label.style.cursor = 'pointer';

            checkbox.addEventListener('change', () => {
              self.toggleOverlay(overlay.id, checkbox.checked);
            });

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            overlayContainer.appendChild(checkboxContainer);
          });

          container.appendChild(overlayContainer);
        }

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

  toggleOverlay(overlayId: string, visible: boolean) {
    if (!this.map) return;
    
    // Toggle overlay visibility
    this.map.setLayoutProperty(overlayId, 'visibility', visible ? 'visible' : 'none');
    
    // Update overlay state
    const overlay = this.availableOverlays.find(o => o.id === overlayId);
    if (overlay) {
      overlay.visible = visible;
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}

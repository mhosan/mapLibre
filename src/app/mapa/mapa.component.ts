import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Map, NavigationControl, Popup, AttributionControl, type StyleSpecification, type IControl } from 'maplibre-gl';
import { MapLayersService } from './map-layers.service';
import { type LayerMetadata, type OverlayMetadata } from '../models/map-layer.interfaces';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [NgbDropdownModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})

export class MapaComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map?: Map;
  private currentLayerId: string = '';
  private availableLayers: LayerMetadata[] = [];
  private availableOverlays: OverlayMetadata[] = [];

  constructor(private layersService: MapLayersService) { }
  // items: MenuItem[]; // Eliminado PrimeNG
  ngOnInit(): void {
    this.availableLayers = this.layersService.getAvailableLayers();
    this.availableOverlays = this.layersService.getAvailableOverlays();
    this.currentLayerId = this.layersService.getDefaultLayer();
    /* this.items = [
      {
        label: 'Capas base',
        icon: 'pi pi-map',
        items: this.availableLayers.map(layer => ({
          label: layer.displayName,
          icon: 'pi pi-map',
          id: layer.id,
          command: () => this.switchToLayer(layer.id)
        }))
      },
      {
        label: 'Capas superpuestas',
        icon: 'pi pi-images',
        items: this.availableOverlays.map(overlay => ({
          label: overlay.displayName,
          icon: 'pi pi-image',
          id: overlay.id,
          command: () => this.toggleOverlay(overlay.id, !overlay.visible)
        }))
      }
    ] */
    this.initializeMap();
  }

  private async initializeMap(): Promise<void> {
    const style = this.layersService.getMapStyle();
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style,
      center: [-58.3816, -34.6037],
      zoom: 5,
      attributionControl: false,
    });

    this.map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.addControl(new AttributionControl(), 'bottom-left');

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

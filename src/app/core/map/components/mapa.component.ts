import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Map, NavigationControl, Popup, AttributionControl, type StyleSpecification, type IControl } from 'maplibre-gl';
import { MapLayersService } from '../services/map-layers.service';
import { type LayerMetadata, type OverlayMetadata } from '../../../../shared/models/map-layer.interfaces';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})

export class MapaComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map?: Map;
  private currentLayerId: string = '';
  public availableLayers: LayerMetadata[] = [];
  public availableOverlays: OverlayMetadata[] = [];

  constructor(private layersService: MapLayersService, private http: HttpClient) { }
  
  ngOnInit(): void {
    this.availableLayers = this.layersService.getAvailableLayers();
    this.availableOverlays = this.layersService.getAvailableOverlays();
    this.currentLayerId = this.layersService.getDefaultLayer();
    this.initializeMap();
  }

probarMock() {
  this.http.get<{ mensaje: string }>('/api/post').subscribe({
    next: (resp) => alert('Respuesta del mock: ' + resp.mensaje),
    error: (err) => alert('Error: ' + JSON.stringify(err))
  });
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
      const keys = Object.keys(properties);
      const maxItems = 5;
      let html = `<div style="max-height: 180px; overflow-y: auto;"><table style="margin-bottom:0;">`;
      keys.forEach(key => {
        html += `<tr><th style="text-align:left; padding-right:8px;">${key}</th><td>${properties[key]}</td></tr>`;
      });
      html += '</table></div>';
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

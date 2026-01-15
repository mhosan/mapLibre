import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Map, NavigationControl, Popup, AttributionControl, type StyleSpecification, type IControl } from 'maplibre-gl';
import { MapLayersService } from './services/map-layers.service';
import { MapInteractionService } from './services/map-interaction.service';
import { type LayerMetadata, type OverlayMetadata } from '../models/map-layer.interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css'
})

export class MapaComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  private map?: Map;
  private currentLayerId: string = '';
  public availableLayers: LayerMetadata[] = [];
  public availableOverlays: OverlayMetadata[] = [];

  constructor(
    private layersService: MapLayersService,
    private interactionService: MapInteractionService
  ) { }

  ngOnInit(): void {
    this.availableLayers = this.layersService.getAvailableLayers();
    this.availableOverlays = this.layersService.getAvailableOverlays();
    this.currentLayerId = this.layersService.getDefaultLayer();
    this.initializeMap();
  }

  /********************************************************************
   * Inicializa el mapa con el estilo y las capas predeterminadas.
  ********************************************************************/
  private async initializeMap(): Promise<void> {
    const style = this.layersService.getMapStyle();
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style,
      center: [-58.3816, -34.6037],
      zoom: 8,
      attributionControl: false,
    });

    this.map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.addControl(new AttributionControl(), 'bottom-left');

    /******************************************************************
     * Delegar la gestión de eventos al servicio de interacción
     * @param map Instancia del mapa de MapLibre
     * @param getOverlays Función que retorna las capas overlay actuales
     * esto no es una lista de capas, sino que es una función que retorna 
     * las capas overlay actuales.
     ******************************************************************/
    this.interactionService.initializeHandlers(this.map, () => this.availableOverlays);
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

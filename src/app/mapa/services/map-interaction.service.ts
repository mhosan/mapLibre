import { Injectable } from '@angular/core';
import { Map, Popup } from 'maplibre-gl';
import { OverlayMetadata } from '../../models/map-layer.interfaces';
import { MapPopupService } from './map-popup.service';

@Injectable({
    providedIn: 'root'
})
export class MapInteractionService {

    constructor(private popupService: MapPopupService) { }

    /**
     * Inicializa los manejadores de eventos (listeners) para el mapa.
     * @param map Instancia del mapa de MapLibre
     * @param getOverlays Función que retorna las capas overlay actuales
     */
    initializeHandlers(map: Map, getOverlays: () => OverlayMetadata[]): void {

        // Evento click general para cualquier capa vectorial visible
        map.on('click', (e) => {
            const overlays = getOverlays();

            // Obtener solo las capas vectoriales activas (circle, line, fill) y visibles
            const vectorLayerIds = overlays
                .filter(o => map.getLayoutProperty(o.id, 'visibility') === 'visible')
                .map(o => o.id);

            if (vectorLayerIds.length === 0) return;

            // Buscar elementos de las capas vectoriales en la posición del clic
            const features = map.queryRenderedFeatures(e.point, { layers: vectorLayerIds });
            if (!features.length) return;

            // Extraer propiedades del primer elemento encontrado
            const { properties } = features[0];
            if (!properties) return;

            // Configurar y añadir el popup al mapa con la información procesada por el servicio de popups
            new Popup()
                .setLngLat(e.lngLat)
                .setHTML(this.popupService.getFeaturePopupHtml(properties))
                .addTo(map);
        });

        // Cambiar el cursor al pasar sobre elementos interactuables (opcional, mejora UX)
        map.on('mousemove', (e) => {
            const overlays = getOverlays();
            const vectorLayerIds = overlays
                .filter(o => map.getLayoutProperty(o.id, 'visibility') === 'visible')
                .map(o => o.id);

            if (vectorLayerIds.length === 0) {
                map.getCanvas().style.cursor = '';
                return;
            }

            const features = map.queryRenderedFeatures(e.point, { layers: vectorLayerIds });
            map.getCanvas().style.cursor = features.length ? 'pointer' : '';
        });
    }
}

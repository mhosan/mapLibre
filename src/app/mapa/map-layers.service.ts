import { Injectable } from '@angular/core';
import { type StyleSpecification } from 'maplibre-gl';
import { LayerDefinition, RasterSourceDefinition, GeoJSONSourceDefinition, LayerMetadata, OverlayMetadata } from '../models/map-layer.interfaces';

@Injectable({
    providedIn: 'root'
})
export class MapLayersService {


    getMapStyle(): StyleSpecification {
        return {
            version: 8,
            sources: this.getSources(),
            layers: this.getLayers()
        };
    }

    getAvailableLayers(): LayerMetadata[] {
        return this.layerMetadata.filter(layer => layer.enabled);
    }

    getDefaultLayer(): string {
        return this.layerMetadata[0].id; // First enabled layer
    }

    /****************************
     * paso 1: agregar sources 
     ****************************/
    private getSources(): Record<string, RasterSourceDefinition | GeoJSONSourceDefinition> {
        return {
            osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
            esriWorldImagery: {
                type: 'raster',
                tiles: [
                    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                ],
                tileSize: 256,
                attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            },
            googleSatellite: {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                maxzoom: 21,
                attribution: '© Google Maps',
            },
            argenMap: {
                type: 'raster',
                tiles: ['https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 21,
                attribution: '© IGN Argentina',
                scheme: 'tms',
            },
            googleMaps: {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'],
                tileSize: 256,
                maxzoom: 21,
                attribution: '© Google Maps',
            },
            googleHybrid: {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'],
                tileSize: 256,
                maxzoom: 21,
                attribution: '© Google Maps',
            },
            esriTransportation: {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                attribution: '© Esri',
            },
            // Fuentes GeoJSON para overlays
            redVialNacional: {
                type: 'geojson',
                data: '/assets/json/redVialNacional.geojson',
            },
            redVialProvincial: {
                type: 'geojson',
                data: '/assets/json/redVialProvincial.geojson',
            }
        };
    }

    /****************************
     * paso 2: agregar layers
     ****************************/
    private getLayers(): LayerDefinition[] {
        return [
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
            {
                id: 'argenmap-tiles',
                type: 'raster',
                source: 'argenMap',
                layout: { visibility: 'none' },
            },
            {
                id: 'google-maps-tiles',
                type: 'raster',
                source: 'googleMaps',
                layout: { visibility: 'none' },
            },
            {
                id: 'google-hybrid-tiles',
                type: 'raster',
                source: 'googleHybrid',
                layout: { visibility: 'none' },
            },
            {
                id: 'esri-transportation-tiles',
                type: 'raster',
                source: 'esriTransportation',
                layout: { visibility: 'none' },
            },
            // Capas vectoriales para overlays
            {
                id: 'red-vial-nacional',
                type: 'line',
                source: 'redVialNacional',
                layout: { visibility: 'none' },
                paint: {
                    'line-color': '#ff0000',
                    'line-width': 2
                }
            },
            {
                id: 'red-vial-provincial',
                type: 'line',
                source: 'redVialProvincial',
                layout: { visibility: 'none' },
                paint: {
                    'line-color': '#0000ff',
                    'line-width': 1
                }
            }
        ];
    }

    /*****************************
    * paso 3 agregar metadatos
    ****************************/
    private readonly layerMetadata: LayerMetadata[] = [
        { id: 'osm-tiles', sourceId: 'osm', displayName: 'OpenStreetMap', enabled: true },
        { id: 'esri-satellite-tiles', sourceId: 'esriWorldImagery', displayName: 'Satélite (Esri)', enabled: true },
        { id: 'argenmap-tiles', sourceId: 'argenMap', displayName: 'ArgenMap (IGN)', enabled: true },
        { id: 'google-maps-tiles', sourceId: 'googleMaps', displayName: 'Google Maps', enabled: true },
        { id: 'google-hybrid-tiles', sourceId: 'googleHybrid', displayName: 'Google Híbrido', enabled: true },
        { id: 'google-satellite-tiles', sourceId: 'googleSatellite', displayName: 'Google Satélite', enabled: true },
        { id: 'esri-transportation-tiles', sourceId: 'esriTransportation', displayName: 'Esri Transporte', enabled: true },
    ];

    /****************************
     * overlays vectoriales
     ****************************/
    private readonly overlayMetadata: OverlayMetadata[] = [
        { id: 'red-vial-nacional', sourceId: 'redVialNacional', displayName: 'Red Vial Nacional', enabled: true, visible: false },
        { id: 'red-vial-provincial', sourceId: 'redVialProvincial', displayName: 'Red Vial Provincial', enabled: true, visible: false },
    ];

    getAvailableOverlays(): OverlayMetadata[] {
        return this.overlayMetadata.filter(overlay => overlay.enabled);
    }

}

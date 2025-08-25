import { Injectable } from '@angular/core';
import { type StyleSpecification } from 'maplibre-gl';
import { LayerDefinition, RasterSourceDefinition, GeoJSONSourceDefinition, LayerMetadata, OverlayMetadata } from '../models/map-layer.interfaces';
import { CoordinateSystemService } from '../services/coordinate-system.service';

@Injectable({
    providedIn: 'root'
})
export class MapLayersService {

    constructor(private coordinateSystemService: CoordinateSystemService) { }

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
            comisarias: {
                type: 'geojson',
                data: 'assets/json/comisarias.geojson',
            },
            escuelas: {
                type: 'geojson',
                data: 'assets/json/escuelas.geojson',
            },
            partidos: {
                type: 'geojson',
                data: 'assets/json/partidos.geojson',
            },
            hidro: {
                type: 'geojson',
                data: 'assets/json/hidro.geojson',
            },
            localidades: {
                type: 'geojson',
                data: 'assets/json/localidades.geojson',
            },
            provincias: {
                type: 'geojson',
                data: 'assets/json/provincias.geojson',
            },
            rutas: {
                type: 'geojson',
                data: 'assets/json/rutas.geojson',
            },
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
                id: 'comisarias',
                type: 'circle',
                source: 'comisarias',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#00b300',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            },
            {
                id: 'escuelas',
                type: 'circle',
                source: 'escuelas',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#b37400ff',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            },
            {
                id: 'partidos',
                type: 'fill',
                source: 'partidos',
                layout: { visibility: 'none' },
                paint: {
                    'fill-color': '#3388ff',
                    'fill-opacity': 0.3,
                    'fill-outline-color': '#2255aa'
                }
            },
            {
                id: 'hidro',
                type: 'line',
                source: 'hidro',
                layout: { visibility: 'none' },
                paint: {
                    'line-color': '#0000ff',
                    'line-width': 2
                }
            },
            {
                id: 'localidades',
                type: 'circle',
                source: 'localidades',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': 6,
                    'circle-color': 'rgba(44, 187, 0, 1)'

                }
            },
            {
                id: 'provincias',
                type: 'fill',
                source: 'provincias',
                layout: { visibility: 'none' },
                paint: {
                    'fill-color': '#3388ff',
                    'fill-opacity': 0.3,
                    'fill-outline-color': '#aa2276ff'
                }
            },
            {
                id: 'rutas',
                type: 'line',
                source: 'rutas',
                layout: { visibility: 'none' },
                paint: {
                    'line-color': '#ff0000',
                    'line-width': 2
                }   
            }
        ];
    }

    /*****************************
    * paso 3 agregar metadatos
    ****************************/
    private readonly layerMetadata: LayerMetadata[] = [
        { id: 'osm-tiles', sourceId: 'osm', displayName: 'OpenStreetMap (serv.teselas raster)', enabled: true },
        { id: 'esri-satellite-tiles', sourceId: 'esriWorldImagery', displayName: 'Satélite Esri  (serv.teselas raster)', enabled: true },
        { id: 'argenmap-tiles', sourceId: 'argenMap', displayName: 'ArgenMap IGN (serv.teselas raster)', enabled: true },
        { id: 'google-maps-tiles', sourceId: 'googleMaps', displayName: 'Google Maps (serv.teselas raster)', enabled: true },
        { id: 'google-hybrid-tiles', sourceId: 'googleHybrid', displayName: 'Google Híbrido (serv.teselas raster)', enabled: true },
        { id: 'google-satellite-tiles', sourceId: 'googleSatellite', displayName: 'Google Satélite (serv.teselas raster)', enabled: true },
        { id: 'esri-transportation-tiles', sourceId: 'esriTransportation', displayName: 'Esri Transporte (serv.teselas raster)', enabled: true },
    ];

    /****************************
     * overlays vectoriales
     ****************************/
    private readonly overlayMetadata: OverlayMetadata[] = [
        { id: 'comisarias', sourceId: 'comisarias', displayName: 'Comisarías (geoJson)', enabled: true, visible: false, crs: 'EPSG:4326' },
        { id: 'escuelas', sourceId: 'escuelas', displayName: 'Escuelas (geoJson)', enabled: true, visible: false, crs: 'EPSG:4326' },
        { id: 'partidos', sourceId: 'partidos', displayName: 'Partidos (geoJson)', enabled: true, visible: false, crs: 'EPSG:4326' },
        { id: 'hidro', sourceId: 'hidro', displayName: 'Hidrografía (geoJson)', enabled: true, visible: false, crs: 'EPSG:4326' },
        { id: 'localidades', sourceId: 'localidades', displayName: 'Localidades (geoJson)', enabled: true, visible: false, crs: 'EPSG:4326' },
        { id: 'provincias', sourceId: 'provincias', displayName: 'Provincias (geoJson)', enabled: true, visible: false, crs: 'EPSG:4326' },
        { id: 'rutas', sourceId: 'rutas', displayName: 'Rutas (geoJson)', enabled: true, visible: false, crs: 'EPSG:4326' },
    ];

    getAvailableOverlays(): OverlayMetadata[] {
        return this.overlayMetadata.filter(overlay => overlay.enabled);
    }

    public getMapStyle(): StyleSpecification {
        return {
            version: 8,
            sources: this.getSources(),
            layers: this.getLayers()
        };
    }

}

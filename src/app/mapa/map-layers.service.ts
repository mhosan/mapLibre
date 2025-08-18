import { Injectable } from '@angular/core';
import { type StyleSpecification } from 'maplibre-gl';
import { LayerDefinition, RasterSourceDefinition, GeoJSONSourceDefinition, LayerMetadata, OverlayMetadata } from '../models/map-layer.interfaces';
import { CoordinateSystemService } from '../services/coordinate-system.service';

@Injectable({
    providedIn: 'root'
})
export class MapLayersService {

    constructor(private coordinateSystemService: CoordinateSystemService) {}


    getMapStyle(): StyleSpecification {
        return {
            version: 8,
            sources: this.getSources(),
            layers: this.getLayers()
        };
    }

    /**
     * Obtiene el estilo del mapa con transformación de coordenadas para overlays
     */
    async getMapStyleWithTransforms(): Promise<StyleSpecification> {
        const sources = await this.getTransformedSources();
        return {
            version: 8,
            sources: sources,
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
            comisarias: {
                type: 'geojson',
                data: '/assets/json/comisarias.geojson',
            },
            escuelas: {
                type: 'geojson',
                data: '/assets/json/escuelas.geojson',
            },
            calles:{
                type: 'geojson',
                data: '/assets/json/callesLPBssoEda.geojson',
            },
            partidos:{
                type: 'geojson',
                data: '/assets/json/partidos.geojson',
            }
        };
    }

    /**
     * Obtiene las fuentes con transformaciones aplicadas para overlays vectoriales
     */
    private async getTransformedSources(): Promise<Record<string, RasterSourceDefinition | GeoJSONSourceDefinition>> {
        const originalSources = this.getSources();
        const transformedSources: Record<string, RasterSourceDefinition | GeoJSONSourceDefinition> = {};

        for (const [sourceId, source] of Object.entries(originalSources)) {
            if (source.type === 'geojson') {
                // Encontrar metadatos del overlay para obtener CRS
                const overlayMeta = this.overlayMetadata.find(overlay => overlay.sourceId === sourceId);
                
                if (overlayMeta && overlayMeta.crs) {
                    try {
                        // Transformar GeoJSON si es necesario
                        const transformedData = await this.coordinateSystemService.transformGeoJSON(
                            source.data,
                            overlayMeta.crs,
                            'EPSG:4326'
                        );
                        
                        // Crear fuente con datos transformados
                        transformedSources[sourceId] = {
                            type: 'geojson',
                            data: transformedData
                        };
                        
                        // console.log eliminado
                    } catch (error) {
                        console.warn(`Error transformando ${sourceId}:`, error);
                        // Usar fuente original en caso de error
                        transformedSources[sourceId] = source;
                    }
                } else {
                    // Fuente sin CRS definido, usar original
                    transformedSources[sourceId] = source;
                }
            } else {
                // Fuentes raster no necesitan transformación
                transformedSources[sourceId] = source;
            }
        }

        return transformedSources;
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
                id: 'calles',
                type: 'line',
                source: 'calles',
                layout: { visibility: 'none' },
                paint: {
                    'line-color': '#ff0000',
                    'line-width': 2
                }
            },
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
    { id: 'red-vial-nacional', sourceId: 'redVialNacional', displayName: 'Red Vial Nacional', enabled: true, visible: false, crs: 'EPSG:22175' },
    { id: 'red-vial-provincial', sourceId: 'redVialProvincial', displayName: 'Red Vial Provincial', enabled: true, visible: false, crs: 'EPSG:22175' },
    { id: 'comisarias', sourceId: 'comisarias', displayName: 'Comisarías', enabled: true, visible: false, crs: 'EPSG:4326' },
    { id: 'escuelas', sourceId: 'escuelas', displayName: 'Escuelas', enabled: true, visible: false, crs: 'EPSG:4326' },
    { id: 'calles', sourceId: 'calles', displayName: 'Calles', enabled: true, visible: false, crs: 'EPSG:4326' },
    { id: 'partidos', sourceId: 'partidos', displayName: 'Partidos', enabled: true, visible: false, crs: 'EPSG:4326' },
];

    getAvailableOverlays(): OverlayMetadata[] {
        return this.overlayMetadata.filter(overlay => overlay.enabled);
    }

}

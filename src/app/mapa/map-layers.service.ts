import { Injectable } from '@angular/core';
import { type StyleSpecification } from 'maplibre-gl';
import { LayerDefinition, SourceDefinition, LayerMetadata } from '../models/map-layer.interfaces';

@Injectable({
    providedIn: 'root'
})
export class MapLayersService {

    /*****************************
     * paso 3 agregar metadatos
     ****************************/
    private readonly layerMetadata: LayerMetadata[] = [
        { id: 'osm-tiles', sourceId: 'osm', displayName: 'OpenStreetMap', enabled: true },
        { id: 'esri-satellite-tiles', sourceId: 'esriWorldImagery', displayName: 'Satélite (Esri)', enabled: true },
        { id: 'google-satellite-tiles', sourceId: 'googleSatellite', displayName: 'Satélite (Google)', enabled: true },
        { id: 'argenmap-tiles', sourceId: 'argenMap', displayName: 'ArgenMap (IGN)', enabled: true },
    ];

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
    private getSources(): Record<string, SourceDefinition> {
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
        ];
    }
}

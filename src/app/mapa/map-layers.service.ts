import { Injectable } from '@angular/core';
import { type StyleSpecification } from 'maplibre-gl';

export interface LayerDefinition {
  id: string;
  type: 'raster';
  source: string;
  layout?: { visibility: 'visible' | 'none' };
}

export interface SourceDefinition {
  type: 'raster';
  tiles: string[];
  tileSize: number;
  attribution: string;
  maxzoom?: number;
}

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
    };
  }

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
    ];
  }
}

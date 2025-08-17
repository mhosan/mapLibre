export interface LayerDefinition {
    id: string;
    type: 'raster' | 'line' | 'fill';
    source: string;
    layout?: { visibility: 'visible' | 'none' };
    paint?: any;
}

export interface RasterSourceDefinition {
    type: 'raster';
    tiles: string[];
    tileSize: number;
    attribution: string;
    maxzoom?: number;
    scheme?: 'xyz' | 'tms';
}

export interface GeoJSONSourceDefinition {
    type: 'geojson';
    data: string;
}

export type SourceDefinition = RasterSourceDefinition | GeoJSONSourceDefinition;

export interface LayerMetadata {
    id: string;
    sourceId: string;
    displayName: string;
    enabled: boolean;
}

export interface OverlayMetadata {
    id: string;
    sourceId: string;
    displayName: string;
    enabled: boolean;
    visible: boolean;
}

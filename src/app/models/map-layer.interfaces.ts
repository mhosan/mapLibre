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
    scheme?: 'xyz' | 'tms';
}

export interface LayerMetadata {
    id: string;
    sourceId: string;
    displayName: string;
    enabled: boolean;
}

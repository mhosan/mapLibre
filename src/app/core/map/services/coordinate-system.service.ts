import { Injectable } from '@angular/core';
import proj4 from 'proj4';

export interface CoordinateSystemInfo {
  epsg: string;
  name: string;
  isWebMercator: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CoordinateSystemService {
  private readonly STANDARD_CRS = 'EPSG:3857'; // Web Mercator - estándar para web mapping
  
  constructor() {
    // Definir proyecciones comunes
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
    // Definir EPSG:22175 (POSGAR 94 / Argentina 5)
  // EPSG:22175 (POSGAR 94 / Argentina 5) - meridiano central correcto es -57
  // EPSG:22175 (POSGAR 94 / Argentina 5) - definición oficial (faja 5)
  proj4.defs('EPSG:22175', '+proj=tmerc +lat_0=0 +lon_0=-57 +k=1 +x_0=5500000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
  }
  
  /**
   * Sistemas de coordenadas comunes en Argentina
   */
  private readonly KNOWN_CRS: Record<string, CoordinateSystemInfo> = {
    'EPSG:3857': { epsg: 'EPSG:3857', name: 'Web Mercator', isWebMercator: true },
    'EPSG:4326': { epsg: 'EPSG:4326', name: 'WGS84 Geographic', isWebMercator: false },
    'EPSG:22183': { epsg: 'EPSG:22183', name: 'POSGAR 98 / Argentina 3', isWebMercator: false },
    'EPSG:5343': { epsg: 'EPSG:5343', name: 'POSGAR 2007 / Argentina 3', isWebMercator: false },
  };

  /**
   * Obtiene el sistema de coordenadas estándar usado por MapLibre
   */
  getStandardCRS(): string {
    return this.STANDARD_CRS;
  }

  /**
   * Verifica si un EPSG es compatible con Web Mercator (no requiere transformación)
   */
  isWebMercatorCompatible(epsg?: string): boolean {
    if (!epsg) return true; // Asume Web Mercator por defecto
    
    const crsInfo = this.KNOWN_CRS[epsg.toUpperCase()];
    return crsInfo ? crsInfo.isWebMercator : false;
  }

  /**
   * Obtiene información sobre un sistema de coordenadas
   */
  getCRSInfo(epsg?: string): CoordinateSystemInfo | null {
    if (!epsg) return this.KNOWN_CRS[this.STANDARD_CRS];
    
    return this.KNOWN_CRS[epsg.toUpperCase()] || null;
  }


  /**
   * Extrae la primera coordenada de una geometría GeoJSON
   */
  private extractFirstCoordinate(geometry: any): [number, number] | null {
    if (!geometry || !geometry.coordinates) return null;
    
    switch (geometry.type) {
      case 'Point':
        return geometry.coordinates;
      case 'LineString':
      case 'MultiPoint':
        return geometry.coordinates[0];
      case 'Polygon':
      case 'MultiLineString':
        return geometry.coordinates[0][0];
      case 'MultiPolygon':
        return geometry.coordinates[0][0][0];
      default:
        return null;
    }
  }

  /**
   * Detecta el sistema de coordenadas basado en los rangos de valores
   */
  private detectCRSFromCoordinates(x: number, y: number): string {
    // Web Mercator: X típicamente -20037508 a 20037508, Y similar
    if (Math.abs(x) > 180 && Math.abs(y) > 90) {
      return 'EPSG:3857';
    }
    
    // Argentina típicamente: longitud -75 a -53, latitud -55 a -21
    if (x >= -75 && x <= -53 && y >= -55 && y <= -21) {
      return 'EPSG:4326';
    }
    
    // POSGAR Argentina: X típicamente 2000000-7000000, Y 3000000-6000000
    if (x > 1000000 && x < 8000000 && y > 1000000 && y < 8000000) {
      return 'EPSG:22183'; // Asume POSGAR 98
    }
    
    // Por defecto, asume geographic WGS84
    return 'EPSG:4326';
  }


  /**
   * Transforma un GeoJSON de un sistema de coordenadas a otro
   */
  async transformGeoJSON(geoJsonUrl: string, sourceCRS: string, targetCRS: string = 'EPSG:4326'): Promise<any> {
    // Si ya está en el CRS objetivo, no transformar
    if (sourceCRS?.toUpperCase() === targetCRS?.toUpperCase()) {
      const response = await fetch(geoJsonUrl);
      return response.json();
    }

    try {
      const response = await fetch(geoJsonUrl);
      const geojson = await response.json();

      // Debug: primeras coordenadas antes y después
      try {
        const first = this.extractFirstCoordinate(geojson.features?.[0]?.geometry);
        if (first) {
          // console.log eliminado
          const test = proj4(sourceCRS, targetCRS, first as any);
          // console.log eliminado
        }
      } catch {}

      // Transformar coordenadas al CRS objetivo (por defecto WGS84 / EPSG:4326)
      return this.transformGeoJSONCoordinates(geojson, sourceCRS, targetCRS);
    } catch (error) {
      console.error(`Error transformando GeoJSON de ${sourceCRS} a ${targetCRS}:`, error);
      throw error;
    }
  }

  /**
   * Transforma las coordenadas de un objeto GeoJSON
   */
  private transformGeoJSONCoordinates(geojson: any, sourceCRS: string, targetCRS: string): any {
    const transformed = JSON.parse(JSON.stringify(geojson)); // Deep copy

    if (transformed.features) {
      transformed.features.forEach((feature: any) => {
        if (feature.geometry) {
          this.transformGeometry(feature.geometry, sourceCRS, targetCRS);
        }
      });
    }

    // Eliminar o actualizar la propiedad 'crs' para que MapLibre no interprete mal el CRS
    if (transformed.crs) {
      // Si el target es EPSG:4326, simplemente elimina la propiedad
      if (targetCRS === 'EPSG:4326') {
        delete transformed.crs;
      } else {
        // O actualiza el nombre del CRS
        transformed.crs = {
          type: 'name',
          properties: { name: `urn:ogc:def:crs:${targetCRS}` }
        };
      }
    }

    return transformed;
  }

  /**
   * Transforma las coordenadas de una geometría
   */
  private transformGeometry(geometry: any, sourceCRS: string, targetCRS: string): void {
    if (!geometry.coordinates) return;

    switch (geometry.type) {
      case 'Point':
        geometry.coordinates = this.transformCoordinate(geometry.coordinates, sourceCRS, targetCRS);
        break;
      case 'LineString':
      case 'MultiPoint':
        geometry.coordinates = geometry.coordinates.map((coord: number[]) => 
          this.transformCoordinate(coord, sourceCRS, targetCRS)
        );
        break;
      case 'Polygon':
      case 'MultiLineString':
        geometry.coordinates = geometry.coordinates.map((ring: number[][]) =>
          ring.map((coord: number[]) => this.transformCoordinate(coord, sourceCRS, targetCRS))
        );
        break;
      case 'MultiPolygon':
        geometry.coordinates = geometry.coordinates.map((polygon: number[][][]) =>
          polygon.map((ring: number[][]) =>
            ring.map((coord: number[]) => this.transformCoordinate(coord, sourceCRS, targetCRS))
          )
        );
        break;
    }
  }

  /**
   * Transforma una coordenada individual
   */
  private transformCoordinate(coord: number[], sourceCRS: string, targetCRS: string): number[] {
    try {
      let input = coord;
      if (sourceCRS === 'EPSG:22175') {
        input = [-Math.abs(coord[0]), -Math.abs(coord[1])];
      }
      return proj4(sourceCRS, targetCRS, input);
    } catch (error) {
      console.warn(`Error transformando coordenada de ${sourceCRS} a ${targetCRS}:`, error);
      return coord;
    }
  }
}

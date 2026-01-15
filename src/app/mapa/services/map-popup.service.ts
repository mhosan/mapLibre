import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MapPopupService {

    constructor() { }

    /**
     * Genera el contenido HTML para un popup basado en las propiedades de una feature.
     * @param properties Objeto con los metadatos de la feature (GeoJSON)
     * @returns String con el HTML formateado como tabla
     */
    getFeaturePopupHtml(properties: any): string {
        if (!properties) return '';

        // Construir dinámicamente el contenido HTML de la tabla de atributos
        const tableRows = Object.entries(properties)
            .map(([key, value]) => `
        <tr>
          <th style="text-align: left; padding-right: 8px; border-bottom: 1px solid #444; color: #90caf9;">${key}</th>
          <td style="border-bottom: 1px solid #444; color: #fff;">${value}</td>
        </tr>
      `).join('');

        return `
      <div style="max-height: 180px; overflow-y: auto; font-family: sans-serif; font-size: 12px;">
        <table style="margin: 0; width: 100%; border-collapse: collapse;">
          ${tableRows}
        </table>
      </div>
    `;
    }
}

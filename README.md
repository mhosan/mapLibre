# MapLibre

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.1.

## Requisitos de instalación

Antes de compilar o desarrollar, asegúrate de instalar las dependencias necesarias para el mapa:

- Libreria MapLibre:
```bash
npm install maplibre-gl @types/maplibre-gl --save
```
- ng-bootstrap:
```bash
ng add @ng-bootstrap/ng-bootstrap
```
- Iconos en la aplicación
 - Este proyecto utiliza [Bootstrap Icons](https://icons.getbootstrap.com/) para los iconos en la interfaz de usuario.
 - Los iconos se cargan automáticamente agregando la ruta `node_modules/bootstrap-icons/font/bootstrap-icons.min.css` en la sección `styles` de `angular.json`.
 - No es necesario modificar el `index.html` ni usar un CDN para los iconos.
 - Para usar un icono, simplemente agrega una etiqueta como `<i class="bi bi-map"></i>` en tu HTML.
 - Puedes consultar la lista completa de iconos disponibles en la [documentación oficial de Bootstrap Icons](https://icons.getbootstrap.com/).


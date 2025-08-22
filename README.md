# MapLibre

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.1.

## Requisitos de instalación

Antes de compilar o desarrollar, asegúrate de instalar las dependencias necesarias para el mapa:

```bash
npm install maplibre-gl @types/maplibre-gl --save
```

Esto es necesario para evitar errores de importación relacionados con 'maplibre-gl'.

# Iconos en la aplicación

Este proyecto utiliza [Bootstrap Icons](https://icons.getbootstrap.com/) para los iconos en la interfaz de usuario.

- Los iconos se cargan automáticamente agregando la ruta `node_modules/bootstrap-icons/font/bootstrap-icons.min.css` en la sección `styles` de `angular.json`.
- No es necesario modificar el `index.html` ni usar un CDN para los iconos.
- Para usar un icono, simplemente agrega una etiqueta como `<i class="bi bi-map"></i>` en tu HTML.
- Puedes consultar la lista completa de iconos disponibles en la [documentación oficial de Bootstrap Icons](https://icons.getbootstrap.com/).

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# MapLibre

Este proyecto fué generado con [Angular CLI](https://github.com/angular/angular-cli) version 20.0.1.

## Requisitos de instalación

- MapLibre:
```bash
npm install maplibre-gl @types/maplibre-gl --save
```
- Bootstrap:
```bash
npm install bootstrap@latest
```
En el archivo `src/styles.css` agregar:
```css
@import "bootstrap/dist/css/bootstrap.min.css";
```
( Opcional ) Si vas a usar componentes JS de Bootstrap instala `@popperjs/core`:
```bash
npm install @popperjs/core
```

**Nota:** Este proyecto fue migrado de Tailwind/DaisyUI a Bootstrap; se eliminaron las dependencias de Tailwind y DaisyUI y ahora se importa Bootstrap desde `src/styles.css`. Si clonas el repositorio, ejecuta `npm install` antes de levantar la app.```

## Despliegue

El deploy se realiza automáticamente con el push a GitHub (GitHub Pages). La URL final es: https://mhosan.github.io/mapLibre/


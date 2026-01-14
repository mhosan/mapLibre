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

## Migración Tailwind → Bootstrap

Se migró el proyecto de **Tailwind / DaisyUI** a **Bootstrap** en la rama `feature/migrate-tailwind-to-bootstrap`. Cambios principales realizados:

- Eliminadas dependencias: `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `daisyui` (comando ejecutado: `npm uninstall tailwindcss @tailwindcss/postcss postcss daisyui`).
- Eliminado `.postcssrc.json` y removidas las directivas `@import "tailwindcss";` y `@plugin "daisyui";` de `src/styles.css`.
- Instalado `bootstrap` (`npm install bootstrap@latest`) y agregado `@import "bootstrap/dist/css/bootstrap.min.css";` en `src/styles.css`.
- Actualizada la asociación de archivos en `.vscode/settings.json` para no forzar Tailwind.
- Reemplazo manual de clases Tailwind/DaisyUI en componentes (ej.: `src/app/mapa/mapa.component.html`).
- Regenerados los assets en `docs/` y actualizado `package-lock.json`.

Comandos útiles (ejecutados o recomendados):

```bash
git checkout -b feature/migrate-tailwind-to-bootstrap
npm uninstall tailwindcss @tailwindcss/postcss postcss daisyui
npm install bootstrap@latest
npm install
npm run build
```


## Despliegue

El deploy se realiza automáticamente con el push a GitHub (GitHub Pages). La URL final es: https://mhosan.github.io/mapLibre/


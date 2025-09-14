# MapLibre

Este proyecto fué generado con [Angular CLI](https://github.com/angular/angular-cli) version 20.0.1.

## Requisitos de instalación

- MapLibre:
```bash
npm install maplibre-gl @types/maplibre-gl --save
```
- Tailwind:
```bash
npm install tailwindcss @tailwindcss/postcss postcss --force
```
En la raiz del proyecto agregar un archivo .postcssrc.json con el siguiente contenido:
```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```
En el archivo src/style.css agregar:
```css
@import "tailwindcss";
```
- DaisyUI:
```bash
npm install daisyui@latest --force
```
En el archivo src/style.css agregar:
```css
@plugin "daisyui";
```


# JS Playground

Una aplicación web para aprender y practicar JavaScript, similar a [Playground](https://playground.js.org/) o [RunJS](https://runjs.app/play).

## Características

- **Editor de código** con Monaco Editor (el mismo VS Code usa)
- **Ejecución segura** en sandbox (iframe aislado)
- **Consola** con soporte para `console.log`, `console.warn`, `console.error` y estilos CSS
- **82 snippets** predefinidos organizados en 11 niveles de aprendizaje
- **Snippet personal** para guardar tus propios ejemplos
- **Compartir código** via URL comprimida
- **Tema claro/oscuro**
- **Tests automatizados** con Vitest

## Estructura de Niveles

| Nivel | Tema | Topics |
|-------|------|--------|
| 0 | Personal | Mis Snippets |
| 1 | Fundamentos básicos | Variables, Tipos de datos, Operadores, Entrada/Salida |
| 2 | Control del programa | Condicionales, Bucles, Break/Continue, Scope |
| 3 | Funciones | Funciones básicas, Parámetros, Arrow functions, Callbacks |
| 4 | Estructuras de datos | Arrays, Métodos de arrays, Objetos, Destructuring |
| 5 | Conceptos clave | This, Hoisting, Closures, Clases |
| 6 | Asincronía | Callbacks asíncronos, Promises, Async/Await, Fetch API |
| 7 | JavaScript moderno (ES6+) | Template strings, Destructuring, Spread, Módulos |
| 8 | Navegador (DOM) | DOM, Selección de elementos, Eventos, Manipulación |
| 9 | Avanzado | Manejo de errores, JSON, Storage, Programación funcional |
| 10 | Profesional | Debugging, Testing básico, Performance, TypeScript básico |

## Installation

```bash
cd js-playground
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm run build
npm run preview
```

## Testing

```bash
npm run test        # Ejecutar tests una vez
npm run test:watch  # Modo watch
```

## Tecnologías

- **React 19** - UI framework
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Monaco Editor** - Editor de código
- **Vitest** - Testing
- **LocalStorage** - Persistencia

## Seguridad

- El código se ejecuta en un iframe con `sandbox="allow-scripts"`
- No tiene acceso al DOM principal ni cookies
- Timeout de 5 segundos para evitar bucles infinitos

## Estructura del Proyecto

```
src/
├── components/
│   ├── CodeEditor.tsx    # Monaco Editor
│   ├── Console.tsx        # Panel de consola
│   ├── Header.tsx         # Barra de navegación
│   ├── SnippetModal.tsx   # Modal crear/editar snippets
│   └── SnippetSidebar.tsx # Panel lateral de snippets
├── hooks/
│   ├── useRunner.ts       # Ejecución de código
│   ├── useSnippets.ts     # Gestión de snippets
│   └── useTheme.ts        # Cambio de tema
├── lib/
│   ├── runner.ts         # Servicio de ejecución sandbox
│   ├── share.ts          # Compartir via URL
│   └── storage.ts        # LocalStorage + categorías
├── types/
│   └── index.ts          # TypeScript interfaces
├── __tests__/
│   └── storage.test.ts   # Tests de storage
├── App.tsx
├── main.tsx
└── index.css
```

## Uso

1. **Escribir código** en el editor Monaco
2. Click en **Run** o presiona `Ctrl+Enter`
3. Ver resultados en la **consola**
4. **Guardar snippet** con nombre y categoría
5. **Compartir** mediante el botón de compartir (copia URL)
6. **Cambiar tema** con el toggle superior derecho

# JS Playground - Especificación

## 1. Visión General del Proyecto

**Nombre del Proyecto:** JS Playground  
**Tipo:** Aplicación de Página Única (SPA)  
**Funcionalidad Principal:** Editor de JavaScript basado en navegador con ejecución en sandbox, captura de consola y compartir vía URL  
**Usuarios Objetivo:** Desarrolladores que desean probar rápidamente snippets de JavaScript y aprender JavaScript mediante ejemplos prácticos

---

## 2. Especificación UI/UX

### Estructura del Layout

**Desktop (≥768px):**
- Header: 48px altura, contiene logo, toggle de tema, botón compartir
- Principal: Layout de 2 columnas (50/50)
  - Izquierda: Editor de Código (Monaco)
  - Derecha: Salida de Consola
- Sidebar: Panel de snippets colapsable (280px ancho)

**Móvil (<768px):**
- Header: 48px altura
- Principal: Vista basada en pestañas (Editor / Consola)
- Bottom sheet para snippets

### Paleta de Colores

**Tema Claro:**
- Background: `#FAFBFC`
- Surface: `#FFFFFF`
- Border: `#E1E4E8`
- Primary: `#2563EB`
- Primary Hover: `#1D4ED8`
- Text Primary: `#1F2937`
- Text Secondary: `#6B7280`

**Tema Oscuro:**
- Background: `#0D1117`
- Surface: `#161B22`
- Border: `#30363D`
- Primary: `#58A6FF`
- Primary Hover: `#79B8FF`
- Text Primary: `#E6EDF3`
- Text Secondary: `#8B949E`

### Tipografía
- Editor: `"JetBrains Mono", "Fira Code", monospace`
- UI: `"Inter", -apple-system, sans-serif`
- Header: 14px semibold
- Body: 14px regular
- Consola: 13px monospace

### Componentes

**Header:**
- Logo/Título: "JS Playground" (izquierda)
- Acciones: Toggle tema, Compartir (derecha)

**Panel Editor:**
- Instancia de Monaco Editor
- Toolbar: Botón Run, Toggle Auto-run, Botón Clear
- Indicador de estado (Running/Idle)

**Panel Consola:**
- Encabezado: "Console" + botón clear
- Área de salida: Lista desplazable de entradas
- Soporte para estilos CSS (`%c` en console.log)

**Sidebar de Snippets:**
- Búsqueda por nombre
- Acordeón de 3 niveles: Categoría → Tema → Snippets
- 11 niveles de aprendizaje (0-10)
- Botón discreto para editar snippets

---

## 3. Especificación de Funcionalidad

### Características Principales

**1. Editor de Código**
- Monaco Editor con soporte para JavaScript
- Autocompletado,匹配的括号, resaltado de sintaxis
- Ctrl/Cmd + Enter: Ejecutar código
- Ctrl/Cmd + S: Guardar snippet actual

**2. Ejecución de Código (Sandbox)**
- Iframe con atributo sandbox: `allow-scripts`
- Sin `allow-same-origin` para prevenir acceso al DOM
- Comunicación via postMessage
- Captura: console.log, console.info, console.warn, console.error
- Captura: errores de runtime, rechazos de promises
- Timeout: 5 segundos máximo de ejecución
- Soporte para estilos CSS en consola

**3. Auto-run**
- Toggle para habilitar/deshabilitar
- Debounce: 800ms después del último keystroke
- Muestra errores de sintaxis sin bloquear

**4. Gestión de Snippets**
- Almacenamiento en LocalStorage
- Campos: id, name, code, category, topic, createdAt, updatedAt
- Snippet actual se guarda automáticamente al cambiar
- Búsqueda por nombre
- 82 snippets predefinidos

**5. Compartir vía URL**
- Codifica código con compresión LZ-string
- Almacena en hash URL: `#code=compressed`
- Al cargar: decodifica y_popula editor
- Botón compartir copia URL al portapapeles

**6. Tema**
- Toggle Claro/Oscuro
- Persiste en LocalStorage
- Tema de Monaco Editor sincronizado

---

## 4. Estructura de Niveles de Aprendizaje

| Nivel | Categoría | ID | Temas |
|-------|-----------|-----|-------|
| 0 | Personal | mis-snippets | Mis Snippets |
| 1 | Fundamentos básicos | fundamentos | Variables, Tipos de datos, Operadores, Entrada/Salida |
| 2 | Control del programa | control | Condicionales, Bucles, Break/Continue, Scope |
| 3 | Funciones | funciones | Funciones básicas, Parámetros, Arrow functions, Callbacks |
| 4 | Estructuras de datos | estructuras | Arrays, Métodos de arrays, Objetos, Destructuring |
| 5 | Conceptos clave | conceptos | This, Hoisting, Closures, Clases |
| 6 | Asincronía | asincronia | Callbacks asíncronos, Promises, Async/Await, Fetch API |
| 7 | JavaScript moderno (ES6+) | es6 | Template strings, Destructuring, Spread, Módulos |
| 8 | Navegador (DOM) | dom | DOM, Selección de elementos, Eventos, Manipulación |
| 9 | Avanzado | avanzado | Manejo de errores, JSON, Storage, Programación funcional |
| 10 | Profesional | profesional | Debugging, Testing básico, Performance, TypeScript básico |

**Total: 82 snippets** (2 por cada tema de los niveles 1-10, más espacio para snippets personales en nivel 0)

---

## 5. Arquitectura

### Estructura de Archivos
```
src/
├── components/
│   ├── CodeEditor.tsx
│   ├── Console.tsx
│   ├── Header.tsx
│   ├── SnippetModal.tsx
│   └── SnippetSidebar.tsx
├── hooks/
│   ├── useRunner.ts
│   ├── useSnippets.ts
│   └── useTheme.ts
├── lib/
│   ├── runner.ts
│   ├── share.ts
│   └── storage.ts
├── types/
│   └── index.ts
├── __tests__/
│   └── storage.test.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Servicio Runner
- Crea iframe sandbox al inicializar
- Envía código via postMessage
- Escucha resultados/errores
- Limpia al destruir

### Seguridad
- Iframe sandbox: solo `allow-scripts`
- Sin acceso directo a window/document
- Validación de origen postMessage
- No usa eval() en hilo principal

---

## 6. Criterios de Aceptación

- [x] Puedo escribir JS y ver console.log en panel de salida
- [x] Errores capturados y mostrados con stack trace
- [x] Auto-run funciona con debounce y no bloquea UI
- [x] Recargar mantiene último código
- [x] Compartir link abre mismo código en nueva pestaña
- [x] Código de usuario aislado del contexto principal
- [x] Tema claro/oscuro funciona y persiste
- [x] Vista móvil muestra pestañas para Editor/Consola
- [x] 11 niveles de aprendizaje (0-10) con 82 snippets
- [x] Snippets personales guardados en "Nivel 0 — Personal"
- [x] Acordeón de 3 niveles en sidebar
- [x] Botón editar discreto en snippets

---

## 7. Tests

### Tests Implementados (14 tests)

**Categorías:**
- ✓ 11 categorías (incluyendo Nivel 0)
- ✓ "Nivel 0 — Personal" es la primera
- ✓ IDs de categoría únicos

**Storage - Snippets:**
- ✓ Guardar snippet
- ✓ Recuperar snippets
- ✓ Actualizar snippet
- ✓ Eliminar snippet

**Storage - Código:**
- ✓ Código por defecto
- ✓ Guardar/recuperar código

**Storage - Tema:**
- ✓ Tema por defecto (dark)
- ✓ Guardar/cambiar tema

Ejecutar tests:
```bash
npm run test
```

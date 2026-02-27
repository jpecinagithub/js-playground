import type { Snippet } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SNIPPETS_KEY = 'js-playground-snippets';
const CURRENT_KEY = 'js-playground-current';
const THEME_KEY = 'js-playground-theme';
const INITIALIZED_KEY = 'js-playground-initialized-v6';

export interface SnippetCategory {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
}

export const CATEGORIES: SnippetCategory[] = [
  {
    id: 'mis-snippets',
    name: 'Nivel 0 — Personal',
    topics: [
      { id: 'mis-snippets', name: 'Mis Snippets' },
    ]
  },
  {
    id: 'fundamentos',
    name: 'Nivel 1 — Fundamentos básicos',
    topics: [
      { id: 'variables', name: '1.1 Variables' },
      { id: 'tipos', name: '1.2 Tipos de datos' },
      { id: 'operadores', name: '1.3 Operadores' },
      { id: 'entrada-salida', name: '1.4 Entrada y salida de datos' },
    ]
  },
  {
    id: 'control',
    name: 'Nivel 2 — Control del programa',
    topics: [
      { id: 'condicionales', name: '2.1 Condicionales' },
      { id: 'bucles', name: '2.2 Bucles' },
      { id: 'break-continue', name: '2.3 Break y Continue' },
      { id: 'scope', name: '2.4 Scope' },
    ]
  },
  {
    id: 'funciones',
    name: 'Nivel 3 — Funciones',
    topics: [
      { id: 'funciones-intro', name: '3.1 Funciones básicas' },
      { id: 'parametros', name: '3.2 Parámetros' },
      { id: 'arrow', name: '3.3 Arrow functions' },
      { id: 'callbacks', name: '3.4 Callbacks' },
    ]
  },
  {
    id: 'estructuras',
    name: 'Nivel 4 — Estructuras de datos',
    topics: [
      { id: 'arrays', name: '4.1 Arrays' },
      { id: 'metodos-arrays', name: '4.2 Métodos de arrays' },
      { id: 'objetos', name: '4.3 Objetos' },
      { id: 'destructuring', name: '4.4 Destructuring' },
    ]
  },
  {
    id: 'conceptos',
    name: 'Nivel 5 — Conceptos clave',
    topics: [
      { id: 'this', name: '5.1 This' },
      { id: 'hoisting', name: '5.2 Hoisting' },
      { id: 'closures', name: '5.3 Closures' },
      { id: 'classes', name: '5.4 Clases' },
    ]
  },
  {
    id: 'asincronia',
    name: 'Nivel 6 — Asincronía',
    topics: [
      { id: 'callbacks-async', name: '6.1 Callbacks asíncronos' },
      { id: 'promises', name: '6.2 Promises' },
      { id: 'async-await', name: '6.3 Async/Await' },
      { id: 'fetch', name: '6.4 Fetch API' },
    ]
  },
  {
    id: 'es6',
    name: 'Nivel 7 — JavaScript moderno (ES6+)',
    topics: [
      { id: 'template-strings', name: '7.1 Template strings' },
      { id: 'destructuring', name: '7.2 Destructuring' },
      { id: 'spread', name: '7.3 Spread operator' },
      { id: 'modulos', name: '7.4 Módulos' },
    ]
  },
  {
    id: 'dom',
    name: 'Nivel 8 — Navegador (DOM)',
    topics: [
      { id: 'dom-intro', name: '8.1 DOM' },
      { id: 'seleccion', name: '8.2 Selección de elementos' },
      { id: 'eventos', name: '8.3 Eventos' },
      { id: 'manipulacion', name: '8.4 Manipulación del DOM' },
    ]
  },
  {
    id: 'avanzado',
    name: 'Nivel 9 — Avanzado',
    topics: [
      { id: 'errores', name: '9.1 Manejo de errores' },
      { id: 'json', name: '9.2 JSON' },
      { id: 'storage', name: '9.3 Storage' },
      { id: 'funcional', name: '9.4 Programación funcional' },
    ]
  },
  {
    id: 'profesional',
    name: 'Nivel 10 — Profesional',
    topics: [
      { id: 'debugging', name: '10.1 Debugging' },
      { id: 'testing', name: '10.2 Testing básico' },
      { id: 'performance', name: '10.3 Performance' },
      { id: 'typescript', name: '10.4 TypeScript básico' },
    ]
  },
];

const DEFAULT_CODE = `// Welcome to JS Playground!
// Write your JavaScript code here

console.log('Hello, World!');`;

const DEFAULT_SNIPPETS: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Nivel 1: Fundamentos
  { name: 'Declarar variables', category: 'fundamentos', topic: 'variables', code: '// Variables\nvar x = 1;\nlet y = 2;\nconst z = 3;\nconsole.log(x, y, z);' },
  { name: 'Let vs Const', category: 'fundamentos', topic: 'variables', code: '// Let puede cambiar, const no\nlet edad = 25;\nedad = 26;\n\nconst usuario = { nombre: "Ana" };\nusuario.nombre = "Maria"; // OK\nconsole.log(usuario);' },

  { name: 'Tipos primitivos', category: 'fundamentos', topic: 'tipos', code: '// Tipos: string, number, boolean\nconst nombre = "Carlos";\nconst edad = 30;\nconst activo = true;\n\nconsole.log(typeof nombre);\nconsole.log(typeof edad);\nconsole.log(typeof activo);' },
  { name: 'Arrays y objetos', category: 'fundamentos', topic: 'tipos', code: '// Array y objeto\nconst numeros = [1, 2, 3];\nconst persona = { nombre: "Ana", edad: 25 };\n\nconsole.log(numeros[0]);\nconsole.log(persona.nombre);' },

  { name: 'Operadores aritméticos', category: 'fundamentos', topic: 'operadores', code: '// +, -, *, /, %\nconsole.log(10 + 5);\nconsole.log(10 - 5);\nconsole.log(10 * 5);\nconsole.log(10 / 5);\nconsole.log(10 % 3);' },
  { name: 'Operadores comparación', category: 'fundamentos', topic: 'operadores', code: '// ==, ===, !=, <, >\nconsole.log(5 == "5");  // true\nconsole.log(5 === "5"); // false\nconsole.log(5 > 3);\nconsole.log(5 < 3);' },

  { name: 'Console.log básico', category: 'fundamentos', topic: 'entrada-salida', code: '// console.log\nconsole.log("Hola mundo");\nconsole.log("Numero:", 42);\nconsole.log("Multiple:", 1, 2, 3);' },
  { name: 'Console con estilos', category: 'fundamentos', topic: 'entrada-salida', code: '// Console con CSS (solo navegador)\nconsole.log("%cRojo", "color: red; font-size: 20px;");\nconsole.log("%cAzul", "color: blue; font-weight: bold;");' },

  // Nivel 2: Control
  { name: 'If - else', category: 'control', topic: 'condicionales', code: '// If else\nconst edad = 18;\n\nif (edad >= 18) {\n  console.log("Mayor de edad");\n} else {\n  console.log("Menor de edad");\n}' },
  { name: 'Switch', category: 'control', topic: 'condicionales', code: '// Switch\nconst dia = 2;\n\nswitch (dia) {\n  case 1: console.log("Lunes"); break;\n  case 2: console.log("Martes"); break;\n  default: console.log("Otro dia");\n}' },

  { name: 'For loop', category: 'control', topic: 'bucles', code: '// For clásico\nfor (let i = 0; i < 5; i++) {\n  console.log("Iteracion:", i);\n}' },
  { name: 'While y for...of', category: 'control', topic: 'bucles', code: '// While\nlet count = 0;\nwhile (count < 3) {\n  console.log(count);\n  count++;\n}\n\n// For...of\nconst frutas = ["manzana", "pera"];\nfor (const f of frutas) {\n  console.log(f);\n}' },

  { name: 'Break', category: 'control', topic: 'break-continue', code: '// Break - salir del bucle\nfor (let i = 1; i <= 10; i++) {\n  if (i % 7 === 0) {\n    console.log("Encontrado:", i);\n    break;\n  }\n}' },
  { name: 'Continue', category: 'control', topic: 'break-continue', code: '// Continue - saltar iteracion\nfor (let i = 1; i <= 5; i++) {\n  if (i % 2 !== 0) continue;\n  console.log("Par:", i);\n}' },

  { name: 'Scope global y local', category: 'control', topic: 'scope', code: '// Scope\nconst global = "soy global";\n\nfunction test() {\n  const local = "soy local";\n  console.log(global); // OK\n  console.log(local);  // OK\n}\n\n// console.log(local); // ERROR' },
  { name: 'Block scope', category: 'control', topic: 'scope', code: '// Block scope con let/const\n{\n  let x = 1;\n  const y = 2;\n  console.log("Dentro:", x, y);\n}\n// console.log(x); // ERROR\n\n// var NO tiene block scope\n{\n  var z = 3;\n}\nconsole.log("Var:", z); // OK' },

  // Nivel 3: Funciones
  { name: 'Declarar función', category: 'funciones', topic: 'funciones-intro', code: '// Funcion basica\nfunction saludar(nombre) {\n  return "Hola, " + nombre;\n}\n\nconsole.log(saludar("Carlos"));' },
  { name: 'Arrow function', category: 'funciones', topic: 'funciones-intro', code: '// Arrow function\nconst saludar = (nombre) => "Hola, " + nombre;\n\nconsole.log(saludar("Ana"));\n\n// Con cuerpo\nconst doble = (x) => {\n  return x * 2;\n};\nconsole.log(doble(5));' },

  { name: 'Parámetros por defecto', category: 'funciones', topic: 'parametros', code: '// Parametros por defecto\nfunction saludar(nombre = "Invitado") {\n  return "Hola, " + nombre;\n}\n\nconsole.log(saludar("Carlos"));\nconsole.log(saludar());' },
  { name: 'Rest parameters', category: 'funciones', topic: 'parametros', code: '// Rest parameters\nfunction sumar(...numeros) {\n  return numeros.reduce((a, b) => a + b, 0);\n}\n\nconsole.log(sumar(1, 2, 3, 4, 5));' },

  { name: 'Arrow function completa', category: 'funciones', topic: 'arrow', code: '// Arrow functions\nconst cuadrado = x => x * x;\nconsole.log(cuadrado(5));\n\nconst sumar = (a, b) => a + b;\nconsole.log(sumar(3, 4));' },
  { name: 'Arrow y this', category: 'funciones', topic: 'arrow', code: '// Arrow preserva this\nfunction Timer() {\n  this.segundos = 0;\n  \n  setInterval(() => {\n    this.segundos++;\n    console.log(this.segundos);\n  }, 1000);\n}\n// new Timer(); // Descomenta para probar' },

  { name: 'Callbacks básicos', category: 'funciones', topic: 'callbacks', code: '// Callback\nfunction procesar(array, fn) {\n  return array.map(fn);\n}\n\nconst numeros = [1, 2, 3];\nconst duplicados = procesar(numeros, x => x * 2);\nconsole.log(duplicados);' },
  { name: 'Callbacks en array', category: 'funciones', topic: 'callbacks', code: '// Array methods con callbacks\nconst nums = [1, 2, 3, 4, 5];\n\nconsole.log(nums.map(x => x * 2));\nconsole.log(nums.filter(x => x > 2));\nconsole.log(nums.reduce((a, b) => a + b, 0));' },

  // Nivel 4: Estructuras
  { name: 'Crear arrays', category: 'estructuras', topic: 'arrays', code: '// Arrays\nconst vacio = [];\nconst numeros = [1, 2, 3];\nconst mixto = [1, "dos", true];\n\nconsole.log(numeros[0]);\nconsole.log(numeros.length);\nnumeros.push(4);\nconsole.log(numeros);' },
  { name: 'Acceder a elementos', category: 'estructuras', topic: 'arrays', code: '// Destructuring array\nconst colores = ["rojo", "verde", "azul"];\n\nconst [primero, segundo, tercero] = colores;\nconsole.log(primero, segundo);\n\nconst [x, ...resto] = [1, 2, 3, 4];\nconsole.log(x, resto);' },

  { name: 'Map y Filter', category: 'estructuras', topic: 'metodos-arrays', code: '// map y filter\nconst nums = [1, 2, 3, 4, 5];\n\nconst duplicados = nums.map(x => x * 2);\nconsole.log(duplicados);\n\nconst pares = nums.filter(x => x % 2 === 0);\nconsole.log(pares);' },
  { name: 'Reduce', category: 'estructuras', topic: 'metodos-arrays', code: '// Reduce\nconst nums = [1, 2, 3, 4];\n\nconst suma = nums.reduce((acc, x) => acc + x, 0);\nconsole.log("Suma:", suma);\n\nconst max = nums.reduce((a, b) => a > b ? a : b);\nconsole.log("Max:", max);' },

  { name: 'Crear objetos', category: 'estructuras', topic: 'objetos', code: '// Objetos\nconst persona = {\n  nombre: "Carlos",\n  edad: 30,\n  ciudad: "Madrid"\n};\n\nconsole.log(persona.nombre);\nconsole.log(persona["edad"]);' },
  { name: 'Object methods', category: 'estructuras', topic: 'objetos', code: '// Object keys, values, entries\nconst persona = { nombre: "Ana", edad: 25 };\n\nconsole.log(Object.keys(persona));\nconsole.log(Object.values(persona));\nconsole.log(Object.entries(persona));' },

  { name: 'Destructuring objetos', category: 'estructuras', topic: 'destructuring', code: '// Destructuring objeto\nconst persona = { nombre: "Carlos", edad: 30 };\n\nconst { nombre, edad } = persona;\nconsole.log(nombre, edad);\n\nconst { nombre: n, edad: e } = persona;\nconsole.log(n, e);' },
  { name: 'Destructuring con defaults', category: 'estructuras', topic: 'destructuring', code: '// Destructuring con valores por defecto\nconst coords = { x: 10 };\n\nconst { x, y = 0 } = coords;\nconsole.log(x, y);' },

  // Nivel 5: Conceptos
  { name: 'This en objetos', category: 'conceptos', topic: 'this', code: '// This en objeto\nconst persona = {\n  nombre: "Carlos",\n  saludar() {\n    return "Hola, soy " + this.nombre;\n  }\n};\n\nconsole.log(persona.saludar());' },
  { name: 'This con bind', category: 'conceptos', topic: 'this', code: '// This y bind\nfunction saludar() {\n  return "Hola, " + this.nombre;\n}\n\nconst usuario = { nombre: "Ana" };\nconst saludarAna = saludar.bind(usuario);\n\nconsole.log(saludarAna());' },

  { name: 'Hoisting con var', category: 'conceptos', topic: 'hoisting', code: '// Hoisting\nconsole.log(x); // undefined (no error)\nvar x = 5;\nconsole.log(x); // 5' },
  { name: 'Hoisting con let', category: 'conceptos', topic: 'hoisting', code: '// let NO se hoistea igual\n// console.log(y); // ReferenceError!\nlet y = 10;\nconsole.log(y);' },

  { name: 'Closure básico', category: 'conceptos', topic: 'closures', code: '// Closure\nfunction crearContador() {\n  let cuenta = 0;\n  return function() {\n    cuenta++;\n    return cuenta;\n  };\n}\n\nconst contador = crearContador();\nconsole.log(contador()); // 1\nconsole.log(contador()); // 2' },
  { name: 'Closure con parámetros', category: 'conceptos', topic: 'closures', code: '// Closure con parametro\nfunction crearMultiplier(factor) {\n  return function(num) {\n    return num * factor;\n  };\n}\n\nconst por2 = crearMultiplier(2);\nconst por10 = crearMultiplier(10);\n\nconsole.log(por2(5));\nconsole.log(por10(5));' },

  { name: 'Clase básica', category: 'conceptos', topic: 'classes', code: '// Clase\nclass Persona {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n  \n  saludar() {\n    return "Hola, soy " + this.nombre;\n  }\n}\n\nconst ana = new Persona("Ana");\nconsole.log(ana.saludar());' },
  { name: 'Herencia', category: 'conceptos', topic: 'classes', code: '// Herencia\nclass Animal {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n}\n\nclass Perro extends Animal {\n  ladrar() {\n    return this.nombre + " dice: Guau!";\n  }\n}\n\nconst luna = new Perro("Luna");\nconsole.log(luna.ladrar());' },

  // Nivel 6: Asincronía
  { name: 'Callbacks asíncronos', category: 'asincronia', topic: 'callbacks-async', code: '// Callbacks asíncronos\nfunction obtenerDatos(callback) {\n  setTimeout(() => {\n    callback(null, { usuario: "Carlos" });\n  }, 1000);\n}\n\nobtenerDatos((err, data) => {\n  if (err) {\n    console.log("Error:", err);\n  } else {\n    console.log("Datos:", data);\n  }\n});' },
  { name: 'setTimeout y setInterval', category: 'asincronia', topic: 'callbacks-async', code: '// setTimeout y setInterval\nconsole.log("Inicio");\n\nsetTimeout(() => {\n  console.log("Después de 1 segundo");\n}, 1000);\n\nconst intervalo = setInterval(() => {\n  console.log("Cada segundo");\n}, 1000);\n\n// Detener después de 3 veces\nsetTimeout(() => {\n  clearInterval(intervalo);\n  console.log("Fin del intervalo");\n}, 3500);' },

  { name: 'Promise básica', category: 'asincronia', topic: 'promises', code: '// Promise\nconst promise = new Promise((resolve, reject) => {\n  setTimeout(() => resolve("Listo!"), 1000);\n});\n\npromise.then(result => console.log(result));' },
  { name: 'Promise.all', category: 'asincronia', topic: 'promises', code: '// Promise.all\nconst p1 = Promise.resolve(1);\nconst p2 = Promise.resolve(2);\nconst p3 = Promise.resolve(3);\n\nPromise.all([p1, p2, p3]).then(values => {\n  console.log(values);\n});' },

  { name: 'Async/Await', category: 'asincronia', topic: 'async-await', code: '// Async/Await\nasync function fetchData() {\n  return new Promise(resolve => {\n    setTimeout(() => resolve("Datos"), 1000);\n  });\n}\n\nasync function main() {\n  console.log("Cargando...");\n  const data = await fetchData();\n  console.log(data);\n}\n\nmain();' },
  { name: 'Try/Catch', category: 'asincronia', topic: 'async-await', code: '// Try/Catch con async\nasync function ejemplo() {\n  try {\n    const result = await Promise.reject("Error!");\n    console.log(result);\n  } catch (error) {\n    console.log("Capturado:", error);\n  }\n}\n\nejemlo();' },

  { name: 'Fetch API', category: 'asincronia', topic: 'fetch', code: '// Fetch API\n// fetch("https://jsonplaceholder.typicode.com/todos/1")\n//   .then(res => res.json())\n//   .then(data => console.log(data));\n\n// Simulado\nconst fakeFetch = () => Promise.resolve({ title: "Tarea 1", completed: false });\n\nfakeFetch().then(data => console.log(data));' },
  { name: 'Fetch con async', category: 'asincronia', topic: 'fetch', code: '// Fetch con async/await\nasync function loadData() {\n  // Simulado\n  const data = await Promise.resolve({ userId: 1, title: "Prueba" });\n  console.log(data);\n}\n\nloadData();' },

  // Nivel 7: ES6+
  { name: 'Template literals', category: 'es6', topic: 'template-strings', code: '// Template literals\nconst nombre = "Carlos";\nconst edad = 30;\n\nconsole.log(`Hola, me llamo ${nombre} y tengo ${edad} años`);\nconsole.log(`2 + 2 = ${2 + 2}`);\n\n// Multilínea\nconst html = `\n  <div>\n    <h1>Título</h1>\n  </div>\n`;\nconsole.log(html);' },
  { name: 'Tagged templates', category: 'es6', topic: 'template-strings', code: '// Tagged templates\nfunction mayusculas(strings, ...values) {\n  return strings.reduce((acc, str, i) => {\n    return acc + str + (values[i] ? values[i].toUpperCase() : "");\n  }, "");\n}\n\nconst nombre = "carlos";\nconst resultado = mayusculas`Hola ${nombre}, bienvenido`;\nconsole.log(resultado);' },

  { name: 'Destructuring arrays', category: 'es6', topic: 'destructuring', code: '// Destructuring\nconst nums = [1, 2, 3, 4, 5];\n\nconst [a, b, ...resto] = nums;\nconsole.log(a, b, resto);\n\n// Swap\nlet x = 1, y = 2;\n[x, y] = [y, x];\nconsole.log(x, y);\n\n// Valor por defecto\nconst [p = 0, q = 0] = [1];\nconsole.log(p, q);' },
  { name: 'Destructuring objetos anidado', category: 'es6', topic: 'destructuring', code: '// Destructuring anidado\nconst data = {\n  usuario: {\n    nombre: "Ana",\n    direccion: { ciudad: "Madrid" }\n  }\n};\n\nconst { usuario: { nombre, direccion: { ciudad } } } = data;\nconsole.log(nombre, ciudad);\n\n// Valores por defecto\nconst { role = "user" } = {};\nconsole.log(role);' },

  { name: 'Spread en arrays', category: 'es6', topic: 'spread', code: '// Spread operator\nconst arr1 = [1, 2, 3];\nconst arr2 = [4, 5, 6];\n\n// Combinar\nconst combinado = [...arr1, ...arr2];\nconsole.log(combinado);\n\n// Copiar\nconst copia = [...arr1];\nconsole.log(copia);\n\n// Argumentos\nconsole.log(Math.max(...[3, 1, 4, 1, 5]));' },
  { name: 'Spread en objetos', category: 'es6', topic: 'spread', code: '// Spread en objetos\nconst base = { x: 1, y: 2 };\nconst extenso = { ...base, z: 3 };\nconsole.log(extenso);\n\n// Sobrescribir\nconst obj1 = { a: 1, b: 2 };\nconst obj2 = { ...obj1, b: 10, c: 3 };\nconsole.log(obj2);\n\n// Combinar\nconst merged = { ...{ a: 1 }, ...{ b: 2 } };\nconsole.log(merged);' },

  { name: 'Import/Export básico', category: 'es6', topic: 'modulos', code: '// Módulos (simulado en un archivo)\n// export const PI = 3.14159;\n// export function suma(a, b) { return a + b; }\n\n// import { PI, suma } from "./modulo.js";\n\n// Simulado\nconst modulo = {\n  PI: 3.14159,\n  suma: (a, b) => a + b\n};\n\nconsole.log("PI:", modulo.PI);\nconsole.log("Suma:", modulo.suma(2, 3));' },
  { name: 'Export default', category: 'es6', topic: 'modulos', code: '// Export default\n// export default function() { ... }\n// import miFuncion from "./modulo.js";\n\n// Simulado con objeto\nconst app = {\n  init: () => console.log("Inicializado"),\n  config: { version: "1.0" }\n};\n\napp.init();\nconsole.log(app.config);' },

  // Nivel 8: DOM
  { name: '¿Qué es el DOM?', category: 'dom', topic: 'dom-intro', code: '// DOM - Document Object Model\n// console.log(document);\n\n// Simulación\nconst dom = {\n  title: "Mi Página",\n  body: "Contenido",\n  getElementById: (id) => ({ innerHTML: "Elemento " + id }),\n  querySelector: (sel) => ({ textContent: "Elemento" })\n};\n\nconsole.log("DOM:", dom.title);\nconsole.log("Body:", dom.body);' },
  { name: 'Árbol del DOM', category: 'dom', topic: 'dom-intro', code: '// Estructura del DOM\n// document\n//   ├── html\n//   │   ├── head\n//   │   └── body\n//   │       ├── div\n//   │       └── p\n\n// Simulado\nconst estructura = {\n  html: {\n    head: { title: "Título" },\n    body: {\n      div: { class: "container" },\n      p: "Párrafo"\n    }\n  }\n};\n\nconsole.log(JSON.stringify(estructura, null, 2));' },

  { name: 'querySelector', category: 'dom', topic: 'seleccion', code: '// Seleccionar elementos\n// const elemento = document.querySelector(".mi-clase");\n// const elementos = document.querySelectorAll("div");\n\n// Simulado\nconst mockDOM = {\n  querySelector: (sel) => ({ tag: sel, textContent: "Contenido" }),\n  querySelectorAll: (sel) => [\n    { textContent: "Elemento 1" },\n    { textContent: "Elemento 2" }\n  ]\n};\n\nconst div = mockDOM.querySelector("div");\nconsole.log(div);\n\nconst items = mockDOM.querySelectorAll(".item");\nconsole.log("Items:", items.length);' },
  { name: 'getElementById', category: 'dom', topic: 'seleccion', code: '// getElementById\n// const header = document.getElementById("header");\n\n// Simulado\nconst elementos = {\n  header: { id: "header", textContent: "Cabecera" },\n  footer: { id: "footer", textContent: "Pie" },\n  main: { id: "main", textContent: "Contenido principal" }\n};\n\nfunction getElementById(id) {\n  return elementos[id] || null;\n}\n\nconsole.log(getElementById("header"));\nconsole.log(getElementById("main"));' },

  { name: 'addEventListener', category: 'dom', topic: 'eventos', code: '// addEventListener\n// boton.addEventListener("click", () => console.log("Click!"));\n\n// Simulado\nconst boton = {\n  onclick: null,\n  addEventListener(evento, fn) {\n    if (evento === "click") this.onclick = fn;\n  },\n  click() {\n    if (this.onclick) this.onclick();\n  }\n};\n\nboton.addEventListener("click", () => console.log("Botón clickeado!"));\nboton.click();' },
  { name: 'Event object', category: 'dom', topic: 'eventos', code: '// Event object\n// elemento.addEventListener("click", (e) => {\n//   console.log(e.target);\n//   console.log(e.type);\n// });\n\n// Simulado\nconst evento = {\n  type: "click",\n  target: { tagName: "BUTTON", textContent: "Enviar" },\n  preventDefault: () => console.log("Prevent default"),\n  stopPropagation: () => console.log("Stop propagation")\n};\n\nconsole.log("Tipo:", evento.type);\nconsole.log("Target:", evento.target.tagName);\nevento.preventDefault();' },

  { name: 'Modificar contenido', category: 'dom', topic: 'manipulacion', code: '// Modificar innerHTML y textContent\n// elemento.innerHTML = "<b>Negrita</b>";\n// elemento.textContent = "Solo texto";\n\n// Simulado\nconst elemento = {\n  innerHTML: "<b>Negrita</b>",\n  textContent: "Solo texto plano"\n};\n\nconsole.log("HTML:", elemento.innerHTML);\nconsole.log("Texto:", elemento.textContent);\n\n// Asignar\nelemento.innerHTML = "<span>Nuevo contenido</span>";\nconsole.log("Actualizado:", elemento.innerHTML);' },
  { name: 'Crear elementos', category: 'dom', topic: 'manipulacion', code: '// Crear y añadir elementos\n// const nuevo = document.createElement("div");\n// nuevo.textContent = "Hola";\n// document.body.appendChild(nuevo);\n\n// Simulado\nconst dom = {\n  body: { children: [] },\n  createElement(tag) {\n    return { tag, textContent: "", children: [] };\n  },\n  appendChild(elemento) {\n    this.body.children.push(elemento);\n  }\n};\n\nconst div = dom.createElement("div");\ndiv.textContent = "Nuevo elemento";\ndom.appendChild(div);\n\nconsole.log("DOM:", dom.body.children);' },

  // Nivel 9: Avanzado
  { name: 'Try/Catch', category: 'avanzado', topic: 'errores', code: '// Try/Catch\ntry {\n  const result = 10 / 0;\n  console.log("Resultado:", result);\n} catch (error) {\n  console.log("Error:", error.message);\n} finally {\n  console.log("Siempre se ejecuta");\n}' },
  { name: 'Lanzar errores', category: 'avanzado', topic: 'errores', code: '// Throw errors\nfunction dividir(a, b) {\n  if (b === 0) {\n    throw new Error("No se puede dividir por cero");\n  }\n  return a / b;\n}\n\ntry {\n  console.log(dividir(10, 0));\n} catch (e) {\n  console.log("Capturado:", e.message);\n}' },

  { name: 'JSON.parse', category: 'avanzado', topic: 'json', code: '// JSON.parse y JSON.stringify\nconst jsonStr = \'{"nombre": "Carlos", "edad": 30}\';\nconst obj = JSON.parse(jsonStr);\nconsole.log(obj);\n\n// Convertir a JSON\nconst persona = { nombre: "Ana", ciudad: "Madrid" };\nconst json = JSON.stringify(persona);\nconsole.log(json);\n\n// Pretty print\nconsole.log(JSON.stringify(persona, null, 2));' },
  { name: 'JSON con arrays', category: 'avanzado', topic: 'json', code: '// JSON con arrays\nconst jsonArray = \'[1, 2, 3, 4, 5]\';\nconst nums = JSON.parse(jsonArray);\nconsole.log(nums);\n\nconst usuarios = [\n  { nombre: "Ana", edad: 25 },\n  { nombre: "Carlos", edad: 30 }\n];\n\nconsole.log(JSON.stringify(usuarios, null, 2));' },

  { name: 'LocalStorage', category: 'avanzado', topic: 'storage', code: '// LocalStorage\nlocalStorage.setItem("usuario", "Carlos");\nlocalStorage.setItem("token", "abc123");\n\nconsole.log("Usuario:", localStorage.getItem("usuario"));\nconsole.log("Token:", localStorage.getItem("token"));\n\n// Eliminar\nlocalStorage.removeItem("token");\nconsole.log("Token tras eliminar:", localStorage.getItem("token"));' },
  { name: 'SessionStorage', category: 'avanzado', topic: 'storage', code: '// SessionStorage (se borra al cerrar)\nsessionStorage.setItem("carrito", JSON.stringify([1, 2, 3]));\n\nconst carrito = JSON.parse(sessionStorage.getItem("carrito"));\nconsole.log("Carrito:", carrito);\n\n// Limpiar todo\nsessionStorage.clear();\nconsole.log("Vacío:", sessionStorage.length);' },

  { name: 'map/filter/reduce', category: 'avanzado', topic: 'funcional', code: '// Programación funcional\nconst nums = [1, 2, 3, 4, 5];\n\nconst resultado = nums\n  .filter(x => x % 2 === 0)\n  .map(x => x * 2)\n  .reduce((a, b) => a + b, 0);\n\nconsole.log("Resultado:", resultado);\n\n// Chain completo\nconst usuarios = [\n  { nombre: "Ana", edad: 25 },\n  { nombre: "Carlos", edad: 17 },\n  { nombre: "Pedro", edad: 30 }\n];\n\nconst nombresMayores = usuarios\n  .filter(u => u.edad >= 18)\n  .map(u => u.nombre);\n\nconsole.log("Mayores de edad:", nombresMayores);' },
  { name: 'Funciones puras', category: 'avanzado', topic: 'funcional', code: '// Funciones puras\n// Pura: mismo input = mismo output, sin副作用\nconst sumar = (a, b) => a + b;\nconsole.log("Suma:", sumar(2, 3));\n\n// Impura: modificael estado\let total = 0;\nconst agregar = (valor) => {\n  total += valor;\n  return total;\n};\n\nconsole.log("Agregar 5:", agregar(5));\nconsole.log("Agregar 3:", agregar(3));\n\n// Mejor: función pura\nconst agregarPuro = (array, valor) => [...array, valor];\nconst nuevoArray = agregarPuro([1, 2], 3);\nconsole.log("Nuevo array:", nuevoArray);' },

  // Nivel 10: Profesional
  { name: 'Console debugging', category: 'profesional', topic: 'debugging', code: '// Debugging\nconsole.log("Debug 1");\nconsole.warn("Advertencia");\nconsole.error("Error");\n\n// Tabla\nconsole.table([\n  { nombre: "Ana", edad: 25 },\n  { nombre: "Carlos", edad: 30 }\n]);\n\n// Grupo\nconsole.group("Usuario");\nconsole.log("Nombre: Ana");\nconsole.log("Edad: 25");\nconsole.groupEnd();\n\n// Tiempo\nconsole.time("miBucle");\nfor (let i = 0; i < 1000; i++) {}\nconsole.timeEnd("miBucle");' },
  { name: 'Breakpoints', category: 'profesional', topic: 'debugging', code: '// Breakpoints (en DevTools)\n// 1. Abre DevTools (F12)\n// 2. Ve a Sources > tu archivo\n// 3. Haz clic en el número de línea para poner breakpoint\n// 4. Recarga la página\n\nfunction calcular(a, b) { // ← breakpoint aquí\n  return a + b; // ← o aquí\n}\n\nconst resultado = calcular(5, 3);\nconsole.log(resultado);\n\n// Tambien puedes usar debugger;\nfunction ejemplo() {\n  debugger; // Pausa automática aquí\n  console.log("Continuará tras continuar");\n}\nejemplo();' },

  { name: 'Test básico con console', category: 'profesional', topic: 'testing', code: '// Testing básico\nfunction sumar(a, b) {\n  return a + b;\n}\n\n// Tests\nfunction test(nombre, fn) {\n  try {\n    fn();\n    console.log("✓", nombre);\n  } catch (e) {\n    console.error("✗", nombre, "-", e.message);\n  }\n}\n\nfunction assert(cond, msg) {\n  if (!cond) throw new Error(msg);\n}\n\ntest("2 + 3 = 5", () => {\n  assert(sumar(2, 3) === 5, "Expected 5");\n});\n\ntest("0 + 0 = 0", () => {\n  assert(sumar(0, 0) === 0, "Expected 0");\n});' },
  { name: 'Test assertions', category: 'profesional', topic: 'testing', code: '// Assertions básicas\nconst assert = (condition, message) => {\n  if (!condition) throw new Error("Assertion failed: " + message);\n};\n\n// Tests de funciones\nfunction potencia(base, exp) {\n  return base ** exp;\n}\n\nassert(potencia(2, 3) === 8, "2^3 = 8");\nassert(potencia(5, 0) === 1, "x^0 = 1");\nassert(potencia(0, 5) === 0, "0^x = 0");\n\nconsole.log("Todos los tests pasaron!");' },

  { name: 'Performance básico', category: 'profesional', topic: 'performance', code: '// Performance\n// console.time - medir tiempo\nconsole.time("Bucle for");\nlet sum = 0;\nfor (let i = 0; i < 1000000; i++) {\n  sum += i;\n}\nconsole.timeEnd("Bucle for");\n\n// console.time - reduce\nconsole.time("Reduce");\nconst nums = Array.from({ length: 1000000 }, (_, i) => i);\nconst sum2 = nums.reduce((a, b) => a + b, 0);\nconsole.timeEnd("Reduce");\n\nconsole.log("Suma:", sum2);' },
  { name: 'Optimizar bucles', category: 'profesional', topic: 'performance', code: '// Optimizaciones\n// 1. Cachear length\nconst arr = [1, 2, 3, 4, 5];\nfor (let i = 0, len = arr.length; i < len; i++) {\n  console.log(arr[i]);\n}\n\n// 2. Usar for...of en vez de forEach\nfor (const item of arr) {\n  console.log(item);\n}\n\n// 3. Crear nodos fuera del bucle\nconst items = ["a", "b", "c"];\n// Malo:\n// items.forEach(item => document.body.appendChild(...));\n// Bueno: construir string o fragmento\nconst html = items.map(i => `<li>${i}</li>`).join("");\nconsole.log("HTML:", html);' },

  { name: 'TypeScript básico', category: 'profesional', topic: 'typescript', code: '// TypeScript - tipos básicos\n// Types\nlet nombre: string = "Carlos";\nlet edad: number = 30;\nlet activo: boolean = true;\n\n// Arrays\nlet numeros: number[] = [1, 2, 3];\nlet textos: Array<string> = ["a", "b"];\n\n// Objetos\ninterface Usuario {\n  nombre: string;\n  edad: number;\n}\n\nconst usuario: Usuario = {\n  nombre: "Ana",\n  edad: 25\n};\n\nconsole.log(nombre, edad, usuario);' },
  { name: 'TypeScript funciones', category: 'profesional', topic: 'typescript', code: '// TypeScript - funciones tipadas\n// Tipos en funciones\nfunction saludar(nombre: string): string {\n  return "Hola, " + nombre;\n}\n\n// Arrow con tipos\nconst sumar = (a: number, b: number): number => a + b;\n\n// Parámetros opcionales\nfunction crearUsuario(nombre: string, edad?: number): object {\n  return { nombre, edad: edad ?? 0 };\n}\n\nconsole.log(saludar("Carlos"));\nconsole.log(sumar(2, 3));\nconsole.log(crearUsuario("Ana", 25));\nconsole.log(crearUsuario("Anonimo"));' },
];

function initializeDefaultSnippets(): void {
  if (localStorage.getItem(INITIALIZED_KEY)) return;
  
  const snippets: Snippet[] = DEFAULT_SNIPPETS.map(s => ({
    ...s,
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
  
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
  localStorage.setItem(INITIALIZED_KEY, 'true');
}

export function getSnippets(): Snippet[] {
  initializeDefaultSnippets();
  
  try {
    const data = localStorage.getItem(SNIPPETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Snippet {
  const snippets = getSnippets();
  const newSnippet: Snippet = {
    ...snippet,
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  snippets.unshift(newSnippet);
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
  return newSnippet;
}

export function updateSnippet(id: string, updates: Partial<Omit<Snippet, 'id' | 'createdAt'>>): Snippet | null {
  const snippets = getSnippets();
  const index = snippets.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  snippets[index] = {
    ...snippets[index],
    ...updates,
    updatedAt: Date.now(),
  };
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
  return snippets[index];
}

export function deleteSnippet(id: string): boolean {
  const snippets = getSnippets();
  const filtered = snippets.filter(s => s.id !== id);
  if (filtered.length === snippets.length) return false;
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(filtered));
  return true;
}

export function getCurrentCode(): string {
  return localStorage.getItem(CURRENT_KEY) || DEFAULT_CODE;
}

export function setCurrentCode(code: string): void {
  localStorage.setItem(CURRENT_KEY, code);
}

export function getTheme(): 'light' | 'dark' {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'dark';
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_KEY, theme);
}

export { DEFAULT_CODE };

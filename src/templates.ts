import type { Lang } from './i18n';

export type TemplateCategory = 'fundamentals' | 'modern' | 'async' | 'other';

export interface Template {
  id: string;
  name: Record<Lang, string>;
  category: TemplateCategory;
  explanation: Record<Lang, string>;
  code: string;
}

export const DEFAULT_CODE = `const nombre = "JavaScript";

console.log(\`Hola \${nombre}!\`);

const numeros = [1, 2, 3, 4, 5];

const dobles = numeros.map(numero => numero * 2);

console.log(dobles);
`;

export const TEMPLATES: Template[] = [
  {
    id: 'variables',
    name: { en: 'Variables and types', es: 'Variables y tipos' },
    category: 'fundamentals',
    explanation: {
      en: "Store values in named containers. const can't be reassigned; let can.",
      es: 'Guarda valores en contenedores con nombre. const no se puede reasignar; let sí.',
    },
    code: `const nombre = "Ana";
let edad = 28;
const activo = true;

console.log(nombre);
console.log(edad);
console.log(activo);
`,
  },
  {
    id: 'conditionals',
    name: { en: 'Conditionals', es: 'Condicionales' },
    category: 'fundamentals',
    explanation: {
      en: 'Run different code depending on whether a condition is true or false.',
      es: 'Ejecuta código distinto según una condición sea verdadera o falsa.',
    },
    code: `const edad = 20;

if (edad >= 18) {
  console.log("Mayor de edad");
} else {
  console.log("Menor de edad");
}
`,
  },
  {
    id: 'functions',
    name: { en: 'Functions', es: 'Funciones' },
    category: 'fundamentals',
    explanation: {
      en: 'Reusable blocks of code that take inputs and return an output.',
      es: 'Bloques de código reutilizables que reciben entradas y devuelven una salida.',
    },
    code: `function sumar(a, b) {
  return a + b;
}

console.log(sumar(4, 7));
`,
  },
  {
    id: 'arrow',
    name: { en: 'Arrow functions', es: 'Arrow functions' },
    category: 'modern',
    explanation: {
      en: 'A shorter way to write functions, very common in modern JavaScript.',
      es: 'Una forma más corta de escribir funciones, muy común en JavaScript moderno.',
    },
    code: `const multiplicar = (a, b) => a * b;

console.log(multiplicar(4, 5));
`,
  },
  {
    id: 'arrays',
    name: { en: 'Arrays', es: 'Arrays' },
    category: 'fundamentals',
    explanation: {
      en: 'Ordered lists of values, accessed by their position starting at 0.',
      es: 'Listas ordenadas de valores, accesibles por su posición empezando en 0.',
    },
    code: `const numeros = [1, 2, 3, 4, 5];

console.log(numeros);
console.log(numeros[0]);
`,
  },
  {
    id: 'map-filter-reduce',
    name: { en: 'map / filter / reduce', es: 'map / filter / reduce' },
    category: 'modern',
    explanation: {
      en: 'Transform (map), select (filter) and combine (reduce) the elements of an array.',
      es: 'Transforma (map), selecciona (filter) y combina (reduce) los elementos de un array.',
    },
    code: `const numeros = [1, 2, 3, 4, 5];

const dobles = numeros.map(n => n * 2);
const pares = numeros.filter(n => n % 2 === 0);
const suma = numeros.reduce((total, n) => total + n, 0);

console.log(dobles);
console.log(pares);
console.log(suma);
`,
  },
  {
    id: 'objects',
    name: { en: 'Objects', es: 'Objetos' },
    category: 'fundamentals',
    explanation: {
      en: 'Group related data as key–value pairs and read it with dot notation.',
      es: 'Agrupa datos relacionados como pares clave–valor y léelos con notación de punto.',
    },
    code: `const usuario = {
  nombre: "Carlos",
  edad: 32,
  ciudad: "Madrid"
};

console.log(usuario);
console.log(usuario.nombre);
`,
  },
  {
    id: 'destructuring',
    name: { en: 'Destructuring', es: 'Destructuring' },
    category: 'modern',
    explanation: {
      en: 'Extract values from arrays or objects and assign them directly to variables.',
      es: 'Extrae valores de arrays u objetos y asígnalos directamente a variables.',
    },
    code: `const usuario = {
  nombre: "Laura",
  edad: 29
};

const { nombre, edad } = usuario;

console.log(nombre);
console.log(edad);
`,
  },
  {
    id: 'spread',
    name: { en: 'Spread operator', es: 'Operador spread' },
    category: 'modern',
    explanation: {
      en: 'Expand an array or object into individual elements with ...',
      es: 'Expande un array u objeto en elementos individuales con ...',
    },
    code: `const numeros = [1, 2, 3];

const nuevosNumeros = [...numeros, 4, 5];

console.log(nuevosNumeros);
`,
  },
  {
    id: 'loops',
    name: { en: 'Loops', es: 'Bucles' },
    category: 'fundamentals',
    explanation: {
      en: 'Repeat an action for each element of a collection with for...of.',
      es: 'Repite una acción para cada elemento de una colección con for...of.',
    },
    code: `const frutas = ["manzana", "pera", "naranja"];

for (const fruta of frutas) {
  console.log(fruta);
}
`,
  },
  {
    id: 'callbacks',
    name: { en: 'Callbacks', es: 'Callbacks' },
    category: 'async',
    explanation: {
      en: 'Pass a function as an argument so it runs when the task finishes.',
      es: 'Pasa una función como argumento para que se ejecute cuando la tarea termine.',
    },
    code: `function procesarUsuario(nombre, callback) {
  console.log(\`Procesando a \${nombre}...\`);

  callback(nombre);
}

procesarUsuario("Ana", usuario => {
  console.log(\`Usuario \${usuario} procesado\`);
});
`,
  },
  {
    id: 'promises',
    name: { en: 'Promises', es: 'Promesas' },
    category: 'async',
    explanation: {
      en: 'Represent a value that will be available in the future; .then() runs when it resolves.',
      es: 'Representa un valor que estará disponible en el futuro; .then() se ejecuta cuando se resuelve.',
    },
    code: `const esperar = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("Operación terminada");
    }, 1000);
  });
};

esperar().then(resultado => {
  console.log(resultado);
});
`,
  },
  {
    id: 'async-await',
    name: { en: 'Async / Await', es: 'Async / Await' },
    category: 'async',
    explanation: {
      en: 'Write asynchronous code that reads like synchronous code, without nested callbacks.',
      es: 'Escribe código asíncrono que se lee como síncrono, sin callbacks anidados.',
    },
    code: `function esperar() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("Datos recibidos");
    }, 1000);
  });
}

async function ejecutar() {
  console.log("Esperando...");

  const resultado = await esperar();

  console.log(resultado);
}

ejecutar();
`,
  },
  {
    id: 'fetch',
    name: { en: 'Fetch API', es: 'Fetch API' },
    category: 'async',
    explanation: {
      en: 'Request data from a public API over the network and read it as JSON.',
      es: 'Pide datos a una API pública a través de la red y léelos como JSON.',
    },
    code: `async function cargarDatos() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");

  const data = await response.json();

  console.log(data);
}

cargarDatos();
`,
  },
  {
    id: 'classes',
    name: { en: 'Classes', es: 'Clases' },
    category: 'other',
    explanation: {
      en: 'Blueprints for creating objects with shared structure and behavior.',
      es: 'Plantillas para crear objetos con estructura y comportamiento compartidos.',
    },
    code: `class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }

  presentarse() {
    return \`Soy \${this.nombre} y tengo \${this.edad} años\`;
  }
}

const persona = new Persona("Miguel", 35);

console.log(persona.presentarse());
`,
  },
];

export const templateById = (id: string | null): Template | undefined =>
  TEMPLATES.find((t) => t.id === id);

import type { Lang } from './i18n';

// Precomputed step traces for the "step by step" mode. Only defined for the
// basic templates where it makes sense — no attempt at a generic debugger.

export interface StepDef {
  /** 1-based line number to highlight in the editor */
  line: number;
  /** [name, display value] pairs visible at this point */
  vars: Array<[string, string]>;
  /** console output accumulated so far */
  out?: string;
  note: Record<Lang, string>;
  isResult?: boolean;
}

export const STEPS: Record<string, StepDef[]> = {
  variables: [
    {
      line: 1,
      vars: [['nombre', '"Ana"']],
      note: {
        en: 'A constant named nombre is created holding the text "Ana".',
        es: 'Se crea una constante llamada nombre con el texto "Ana".',
      },
    },
    {
      line: 2,
      vars: [
        ['nombre', '"Ana"'],
        ['edad', '28'],
      ],
      note: {
        en: 'A variable edad is created with the number 28. Unlike const, let can be reassigned later.',
        es: 'Se crea una variable edad con el número 28. A diferencia de const, let sí se puede reasignar.',
      },
    },
    {
      line: 3,
      vars: [
        ['nombre', '"Ana"'],
        ['edad', '28'],
        ['activo', 'true'],
      ],
      note: {
        en: 'A constant activo stores the boolean true.',
        es: 'Una constante activo guarda el booleano true.',
      },
    },
    {
      line: 5,
      vars: [
        ['nombre', '"Ana"'],
        ['edad', '28'],
        ['activo', 'true'],
      ],
      out: 'Ana',
      note: {
        en: 'console.log prints the value of nombre.',
        es: 'console.log imprime el valor de nombre.',
      },
    },
    {
      line: 6,
      vars: [
        ['nombre', '"Ana"'],
        ['edad', '28'],
        ['activo', 'true'],
      ],
      out: 'Ana\n28',
      note: {
        en: 'Now the value of edad is printed.',
        es: 'Ahora se imprime el valor de edad.',
      },
    },
    {
      line: 7,
      vars: [
        ['nombre', '"Ana"'],
        ['edad', '28'],
        ['activo', 'true'],
      ],
      out: 'Ana\n28\ntrue',
      isResult: true,
      note: {
        en: 'All three values were printed, each on its own line.',
        es: 'Los tres valores se imprimieron, cada uno en su línea.',
      },
    },
  ],

  conditionals: [
    {
      line: 1,
      vars: [['edad', '20']],
      note: {
        en: 'edad is set to 20.',
        es: 'edad vale 20.',
      },
    },
    {
      line: 3,
      vars: [['edad', '20']],
      note: {
        en: 'Is edad >= 18? 20 >= 18 is true, so the first branch runs.',
        es: '¿edad >= 18? 20 >= 18 es verdadero, así que se ejecuta la primera rama.',
      },
    },
    {
      line: 4,
      vars: [['edad', '20']],
      out: 'Mayor de edad',
      isResult: true,
      note: {
        en: 'The else branch is skipped entirely.',
        es: 'La rama else se omite por completo.',
      },
    },
  ],

  functions: [
    {
      line: 1,
      vars: [],
      note: {
        en: 'The function sumar is defined. Nothing runs yet — it only runs when called.',
        es: 'Se define la función sumar. Aún no se ejecuta nada: solo se ejecutará cuando se la llame.',
      },
    },
    {
      line: 5,
      vars: [
        ['a', '4'],
        ['b', '7'],
      ],
      note: {
        en: 'sumar(4, 7) is called: a becomes 4 and b becomes 7.',
        es: 'Se llama a sumar(4, 7): a vale 4 y b vale 7.',
      },
    },
    {
      line: 2,
      vars: [
        ['a', '4'],
        ['b', '7'],
      ],
      note: {
        en: 'return a + b sends 11 back to the caller.',
        es: 'return a + b devuelve 11 a quien llamó a la función.',
      },
    },
    {
      line: 5,
      vars: [
        ['a', '4'],
        ['b', '7'],
      ],
      out: '11',
      isResult: true,
      note: {
        en: 'console.log prints the returned value: 11.',
        es: 'console.log imprime el valor devuelto: 11.',
      },
    },
  ],

  loops: [
    {
      line: 1,
      vars: [['frutas', '["manzana", "pera", "naranja"]']],
      note: {
        en: 'The array frutas is created with three elements.',
        es: 'Se crea el array frutas con tres elementos.',
      },
    },
    {
      line: 3,
      vars: [
        ['frutas', '["manzana", "pera", "naranja"]'],
        ['fruta', '"manzana"'],
      ],
      note: {
        en: 'fruta takes the first element: "manzana".',
        es: 'fruta toma el primer elemento: "manzana".',
      },
    },
    {
      line: 4,
      vars: [['fruta', '"manzana"']],
      out: 'manzana',
      note: {
        en: 'It gets printed.',
        es: 'Se imprime.',
      },
    },
    {
      line: 3,
      vars: [['fruta', '"pera"']],
      out: 'manzana',
      note: {
        en: 'fruta moves to the second element: "pera".',
        es: 'fruta pasa al segundo elemento: "pera".',
      },
    },
    {
      line: 4,
      vars: [['fruta', '"pera"']],
      out: 'manzana\npera',
      note: {
        en: 'Printed as well.',
        es: 'También se imprime.',
      },
    },
    {
      line: 3,
      vars: [['fruta', '"naranja"']],
      out: 'manzana\npera',
      note: {
        en: 'fruta takes the last element: "naranja".',
        es: 'fruta toma el último elemento: "naranja".',
      },
    },
    {
      line: 4,
      vars: [['fruta', '"naranja"']],
      out: 'manzana\npera\nnaranja',
      isResult: true,
      note: {
        en: 'The loop ends — there are no more elements.',
        es: 'El bucle termina: no quedan más elementos.',
      },
    },
  ],

  'map-filter-reduce': [
    {
      line: 1,
      vars: [['numeros', '[1, 2, 3, 4, 5]']],
      note: {
        en: 'The array numeros is created.',
        es: 'Se crea el array numeros.',
      },
    },
    {
      line: 3,
      vars: [
        ['numeros', '[1, 2, 3, 4, 5]'],
        ['dobles', '[2, 4, 6, 8, 10]'],
      ],
      note: {
        en: 'map runs n => n * 2 on every element and builds a brand-new array.',
        es: 'map aplica n => n * 2 a cada elemento y construye un array nuevo.',
      },
    },
    {
      line: 4,
      vars: [
        ['numeros', '[1, 2, 3, 4, 5]'],
        ['dobles', '[2, 4, 6, 8, 10]'],
        ['pares', '[2, 4]'],
      ],
      note: {
        en: 'filter keeps only the elements where n % 2 === 0.',
        es: 'filter conserva solo los elementos donde n % 2 === 0.',
      },
    },
    {
      line: 5,
      vars: [
        ['numeros', '[1, 2, 3, 4, 5]'],
        ['dobles', '[2, 4, 6, 8, 10]'],
        ['pares', '[2, 4]'],
        ['suma', '15'],
      ],
      note: {
        en: 'reduce combines everything into a single value: 1 + 2 + 3 + 4 + 5 = 15.',
        es: 'reduce combina todo en un único valor: 1 + 2 + 3 + 4 + 5 = 15.',
      },
    },
    {
      line: 7,
      vars: [
        ['dobles', '[2, 4, 6, 8, 10]'],
        ['pares', '[2, 4]'],
        ['suma', '15'],
      ],
      out: '[ 2, 4, 6, 8, 10 ]',
      note: {
        en: 'The doubled array is printed.',
        es: 'Se imprime el array duplicado.',
      },
    },
    {
      line: 8,
      vars: [
        ['dobles', '[2, 4, 6, 8, 10]'],
        ['pares', '[2, 4]'],
        ['suma', '15'],
      ],
      out: '[ 2, 4, 6, 8, 10 ]\n[ 2, 4 ]',
      note: {
        en: 'The filtered array is printed.',
        es: 'Se imprime el array filtrado.',
      },
    },
    {
      line: 9,
      vars: [
        ['dobles', '[2, 4, 6, 8, 10]'],
        ['pares', '[2, 4]'],
        ['suma', '15'],
      ],
      out: '[ 2, 4, 6, 8, 10 ]\n[ 2, 4 ]\n15',
      isResult: true,
      note: {
        en: 'The total is printed. One array, three different questions answered.',
        es: 'Se imprime el total. Un array, tres preguntas distintas respondidas.',
      },
    },
  ],
};

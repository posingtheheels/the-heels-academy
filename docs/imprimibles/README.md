# Imprimibles

Los nueve descargables, en origen. Cada uno es un HTML que se imprime a PDF con
Chrome en modo headless. El estilo está compartido en `base.css`, así que
cambiarlo ahí cambia los nueve a la vez.

Todos caben en **una cara de A4** y están pensados para imprimirse en blanco y
negro: los rosas son fondos, nunca texto.

---

## Dónde vive cada uno

**Los cuatro de la masterclass son gratuitos.** Se entregan en la sesión y en el
replay, así que su PDF vive en `public/masterclass/` y se sirve directo. Los
nombres de fichero los fija `DESCARGABLES` en `src/lib/masterclass.ts`: si
cambias uno aquí, cámbialo allí.

| Fichero | Para qué |
|---|---|
| `hoja-de-puntuacion` | El diagnóstico sobre 45. También se usa en la lección 1 y en la última de Fundamentos, y en las semanas 9 y 12 del programa |
| `checklist-siete-puntos` | Los siete puntos, para el espejo |
| `mapa-musical` | Plantilla de segundo · acento · pose |
| `dia-d-y-maleta` | Cronograma, bolsa, backstage e imprevistos |

**Los cinco del curso son contenido de pago.** No van a `public/`: ahí cualquiera
adivinaría la URL. Su sitio es el bucket privado de Supabase, servidos con
enlace firmado como `LessonResource`, igual que dice la especificación de
Formación Academy. Mientras esa parte no esté construida, el PDF generado se
queda aquí y se sube a mano.

| Fichero | Módulo |
|---|---|
| `criterios-por-categoria` | M1 · Antes de posar |
| `cuatro-cuartos` | M2 · Los cuartos de giro |
| *(fichas de poses)* | M3 · **Pendiente** |
| `recorrido-tarima` | M5 · Caminar y presentarse |
| `plan-12-semanas` | M6 · Entrenar el posing en casa |

El M4 no lleva recurso a propósito: se practica delante del espejo, no en papel,
y conviene decirlo en cámara para que no lo echen de menos.

---

## Regenerar un PDF

```
node scripts/imprimir-pdf.js plan-12-semanas
```

Sin argumentos los regenera todos. El script deja cada PDF en su sitio: los
cuatro de la masterclass en `public/masterclass/` y los del curso aquí.

Necesita Chrome o Edge instalado, nada más. Las fuentes se descargan de Google
Fonts al imprimir, así que hace falta conexión; si no la hay, el PDF sale con
las fuentes de respaldo y se nota.

---

## Si tocas el contenido

Los textos no son decorativos: repiten, a propósito y palabra por palabra, el
vocabulario de los guiones de Fundamentos y del dossier del programa. Los siete
puntos se llaman igual en los tres sitios, y «se llega ya colocada» es la misma
frase en el guion del módulo 2 y en el imprimible de los cuartos.

Si cambias un nombre aquí, búscalo en `docs/guiones-fundamentos.md` y en
`Camino-a-la-Tarima-Dossier.pdf` antes de darlo por hecho.

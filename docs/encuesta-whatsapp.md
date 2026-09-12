# Cuestionario de satisfacción por WhatsApp

Formulario público en `/encuesta`, panel de respuestas en `/admin/encuestas`.
El enlace se reparte a mano por WhatsApp: la página no se indexa en Google.

---

## 1. Puesta en marcha (se hace una sola vez)

### 1.1 Crear la tabla

```bash
npx prisma db push
```

Añade la tabla `Survey`. Es una tabla nueva, no toca ninguna de las que ya
existen.

Después, si quieres dejarla con las mismas políticas que el resto:

```bash
node scripts/enable-rls.js
```

### 1.2 Crear el bucket de los vídeos

En Supabase → **Storage** → *New bucket*:

| Campo | Valor |
| --- | --- |
| Name | `encuestas` |
| Public bucket | **NO** (desmarcado) |
| File size limit | `50 MB` (el tope global del proyecto en Supabase) |
| Allowed MIME types | `video/mp4,video/quicktime,video/webm,video/x-matroska,video/3gpp` |

Los MIME types van **separados por comas**, sin espacios ni saltos de línea: el
campo de Supabase los parte por comas y si les pones espacios alrededor no
reconoce el tipo.

Los 50 MB no son una cifra elegida: es el límite global del proyecto, y el
código (`MAX_VIDEO_BYTES` en `src/lib/encuesta.ts`) está puesto para coincidir.
Si algún día subes ese límite global en *Storage Settings*, cambia también esa
constante — si el código permitiera más que el bucket, la subida reventaría al
final en vez de avisar antes de empezar.

El bucket tiene que ser **privado**. Los vídeos son de alumnas reales: el panel
de admin los reproduce con un enlace firmado que caduca en una hora, así que
nadie puede compartir la URL por ahí.

No hace falta tocar las políticas de RLS del bucket: la subida se firma desde el
servidor y la reproducción también.

### 1.3 Comprobar

1. Abre `/encuesta` y manda una respuesta de prueba con un vídeo corto.
2. Entra en `/admin` → **Encuestas** y comprueba que aparece y que el vídeo se ve.
3. Bórrala desde el propio panel (borra también el vídeo del bucket).

---

## 2. Los mensajes de WhatsApp

Están dentro del panel (`/admin/encuestas`) con un botón de **Copiar mensaje**
que ya te mete el enlace. Sustituye `{nombre}` por el de cada alumna.

### Envío general

> ¡Hola {nombre}! 👠
>
> Estoy preparando la nueva temporada de The Heels y quiero que salga a tu
> medida, así que voy a preguntarte directamente a ti.
>
> Son 2 minutos, se contesta desde el móvil y puedes dejarlo en anónimo si
> quieres:
> https://posingtheheels.com/encuesta
>
> Y si te apetece, al final hay un botón para grabarme un vídeo de 30 segundos
> contándome qué tal te va. Me hace una ilusión enorme verlos. 🤍
>
> Gracias por estar ahí.

### Después de un campeonato

> ¡{nombre}! 🏆
>
> Todavía estoy con la emoción de verte sobre la tarima. Ahora que lo tienes
> fresco, cuéntame cómo lo viviste y qué tal te preparé para ese momento.
>
> Son 2 minutos: https://posingtheheels.com/encuesta
>
> Si te grabas un vídeo contándolo, lo guardo como oro. 🤍

### Alumnas que ya no vienen

> Hola {nombre} 🤍
>
> Hace tiempo que no te veo por The Heels y me acuerdo mucho de ti. Me
> encantaría saber qué te llevaste de aquella etapa y qué podría hacer mejor.
>
> Son 2 minutos y me ayuda muchísimo: https://posingtheheels.com/encuesta
>
> Gracias por el ratito. Aquí tienes tu sitio siempre que quieras volver.

### Recordatorio suave (a los 4-5 días)

> ¡Hola {nombre}! Te dejo por aquí otra vez el cuestionario, por si se te quedó
> a medias entre entrenos 😅
>
> https://posingtheheels.com/encuesta
>
> Dos minutos y me ayudas un montón. ¡Gracias! 🤍

---

## 3. Qué se pregunta y por qué

Nueve pasos cortos. **Ninguna pregunta es obligatoria** y así se dice en la
cabecera: una respuesta a medias vale más que una que nadie termina.

### Paso 1 · Quién eres
Nombre, WhatsApp, antigüedad, modalidad y **cómo me conociste** (Instagram,
una amiga, tu entrenador, Google, un campeonato, otro).

La antigüedad y la modalidad te dejan cruzar después (*"las de online puntúan
más bajo la corrección técnica"*). El canal te dice dónde merece la pena
invertir tiempo y dinero.

### Paso 2 · Ocho valoraciones de 1 a 5
Clases · Yo como coach · Correcciones técnicas · Seguimiento entre clases ·
Reservas y organización · Calidad-precio · Tu progreso · Global.

Separadas a propósito: una nota global de 4 no te dice nada, pero un 5 en clases
y un 3 en reservas te dice exactamente dónde meter mano. *Tu progreso* es
autopercepción, no una nota a la academia: es el mejor predictor de quién
renueva.

### Paso 3 · Recomendación de 0 a 10 (NPS)
*"¿Me recomendarías a una amiga que quiere competir?"*. El panel calcula el NPS
(% de 9-10 menos % de 0-6). Al marcar un 9 o un 10 aparece un mensaje que las
anima a explicarlo después, que es de donde salen los buenos testimonios.

### Paso 4 · Cómo llegaste hasta aquí
| Pregunta | Para qué sirve |
| --- | --- |
| ¿Qué te hizo decidirte a dar el paso? | El argumento que convierte, dicho por quien ya convirtió |
| ¿Miraste otras opciones antes? ¿Por qué me elegiste a mí? | Tu diferencia frente a la competencia |
| ¿Qué te sorprendió que no esperabas? | Rompe el tópico: saca cosas que ni sabías que vendías |

### Paso 5 · Tu experiencia en clase
| Pregunta | Para qué sirve |
| --- | --- |
| ¿Qué es lo que más te engancha de las clases? | Tu argumento de venta, en sus palabras |
| Un momento en el que te sentiste orgullosa de ti | Historias concretas: lo que mejor funciona en redes |
| ¿Cómo te sentías en tu primera tarima y cómo te sientes ahora? | El antes/después más potente. *La* pregunta para vídeo |
| ¿En qué notas que has cambiado desde que empezaste? | El progreso contado por ella |

### Paso 6 · Lo que te llevas
| Pregunta | Para qué sirve |
| --- | --- |
| ¿Algo que hayas conseguido fuera de la tarima? | Amplía el público: no sólo compite quien compite |
| ¿Qué te dice la gente cuando te ve posar ahora? | Prueba social de rebote, muy creíble |
| ¿Qué le dirías a la que eras el primer día? | Emocional, sale sola, funciona en carrusel |
| Convence a una amiga en una sola frase | Testimonio listo para la web, ya escrito por ella |
| Si The Heels fuera una palabra o una canción | Frases con gancho para rótulos y reels |

### Paso 7 · Qué te gustaría
- *¿Qué pequeño detalle haría tus clases todavía mejores?* (abierta)
- **¿Qué te gustaría trabajar más en clase?** — obligatorias, caminar y giros,
  brazos y manos, expresión y mirada, rutina libre, presencia en tarima,
  confianza y nervios, posado para fotos y redes. Con esto planificas el
  trimestre.
- **¿Qué te interesaría que lanzara?** — packs intensivos de preparación para
  campeonato, formaciones grabadas para ver en casa, talleres de fin de semana,
  sesiones individuales, grupos por categoría. Testea productos nuevos sin
  montarlos.

La pregunta de mejora está formulada como *"un pequeño detalle"* en lugar de
*"¿qué está mal?"*. La gente contesta mucho más y, además, contesta cosas
accionables en vez de desahogos.

### Paso 8 · Tu coach
Una sola pregunta, con su pantalla entera: *"Para terminar, háblame de mí como
coach: qué te aporto, cómo te hago sentir en clase y en qué crees que podría
ayudarte todavía más"*.

Va sola y al final a propósito. Sola, porque una caja grande sin nada al lado
invita a escribir largo. Al final, porque para entonces ya ha recordado sus
mejores momentos en los pasos anteriores y escribe desde ahí.

### Paso 9 · Vídeo + permiso
Botón para grabar o subir un vídeo (máximo 50 MB, con la cámara en calidad
normal), con cuatro ideas de qué contar para que no se queden en blanco. Debajo
del botón se avisa de que en 4K puede no caber, y si aun así se pasa, el error
se lo dice antes de empezar a subir. Debajo, la casilla de autorización para
publicarlo en web y redes: viene marcada, pero se puede desmarcar y entonces la
respuesta sólo se usa internamente.

---

## 4. El panel `/admin/encuestas`

- **Métricas arriba**: respuestas totales, sin leer, con vídeo y NPS.
- **Medias por apartado**: las ocho valoraciones en barras.
- **Recuentos de las cerradas**: cómo te conocieron, qué quieren trabajar más y
  qué lanzamiento les interesa, ordenados por votos.
- **Filtros**: todas / sin leer / con vídeo / listas para publicar.
- **Ficha de cada respuesta**: reproduce el vídeo, muestra las notas, todo el
  texto libre y lo que marcó, y permite **publicar como testimonio**.

Publicar crea un `Feedback` nuevo (el que sale en la landing) con el texto que
tú edites antes de darle al botón. La encuesta original se queda intacta en el
panel: el testimonio público y el dato interno son cosas distintas, y así no
acaba en la portada algo que la alumna escribió en privado.

El botón sólo aparece si marcó la casilla de autorización.

---

## 5. Consejos de envío

- **Uno a uno, no en difusión.** WhatsApp penaliza las listas de difusión
  grandes y la tasa de respuesta cae en picado. Personalizar el `{nombre}` marca
  mucha diferencia.
- **Momento**: justo después de clase o el día siguiente a un campeonato, con la
  emoción todavía caliente. Es cuando salen los mejores vídeos.
- **Un solo recordatorio** a los 4-5 días. Más que eso quema.
- **Cierra el círculo**: cuando apliques una de las mejoras que te pidan,
  díselo. *"Lo de los espejos nos lo pediste tú"* es la mejor forma de que la
  próxima encuesta también la contesten.

---

## 6. Si ves que se quedan a medias

El cuestionario tiene 14 preguntas abiertas. Es mucho, y lo sabemos: está
montado para que cada pantalla sea corta y se pueda saltar, pero si en el panel
ves que las últimas pantallas llegan casi siempre vacías, el orden por el que
recortaría es este:

1. *Si The Heels fuera una palabra o una canción* (`inOneWord`) — es la más
   prescindible: bonita para rótulos, pero no decide nada.
2. *¿Qué te dice la gente cuando te ve posar ahora?* (`peopleSay`) — se solapa
   bastante con «en qué has cambiado».
3. *¿Qué le dirías a la que eras el primer día?* (`toPastSelf`) — se solapa con
   «cómo te sentías en tu primera tarima».

Todas las preguntas viven en [`src/lib/encuesta.ts`](../src/lib/encuesta.ts).
Quitar una de la lista la retira del formulario, del correo de aviso y del panel
de golpe; no hay que tocar nada más.

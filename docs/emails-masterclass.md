# Masterclass — la secuencia de correos

Ocho envíos, del anuncio del 10 de diciembre al cierre de la ventana el 24 de
enero. Listos para programar en Resend.

> **El email 1 ya está escrito en código**, en `src/app/api/masterclass/route.ts`.
> Si cambias aquí su texto, cámbialo también allí. Los demás van en Resend.

---

## Cómo están escritos

**Cortos.** Un email de la academia no es una newsletter. El único que pasa de
quince líneas es el de objeciones, y porque es una lista.

**Sin asunto de embudo.** Nada de «🔥 ÚLTIMAS PLAZAS». Este público es pequeño,
se conoce y huele el marketing a distancia. Los asuntos están escritos como le
escribirías a una alumna.

**Un solo enlace por correo**, salvo en el del replay. Dos llamadas a la acción
en el mismo email son media llamada a la acción.

### Las dos listas

Desde el email 5 la secuencia se parte en dos según lo que contestaron en
«¿cuándo compites?». Esa segmentación la hace sola el panel: filtras y exportas.

| Lista | Quién | Qué se le empuja |
|---|---|---|
| **Temporada** | Abril-mayo y junio-julio | La cohorte y la ficha de solicitud |
| **Sin fecha** | Otoño, sin fecha, nunca ha competido | Fundamentos del Posing |

**El mismo email para las dos quema las dos.** A quien compite en abril, decirle
«empieza por la base cuando quieras» le quita la urgencia. A quien no tiene
fecha, hablarle de plazas que se acaban le dice que esto no es para ella.

### Calendario

| # | Cuándo | Asunto |
|---|---|---|
| 0 | jue 10 dic | Me acabo de bajar de la tarima |
| 1 | al inscribirse | Estás dentro — jueves 14 a las 19:30 |
| 2 | lun 11 ene | Lo que vamos a ver el jueves |
| 3 | mié 13 ene | Prepara tu sitio para mañana |
| 4 | jue 14 ene, 18:30 | Empezamos en una hora |
| 5 | vie 15 ene, 10:00 | Tu replay y tus cuatro descargables · **dos versiones** |
| 6 | dom 17 ene, 18:00 | Se cierra esta noche |
| 7 | jue 21 ene | Las dudas que más me habéis preguntado · **dos versiones** |

---

# 0 · El anuncio

**Jueves 10 de diciembre · a toda la base**

El que abre la inscripción. Va con tu análisis en vídeo, que es lo que le da
derecho a existir: no estás anunciando una masterclass, estás enseñando tu
competición y de paso hay una masterclass.

**Asunto:** Me acabo de bajar de la tarima
**Preheader:** Te lo enseño por dentro, incluido lo que me salió mal

> Hola [nombre],
>
> Hace dos semanas competí. Te prometí que lo grabaría todo y que te lo
> enseñaría por dentro, así que aquí está.
>
> He cogido el vídeo de mi tarima y me he puntuado yo misma en los nueve
> apartados con los que puntúa un juez. En voz alta, incluidos los dos en los
> que saqué peor nota.
>
> **[Ver el vídeo]**
>
> Son ocho minutos y vas a ver el backstage, la espera y lo que hice en los
> noventa segundos que importan.
>
> Y hay otra cosa. En enero empieza la temporada de verdad: las primeras
> competiciones son en abril y las preparaciones arrancan ahora. Voy a hacer una
> masterclass gratuita el **jueves 14 de enero a las 19:30** para enseñarte a
> ponerte esa nota a ti misma, y a saber qué hacer con ella.
>
> **[Guardar mi plaza]**
>
> Nos vemos en enero.
> Alejandra

---

# 1 · La confirmación

**Automático, al inscribirse · ya implementado en código**

**Asunto:** Estás dentro — jueves 14 de enero a las 19:30
**Preheader:** Te mando el enlace el mismo día

> [nombre], tienes tu plaza guardada.
>
> **Jueves 14 de enero a las 19:30**, hora peninsular. Online, 90 minutos más
> preguntas.
>
> Te mando el enlace de la sala el mismo día por email y por WhatsApp. Mientras
> tanto, apúntatelo en el calendario: el recordatorio de última hora es el que
> más gente se pierde.
>
> **Ven preparada**
>
> - Tacones de competición, o unos de altura parecida.
> - Ropa que deje ver la línea del cuerpo.
> - Un hueco despejado de unos 2 × 1,5 m.
> - El móvil o el portátil a unos 2,5 m, a la altura del ombligo.
>
> Las cinco primeras en encender la cámara entran en la ronda de corrección en
> directo. Si no puedes a esa hora, no pasa nada: tendrás el replay hasta el
> domingo 17 a las 23:59.

---

# 2 · Tres días antes

**Lunes 11 de enero**

Su trabajo es que se acuerden y que entiendan que no es una clase de muestra.
La promesa del número es lo que diferencia esta sesión de cualquier otra.

**Asunto:** Lo que vamos a ver el jueves
**Preheader:** Y el número con el que te vas a ir

> [nombre], el jueves a las 19:30. Esto es lo que da tiempo a ver en 90
> minutos:
>
> **Qué puntúa un juez** y la arquitectura de una pose en siete puntos de
> control que puedes revisar sola delante del espejo.
>
> **Por qué la mayoría de rutinas individuales son un collage**, y cómo se monta
> una sobre los acentos de tu música.
>
> **El camino entero hasta la tarima**: la semana previa, el tanning y el día de
> la competición cronometrado.
>
> Y al final te vas con tu número. Te puntúas en los mismos nueve apartados con
> los que se puntúa en tarima, sobre 45. **Te va a salir entre 18 y 26, y está
> bien que salga ahí**: lo que importa no es el número de hoy, es contra qué lo
> comparas dentro de doce semanas.
>
> Nos vemos el jueves.
> Alejandra
>
> **[Añadir al calendario]**

---

# 3 · La víspera

**Miércoles 13 de enero**

El que más sube la participación en cámara, porque el motivo real para no
encenderla casi nunca es la vergüenza: es no tener el sitio montado.

**Asunto:** Prepara tu sitio para mañana
**Preheader:** Dos metros, el móvil a la altura del ombligo y poco más

> [nombre], mañana a las 19:30.
>
> Para que puedas posar y yo pueda corregirte, monta tu sitio hoy y no mañana a
> las 19:25:
>
> - **Espacio:** 2 × 1,5 m despejados. Con eso llega para todo.
> - **Cámara:** a 2,5 m y **a la altura de tu ombligo**, no de tu cara. Esta es
>   la que más cambia: puesta alta te acorta las piernas y vas a corregir algo
>   que no existe.
> - **Luz:** de frente o cenital. Nunca a contraluz.
> - **Tacones** de competición o de altura parecida, y ropa que deje ver la
>   línea.
> - **El espejo, detrás de la cámara.** Tienes que aprender a posar sin mirarte.
>
> Las cinco primeras en encender la cámara entran en la ronda de corrección en
> directo. Si prefieres mirar con la cámara apagada, también vale: se ve y se
> aprende igual.
>
> Hasta mañana.
> Alejandra

---

# 4 · Una hora antes

**Jueves 14 de enero, 18:30 · también por WhatsApp**

El email más corto de los ocho y el que más asistencia mueve. No añadas nada
más: cualquier frase de más le quita fuerza al enlace.

**Asunto:** Empezamos en una hora
**Preheader:** Aquí tienes el enlace

> [nombre], a las 19:30.
>
> **[Entrar a la sala]**
>
> Nos vemos ahora.

---

# 5 · El replay

**Viernes 15 de enero, 10:00 · dos versiones**

El único correo con más de un enlace, y aun así primero el replay y después la
oferta. Si inviertes el orden, parece que la sesión era la excusa.

### 5A · Lista «Temporada»

**Asunto:** Tu replay y tus cuatro descargables
**Preheader:** Disponibles hasta el domingo a las 23:59

> [nombre], aquí tienes todo lo de ayer.
>
> **[Ver el replay]** — disponible hasta el domingo 17 a las 23:59.
>
> Y los cuatro descargables:
>
> - Checklist de los siete puntos de la pose
> - Plantilla de mapa musical
> - Cronograma del día D con la lista de maleta
> - Tu hoja de puntuación sobre 45
>
> ---
>
> Me dijiste que compites esta temporada, así que te escribo con eso delante.
>
> Si tu competición es en abril o mayo, tienes por delante **exactamente las
> doce semanas** que dura el programa. La cohorte arranca el **25 de enero** y
> termina el 18 de abril, justo cuando se abre la temporada: el simulacro
> puntuado te cae a tres semanas de tu tarima.
>
> Son ocho plazas y las reservo por orden de pago, no de solicitud. Para entrar
> rellenas una ficha corta, hablamos quince minutos y te digo tres cosas
> concretas que veo en tu vídeo. Si no te encaja, te lo digo yo.
>
> **[Rellenar mi ficha]**
>
> Si entras antes del domingo 24 te llevas además **Fundamentos del Posing
> incluido**, para que empieces esa misma noche sin esperar al 25.
>
> Alejandra

### 5B · Lista «Sin fecha»

**Asunto:** Tu replay y tus cuatro descargables
**Preheader:** Disponibles hasta el domingo a las 23:59

> [nombre], aquí tienes todo lo de ayer.
>
> **[Ver el replay]** — disponible hasta el domingo 17 a las 23:59.
>
> Y los cuatro descargables:
>
> - Checklist de los siete puntos de la pose
> - Plantilla de mapa musical
> - Cronograma del día D con la lista de maleta
> - Tu hoja de puntuación sobre 45
>
> ---
>
> Me dijiste que todavía no tienes fecha, así que no te voy a hablar de plazas
> ni de prisas. Al revés: **estás en el mejor momento posible para construir la
> base.**
>
> Cuando llegue tu preparación vas a tener la cabeza en la dieta y en el
> gimnasio, y el posing va a pasar a segundo plano. Lo que aprendas ahora, sin
> esa presión encima, es lo que vas a tener ya resuelto entonces.
>
> **Fundamentos del Posing** es eso: las poses obligatorias de tu categoría
> adaptadas a tu cuerpo, los cuatro cuartos de giro, las manos, la cara, la
> caminata y un plan de práctica de doce semanas. Dos horas repartidas en
> veinte lecciones cortas, y el acceso no caduca.
>
> Hasta el domingo a las 23:59 está a **39 € en lugar de 59 €**.
>
> **[Quiero Fundamentos]**
>
> Y cuando tengas fecha, me escribes y hablamos.
> Alejandra

---

# 6 · El cierre del replay

**Domingo 17 de enero, 18:00 · las dos listas**

Corto y sin dramatizar. El cierre es real, así que no hace falta adornarlo.

**Asunto:** Se cierra esta noche
**Preheader:** El replay y el precio, hasta las 23:59

> [nombre], a las 23:59 cierro las dos cosas: el replay de la masterclass y
> Fundamentos del Posing a 39 €.
>
> Si lo tenías pendiente, es hoy.
>
> **[Ver el replay]**
> **[Quiero Fundamentos — 39 €]**
>
> Y si no te viene bien ahora, no pasa nada: la masterclass la repito cada pocas
> semanas y te avisaré.
>
> Alejandra

---

# 7 · Las objeciones

**Jueves 21 de enero · dos versiones**

El único largo, y se perdona porque es una lista de respuestas. Va a mitad de
la ventana de llamadas, cuando ya tienes claro qué están preguntando: **cambia
estas preguntas por las que te hayan hecho de verdad.**

### 7A · Lista «Temporada»

**Asunto:** Las dudas que más me habéis preguntado
**Preheader:** Y cuántas plazas quedan

> [nombre], estos días he hablado con varias de vosotras y hay cuatro preguntas
> que se repiten. Te las contesto aquí por si son las tuyas.
>
> **«Es caro»**
> Son 16,5 horas de clase en directo por 267 €. Menos de 16 € la hora, cuando
> una clase suelta son 25. Y menos de lo que te va a costar el traje.
>
> **«¿En grupo me vas a corregir menos?»**
> Cada clase tiene un bloque en el que pasas tú sola delante de las demás. Y
> aprendes de lo que le corrijo a la de al lado, que es literalmente lo que va a
> pasar en tu comparativa.
>
> **«No tengo sitio en casa»**
> Con 2 × 1,5 m llega para todo menos la caminata, y para eso te doy
> alternativas. Te paso una guía de montaje antes de empezar.
>
> **«Mi preparador ya me da posing»**
> Perfecto, y no nos pisamos: él lleva tu físico y yo llevo cómo lo muestras. De
> hecho conviene que hablemos si él quiere.
>
> ---
>
> Quedan **[X] plazas** en la cohorte que arranca el 25 de enero. La ficha se
> cierra el domingo.
>
> **[Rellenar mi ficha]**
>
> Alejandra

> **Nota.** Pon el número real. Si quedan seis, pon seis. Un «últimas plazas»
> sin número no se lo cree nadie, y si alguna vez te pillan inflándolo se acabó
> la confianza con toda la lista.

### 7B · Lista «Sin fecha»

**Asunto:** Por dónde empezar si todavía no tienes fecha
**Preheader:** Lo que haría yo en tu sitio

> [nombre], te escribo sin nada que venderte hoy.
>
> La pregunta que más me hacen las que todavía no tienen fecha es por dónde
> empezar. Lo que yo haría, en este orden:
>
> **1. Los siete puntos de la pose.** Están en el checklist que te descargaste.
> Diez minutos al día delante del espejo durante dos semanas y dejas de pensar
> en ellos.
>
> **2. Tacón.** Cinco minutos al día andando por casa. No cansa, no interfiere
> con nada y es lo que más tarda en construirse.
>
> **3. Grábate.** Con el móvil a la altura del ombligo, a 2,5 m. Una vez por
> semana, la misma secuencia. Es la única forma de ver que avanzas.
>
> Con eso solo ya vas a llegar a tu primera preparación por delante de donde
> llega casi todo el mundo.
>
> Cuando tengas fecha, escríbeme y miramos qué te conviene.
>
> Alejandra

---

# Notas de envío

**Nombre y remitente.** Todo sale de `soporte@posingtheheels.com` con el nombre
«Alejandra · The Heels». Un remitente con nombre propio abre más que uno de
marca, y aquí el nombre propio es el producto.

**Baja.** Enlace de baja visible en todos. Quien se da de baja de una lista
pequeña te está haciendo un favor.

**Horas.** El de la víspera y el de una hora antes son los dos que de verdad
mueven la asistencia. Si solo pudieras mandar dos de los ocho, serían esos.

**WhatsApp.** El 4 va también por WhatsApp. Es el que más gente salva, y para
eso está el campo de teléfono en el formulario.

**Lo que no se hace.** No se reenvía la secuencia a quien ya compró. En cuanto
alguien pasa a estado COMPRÓ en el panel, sale de la secuencia: nada enfada más
que recibir la oferta de algo que acabas de pagar.

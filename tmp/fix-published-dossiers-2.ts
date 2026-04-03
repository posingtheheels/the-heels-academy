import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pStyle = 'style="margin-bottom: 1.5rem; line-height: 1.8; color: #374151; font-size: 1.1rem;"';
const hLevel2Style = 'style="margin-top: 2.5rem; margin-bottom: 1rem; color: #111827; font-weight: 700; font-size: 1.5rem; font-family: serif;"';

const getFooter = (cta: string) => `
<div style="background: rgba(230, 192, 192, 0.1); padding: 32px; border-radius: 16px; border-left: 6px solid #e6c0c0; margin-top: 48px; border-top: 1px solid rgba(230, 192, 192, 0.2);">
  <p style="margin-bottom: 12px; font-weight: 900; letter-spacing: 0.2em; color: #8e6a6a; text-transform: uppercase; font-size: 12px;">👠 DEBATE PRO: THE HEELS ACADEMY</p>
  <p style="font-size: 16px; line-height: 1.6; color: #4b5563; font-style: italic;">${cta}</p>
</div>
`;

const restOfPublished = [
  {
    slug: "enfoque-gluteo-femoral-tie-in-perfecto",
    content: `
      <p ${pStyle}><strong>El Santo Grial del Tren Inferior: Dominando el Tie-In.</strong><br/>
      No hay nada que separe más a una Pro de una Amateur en las categorías de glúteo-dominantes que el 'Tie-In' glúteo-femoral. Esa línea nítida que divide el glúteo mayor del bíceps femoral es el resultado de años de entrenamiento técnico, una gestión de agua impecable y un posing que entienda la anatomía longitudinal de la pierna.</p>

      <h2 ${hLevel2Style}>Biomecánica del Aislamiento Glúteo-Femoral</h2>
      <p ${pStyle}>Para conseguir ese corte profundo, no basta con hacer peso muerto. Debemos atacar el origen del femoral en la tuberosidad isquiática y la inserción del glúteo bajo. En la academia recomendamos el Peso Muerto Rumano con un rango de movimiento acortado para mantener la tensión mecánica máxima en el punto de estiramiento del tie-in. El uso de cintas elásticas laterales durante los empujes de cadera puede reclutar más fibras del glúteo medio, ayudando a que la base se vea más compacta y separada del femoral superior.</p>

      <h2 ${hLevel2Style}>Nutrición: El factor de la Inflamación Subcutánea</h2>
      <p ${pStyle}>A menudo, el tie-in existe muscularmente pero está 'borrado' por la retención inflamatoria. Los lácteos procesados, el exceso de edulcorantes artificiales o una mala gestión del sodio en la dieta pueden causar un edema leve en esa zona específica de la cadera. Una dieta anti-inflamatoria rica en potasio y el uso estratégico de diuréticos naturales permitidos en fase de prep son claves para que ese corte muscular respire bajo las luces de la tarima.</p>

      <h2 ${hLevel2Style}>Posing Técnico: Cómo 'Abrir' el Corte</h2>
      <p ${pStyle}>Al realizar la pose posterior, el secreto está en la rotación externa del fémur sin perder el pie en el suelo. Al presionar los talones hacia afuera de forma imperceptible, generas una tensión que proyecta hacia afuera el vasto lateral y el femoral, haciendo que la inserción glútea se vea más profunda por el contraste de sombras. En The Heels practicamos esta 'tensión invisible' hasta que se convierta en una segunda naturaleza para nuestras atletas.</p>
    `,
    cta: "¿Cómo gestionas tú para no perder la nítidez del tie-in en volumen? ¡Comenta tus sensaciones técnicas!"
  },
  {
     slug: "reglamento-ifbb-2026-cambios-puntuacion",
     content: `
       <p ${pStyle}><strong>Actualización Crítica del Reglamento IFBB Pro League 2026.</strong><br/>
       Ignorar los cambios en el reglamento es salir a competir con un vendaje en los ojos. La liga profesional evoluciona y con ella, los criterios que definen quién se lleva la tarjeta Pro y quién se queda fuera de los podios internacionales.</p>

       <h2 ${hLevel2Style}>El Nuevo Estándar del Control Abdominal</h2>
       <p ${pStyle}>Para 2026, la IFBB ha subrayado la tolerancia cero con la distensión abdominal (palumboismo o mala gestión respiratoria). Se han incluido notas específicas para los jueces que exigen penalizar cualquier momento de relajación de la faja abdominal durante las transiciones o incluso cuando la atleta está esperando en la línea trasera. El dominio del Hipopresivo Funcional durante el I-walk se ha vuelto una herramienta competitiva de primer orden. No se perdona una barriga dilatada por gases o por exceso de comida pre-tarima.</p>

       <h2 ${hLevel2Style}>Simetría X-Frame: El Balance Clavícula-Cadera</h2>
       <p ${pStyle}>En Bikini y Figure, el énfasis se ha desplazado hacia una simetría X-frame más acentuada. Se busca que la anchura clavicular (deltoides lateral) sea proporcionalmente armónica con la anchura de la cadera (vasto lateral del cuádriceps). Se ha penalizado el 'look' de hombros excesivamente masivos que parecen despegados del resto del físico. La armonía fluida es la palabra clave para este 2026.</p>

       <h2 ${hLevel2Style}>Profesionalismo y Conducta en Escenario Blue</h2>
       <p ${pStyle}>Se penalizará cualquier conducta que reste elegancia al evento. Esto incluye poses excesivamente sugestivas o agresivas que rompan el 'look' deportivo de la organización. La liga busca proyectar una imagen de élite atlética y profesional. El tinte, el maquillaje y el calzado deben cumplir estrictamente con los milímetros de altura permitidos para no ser descalificada o penalizada severamente.</p>
     `,
     cta: "¿Te parecen justos estos cambios en 2026? ¡Danos tu visión técnica aquí abajo!"
  }
];

async function main() {
  for (const post of restOfPublished) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: { content: post.content + getFooter(post.cta) }
    });
  }
  console.log("Artículos PUBLICADOS ampliados (Tanda 2) con éxito.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

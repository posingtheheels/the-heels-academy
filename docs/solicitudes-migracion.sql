-- Solicitudes de Camino a la Tarima -- la ficha de la atleta y la llamada.
--
-- Puramente aditivo: una tabla nueva, tres indices y ninguna clave foranea.
-- No toca User, Plan, UserPlan, Slot, Booking, Lead ni las tablas de Formacion
-- Academy. Se puede aplicar con la aplicacion en marcha.
--
-- Equivale a `npx prisma db push` sobre el esquema actual.

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "age" INTEGER,
    "federation" TEXT,
    "category" TEXT,
    "modality" TEXT NOT NULL DEFAULT 'NO_LO_SE',
    "competitionDate" TIMESTAMP(3),
    "competitionVenue" TEXT,
    "previousCompetitions" TEXT,
    "preparedBy" TEXT,
    "injuries" TEXT,
    "heelExperience" TEXT,
    "availability" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "biggestFear" TEXT,
    "seasonGoal" TEXT,
    "videoPath" TEXT,
    "competitionVideoPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NUEVA',
    "cohort" TEXT,
    "callNotes" TEXT,
    "notes" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
-- Para ordenar por quien tiene la tarima mas cerca, que es como se atiende.
CREATE INDEX "Application_competitionDate_idx" ON "Application"("competitionDate");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

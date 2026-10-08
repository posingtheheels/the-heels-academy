-- Masterclass "Los 90 segundos" -- inscripciones del embudo.
--
-- Puramente aditivo: una tabla nueva, cuatro indices y ninguna clave foranea.
-- No toca User, Plan, UserPlan, Slot, Booking ni las tablas de Formacion
-- Academy. Se puede aplicar con la aplicacion en marcha.
--
-- Equivale a `npx prisma db push` sobre el esquema actual.

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "edition" TEXT NOT NULL,
    "federation" TEXT,
    "category" TEXT,
    "competeWhen" TEXT NOT NULL,
    "hasCompeted" BOOLEAN NOT NULL DEFAULT false,
    "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
    "consentRecording" BOOLEAN NOT NULL DEFAULT false,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INSCRITA',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Reinscribirse con el mismo correo corrige los datos en lugar de duplicar la
-- fila. El endpoint hace upsert sobre esta clave.
CREATE UNIQUE INDEX "Lead_email_edition_key" ON "Lead"("email", "edition");

-- CreateIndex
CREATE INDEX "Lead_edition_idx" ON "Lead"("edition");

-- CreateIndex
CREATE INDEX "Lead_competeWhen_idx" ON "Lead"("competeWhen");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

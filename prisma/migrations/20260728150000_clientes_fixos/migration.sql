-- CreateTable
CREATE TABLE "FixedClient" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "phone" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'SEMANAL',
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "startDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedClientSkip" (
    "id" TEXT NOT NULL,
    "fixedClientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedClientSkip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FixedClientSkip_fixedClientId_date_key" ON "FixedClientSkip"("fixedClientId", "date");

-- AddForeignKey
ALTER TABLE "FixedClient" ADD CONSTRAINT "FixedClient_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedClientSkip" ADD CONSTRAINT "FixedClientSkip_fixedClientId_fkey" FOREIGN KEY ("fixedClientId") REFERENCES "FixedClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;


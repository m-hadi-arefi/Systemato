-- AlterTable Business: add geolocation and branding fields
ALTER TABLE "Business" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Business" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Business" ADD COLUMN "primaryColor" TEXT;
ALTER TABLE "Business" ADD COLUMN "secondaryColor" TEXT;
ALTER TABLE "Business" ADD COLUMN "coverImageUrl" TEXT;

-- AlterTable BusinessMember: add business-specific display name
ALTER TABLE "BusinessMember" ADD COLUMN "displayName" TEXT;

-- AlterTable Appointment: add optional service reference
ALTER TABLE "Appointment" ADD COLUMN "serviceId" TEXT;

-- CreateTable Service
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey Service -> Business
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Appointment -> Service
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

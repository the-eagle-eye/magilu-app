-- CreateTable
CREATE TABLE "Shoe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "eurSize" REAL NOT NULL,
    "usSize" REAL,
    "ukSize" REAL,
    "color" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'Zapatilla',
    "genero" TEXT NOT NULL DEFAULT 'hombre',
    "precio" REAL,
    "precioVenta" REAL,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "notas" TEXT,
    "sku" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShoePhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shoeId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'zapato',
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShoePhoto_shoeId_fkey" FOREIGN KEY ("shoeId") REFERENCES "Shoe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Shoe_marca_idx" ON "Shoe"("marca");

-- CreateIndex
CREATE INDEX "Shoe_eurSize_idx" ON "Shoe"("eurSize");

-- CreateIndex
CREATE INDEX "Shoe_estado_idx" ON "Shoe"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Compound indexes on Shoe for common filter combinations
CREATE INDEX IF NOT EXISTS "Shoe_estado_genero_idx" ON "Shoe"("estado", "genero");
CREATE INDEX IF NOT EXISTS "Shoe_estado_eurSize_idx" ON "Shoe"("estado", "eurSize");

-- Indexes on ShoePhoto for efficient photo lookups by shoe
CREATE INDEX IF NOT EXISTS "ShoePhoto_shoeId_idx" ON "ShoePhoto"("shoeId");
CREATE INDEX IF NOT EXISTS "ShoePhoto_shoeId_esPrincipal_idx" ON "ShoePhoto"("shoeId", "esPrincipal");

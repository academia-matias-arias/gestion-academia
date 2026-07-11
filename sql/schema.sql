-- ============================================================
-- Academia de Cueca 2026 — Esquema de Base de Datos
-- Ejecutar en: https://supabase.com/dashboard/project/dxpoewgogitugoguccyw/sql/new
-- ============================================================

-- 1. TABLA: alumnos
CREATE TABLE IF NOT EXISTS alumnos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_alumno TEXT NOT NULL,
  edad TEXT,
  fecha_nacimiento DATE,
  sede TEXT NOT NULL,
  contacto TEXT DEFAULT '',
  valor_mensualidad INTEGER NOT NULL DEFAULT 15000,
  estado TEXT NOT NULL DEFAULT 'activo',
  motivo_retiro TEXT DEFAULT '',
  beca BOOLEAN DEFAULT false,
  monto_beca INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: pagos
CREATE TABLE IF NOT EXISTS pagos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alumno_id BIGINT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  anio INTEGER NOT NULL,
  monto_pagado INTEGER NOT NULL,
  fecha_registro DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, mes, anio)
);

-- 3. TABLA: asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alumno_id BIGINT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, fecha)
);

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_alumnos_sede ON alumnos(sede);
CREATE INDEX IF NOT EXISTS idx_alumnos_estado ON alumnos(estado);
CREATE INDEX IF NOT EXISTS idx_alumnos_nombre ON alumnos(nombre_alumno);
CREATE INDEX IF NOT EXISTS idx_pagos_mes_anio ON pagos(mes, anio);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);

-- 5. ROW LEVEL SECURITY
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS (acceso público para el panel admin)
-- Se eliminan primero para evitar errores si ya existen
DROP POLICY IF EXISTS "Public read alumnos" ON alumnos;
DROP POLICY IF EXISTS "Public insert alumnos" ON alumnos;
DROP POLICY IF EXISTS "Public update alumnos" ON alumnos;
DROP POLICY IF EXISTS "Public delete alumnos" ON alumnos;

DROP POLICY IF EXISTS "Public read pagos" ON pagos;
DROP POLICY IF EXISTS "Public insert pagos" ON pagos;
DROP POLICY IF EXISTS "Public update pagos" ON pagos;
DROP POLICY IF EXISTS "Public delete pagos" ON pagos;

DROP POLICY IF EXISTS "Public read asistencias" ON asistencias;
DROP POLICY IF EXISTS "Public insert asistencias" ON asistencias;
DROP POLICY IF EXISTS "Public update asistencias" ON asistencias;
DROP POLICY IF EXISTS "Public delete asistencias" ON asistencias;

CREATE POLICY "Public read alumnos" ON alumnos FOR SELECT USING (true);
CREATE POLICY "Public insert alumnos" ON alumnos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update alumnos" ON alumnos FOR UPDATE USING (true);
CREATE POLICY "Public delete alumnos" ON alumnos FOR DELETE USING (true);

CREATE POLICY "Public read pagos" ON pagos FOR SELECT USING (true);
CREATE POLICY "Public insert pagos" ON pagos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update pagos" ON pagos FOR UPDATE USING (true);
CREATE POLICY "Public delete pagos" ON pagos FOR DELETE USING (true);

CREATE POLICY "Public read asistencias" ON asistencias FOR SELECT USING (true);
CREATE POLICY "Public insert asistencias" ON asistencias FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update asistencias" ON asistencias FOR UPDATE USING (true);
CREATE POLICY "Public delete asistencias" ON asistencias FOR DELETE USING (true);

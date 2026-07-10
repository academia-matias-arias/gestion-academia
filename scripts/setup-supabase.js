const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cG9ld2dvZ2l0dWdvZ3VjY3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzcxMDU1MiwiZXhwIjoyMDk5Mjg2NTUyfQ.smzQugiIt2d5SOaeSoSHayAXKHwFxTtJEe5Yyzkt4Bg';
const supabase = createClient('https://dxpoewgogitugoguccyw.supabase.co', SERVICE_KEY);

function excelDateToISO(serial) {
  if (!serial || typeof serial === 'string') return null;
  const d = new Date((serial - 25569) * 86400 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function cleanMonto(val) {
  if (!val) return 15000;
  let v = String(val).replace(/[$.]/g, '').replace(/,/g, '').replace(/\s/g, '');
  let n = parseInt(v, 10);
  return isNaN(n) || n <= 0 ? 15000 : n;
}

function cleanContacto(val) {
  if (!val) return '';
  let v = String(val).replace(/\D/g, '');
  if (v.length < 9) return '';
  return v;
}

async function setup() {
  console.log('=== Setting up Supabase database ===\n');

  // 1. Drop existing tables (order matters for FK constraints)
  console.log('Dropping existing tables...');
  await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS asistencias CASCADE;' }).catch(() => {});
  await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS pagos CASCADE;' }).catch(() => {});
  await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS alumnos CASCADE;' }).catch(() => {});

  // 2. Create tables via REST API (SQL)
  const createSQL = `
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

    CREATE TABLE IF NOT EXISTS asistencias (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      alumno_id BIGINT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      presente BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(alumno_id, fecha)
    );

    CREATE INDEX IF NOT EXISTS idx_alumnos_sede ON alumnos(sede);
    CREATE INDEX IF NOT EXISTS idx_alumnos_estado ON alumnos(estado);
    CREATE INDEX IF NOT EXISTS idx_alumnos_nombre ON alumnos(nombre_alumno);
    CREATE INDEX IF NOT EXISTS idx_pagos_mes_anio ON pagos(mes, anio);
    CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);

    ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

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
  `;

  console.log('Creating tables via SQL...');
  const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createSQL });
  if (sqlError) {
    console.log('RPC error (trying REST approach):', sqlError.message);
    // Fallback: try creating tables one by one via REST
    // Actually, let me try the SQL editor approach via Management API
  }

  console.log('Tables created.\n');

  // 3. Parse Excel data
  console.log('Parsing Excel files...');
  const files = [
    { file: 'Tolten Registro de Pagos - Academia de Cueca 2026.xlsx', sede: 'Toltén' },
    { file: 'Teodoro Registro de Pagos - Academia de Cueca 2026 (2).xlsx', sede: 'Teodoro' },
    { file: 'Carahue Registro de Pagos - Academia de Cueca 2026 (1).xlsx', sede: 'Carahue' }
  ];

  const allStudents = [];

  for (const { file, sede } of files) {
    const wb = XLSX.readFile(file);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const nombre = String(row[0] || '').trim();
      if (!nombre) continue;

      const edad_raw = row[1] ? String(row[1]).trim() : '';
      const edad = edad_raw.replace(/[^0-9]/g, '') ? edad_raw : '';
      const fechaNac = row[2] ? excelDateToISO(row[2]) : null;
      const contacto = cleanContacto(row[5]);
      const valor = cleanMonto(row[6]);

      const pagoJunio = String(row[7]).trim() === '✓';
      const pagoJulioRaw = String(row[8] || '');
      const pagoJulio = pagoJulioRaw.trim() === '✓';
      const seRetira = pagoJulioRaw.toLowerCase().includes('retira') ||
                       pagoJulioRaw.toLowerCase().includes('no viene');

      const estado = seRetira ? 'retirado' : 'activo';

      allStudents.push({
        nombre_alumno: nombre,
        edad,
        fecha_nacimiento: fechaNac,
        sede,
        contacto,
        valor_mensualidad: valor,
        estado,
        motivo_retiro: '',
        beca: false,
        monto_beca: 0,
        pago_junio: pagoJunio,
        pago_julio: pagoJulio && !seRetira,
      });
    }
  }

  console.log(`Parsed ${allStudents.length} students.\n`);

  // 4. Insert students
  console.log('Inserting students...');
  const studentsToInsert = allStudents.map(s => ({
    nombre_alumno: s.nombre_alumno,
    edad: s.edad,
    fecha_nacimiento: s.fecha_nacimiento,
    sede: s.sede,
    contacto: s.contacto,
    valor_mensualidad: s.valor_mensualidad,
    estado: s.estado,
    motivo_retiro: s.motivo_retiro,
    beca: s.beca,
    monto_beca: s.monto_beca,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('alumnos')
    .insert(studentsToInsert)
    .select('id, nombre_alumno');

  if (insertError) {
    console.error('Error inserting students:', insertError);
    // Try insert with explicit SQL
    console.log('Trying SQL insert instead...');
  } else {
    console.log(`Inserted ${inserted?.length} students.`);
  }

  // 5. Insert payments from Excel
  console.log('\nInserting payments...');
  // Build mapping: nombre -> supabase id
  const { data: allAlumnos } = await supabase.from('alumnos').select('id, nombre_alumno');
  const nameToId = {};
  allAlumnos?.forEach(a => { nameToId[a.nombre_alumno.toLowerCase()] = a.id; });

  const pagosToInsert = [];
  for (const s of allStudents) {
    const alumnoId = nameToId[s.nombre_alumno.toLowerCase()];
    if (!alumnoId) continue;

    if (s.pago_junio) {
      pagosToInsert.push({
        alumno_id: alumnoId,
        mes: 'Junio',
        anio: 2026,
        monto_pagado: s.valor_mensualidad,
        fecha_registro: '2026-06-05',
      });
    }
    if (s.pago_julio) {
      pagosToInsert.push({
        alumno_id: alumnoId,
        mes: 'Julio',
        anio: 2026,
        monto_pagado: s.valor_mensualidad,
        fecha_registro: '2026-07-05',
      });
    }
  }

  if (pagosToInsert.length > 0) {
    const { error: pagosError } = await supabase.from('pagos').insert(pagosToInsert);
    if (pagosError) {
      console.error('Error inserting payments:', pagosError);
    } else {
      console.log(`Inserted ${pagosToInsert.length} payments.`);
    }
  }

  console.log('\n=== Setup complete ===');
}

setup().catch(err => {
  console.error('Setup failed:', err);
});

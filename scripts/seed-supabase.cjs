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

async function seed() {
  console.log('=== Seeding Supabase with Excel data ===\n');

  // Check if data already exists
  const { count } = await supabase.from('alumnos').select('*', { count: 'exact', head: true });
  if (count > 0) {
    console.log(`Found ${count} existing students. Skipping seed.\n`);
    return;
  }

  // Parse Excel files
  const files = [
    { file: 'Tolten Registro de Pagos - Academia de Cueca 2026.xlsx', sede: 'Toltén' },
    { file: 'Teodoro Registro de Pagos - Academia de Cueca 2026 (2).xlsx', sede: 'Teodoro' },
    { file: 'Carahue Registro de Pagos - Academia de Cueca 2026 (1).xlsx', sede: 'Carahue' }
  ];

  const students = [];
  const paymentsData = []; // { nombre, junio: bool, julio: bool }

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

      students.push({
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
      });

      paymentsData.push({ nombre, pago_junio: pagoJunio, pago_julio: pagoJulio && !seRetira, valor });
    }
  }

  console.log(`Parsed ${students.length} students from Excel.\n`);

  // Insert students
  console.log('Inserting students...');
  const { data: inserted, error: insertErr } = await supabase
    .from('alumnos')
    .insert(students)
    .select('id, nombre_alumno');

  if (insertErr) {
    console.error('Error inserting students:', insertErr.message);
    return;
  }

  console.log(`Inserted ${inserted.length} students.`);

  // Build name-to-id map
  const nameToId = {};
  inserted.forEach(a => { nameToId[a.nombre_alumno.toLowerCase()] = a.id; });

  // Insert payments
  const pagosToInsert = [];
  for (const pd of paymentsData) {
    const alumnoId = nameToId[pd.nombre.toLowerCase()];
    if (!alumnoId) {
      console.warn('  WARN: no ID found for:', pd.nombre);
      continue;
    }

    if (pd.pago_junio) {
      pagosToInsert.push({ alumno_id: alumnoId, mes: 'Junio', anio: 2026, monto_pagado: pd.valor, fecha_registro: '2026-06-05' });
    }
    if (pd.pago_julio) {
      pagosToInsert.push({ alumno_id: alumnoId, mes: 'Julio', anio: 2026, monto_pagado: pd.valor, fecha_registro: '2026-07-05' });
    }
  }

  if (pagosToInsert.length > 0) {
    console.log(`\nInserting ${pagosToInsert.length} payments...`);
    const { error: pagosErr } = await supabase.from('pagos').insert(pagosToInsert);
    if (pagosErr) {
      console.error('Error inserting payments:', pagosErr.message);
    } else {
      console.log('Payments inserted successfully.');
    }
  }

  console.log('\n=== Seed complete ===');
  console.log(`Students: ${students.length} | Payments: ${pagosToInsert.length}`);
}

seed().catch(err => console.error('Seed failed:', err));

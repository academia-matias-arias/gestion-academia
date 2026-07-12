import { getTodayParts, formatFechaLarga } from './_birthdays.js';

const MESES_PAGO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function getPeriodo(today = getTodayParts()) {
  return { mes: MESES_PAGO[today.month - 1], anio: today.year };
}

export function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function isDiaPagoHoy(diaPago, today = getTodayParts()) {
  const dia = Number(diaPago);
  if (!dia || dia < 1 || dia > 31) return false;
  const ultimoDia = lastDayOfMonth(today.year, today.month);
  const diaEfectivo = Math.min(dia, ultimoDia);
  return today.day === diaEfectivo;
}

export function formatCLP(n) {
  const val = Math.round(Number(n) || 0);
  return '$' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export async function fetchActivos(
  supabaseUrl,
  supabaseKey,
  columns = 'id,nombre_alumno,sede,valor_mensualidad,dia_pago',
) {
  const url =
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/alumnos` +
    `?select=${encodeURIComponent(columns)}&estado=eq.activo`;
  const res = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase alumnos ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function fetchPagosMes(supabaseUrl, supabaseKey, mes, anio) {
  const url =
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/pagos` +
    `?select=alumno_id&mes=eq.${encodeURIComponent(mes)}&anio=eq.${anio}`;
  const res = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase pagos ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export function findPaganHoy(activos, pagos, today = getTodayParts()) {
  const pagados = new Set(pagos.map((p) => p.alumno_id));
  return activos.filter(
    (a) => isDiaPagoHoy(a.dia_pago, today) && !pagados.has(a.id),
  );
}

export function buildRecordatorioMessage(alumno, periodo, today = getTodayParts()) {
  const nombre = alumno.nombre_alumno || 'Alumno';
  const monto = formatCLP(alumno.valor_mensualidad);
  const sede = alumno.sede ? `\n📍 Sede: ${alumno.sede}` : '';
  return (
    `🔔 *Recordatorio de pago*\n` +
    `📅 ${formatFechaLarga(today)}\n\n` +
    `Hoy le corresponde pagar a *${nombre}* la mensualidad de ` +
    `*${periodo.mes} ${periodo.anio}*.\n\n` +
    `💵 Monto: *${monto}*${sede}`
  );
}

export function buildResumenDiaMessage(alumnos, periodo, today = getTodayParts()) {
  const total = alumnos.reduce((s, a) => s + (a.valor_mensualidad || 0), 0);
  let cuerpo = '';
  for (const a of alumnos) {
    const sede = a.sede ? ` — ${a.sede}` : '';
    cuerpo += `• ${a.nombre_alumno}${sede} — ${formatCLP(a.valor_mensualidad)}\n`;
  }
  return (
    `🔔 *Pagos que vencen hoy — ${periodo.mes} ${periodo.anio}*\n` +
    `📅 ${formatFechaLarga(today)}\n\n` +
    `Hoy les corresponde pagar a *${alumnos.length}* alumno(s):\n\n` +
    cuerpo +
    `\n💵 Total del día: *${formatCLP(total)}*`
  );
}

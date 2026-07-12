const TIMEZONE = 'America/Santiago';

export function getTodayParts(date = new Date(), timeZone = TIMEZONE) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [year, month, day] = fmt.format(date).split('-').map(Number);
  return { year, month, day };
}

export function parseBirthDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function findBirthdaysToday(students, today = getTodayParts()) {
  return students
    .map((student) => {
      const birth = parseBirthDate(student.fecha_nacimiento);
      if (!birth) return null;
      if (birth.month !== today.month || birth.day !== today.day) return null;
      const age = today.year - birth.year;
      if (age <= 0) return null;
      return { ...student, edad_cumple: age };
    })
    .filter(Boolean);
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatFechaLarga(today = getTodayParts()) {
  return `${today.day} de ${MESES[today.month - 1]} de ${today.year}`;
}

export function buildBirthdayMessage(student, today = getTodayParts()) {
  const nombre = student.nombre_alumno || 'Alumno';
  const anios = student.edad_cumple;
  const sede = student.sede ? `\n📍 Sede: ${student.sede}` : '';
  return (
    `🎉🎂 ¡Feliz cumpleaños! 🎂🎉\n\n` +
    `📅 ${formatFechaLarga(today)}\n\n` +
    `Hoy *${nombre}* está de cumpleaños y cumple *${anios} años*.${sede}\n\n` +
    `¡No olvides felicitarlo/a! 🥳`
  );
}

export async function fetchStudents(supabaseUrl, supabaseKey) {
  const url =
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/alumnos` +
    `?select=id,nombre_alumno,fecha_nacimiento,sede,estado` +
    `&fecha_nacimiento=not.is.null`;
  const res = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase respondió ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function sendTelegramMessage(botToken, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram error: ${JSON.stringify(data)}`);
  }
  return data;
}

import {
  fetchStudents,
  findBirthdaysToday,
  buildBirthdayMessage,
  sendTelegramMessage,
  getTodayParts,
} from './_birthdays.js';

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'No autorizado' });
    }
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!botToken || !chatId) {
    return res
      .status(500)
      .json({ error: 'Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID' });
  }
  if (!supabaseUrl || !supabaseKey) {
    return res
      .status(500)
      .json({ error: 'Faltan credenciales de Supabase' });
  }

  try {
    const today = getTodayParts();
    const students = await fetchStudents(supabaseUrl, supabaseKey);
    const birthdays = findBirthdaysToday(students, today);

    const enviados = [];
    for (const student of birthdays) {
      await sendTelegramMessage(botToken, chatId, buildBirthdayMessage(student, today));
      enviados.push({ nombre: student.nombre_alumno, cumple: student.edad_cumple });
    }

    return res.status(200).json({
      ok: true,
      fecha: `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`,
      cumpleaneros: birthdays.length,
      enviados,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

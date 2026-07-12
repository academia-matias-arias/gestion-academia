import { sendTelegramMessage, getTodayParts } from './_birthdays.js';
import {
  getPeriodo,
  fetchActivos,
  fetchPagosMes,
  findPaganHoy,
  buildRecordatorioMessage,
} from './_payments.js';

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
    return res.status(500).json({ error: 'Faltan credenciales de Supabase' });
  }

  try {
    const today = getTodayParts();
    const periodo = getPeriodo(today);
    const [activos, pagos] = await Promise.all([
      fetchActivos(supabaseUrl, supabaseKey),
      fetchPagosMes(supabaseUrl, supabaseKey, periodo.mes, periodo.anio),
    ]);
    const paganHoy = findPaganHoy(activos, pagos, today);

    const enviados = [];
    for (const alumno of paganHoy) {
      await sendTelegramMessage(
        botToken,
        chatId,
        buildRecordatorioMessage(alumno, periodo, today),
      );
      enviados.push(alumno.nombre_alumno);
    }

    return res.status(200).json({
      ok: true,
      periodo,
      recordatorios: paganHoy.length,
      enviados,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

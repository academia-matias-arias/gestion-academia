#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  fetchStudents,
  findBirthdaysToday,
  buildBirthdayMessage,
  sendTelegramMessage,
  getTodayParts,
} from '../api/_birthdays.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* .env.local es opcional */
  }
}

loadEnvLocal();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry') || args.includes('--dry-run');
const testIndex = args.indexOf('--test');
const testName = testIndex !== -1 ? args[testIndex + 1] : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan credenciales de Supabase (.env.local).');
    process.exit(1);
  }

  const students = await fetchStudents(supabaseUrl, supabaseKey);
  const today = getTodayParts();

  let targets;
  if (testName) {
    const s = students.find(
      (x) => x.nombre_alumno?.toLowerCase() === testName.toLowerCase(),
    );
    if (!s) {
      console.error(`No se encontró al alumno "${testName}".`);
      process.exit(1);
    }
    const birthYear = Number(String(s.fecha_nacimiento).slice(0, 4));
    targets = [{ ...s, edad_cumple: today.year - birthYear }];
    console.log(`Modo TEST con alumno real: ${s.nombre_alumno}`);
  } else {
    targets = findBirthdaysToday(students, today);
    console.log(
      `Fecha ${today.year}-${today.month}-${today.day} · cumpleañeros hoy: ${targets.length}`,
    );
  }

  for (const student of targets) {
    const msg = buildBirthdayMessage(student, today);
    if (dryRun) {
      console.log('\n--- (dry-run, no enviado) ---\n' + msg + '\n');
      continue;
    }
    if (!botToken || !chatId) {
      console.error('Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID para enviar.');
      process.exit(1);
    }
    await sendTelegramMessage(botToken, chatId, msg);
    console.log(`✅ Enviado: ${student.nombre_alumno} (${student.edad_cumple} años)`);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

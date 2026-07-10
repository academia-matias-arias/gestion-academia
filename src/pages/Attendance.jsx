import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X } from 'lucide-react';
import { useToast } from '../components/Toast';

const SEDES = ['Carahue', 'Teodoro', 'Toltén'];

const MOCK_STUDENTS = [
  { id: 1, nombre_alumno: "Ambar Oliva", sede: "Toltén" },
  { id: 2, nombre_alumno: "Laura Saavedra", sede: "Toltén" },
  { id: 3, nombre_alumno: "Aylin Fuentes", sede: "Toltén" },
  { id: 4, nombre_alumno: "Samuel Beltran", sede: "Toltén" },
  { id: 5, nombre_alumno: "Benjamin Fernandez", sede: "Toltén" },
  { id: 6, nombre_alumno: "Leidy Vasquez", sede: "Toltén" },
  { id: 7, nombre_alumno: "Cristhofer Norambuena", sede: "Toltén" },
  { id: 8, nombre_alumno: "Tomas Paredes", sede: "Toltén" },
  { id: 9, nombre_alumno: "Axel Vasquez", sede: "Toltén" },
  { id: 10, nombre_alumno: "Sofia Sandoval", sede: "Toltén" },
  { id: 11, nombre_alumno: "Valentina Castro", sede: "Toltén" },
  { id: 12, nombre_alumno: "Martina Castro", sede: "Toltén" },
  { id: 13, nombre_alumno: "Eddy Castro", sede: "Toltén" },
  { id: 14, nombre_alumno: "Patricia Ponce", sede: "Toltén" },
  { id: 15, nombre_alumno: "Fernanda Carrasco", sede: "Toltén" },
  { id: 16, nombre_alumno: "Antonella Nuñez", sede: "Toltén" },
  { id: 17, nombre_alumno: "Victor Nuñez", sede: "Toltén" },
  { id: 18, nombre_alumno: "Dionisia", sede: "Toltén" },
  { id: 19, nombre_alumno: "Jose", sede: "Toltén" },
  { id: 20, nombre_alumno: "Isidora Cheuque", sede: "Toltén" },
  { id: 21, nombre_alumno: "Cesar", sede: "Toltén" },
  { id: 22, nombre_alumno: "Ivanna", sede: "Toltén" },
  { id: 23, nombre_alumno: "Sebastian Valencia", sede: "Toltén" },
  { id: 24, nombre_alumno: "Krishna Leal", sede: "Toltén" },
  { id: 25, nombre_alumno: "Nayadett Zapata", sede: "Toltén" },
  { id: 26, nombre_alumno: "tio nuevo", sede: "Toltén" },
  { id: 27, nombre_alumno: "dora cortes", sede: "Toltén" },
  { id: 28, nombre_alumno: "Carlos Cortez", sede: "Toltén" },
  { id: 29, nombre_alumno: "hija del tio nuevo", sede: "Toltén" },
  { id: 30, nombre_alumno: "Karlita Alarcon", sede: "Teodoro" },
  { id: 31, nombre_alumno: "Pia", sede: "Teodoro" },
  { id: 32, nombre_alumno: "Barbara Jimenez", sede: "Teodoro" },
  { id: 33, nombre_alumno: "Erick Quiñelem", sede: "Teodoro" },
  { id: 34, nombre_alumno: "Greco Muñoz", sede: "Teodoro" },
  { id: 35, nombre_alumno: "Paz Lopez", sede: "Teodoro" },
  { id: 36, nombre_alumno: "Maximiliano Arevalo", sede: "Teodoro" },
  { id: 37, nombre_alumno: "Yoselin Sepulveda", sede: "Teodoro" },
  { id: 38, nombre_alumno: "Tomas Andara", sede: "Teodoro" },
  { id: 39, nombre_alumno: "Isidora Andara", sede: "Teodoro" },
  { id: 40, nombre_alumno: "Scarleth Bernal", sede: "Teodoro" },
  { id: 41, nombre_alumno: "Antonella Quilaqueo", sede: "Teodoro" },
  { id: 42, nombre_alumno: "Joaquin Lopez", sede: "Carahue" },
  { id: 43, nombre_alumno: "Mirtha Rabanal", sede: "Carahue" },
  { id: 44, nombre_alumno: "Sixto Burgos", sede: "Carahue" },
  { id: 45, nombre_alumno: "Maite San Martin", sede: "Carahue" },
  { id: 46, nombre_alumno: "Josefa Muñoz", sede: "Carahue" },
  { id: 47, nombre_alumno: "Martina Muñoz", sede: "Carahue" },
  { id: 48, nombre_alumno: "Felipe Thiers", sede: "Carahue" },
  { id: 49, nombre_alumno: "Jaime Salas", sede: "Carahue" },
  { id: 50, nombre_alumno: "Alejandra", sede: "Carahue" },
  { id: 51, nombre_alumno: "Betsabe Martinez", sede: "Carahue" },
  { id: 52, nombre_alumno: "John Leal", sede: "Carahue" },
  { id: 53, nombre_alumno: "Sabta Gonzalez", sede: "Carahue" },
  { id: 54, nombre_alumno: "Maylen Ramos", sede: "Carahue" },
  { id: 55, nombre_alumno: "Sayen Aparicio", sede: "Carahue" },
  { id: 56, nombre_alumno: "Roman Lopez", sede: "Carahue" },
  { id: 57, nombre_alumno: "Alexander", sede: "Carahue" },
  { id: 58, nombre_alumno: "Vanessa", sede: "Carahue" },
];

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [asistencias, setAsistencias] = useState({}); // { alumnoId: true/false }
  const [sede, setSede] = useState('Carahue');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchData(); }, [sede, fecha]);

  async function fetchData() {
    setLoading(true);
    setSaved(false);

    if (!supabase) {
      setStudents(MOCK_STUDENTS.filter(s => s.sede === sede));
      setAsistencias({});
      setLoading(false);
      return;
    }

    const { data: alumnosData } = await supabase
      .from('alumnos')
      .select('id, nombre_alumno, sede')
      .eq('sede', sede)
      .eq('estado', 'activo');

    const { data: asistData } = await supabase
      .from('asistencias')
      .select('alumno_id, presente')
      .eq('fecha', fecha);

    const alumnos = alumnosData?.length ? alumnosData : MOCK_STUDENTS.filter(s => s.sede === sede);
    const asistMap = {};
    asistData?.forEach(a => { asistMap[a.alumno_id] = a.presente; });

    setStudents(alumnos);
    setAsistencias(asistMap);
    setLoading(false);
  }

  function toggle(id, value) {
    setAsistencias(prev => ({ ...prev, [id]: value }));
    setSaved(false);
  }

  function marcarTodos(value) {
    const newMap = {};
    students.forEach(s => { newMap[s.id] = value; });
    setAsistencias(newMap);
    setSaved(false);
  }

  async function guardarAsistencia() {
    setSaving('all');
    if (supabase) {
      const records = students.map(s => ({
        alumno_id: s.id,
        fecha,
        presente: asistencias[s.id] ?? false,
      }));
      await supabase.from('asistencias').upsert(records, { onConflict: 'alumno_id,fecha' });
    }
    setSaving(null);
    setSaved(true);
    addToast('Asistencia guardada correctamente');
  }

  const presentes = students.filter(s => asistencias[s.id] === true).length;
  const ausentes = students.filter(s => asistencias[s.id] === false).length;
  const sinMarcar = students.length - presentes - ausentes;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title" style={{ margin: 0 }}>Asistencia</h2>
      </div>

      <div className="filter-bar">
        <select className="form-control" value={sede} onChange={e => setSede(e.target.value)}>
          {SEDES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input
          type="date"
          className="form-control"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="card attendance-summary">
        <div className="attend-stat" style={{ color: 'var(--success)' }}>
          <strong>{presentes}</strong>
          <span>Presentes</span>
        </div>
        <div className="attend-stat" style={{ color: 'var(--danger)' }}>
          <strong>{ausentes}</strong>
          <span>Ausentes</span>
        </div>
        <div className="attend-stat" style={{ color: '#a0aec0' }}>
          <strong>{sinMarcar}</strong>
          <span>Sin marcar</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className="btn btn-outline" style={{ flex: 1, color: 'var(--success)', borderColor: 'var(--success)', fontSize: '0.78rem', padding: '0.4rem 0.75rem', minHeight: '36px' }} onClick={() => marcarTodos(true)}>
          <Check size={14} /> Todos presentes
        </button>
        <button className="btn btn-outline" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.78rem', padding: '0.4rem 0.75rem', minHeight: '36px' }} onClick={() => marcarTodos(false)}>
          <X size={14} /> Todos ausentes
        </button>
      </div>

      {loading ? <div className="loading-spinner">Cargando...</div> : (
        <>
          <div className="card" style={{ padding: 0, marginBottom: '1rem' }}>
            <ul className="student-list">
              {students.map(s => {
                const estado = asistencias[s.id];
                return (
                  <li key={s.id} className="student-item">
                    <div className="student-avatar">{s.nombre_alumno?.[0]}</div>
                    <div className="student-info">
                      <div className="student-name">{s.nombre_alumno}</div>
                    </div>
                    <div className="attend-buttons">
                      <button
                        className={`attend-btn ${estado === true ? 'attend-present' : ''}`}
                        onClick={() => toggle(s.id, true)}
                        title="Presente"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        className={`attend-btn ${estado === false ? 'attend-absent' : ''}`}
                        onClick={() => toggle(s.id, false)}
                        title="Ausente"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
            onClick={guardarAsistencia}
            disabled={saving === 'all'}
          >
            {saving === 'all' ? 'Guardando...' : saved ? '✓ Guardado correctamente' : 'Guardar Asistencia'}
          </button>
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Calendar } from 'lucide-react';

const SEDES = ['Carahue', 'Teodoro', 'Toltén'];

const MOCK_STUDENTS = [
  { id: 1, nombre_alumno: 'Joaquin Lopez', sede: 'Carahue' },
  { id: 2, nombre_alumno: 'Mirtha Rabanal', sede: 'Carahue' },
  { id: 3, nombre_alumno: 'Sixto Burgos', sede: 'Carahue' },
  { id: 4, nombre_alumno: 'Karlita Alarcon', sede: 'Teodoro' },
  { id: 5, nombre_alumno: 'Erick Quiñelem', sede: 'Teodoro' },
  { id: 6, nombre_alumno: 'Greco Muñoz', sede: 'Teodoro' },
  { id: 7, nombre_alumno: 'Laura Saavedra', sede: 'Toltén' },
  { id: 8, nombre_alumno: 'Aylin Fuentes', sede: 'Toltén' },
  { id: 9, nombre_alumno: 'Samuel Beltran', sede: 'Toltén' },
];

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [asistencias, setAsistencias] = useState({}); // { alumnoId: true/false }
  const [sede, setSede] = useState('Carahue');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchData(); }, [sede, fecha]);

  async function fetchData() {
    setLoading(true);
    setSaved(false);

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
    for (const s of students) {
      const presente = asistencias[s.id] ?? false;
      await supabase.from('asistencias').upsert({
        alumno_id: s.id,
        fecha,
        presente,
      }, { onConflict: 'alumno_id,fecha' });
    }
    setSaving(null);
    setSaved(true);
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
        <button className="btn btn-outline" style={{ flex: 1, color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => marcarTodos(true)}>
          <Check size={16} /> Todos presentes
        </button>
        <button className="btn btn-outline" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => marcarTodos(false)}>
          <X size={16} /> Todos ausentes
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

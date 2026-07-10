import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const MESES = ['Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const SEDES = ['Todas', 'Carahue', 'Teodoro', 'Toltén'];

const MOCK_STUDENTS = [
  { id: 1, nombre_alumno: "Ambar Oliva", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 2, nombre_alumno: "Laura Saavedra", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 3, nombre_alumno: "Aylin Fuentes", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 4, nombre_alumno: "Samuel Beltran", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 5, nombre_alumno: "Benjamin Fernandez", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 6, nombre_alumno: "Leidy Vasquez", sede: "Toltén", valor_mensualidad: 10000 },
  { id: 7, nombre_alumno: "Cristhofer Norambuena", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 8, nombre_alumno: "Tomas Paredes", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 9, nombre_alumno: "Axel Vasquez", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 10, nombre_alumno: "Sofia Sandoval", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 11, nombre_alumno: "Valentina Castro", sede: "Toltén", valor_mensualidad: 5000 },
  { id: 12, nombre_alumno: "Martina Castro", sede: "Toltén", valor_mensualidad: 5000 },
  { id: 13, nombre_alumno: "Eddy Castro", sede: "Toltén", valor_mensualidad: 5000 },
  { id: 14, nombre_alumno: "Patricia Ponce", sede: "Toltén", valor_mensualidad: 5000 },
  { id: 15, nombre_alumno: "Fernanda Carrasco", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 16, nombre_alumno: "Antonella Nuñez", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 17, nombre_alumno: "Victor Nuñez", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 18, nombre_alumno: "Dionisia", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 19, nombre_alumno: "Jose", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 20, nombre_alumno: "Isidora Cheuque", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 21, nombre_alumno: "Cesar", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 22, nombre_alumno: "Ivanna", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 23, nombre_alumno: "Sebastian Valencia", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 24, nombre_alumno: "Krishna Leal", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 25, nombre_alumno: "Nayadett Zapata", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 26, nombre_alumno: "tio nuevo", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 27, nombre_alumno: "dora cortes", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 28, nombre_alumno: "Carlos Cortez", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 29, nombre_alumno: "hija del tio nuevo", sede: "Toltén", valor_mensualidad: 15000 },
  { id: 30, nombre_alumno: "Karlita Alarcon", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 31, nombre_alumno: "Pia", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 32, nombre_alumno: "Barbara Jimenez", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 33, nombre_alumno: "Erick Quiñelem", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 34, nombre_alumno: "Greco Muñoz", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 35, nombre_alumno: "Paz Lopez", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 36, nombre_alumno: "Maximiliano Arevalo", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 37, nombre_alumno: "Yoselin Sepulveda", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 38, nombre_alumno: "Tomas Andara", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 39, nombre_alumno: "Isidora Andara", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 40, nombre_alumno: "Scarleth Bernal", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 41, nombre_alumno: "Antonella Quilaqueo", sede: "Teodoro", valor_mensualidad: 15000 },
  { id: 42, nombre_alumno: "Joaquin Lopez", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 43, nombre_alumno: "Mirtha Rabanal", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 44, nombre_alumno: "Sixto Burgos", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 45, nombre_alumno: "Maite San Martin", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 46, nombre_alumno: "Josefa Muñoz", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 47, nombre_alumno: "Martina Muñoz", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 48, nombre_alumno: "Felipe Thiers", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 49, nombre_alumno: "Jaime Salas", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 50, nombre_alumno: "Alejandra", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 51, nombre_alumno: "Betsabe Martinez", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 52, nombre_alumno: "John Leal", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 53, nombre_alumno: "Sabta Gonzalez", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 54, nombre_alumno: "Maylen Ramos", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 55, nombre_alumno: "Sayen Aparicio", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 56, nombre_alumno: "Roman Lopez", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 57, nombre_alumno: "Alexander", sede: "Carahue", valor_mensualidad: 15000 },
  { id: 58, nombre_alumno: "Vanessa", sede: "Carahue", valor_mensualidad: 15000 },
];

const MOCK_PAGOS = {
  Junio: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,25,26,27,35,36,40,41,42,43,44,45,46,47,48,50,52,53,54,55,56,57,58],
  Julio: [2,3,4,5,8,15,16,17,18,19,21,22,23,25,26,27,28,29,35,38,41,48,50,55],
};

export default function Payments() {
  const [students, setStudents] = useState([]);
  const [pagos, setPagos] = useState({});  // { alumnoId_mes: true/false }
  const [mes, setMes] = useState(MESES[1]); // Julio
  const [sedeFilter, setSedeFilter] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => { fetchData(); }, [mes]);

  async function fetchData() {
    setLoading(true);
    if (!supabase) {
      setStudents(MOCK_STUDENTS);
      const pagosSet = {};
      (MOCK_PAGOS[mes] || []).forEach(id => { pagosSet[id] = true; });
      setPagos(pagosSet);
      setLoading(false);
      return;
    }

    const { data: alumnosData } = await supabase
      .from('alumnos')
      .select('id, nombre_alumno, sede, valor_mensualidad')
      .eq('estado', 'activo');

    const { data: pagosData } = await supabase
      .from('pagos')
      .select('alumno_id')
      .eq('mes', mes)
      .eq('anio', 2026);

    const alumnos = alumnosData?.length ? alumnosData : MOCK_STUDENTS;
    const pagosSet = {};
    if (pagosData?.length) {
      pagosData.forEach(p => { pagosSet[p.alumno_id] = true; });
    } else {
      (MOCK_PAGOS[mes] || []).forEach(id => { pagosSet[id] = true; });
    }

    setStudents(alumnos);
    setPagos(pagosSet);
    setLoading(false);
  }

  async function togglePago(alumno) {
    setSaving(alumno.id);
    const pagado = pagos[alumno.id];

    if (pagado) {
      if (supabase) {
        await supabase.from('pagos').delete().eq('alumno_id', alumno.id).eq('mes', mes).eq('anio', 2026);
      }
      setPagos(prev => { const n = { ...prev }; delete n[alumno.id]; return n; });
    } else {
      if (supabase) {
        await supabase.from('pagos').insert([{
          alumno_id: alumno.id,
          mes,
          anio: 2026,
          monto_pagado: alumno.valor_mensualidad,
          fecha_registro: new Date().toISOString().split('T')[0],
        }]);
      }
      setPagos(prev => ({ ...prev, [alumno.id]: true }));
    }
    setSaving(null);
  }

  const filtered = sedeFilter === 'Todas' ? students : students.filter(s => s.sede === sedeFilter);
  const pagados = filtered.filter(s => pagos[s.id]).length;
  const totalMes = filtered.filter(s => pagos[s.id]).reduce((sum, s) => sum + (s.valor_mensualidad || 0), 0);
  const totalEsperado = filtered.reduce((sum, s) => sum + (s.valor_mensualidad || 0), 0);
  const pendiente = totalEsperado - totalMes;
  const pct = filtered.length ? Math.round((pagados / filtered.length) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title" style={{ margin: 0 }}>Pagos 2026</h2>
      </div>

      <div className="filter-bar">
        <select className="form-control" value={mes} onChange={e => setMes(e.target.value)}>
          {MESES.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="form-control" value={sedeFilter} onChange={e => setSedeFilter(e.target.value)}>
          {SEDES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="card payments-summary">
        <div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{pagados}/{filtered.length}</div>
          <div className="stat-label">Pagaron en {mes}</div>
        </div>
        <div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>${totalMes.toLocaleString('es-CL')}</div>
          <div className="stat-label">Ingresos recaudados</div>
        </div>
        <div>
          <div className="stat-value" style={{ color: pct === 100 ? 'var(--success)' : 'var(--warning)' }}>{pct}%</div>
          <div className="stat-label">Completado</div>
        </div>
        <div>
          <div className="stat-value" style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>${pendiente.toLocaleString('es-CL')}</div>
          <div className="stat-label">Pendiente por cobrar</div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar-wrapper" style={{ marginBottom: '1rem' }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {loading ? <div className="loading-spinner">Cargando...</div> : (
        <div className="card" style={{ padding: 0 }}>
          <ul className="student-list">
            {filtered.map(s => {
              const pagado = !!pagos[s.id];
              return (
                <li key={s.id} className={`student-item ${pagado ? 'paid' : ''}`}>
                  <div className="student-avatar" style={{ backgroundColor: pagado ? 'var(--success)' : 'var(--border)', color: pagado ? 'white' : 'var(--text-muted)' }}>
                    {pagado ? <Check size={18} /> : s.nombre_alumno?.[0]}
                  </div>
                  <div className="student-info">
                    <div className="student-name">{s.nombre_alumno}</div>
                    <div className="student-meta">
                      {s.sede} · ${(s.valor_mensualidad || 15000).toLocaleString('es-CL')}
                    </div>
                  </div>
                  <button
                    className={`pay-btn ${pagado ? 'pay-btn-paid' : 'pay-btn-pending'}`}
                    onClick={() => togglePago(s)}
                    disabled={saving === s.id}
                  >
                    {saving === s.id ? '...' : pagado ? '✓ Pagado' : 'Marcar pago'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

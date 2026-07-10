import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const MESES = ['Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const SEDES = ['Todas', 'Carahue', 'Teodoro', 'Toltén'];

const MOCK_STUDENTS = [
  { id: 1, nombre_alumno: 'Joaquin Lopez', sede: 'Carahue', valor_mensualidad: 15000 },
  { id: 2, nombre_alumno: 'Mirtha Rabanal', sede: 'Carahue', valor_mensualidad: 15000 },
  { id: 3, nombre_alumno: 'Karlita Alarcon', sede: 'Teodoro', valor_mensualidad: 15000 },
  { id: 4, nombre_alumno: 'Erick Quiñelem', sede: 'Teodoro', valor_mensualidad: 15000 },
  { id: 5, nombre_alumno: 'Laura Saavedra', sede: 'Toltén', valor_mensualidad: 15000 },
  { id: 6, nombre_alumno: 'Ambar Oliva', sede: 'Toltén', valor_mensualidad: 15000 },
];

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
    pagosData?.forEach(p => { pagosSet[p.alumno_id] = true; });

    setStudents(alumnos);
    setPagos(pagosSet);
    setLoading(false);
  }

  async function togglePago(alumno) {
    setSaving(alumno.id);
    const pagado = pagos[alumno.id];

    if (pagado) {
      await supabase.from('pagos').delete().eq('alumno_id', alumno.id).eq('mes', mes).eq('anio', 2026);
      setPagos(prev => { const n = { ...prev }; delete n[alumno.id]; return n; });
    } else {
      await supabase.from('pagos').insert([{
        alumno_id: alumno.id,
        mes,
        anio: 2026,
        monto_pagado: alumno.valor_mensualidad,
        fecha_registro: new Date().toISOString().split('T')[0],
      }]);
      setPagos(prev => ({ ...prev, [alumno.id]: true }));
    }
    setSaving(null);
  }

  const filtered = sedeFilter === 'Todas' ? students : students.filter(s => s.sede === sedeFilter);
  const pagados = filtered.filter(s => pagos[s.id]).length;
  const totalMes = filtered.filter(s => pagos[s.id]).reduce((sum, s) => sum + (s.valor_mensualidad || 0), 0);
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
                  <div className="student-avatar" style={{ backgroundColor: pagado ? 'var(--success)' : '#e2e8f0', color: pagado ? 'white' : '#a0aec0' }}>
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

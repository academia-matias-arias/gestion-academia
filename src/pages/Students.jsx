import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, X, ChevronRight, Phone } from 'lucide-react';

const SEDES = ['Carahue', 'Teodoro', 'Toltén'];
const MOCK_STUDENTS = [
  { id: 1, nombre_alumno: 'Karlita Alarcon', edad: '15 años', sede: 'Teodoro', contacto: '56951060000', estado: 'activo', valor_mensualidad: 15000 },
  { id: 2, nombre_alumno: 'Joaquin Lopez', edad: '17 años', sede: 'Carahue', contacto: '56949590000', estado: 'activo', valor_mensualidad: 15000 },
  { id: 3, nombre_alumno: 'Ambar Oliva', edad: '10 años', sede: 'Toltén', contacto: '56946540000', estado: 'retirado', valor_mensualidad: 15000 },
  { id: 4, nombre_alumno: 'Laura Saavedra', edad: '11 años', sede: 'Toltén', contacto: '56965630000', estado: 'activo', valor_mensualidad: 15000 },
  { id: 5, nombre_alumno: 'Erick Quiñelem', edad: '9 años', sede: 'Teodoro', contacto: '56986800000', estado: 'activo', valor_mensualidad: 15000 },
  { id: 6, nombre_alumno: 'Mirtha Rabanal', edad: '8 años', sede: 'Carahue', contacto: '56990940000', estado: 'activo', valor_mensualidad: 15000 },
];

const EMPTY_FORM = { nombre_alumno: '', edad: '', fecha_nacimiento: '', sede: 'Carahue', contacto: '', valor_mensualidad: 15000, estado: 'activo' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sedeFilter, setSedeFilter] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    let result = students;
    if (sedeFilter !== 'Todas') result = result.filter(s => s.sede === sedeFilter);
    if (search) result = result.filter(s => s.nombre_alumno?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [students, search, sedeFilter]);

  async function fetchStudents() {
    setLoading(true);
    const { data, error } = await supabase.from('alumnos').select('*').order('nombre_alumno');
    if (error || !data?.length) {
      setStudents(MOCK_STUDENTS);
    } else {
      setStudents(data);
    }
    setLoading(false);
  }

  function openNew() { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }
  function openEdit(s) { setForm({ ...s }); setEditId(s.id); setShowModal(true); }

  async function handleSave() {
    setSaving(true);
    if (editId) {
      const { error } = await supabase.from('alumnos').update(form).eq('id', editId);
      if (!error) {
        setStudents(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
      }
    } else {
      const { data, error } = await supabase.from('alumnos').insert([form]).select().single();
      if (!error && data) {
        setStudents(prev => [...prev, data]);
      } else {
        // Mock insert
        setStudents(prev => [...prev, { ...form, id: Date.now() }]);
      }
    }
    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este alumno?')) return;
    await supabase.from('alumnos').delete().eq('id', id);
    setStudents(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title" style={{ margin: 0 }}>Alumnos</h2>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} color="#a0aec0" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control sede-select" value={sedeFilter} onChange={e => setSedeFilter(e.target.value)}>
          <option>Todas</option>
          {SEDES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="loading-spinner">Cargando...</div> : (
        <div className="card" style={{ padding: 0 }}>
          <ul className="student-list">
            {filtered.length === 0 && (
              <li style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>No se encontraron alumnos</li>
            )}
            {filtered.map(s => (
              <li key={s.id} className="student-item" onClick={() => openEdit(s)}>
                <div className="student-avatar">{s.nombre_alumno?.[0]}</div>
                <div className="student-info">
                  <div className="student-name">{s.nombre_alumno}</div>
                  <div className="student-meta">{s.sede} · {s.edad}</div>
                </div>
                <div className={`badge ${s.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                  {s.estado}
                </div>
                <ChevronRight size={16} color="#a0aec0" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Alumno' : 'Nuevo Alumno'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-control" value={form.nombre_alumno} onChange={e => setForm({...form, nombre_alumno: e.target.value})} placeholder="Nombre del alumno" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input className="form-control" value={form.edad} onChange={e => setForm({...form, edad: e.target.value})} placeholder="Ej: 15 años" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha Nacimiento</label>
                  <input type="date" className="form-control" value={form.fecha_nacimiento?.split('T')[0] || ''} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sede</label>
                  <select className="form-control" value={form.sede} onChange={e => setForm({...form, sede: e.target.value})}>
                    {SEDES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-control" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                    <option value="activo">Activo</option>
                    <option value="retirado">Retirado</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contacto (celular)</label>
                  <input className="form-control" value={form.contacto} onChange={e => setForm({...form, contacto: e.target.value})} placeholder="+56 9 1234 5678" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mensualidad ($)</label>
                  <input type="number" className="form-control" value={form.valor_mensualidad} onChange={e => setForm({...form, valor_mensualidad: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {editId && (
                <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(editId)}>
                  Eliminar
                </button>
              )}
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

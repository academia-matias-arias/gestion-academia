import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, X, ChevronRight } from 'lucide-react';
import { useToast } from '../components/Toast';

const SEDES = ['Carahue', 'Teodoro', 'Toltén'];
const ESTADOS = ['activo', 'congelado', 'retiro_momentaneo', 'retirado'];
const ESTADO_LABELS = { activo: 'Activo', congelado: 'Congelado', retiro_momentaneo: 'Retiro momentáneo', retirado: 'Retirado' };
const ESTADO_BADGE = { activo: 'badge-success', congelado: 'badge-warning', retiro_momentaneo: 'badge-info', retirado: 'badge-danger' };
const MOCK_STUDENTS = [
  { id: 1, nombre_alumno: "Ambar Oliva", edad: "10 años", fecha_nacimiento: "2016-08-27", sede: "Toltén", contacto: "56946541399", valor_mensualidad: 15000, estado: "retirado" },
  { id: 2, nombre_alumno: "Laura Saavedra", edad: "11 años", fecha_nacimiento: "2015-01-24", sede: "Toltén", contacto: "56965634228", valor_mensualidad: 15000, estado: "activo" },
  { id: 3, nombre_alumno: "Aylin Fuentes", edad: "11 años", fecha_nacimiento: "2014-10-27", sede: "Toltén", contacto: "56934205016", valor_mensualidad: 15000, estado: "activo" },
  { id: 4, nombre_alumno: "Samuel Beltran", edad: "12 años", fecha_nacimiento: "2013-11-09", sede: "Toltén", contacto: "56945520572", valor_mensualidad: 15000, estado: "activo" },
  { id: 5, nombre_alumno: "Benjamin Fernandez", edad: "13 años", fecha_nacimiento: "", sede: "Toltén", contacto: "56976636437", valor_mensualidad: 15000, estado: "activo" },
  { id: 6, nombre_alumno: "Leidy Vasquez", edad: "15 años", fecha_nacimiento: "2010-11-26", sede: "Toltén", contacto: "56979499484", valor_mensualidad: 10000, estado: "retirado" },
  { id: 7, nombre_alumno: "Cristhofer Norambuena", edad: "16 años", fecha_nacimiento: "2009-10-28", sede: "Toltén", contacto: "56988753536", valor_mensualidad: 15000, estado: "activo" },
  { id: 8, nombre_alumno: "Tomas Paredes", edad: "5 años", fecha_nacimiento: "", sede: "Toltén", contacto: "56988546717", valor_mensualidad: 15000, estado: "activo" },
  { id: 9, nombre_alumno: "Axel Vasquez", edad: "9 años", fecha_nacimiento: "2016-11-06", sede: "Toltén", contacto: "56979499484", valor_mensualidad: 15000, estado: "retirado" },
  { id: 10, nombre_alumno: "Sofia Sandoval", edad: "11 años", fecha_nacimiento: "2015-02-12", sede: "Toltén", contacto: "56964855668", valor_mensualidad: 15000, estado: "activo" },
  { id: 11, nombre_alumno: "Valentina Castro", edad: "11 años", fecha_nacimiento: "2014-05-17", sede: "Toltén", contacto: "56933791806", valor_mensualidad: 5000, estado: "activo" },
  { id: 12, nombre_alumno: "Martina Castro", edad: "5 años", fecha_nacimiento: "2020-11-07", sede: "Toltén", contacto: "56933731806", valor_mensualidad: 5000, estado: "activo" },
  { id: 13, nombre_alumno: "Eddy Castro", edad: "34 años", fecha_nacimiento: "1992-05-20", sede: "Toltén", contacto: "", valor_mensualidad: 5000, estado: "activo" },
  { id: 14, nombre_alumno: "Patricia Ponce", edad: "34 años", fecha_nacimiento: "1992-07-11", sede: "Toltén", contacto: "", valor_mensualidad: 5000, estado: "activo" },
  { id: 15, nombre_alumno: "Fernanda Carrasco", edad: "18 años", fecha_nacimiento: "2007-12-03", sede: "Toltén", contacto: "56937343120", valor_mensualidad: 15000, estado: "activo" },
  { id: 16, nombre_alumno: "Antonella Nuñez", edad: "17 años", fecha_nacimiento: "2008-07-15", sede: "Toltén", contacto: "56939654471", valor_mensualidad: 15000, estado: "activo" },
  { id: 17, nombre_alumno: "Victor Nuñez", edad: "13 años", fecha_nacimiento: "2012-06-20", sede: "Toltén", contacto: "56939654471", valor_mensualidad: 15000, estado: "activo" },
  { id: 18, nombre_alumno: "Dionisia", edad: "44 años", fecha_nacimiento: "2019-01-01", sede: "Toltén", contacto: "56985431888", valor_mensualidad: 15000, estado: "activo" },
  { id: 19, nombre_alumno: "Jose", edad: "6 años", fecha_nacimiento: "2019-12-09", sede: "Toltén", contacto: "56985431888", valor_mensualidad: 15000, estado: "activo" },
  { id: 20, nombre_alumno: "Isidora Cheuque", edad: "15 años", fecha_nacimiento: "2010-07-15", sede: "Toltén", contacto: "56933830181", valor_mensualidad: 15000, estado: "activo" },
  { id: 21, nombre_alumno: "Cesar", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 22, nombre_alumno: "Ivanna", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 23, nombre_alumno: "Sebastian Valencia", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 24, nombre_alumno: "Krishna Leal", edad: "7 años", fecha_nacimiento: "", sede: "Toltén", contacto: "56959425438", valor_mensualidad: 15000, estado: "activo" },
  { id: 25, nombre_alumno: "Nayadett Zapata", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 26, nombre_alumno: "tio nuevo", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 27, nombre_alumno: "dora cortes", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 28, nombre_alumno: "Carlos Cortez", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 29, nombre_alumno: "hija del tio nuevo", edad: "", fecha_nacimiento: "", sede: "Toltén", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 30, nombre_alumno: "Karlita Alarcon", edad: "15 años", fecha_nacimiento: "2010-06-30", sede: "Teodoro", contacto: "56951055200", valor_mensualidad: 15000, estado: "activo" },
  { id: 31, nombre_alumno: "Pia", edad: "", fecha_nacimiento: "", sede: "Teodoro", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 32, nombre_alumno: "Barbara Jimenez", edad: "", fecha_nacimiento: "", sede: "Teodoro", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 33, nombre_alumno: "Erick Quiñelem", edad: "9 años", fecha_nacimiento: "2016-07-08", sede: "Teodoro", contacto: "56986798947", valor_mensualidad: 15000, estado: "activo" },
  { id: 34, nombre_alumno: "Greco Muñoz", edad: "", fecha_nacimiento: "", sede: "Teodoro", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 35, nombre_alumno: "Paz Lopez", edad: "16 años", fecha_nacimiento: "2009-07-07", sede: "Teodoro", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 36, nombre_alumno: "Maximiliano Arevalo", edad: "11 años", fecha_nacimiento: "2015-02-05", sede: "Teodoro", contacto: "5694565701", valor_mensualidad: 15000, estado: "activo" },
  { id: 37, nombre_alumno: "Yoselin Sepulveda", edad: "", fecha_nacimiento: "", sede: "Teodoro", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 38, nombre_alumno: "Tomas Andara", edad: "", fecha_nacimiento: "", sede: "Teodoro", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 39, nombre_alumno: "Isidora Andara", edad: "", fecha_nacimiento: "", sede: "Teodoro", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 40, nombre_alumno: "Scarleth Bernal", edad: "9 años", fecha_nacimiento: "2016-09-23", sede: "Teodoro", contacto: "56961755141", valor_mensualidad: 15000, estado: "activo" },
  { id: 41, nombre_alumno: "Antonella Quilaqueo", edad: "14 años", fecha_nacimiento: "2011-11-23", sede: "Teodoro", contacto: "56992870896", valor_mensualidad: 15000, estado: "activo" },
  { id: 42, nombre_alumno: "Joaquin Lopez", edad: "17 años", fecha_nacimiento: "2008-09-02", sede: "Carahue", contacto: "56949592278", valor_mensualidad: 15000, estado: "activo" },
  { id: 43, nombre_alumno: "Mirtha Rabanal", edad: "8 años", fecha_nacimiento: "2017-06-03", sede: "Carahue", contacto: "56990941793", valor_mensualidad: 15000, estado: "activo" },
  { id: 44, nombre_alumno: "Sixto Burgos", edad: "16 años", fecha_nacimiento: "2009-07-21", sede: "Carahue", contacto: "56956056730", valor_mensualidad: 15000, estado: "activo" },
  { id: 45, nombre_alumno: "Maite San Martin", edad: "15 años", fecha_nacimiento: "2010-07-08", sede: "Carahue", contacto: "56995760203", valor_mensualidad: 15000, estado: "activo" },
  { id: 46, nombre_alumno: "Josefa Muñoz", edad: "9 años", fecha_nacimiento: "2017-02-22", sede: "Carahue", contacto: "56984102132", valor_mensualidad: 15000, estado: "activo" },
  { id: 47, nombre_alumno: "Martina Muñoz", edad: "13 años", fecha_nacimiento: "2012-12-26", sede: "Carahue", contacto: "56984102132", valor_mensualidad: 15000, estado: "activo" },
  { id: 48, nombre_alumno: "Felipe Thiers", edad: "45 años", fecha_nacimiento: "", sede: "Carahue", contacto: "56976274357", valor_mensualidad: 15000, estado: "activo" },
  { id: 49, nombre_alumno: "Jaime Salas", edad: "11 años", fecha_nacimiento: "2014-12-07", sede: "Carahue", contacto: "56966103042", valor_mensualidad: 15000, estado: "activo" },
  { id: 50, nombre_alumno: "Alejandra", edad: "44 años", fecha_nacimiento: "1982-04-01", sede: "Carahue", contacto: "56976354734", valor_mensualidad: 15000, estado: "activo" },
  { id: 51, nombre_alumno: "Betsabe Martinez", edad: "39 años", fecha_nacimiento: "1986-07-31", sede: "Carahue", contacto: "56961671379", valor_mensualidad: 15000, estado: "activo" },
  { id: 52, nombre_alumno: "John Leal", edad: "49 años", fecha_nacimiento: "", sede: "Carahue", contacto: "56975259471", valor_mensualidad: 15000, estado: "activo" },
  { id: 53, nombre_alumno: "Sabta Gonzalez", edad: "24 años", fecha_nacimiento: "", sede: "Carahue", contacto: "56921815459", valor_mensualidad: 15000, estado: "activo" },
  { id: 54, nombre_alumno: "Maylen Ramos", edad: "39 años", fecha_nacimiento: "1986-11-29", sede: "Carahue", contacto: "56974572461", valor_mensualidad: 15000, estado: "activo" },
  { id: 55, nombre_alumno: "Sayen Aparicio", edad: "", fecha_nacimiento: "", sede: "Carahue", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 56, nombre_alumno: "Roman Lopez", edad: "", fecha_nacimiento: "", sede: "Carahue", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 57, nombre_alumno: "Alexander", edad: "", fecha_nacimiento: "", sede: "Carahue", contacto: "", valor_mensualidad: 15000, estado: "activo" },
  { id: 58, nombre_alumno: "Vanessa", edad: "", fecha_nacimiento: "", sede: "Carahue", contacto: "", valor_mensualidad: 15000, estado: "activo" },
];

const EMPTY_FORM = { nombre_alumno: '', edad: '', fecha_nacimiento: '', sede: 'Carahue', contacto: '', valor_mensualidad: 15000, dia_pago: '', estado: 'activo', motivo_retiro: '', beca: false, monto_beca: 0 };

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
  const { addToast } = useToast();

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    let result = students;
    if (sedeFilter !== 'Todas') result = result.filter(s => s.sede === sedeFilter);
    if (search) result = result.filter(s => s.nombre_alumno?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [students, search, sedeFilter]);

  async function fetchStudents() {
    setLoading(true);
    if (!supabase) {
      setStudents(MOCK_STUDENTS);
      setLoading(false);
      return;
    }
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
    let cleanForm = { ...form, fecha_nacimiento: form.fecha_nacimiento || null, dia_pago: form.dia_pago ? Number(form.dia_pago) : null };
    if (editId) {
      const { id: _id, ...updateData } = cleanForm;
      setStudents(prev => prev.map(s => s.id === editId ? { ...s, ...cleanForm } : s));
      if (supabase) {
        const { error } = await supabase.from('alumnos').update(updateData).eq('id', editId);
        if (error) console.error('Error al actualizar alumno:', error.message);
      }
    } else {
      const { id: _id, ...insertData } = cleanForm;
      if (supabase) {
        const { data, error } = await supabase.from('alumnos').insert([insertData]).select().single();
        if (!error && data) {
          setStudents(prev => [...prev, data]);
        } else if (error) {
          console.error('Error al crear alumno:', error.message);
          setStudents(prev => [...prev, { ...cleanForm, id: Date.now() }]);
        }
      } else {
        setStudents(prev => [...prev, { ...cleanForm, id: Date.now() }]);
      }
    }
    setSaving(false);
    setShowModal(false);
    addToast(editId ? 'Alumno actualizado correctamente' : 'Alumno creado correctamente');
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este alumno?')) return;
    if (supabase) {
      await supabase.from('alumnos').delete().eq('id', id);
    }
    setStudents(prev => prev.filter(s => s.id !== id));
    addToast('Alumno eliminado correctamente');
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
                <div className={`badge ${ESTADO_BADGE[s.estado] || 'badge-danger'}`}>
                  {ESTADO_LABELS[s.estado] || s.estado}
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
                  <select className="form-control" value={form.estado} onChange={e => setForm({...form, estado: e.target.value, motivo_retiro: e.target.value === 'activo' ? '' : form.motivo_retiro})}>
                    {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contacto (celular)</label>
                <input className="form-control" value={form.contacto} onChange={e => setForm({...form, contacto: e.target.value})} placeholder="+56 9 1234 5678" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mensualidad ($)</label>
                  <input type="number" className="form-control" value={form.valor_mensualidad} onChange={e => setForm({...form, valor_mensualidad: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Día de pago mensual</label>
                  <input type="number" min="1" max="31" className="form-control" value={form.dia_pago || ''} onChange={e => setForm({...form, dia_pago: e.target.value})} placeholder="Ej: 5" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Beca</label>
                  <select className="form-control" value={form.beca ? 'si' : 'no'} onChange={e => {
                    const tieneBeca = e.target.value === 'si';
                    setForm({...form, beca: tieneBeca, monto_beca: tieneBeca ? form.monto_beca : 0});
                  }}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                {form.beca && (
                  <div className="form-group">
                    <label className="form-label">Monto Beca ($)</label>
                    <input type="number" className="form-control" value={form.monto_beca} onChange={e => setForm({...form, monto_beca: Number(e.target.value)})} />
                  </div>
                )}
              </div>
              {form.estado !== 'activo' && (
                <div className="form-group">
                  <label className="form-label">Motivo del retiro / baja</label>
                  <textarea className="form-control" rows={3} value={form.motivo_retiro} onChange={e => setForm({...form, motivo_retiro: e.target.value})} placeholder="Ej: Problemas económicos, falta de tiempo, no le gustó..." />
                </div>
              )}
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

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Users, DollarSign, CalendarCheck, PanelLeftClose, PanelLeft } from 'lucide-react';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ToastProvider>
    <Router>
      <div className="app-container">
        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <nav className={`bottom-nav${sidebarCollapsed ? ' collapsed' : ''}`}>
          <div className="sidebar-logo">
            <img src="/logo-academia-sin-fonde.png" alt="Academia de Cueca" />
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <Home />
            <span>Inicio</span>
          </NavLink>
          <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users />
            <span>Alumnos</span>
          </NavLink>
          <NavLink to="/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <DollarSign />
            <span>Pagos</span>
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CalendarCheck />
            <span>Asistencia</span>
          </NavLink>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <header className="mobile-header">
            <img src="/logo-academia-sin-fonde.png" alt="Academia de Cueca" className="header-logo" />
            <h1 style={{ color: 'var(--text)' }}>Gestión de Estudiantes</h1>
          </header>
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </Router>
    </ToastProvider>
  );
}

export default App;

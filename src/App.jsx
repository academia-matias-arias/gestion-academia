import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Users, DollarSign, CalendarCheck } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <nav className="bottom-nav">
          <div className="sidebar-logo">
            <span>🎵</span>
            <span>Academia de Cueca</span>
          </div>
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
            <span>🎵</span>
            <h1>Academia de Cueca</h1>
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
  );
}

export default App;

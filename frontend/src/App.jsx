import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categorias from './pages/Categorias';
import Modelos from './pages/Modelos';
import Unidades from './pages/Unidades';
import Estoque from './pages/Estoque';
import Destinatarios from './pages/Destinatarios';
import Movimentacoes from './pages/Movimentacoes';
import Consultas from './pages/Consultas';
import Usuarios from './pages/Usuarios';

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="w-16 h-16 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
    </div>
  );
  return usuario ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { usuario } = useAuth();
  if (usuario?.perfil !== 'admin') return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '12px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="modelos" element={<Modelos />} />
            <Route path="unidades" element={<Unidades />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="destinatarios" element={<Destinatarios />} />
            <Route path="movimentacoes" element={<Movimentacoes />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

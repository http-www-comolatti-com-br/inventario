import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineViewGrid, HiOutlineCube, HiOutlineTag, HiOutlineClipboardList,
  HiOutlineUsers, HiOutlineUserGroup, HiOutlineSwitchHorizontal,
  HiOutlineSearch, HiOutlineLogout, HiOutlineServer, HiOutlineChip,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';

export default function Sidebar({ collapsed, onToggle }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/categorias', icon: HiOutlineTag, label: 'Categorias' },
    { to: '/modelos', icon: HiOutlineCube, label: 'Modelos' },
    { to: '/unidades', icon: HiOutlineServer, label: 'Patrimônio' },
    { to: '/estoque', icon: HiOutlineClipboardList, label: 'Consumíveis' },
    { to: '/destinatarios', icon: HiOutlineUserGroup, label: 'Destinatários' },
    { to: '/movimentacoes', icon: HiOutlineSwitchHorizontal, label: 'Movimentações' },
    { to: '/consultas', icon: HiOutlineSearch, label: 'Consultas' },
    { to: '/ajuda', icon: HiOutlineQuestionMarkCircle, label: 'Ajuda' },
  ];

  if (usuario?.perfil === 'admin') {
    links.push({ to: '/usuarios', icon: HiOutlineUsers, label: 'Usuários' });
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-dark-800/95 backdrop-blur-xl border-r border-dark-600/50 z-40 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-dark-600/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center flex-shrink-0">
            <HiOutlineChip className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyber-cyan to-cyber-blue bg-clip-text text-transparent">
                Inventário
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Controle de TI</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-dark-600/50">
        {!collapsed && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-gray-300 truncate">{usuario?.nome_completo}</p>
            <p className="text-xs text-gray-500 capitalize">{usuario?.perfil}</p>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link w-full text-cyber-red hover:bg-cyber-red/10" title="Sair">
          <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-dark-700 border border-dark-500 rounded-full flex items-center justify-center text-gray-400 hover:text-cyber-cyan transition-colors"
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import QuickAddModal from './QuickAddModal';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [quickModal, setQuickModal] = useState(false);

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onQuickAdd={() => setQuickModal(true)}
      />
      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* Modal global de Ação Rápida */}
      <QuickAddModal isOpen={quickModal} onClose={() => setQuickModal(false)} />
    </div>
  );
}

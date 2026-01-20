import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function Sidebar() {
  const { currentTenant, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Finaxis" className="h-9 w-9 rounded" />
          <h1 className="text-2xl font-bold text-primary-700">FINAXIS</h1>
        </div>
        <p className="text-sm text-gray-600 mt-2">{currentTenant?.name}</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        <Link
          to="/dashboard"
          className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          📊 Dashboard
        </Link>
        <Link
          to="/transactions"
          className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          💰 Transações
        </Link>
        <Link
          to="/accounts"
          className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          🏦 Contas
        </Link>
        <Link
          to="/categories"
          className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          🏷️ Categorias
        </Link>
        <Link
          to="/reports"
          className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          📈 Relatórios
        </Link>
        <Link
          to="/settings"
          className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          ⚙️ Configurações
        </Link>
      </nav>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}

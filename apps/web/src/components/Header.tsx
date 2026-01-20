import { useAuthStore } from '@/store/auth';

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-900">Bem-vindo, {user?.name}!</h2>
      <div className="flex items-center space-x-4">
        <button className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}

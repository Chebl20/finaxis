import { useState, useEffect } from 'react';
import { categoriesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const ICONS = ['🏷️', '🏦', '💼', '🎯', '📊', '🌟'];
const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];

export function CategoriesPage() {
  const { currentTenant } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: COLORS[0],
    icon: ICONS[0],
  });

  // Map common keyword-based icons to pretty emojis for a more polished look
  const getDisplayIcon = (icon: string | undefined) => {
    if (!icon) return '🏷️';
    const key = String(icon).toLowerCase().trim();
    const map: Record<string, string> = {
      home: '🏠',
      house: '🏠',
      aluguel: '🏠',
      wrench: '🔧',
      manutencao: '🧰',
      manutenação: '🧰',
      maintenance: '🧰',
      car: '🚗',
      fuel: '⛽️',
      marketing: '📣',
      markentig: '📣',
      markenting: '📣',
      mkt: '📣',
      mktg: '📣',
      market: '📣',
      megaphone: '📣',
      lightbulb: '💡',
      receipt: '🧾',
      award: '🏅',
      box: '📦',
      storage: '📦',
      utilities: '💡',
      luz: '💡',
      agua: '🚰',
      água: '🚰',
      internet: '🌐',
      tax: '🧾',
      taxes: '🧾',
      juros: '💸',
      fee: '💸',
      salary: '💼',
      salários: '💼',
      salarios: '💼',
      travel: '🧳',
      viagem: '🧳',
      viagens: '🧳',
      plane: '✈️',
      airplane: '✈️',
      flight: '✈️',
      consultoria: '🧠',
      outros: '🗂️',
      other: '🗂️',
      others: '🗂️',
      services: '🛎️',
      serviços: '🛎️',
      service: '🛎️',
      'more-horizontal': '🗂️',
      vendas: '🛒',
      venda: '🛒',
      produtos: '📦',
      royalties: '🏅',
      investimento: '📈',
      invest: '📈',
      receita: '💰',
      income: '💰',
      despesa: '💳',
      expense: '💳',
      'trending-down': '📉',
      'trending-up': '📈',
      zap: '⚡️',
      user: '👤',
      users: '👥',
      suitcase: '💼',
      briefcase: '💼',
    };
    const mapped = map[key];
    // If icon looks like a keyword/identifier and isn't mapped, fallback to a friendly default
    if (!mapped && /^[a-z0-9_.-]+$/i.test(key)) {
      return '🏷️';
    }
    return mapped || icon;
  };

  // Create a translucent background color from hex, used behind icons
  const hexToRgba = (hex: string, alpha = 0.15) => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    if (currentTenant) {
      loadCategories();
    }
  }, [currentTenant]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.list(currentTenant!.id);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await categoriesAPI.create(currentTenant!.id, {
        name: formData.name,
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
      });

      setFormData({
        name: '',
        type: 'expense',
        color: COLORS[0],
        icon: ICONS[0],
      });
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  const expenses = categories.filter((c) => c.type === 'expense');
  const incomes = categories.filter((c) => c.type === 'income');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Categorias</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Organize suas despesas e receitas com clareza visual.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 transition"
        >
          <span className="text-lg">{showForm ? '✖️' : '➕'}</span>
          <span className="font-medium">{showForm ? 'Cancelar' : 'Nova Categoria'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow ring-1 ring-gray-200 dark:ring-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Nova Categoria</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ex: Alimentação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 hover:scale-105 transition ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary-600 dark:ring-offset-gray-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-9 h-9 rounded-lg transition text-lg flex items-center justify-center border border-transparent hover:border-gray-200 dark:hover:border-gray-700 ${
                        formData.icon === icon
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-semibold shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 transition"
            >
              Criar Categoria
            </button>
          </form>
        </div>
      )}

      {/* Despesas */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Despesas</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {expenses.map((category: any) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: category.color || '#ccc' }} />
              <div className="p-5 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-3xl"
                  style={{
                    borderColor: category.color || '#ccc',
                    color: category.color || '#6b7280',
                    backgroundColor: hexToRgba(category.color || '#9ca3af', 0.15),
                  }}
                  aria-hidden
                >
                  {getDisplayIcon(category.icon) || '🏷️'}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{category.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5"
                      style={{ backgroundColor: hexToRgba(category.color || '#9ca3af', 0.15), color: category.color || '#6b7280' }}
                    >
                      Despesa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Receitas */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Receitas</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {incomes.map((category: any) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: category.color || '#ccc' }} />
              <div className="p-5 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-3xl"
                  style={{
                    borderColor: category.color || '#ccc',
                    color: category.color || '#6b7280',
                    backgroundColor: hexToRgba(category.color || '#9ca3af', 0.15),
                  }}
                  aria-hidden
                >
                  {getDisplayIcon(category.icon) || '🏷️'}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{category.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5"
                      style={{ backgroundColor: hexToRgba(category.color || '#9ca3af', 0.15), color: category.color || '#6b7280' }}
                    >
                      Receita
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

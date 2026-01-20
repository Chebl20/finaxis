import { useState, useEffect } from 'react';
import { accountsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function AccountsPage() {
  const { currentTenant } = useAuthStore();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    initialBalance: '',
  });

  useEffect(() => {
    if (currentTenant) {
      loadAccounts();
    }
  }, [currentTenant]);

  const loadAccounts = async () => {
    try {
      const response = await accountsAPI.list(currentTenant!.id);
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await accountsAPI.create(currentTenant!.id, {
        name: formData.name,
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance) || 0,
      });

      setFormData({ name: '', type: 'bank', initialBalance: '' });
      setShowForm(false);
      loadAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {showForm ? 'Cancelar' : '➕ Nova Conta'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nova Conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ex: Banco do Brasil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="bank">Banco</option>
                  <option value="cash">Caixa</option>
                  <option value="credit_card">Cartão de Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saldo Inicial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, initialBalance: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="0,00"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Criar Conta
            </button>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {accounts.map((account: any) => (
          <div key={account.id} className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{account.type}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  R$ {(typeof account.balance === 'string' ? parseFloat(account.balance) || 0 : (typeof account.balance === 'number' ? account.balance : 0)).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <p className="text-sm text-gray-600">
                Saldo Inicial: R$ {(typeof account.initial_balance === 'string' ? parseFloat(account.initial_balance) || 0 : (typeof account.initial_balance === 'number' ? account.initial_balance : 0)).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm text-gray-600">
                Criado em:{' '}
                {new Date(account.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

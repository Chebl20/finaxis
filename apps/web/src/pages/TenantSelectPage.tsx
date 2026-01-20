import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function TenantSelectPage() {
  const navigate = useNavigate();
  const { user, setCurrentTenant } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTenant, setNewTenant] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await tenantsAPI.list();
      setTenants(response.data.tenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    navigate('/dashboard');
  };

  const createTenant = async () => {
    if (!newTenant.trim()) return;

    setCreating(true);
    try {
      const slug = newTenant.toLowerCase().replace(/\s+/g, '-');
      const response = await tenantsAPI.create({ name: newTenant, slug });
      setCurrentTenant(response.data.tenant);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating tenant:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">FINAXIS</h1>
          <p className="text-primary-700">Selecione uma empresa para continuar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => selectTenant(tenant)}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
              <p className="text-sm text-gray-600 mt-2">Seu papel: {tenant.role}</p>
            </button>
          ))}
        </div>

        {tenants.length > 0 && (
          <div className="border-t-2 border-primary-200 pt-8 mt-8">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">Criar nova empresa</h2>
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {tenants.length === 0 ? 'Crie sua primeira empresa' : 'Adicionar nova empresa'}
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              value={newTenant}
              onChange={(e) => setNewTenant(e.target.value)}
              placeholder="Nome da empresa"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />

            <button
              onClick={createTenant}
              disabled={!newTenant.trim() || creating}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {creating ? 'Criando...' : 'Criar empresa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

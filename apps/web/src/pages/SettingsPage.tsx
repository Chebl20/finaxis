import { useState, useEffect } from 'react';
import { tenantsAPI, ticketsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function SettingsPage() {
  const { currentTenant, user } = useAuthStore();
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [activeTab, setActiveTab] = useState<'team' | 'support'>('team');

  useEffect(() => {
    if (currentTenant) {
      loadData();
    }
  }, [currentTenant]);

  const loadData = async () => {
    try {
      const ticketsRes = await ticketsAPI.list(currentTenant!.id);
      setTickets(ticketsRes.data.tickets);
      // Memberships não tem endpoint, seria adicionado posteriormente
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await tenantsAPI.invite(currentTenant!.id, {
        email: inviteEmail,
        role: inviteRole,
      });

      setInviteEmail('');
      setInviteRole('member');
      alert('Convite enviado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao enviar convite');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'team'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600'
          }`}
        >
          Equipe
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-3 font-semibold transition-colors ${
            activeTab === 'support'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600'
          }`}
        >
          Suporte
        </button>
      </div>

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Convidar Membro</h2>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="usuario@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="member">Membro</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Enviar Convite
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Membros Atuais</h2>
            <p className="text-gray-600 text-center py-8">
              Funcionalidade de membros em desenvolvimento
            </p>
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meus Tickets</h2>

            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket: any) => (
                  <div key={ticket.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          ticket.status === 'closed'
                            ? 'bg-green-100 text-green-700'
                            : ticket.status === 'resolved'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {ticket.status === 'closed' ? '✓ Fechado' : ticket.status === 'resolved' ? 'Resolvido' : ticket.status === 'in_progress' ? 'Em progresso' : 'Aberto'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                    <p className="text-xs text-gray-500">
                      Prioridade: {ticket.priority === 'high' ? '🔴' : ticket.priority === 'normal' ? '🟡' : '🟢'}{' '}
                      {ticket.priority}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Nenhum ticket criado ainda</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Criar Novo Ticket</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const subject = (e.currentTarget.elements.namedItem('subject') as HTMLInputElement)?.value;
                const description = (e.currentTarget.elements.namedItem('description') as HTMLTextAreaElement)?.value;

                try {
                  await ticketsAPI.create(currentTenant!.id, { subject, description, priority: 'normal' });
                  alert('Ticket criado com sucesso!');
                  loadData();
                  (e.target as HTMLFormElement).reset();
                } catch (error) {
                  alert('Erro ao criar ticket');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Descreva o assunto do seu problema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Descreva em detalhes o seu problema ou dúvida"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Enviar Ticket
              </button>
            </form>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Suporte</h3>
            <p className="text-sm text-blue-800">
              Resposta em até 24-48 horas úteis. Para questões urgentes, entre em contato por email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

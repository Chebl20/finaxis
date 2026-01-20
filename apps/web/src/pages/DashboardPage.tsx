import { useState, useEffect } from 'react';
import { transactionsAPI, accountsAPI, categoriesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function DashboardPage() {
  const { currentTenant } = useAuthStore();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Dashboard] Mount/Update - currentTenant:', currentTenant);
    
    // Se não tem tenant, para o loading
    if (!currentTenant?.id) {
      console.log('[Dashboard] No currentTenant, setting loading to false');
      setLoading(false);
      return;
    }

    loadDashboard();
  }, [currentTenant?.id]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Dashboard] Loading data for tenant:', currentTenant?.id);
      
      // Tentar carregar dados com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const [accountsRes, transactionsRes, categoriesRes] = await Promise.all([
        accountsAPI.list(currentTenant!.id).catch(err => {
          console.error('[Dashboard] Error loading accounts:', err);
          return { data: { accounts: [] } };
        }),
        transactionsAPI.list(currentTenant!.id, { limit: 10 }).catch(err => {
          console.error('[Dashboard] Error loading transactions:', err);
          return { data: { transactions: [] } };
        }),
        categoriesAPI.list(currentTenant!.id).catch(err => {
          console.error('[Dashboard] Error loading categories:', err);
          return { data: { categories: [] } };
        }),
      ]);

      clearTimeout(timeoutId);

      // Safely extract arrays from responses
      const accountsArray = Array.isArray(accountsRes.data?.accounts) 
        ? accountsRes.data.accounts 
        : (Array.isArray(accountsRes.data) ? accountsRes.data : []);
      
      const transactionsArray = Array.isArray(transactionsRes.data?.transactions)
        ? transactionsRes.data.transactions
        : (Array.isArray(transactionsRes.data) ? transactionsRes.data : []);
      
      const categoriesArray = Array.isArray(categoriesRes.data?.categories)
        ? categoriesRes.data.categories
        : (Array.isArray(categoriesRes.data) ? categoriesRes.data : []);

      console.log('[Dashboard] Data loaded:', {
        accounts: accountsArray.length,
        transactions: transactionsArray.length,
        categories: categoriesArray.length,
      });
      console.log('[Dashboard] Raw response structure:', {
        accountsRes: accountsRes.data,
        transactionsRes: transactionsRes.data,
        categoriesRes: categoriesRes.data,
      });

      setAccounts(accountsArray);
      setTransactions(transactionsArray);
      setCategories(categoriesArray);
      setLoading(false);
    } catch (err) {
      console.error('[Dashboard] Load error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setLoading(false);
    }
  };


  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

  console.log('[Dashboard] Render state:', { loading, error, currentTenant, hasAccounts: accounts.length });

  // Estado de carregamento
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-900">⚠️ Aviso: {error}</h2>
          <button
            onClick={() => loadDashboard()}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
          >
            Tentar Novamente
          </button>
        </div>
        
        {/* Mostrar dados vazio para que pelo menos a página não fique em branco */}
        <DashboardContent 
          currentTenant={currentTenant}
          accounts={[]}
          transactions={[]}
          categories={[]}
          COLORS={COLORS}
        />
      </div>
    );
  }

  // Se não tem tenant, mostrar mensagem
  if (!currentTenant) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-4">
            Nenhum espaço de trabalho selecionado
          </p>
          <button
            onClick={() => window.location.href = '/tenant-select'}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Selecionar Espaço
          </button>
        </div>
      </div>
    );
  }

  // Render normal com dados
  return (
    <DashboardContent 
      currentTenant={currentTenant}
      accounts={accounts}
      transactions={transactions}
      categories={categories}
      COLORS={COLORS}
    />
  );
}

interface DashboardContentProps {
  currentTenant: any;
  accounts: any[];
  transactions: any[];
  categories: any[];
  COLORS: string[];
}

function DashboardContent({ currentTenant, accounts, transactions, categories, COLORS }: DashboardContentProps) {
  // Ensure accounts is always an array
  const accountsArray = Array.isArray(accounts) ? accounts : [];
  const transactionsArray = Array.isArray(transactions) ? transactions : [];
  
  // Calculate total balance safely
  const totalBalance = accountsArray.reduce((sum, account) => {
    // Handle both string and number balances
    const balance = typeof account?.balance === 'number' 
      ? account.balance 
      : (typeof account?.balance === 'string' ? parseFloat(account.balance) || 0 : 0);
    return sum + balance;
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">{currentTenant?.name}</p>
      </div>

      {/* KPIs Simplificado */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Total em Contas</p>
          <h3 className="text-2xl font-bold text-primary-600 mt-2">
            R$ {totalBalance.toFixed(2).replace('.', ',')}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-600 text-sm">Total de Transações</p>
          <h3 className="text-2xl font-bold text-primary-600 mt-2">{transactionsArray.length}</h3>
        </div>
      </div>

      {/* Contas */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contas</h3>
        {accountsArray.length > 0 ? (
          <div className="space-y-2">
            {accountsArray.map((account: any) => (
              <div key={account.id} className="flex justify-between p-3 bg-gray-50 rounded">
                <p>{account.name}</p>
                <p className="font-semibold">
                  R$ {(typeof account?.balance === 'string' ? parseFloat(account.balance) || 0 : (typeof account?.balance === 'number' ? account.balance : 0)).toFixed(2).replace('.', ',')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Sem contas</p>
        )}
      </div>

      {/* Transações */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transações Recentes</h3>
        {transactionsArray.length > 0 ? (
          <div className="space-y-2">
            {transactionsArray.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="flex justify-between p-3 bg-gray-50 rounded">
                <p>{tx.description}</p>
                <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {(typeof tx?.amount === 'string' ? parseFloat(tx.amount) || 0 : (typeof tx?.amount === 'number' ? tx.amount : 0)).toFixed(2).replace('.', ',')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Sem transações</p>
        )}
      </div>
    </div>
  );
}

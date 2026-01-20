import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { transactionsAPI, categoriesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ReportsPage() {
  const { currentTenant } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    if (currentTenant) {
      loadReports();
    }
  }, [currentTenant, period]);

  const loadReports = async () => {
    try {
      const [categoriesRes, transactionsRes] = await Promise.all([
        categoriesAPI.list(currentTenant!.id),
        transactionsAPI.list(currentTenant!.id),
      ]);

      setCategories(categoriesRes.data.categories);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  // Calcula dados por categoria
  const categoryData = categories.map((cat: any) => {
    const total = transactions
      .filter((tx) => tx.category_id === cat.id)
      .reduce((sum, tx) => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : (typeof tx.amount === 'number' ? tx.amount : 0);
        return sum + amount;
      }, 0);
    return { name: cat.name, value: total };
  });

  // Calcula despesas vs receitas por mês
  type MonthlyAgg = { month: string; income: number; expense: number };
  const monthlyData: Record<string, MonthlyAgg> = {};
  transactions.forEach((tx: any) => {
    const month = format(new Date(tx.transaction_date), 'MMM/yy', { locale: ptBR });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expense: 0 };
    }
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : (typeof tx.amount === 'number' ? tx.amount : 0);
    if (tx.type === 'income') {
      monthlyData[month].income += amount;
    } else {
      monthlyData[month].expense += amount;
    }
  });

  const chartData = Object.values(monthlyData).slice(-12);

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : (typeof tx.amount === 'number' ? tx.amount : 0);
      return sum + amount;
    }, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => {
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : (typeof tx.amount === 'number' ? tx.amount : 0);
      return sum + amount;
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>

        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {p === 'month' ? 'Mês' : p === 'quarter' ? 'Trimestre' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-600 text-sm font-medium">Total de Receitas</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">
            R$ {totalIncome.toFixed(2).replace('.', ',')}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-600 text-sm font-medium">Total de Despesas</p>
          <h3 className="text-3xl font-bold text-red-600 mt-2">
            R$ {totalExpense.toFixed(2).replace('.', ',')}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-600 text-sm font-medium">Resultado Líquido</p>
          <h3 className={`text-3xl font-bold mt-2 ${totalIncome - totalExpense >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
            R$ {(totalIncome - totalExpense).toFixed(2).replace('.', ',')}
          </h3>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Fluxo Mensal */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fluxo Mensal</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Receitas" />
                <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Sem dados</p>
          )}
        </div>

        {/* Por Categoria */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h2>
          {categoryData.some((d: any) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData.filter((d: any) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {categoryData.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Sem dados</p>
          )}
        </div>
      </div>

      {/* Tabela de Categorias */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhamento por Categoria</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Categoria</th>
                <th className="px-4 py-2 text-right">Receitas</th>
                <th className="px-4 py-2 text-right">Despesas</th>
                <th className="px-4 py-2 text-right">Transações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any) => {
                const catTransactions = transactions.filter((tx) => tx.category_id === cat.id);
                const income = catTransactions
                  .filter((tx) => tx.type === 'income')
                  .reduce((sum, tx) => {
                    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : (typeof tx.amount === 'number' ? tx.amount : 0);
                    return sum + amount;
                  }, 0);
                const expense = catTransactions
                  .filter((tx) => tx.type === 'expense')
                  .reduce((sum, tx) => {
                    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : (typeof tx.amount === 'number' ? tx.amount : 0);
                    return sum + amount;
                  }, 0);

                if (catTransactions.length === 0) return null;

                return (
                  <tr key={cat.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span>{cat.icon || '🏷️'}</span>
                      {cat.name}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600">
                      {income > 0 ? `R$ ${income.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right text-red-600">
                      {expense > 0 ? `R$ ${expense.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">{catTransactions.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

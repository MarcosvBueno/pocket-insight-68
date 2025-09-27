import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Wallet, Calendar, Receipt } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Expense {
  id: string;
  amount: number;
  date: string;
  category: {
    name: string;
    color: string;
    icon: string;
  };
}

interface CategoryTotal {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchExpenses();
  }, []);

  const calculateTotals = useCallback((expenseData: Expense[]) => {
    // Total expenses
    const total = expenseData.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );
    setTotalExpenses(total);

    // Monthly expenses
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyTotal = expenseData
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      })
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    setMonthlyExpenses(monthlyTotal);

    // Category totals
    const categoryMap = new Map<string, CategoryTotal>();

    expenseData.forEach(expense => {
      const categoryName = expense.category.name;
      if (categoryMap.has(categoryName)) {
        const existing = categoryMap.get(categoryName)!;
        existing.value += Number(expense.amount);
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          value: Number(expense.amount),
          color: expense.category.color,
          icon: expense.category.icon,
        });
      }
    });

    setCategoryTotals(Array.from(categoryMap.values()));
  }, []);

  const fetchExpenses = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('expenses')
      .select(
        `
        id,
        amount,
        date,
        category:categories (
          name,
          color,
          icon
        )
      `
      )
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return;
    }

    if (data) {
      setExpenses(data as Expense[]);
      calculateTotals(data as Expense[]);
    }
    setLoading(false);
  }, [calculateTotals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Despesas
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Total geral</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count">
              {formatCurrency(monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count">
              {expenses.length}
            </div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count">
              {expenses.length > 0
                ? formatCurrency(totalExpenses / expenses.length)
                : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">Por transação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma despesa registrada ainda
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Principais Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryTotals.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma despesa registrada ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Detalhamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryTotals.map(category => (
              <div
                key={category.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {
                        expenses.filter(e => e.category.name === category.name)
                          .length
                      }{' '}
                      transações
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(category.value)}</p>
                  <p className="text-sm text-muted-foreground">
                    {((category.value / totalExpenses) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
            {categoryTotals.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Comece a adicionar despesas para ver seu resumo de gastos
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

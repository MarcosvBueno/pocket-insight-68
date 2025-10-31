import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/queries/categories';
import { useDeleteExpense, useExpenses } from '@/queries/expenses';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/queries/keys';

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes: string | null;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ExpenseListProps {
  refreshTrigger?: number;
}

export function ExpenseList({ refreshTrigger }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: categories = [] } = useCategories();
  const { data: expenses = [], isLoading: loading } = useExpenses();
  const deleteExpense = useDeleteExpense();
  const queryClient = useQueryClient();

  const { toast } = useToast();

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses(undefined) });
    }
  }, [refreshTrigger, queryClient]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) => e.title.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category.id === selectedCategory);
    }
    return filtered;
  }, [expenses, searchTerm, selectedCategory]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast({ title: 'Sucesso', description: 'Despesa excluída com sucesso' });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir despesa', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Despesas Recentes</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar despesas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {expenses.length === 0
                ? 'Nenhuma despesa ainda. Adicione sua primeira despesa acima!'
                : 'Nenhuma despesa corresponde aos seus filtros.'}
            </p>
          ) : (
            filteredExpenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${expense.category.color}20` }}
                  >
                    {expense.category.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{expense.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{expense.category.name}</span>
                      <span>
                        {format(
                          new Date(expense.date),
                          "dd 'de' MMMM 'de' yyyy",
                          { locale: ptBR }
                        )}
                      </span>
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">
                    {formatCurrency(expense.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

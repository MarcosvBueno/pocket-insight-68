import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

interface ExpenseRow {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes: string | null;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  };
}

async function getCurrentUserId(): Promise<string | undefined> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses(undefined),
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [] as ExpenseRow[];
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          id,
          title,
          amount,
          date,
          notes,
          category:categories (
            id,
            name,
            color,
            icon
          )
        `
        )
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ExpenseRow[];
    },
    staleTime: 30_000,
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      amount: number;
      categoryId: string;
      date: string; // yyyy-MM-dd
      notes?: string | null;
    }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Usuário não autenticado");
      const { error } = await supabase.from("expenses").insert({
        user_id: userId,
        title: payload.title,
        amount: payload.amount,
        category_id: payload.categoryId,
        date: payload.date,
        notes: payload.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses(undefined) });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses(undefined) });
    },
  });
}



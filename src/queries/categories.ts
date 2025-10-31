import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  is_default: boolean | null;
}

async function getCurrentUserId(): Promise<string | undefined> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(undefined),
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [] as Category[];

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, color, icon, is_default")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;
      return (data ?? []) as Category[];
    },
    staleTime: 60_000,
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      color: string;
      icon: string;
    }) => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("categories").insert({
        user_id: userId,
        name: payload.name,
        color: payload.color,
        icon: payload.icon,
        is_default: false,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories(undefined),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories(undefined),
      });
    },
  });
}

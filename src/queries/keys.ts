export const queryKeys = {
  expenses: (userId?: string) => ["expenses", userId] as const,
  categories: (userId?: string) => ["categories", userId] as const,
};

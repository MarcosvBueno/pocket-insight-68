-- Update default categories to Portuguese names
UPDATE public.categories
SET name = CASE name
  WHEN 'Food & Dining' THEN 'Alimentação'
  WHEN 'Transportation' THEN 'Transporte'
  WHEN 'Shopping' THEN 'Compras'
  WHEN 'Entertainment' THEN 'Entretenimento'
  WHEN 'Bills & Utilities' THEN 'Contas e Serviços'
  WHEN 'Healthcare' THEN 'Saúde'
  WHEN 'Education' THEN 'Educação'
  WHEN 'Travel' THEN 'Viagens'
  ELSE name
END
WHERE is_default = true
  AND name IN (
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel'
  );

-- Update handle_new_user trigger function to insert Portuguese defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.categories (user_id, name, color, icon, is_default) VALUES
    (NEW.id, 'Alimentação', '#ef4444', '🍔', true),
    (NEW.id, 'Transporte', '#3b82f6', '🚗', true),
    (NEW.id, 'Compras', '#8b5cf6', '🛍️', true),
    (NEW.id, 'Entretenimento', '#f59e0b', '🎬', true),
    (NEW.id, 'Contas e Serviços', '#6b7280', '💡', true),
    (NEW.id, 'Saúde', '#10b981', '🏥', true),
    (NEW.id, 'Educação', '#06b6d4', '📚', true),
    (NEW.id, 'Viagens', '#ec4899', '✈️', true);

  RETURN NEW;
END;
$$;


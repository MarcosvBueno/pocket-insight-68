import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Palette, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(50, 'O nome deve ter menos de 50 caracteres'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Selecione uma cor válida'),
  icon: z.string().min(1, 'Selecione um ícone'),
});

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
}

const availableIcons = [
  '🏠',
  '🚗',
  '🍔',
  '🛍️',
  '🎮',
  '💊',
  '📚',
  '✈️',
  '💰',
  '🎬',
  '💪',
  '🎨',
  '🏖️',
  '🎁',
  '📱',
];
const defaultColors = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#6b7280',
];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3b82f6',
    icon: '🏷️',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  const validateForm = (): boolean => {
    try {
      categorySchema.parse(newCategory);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleAddCategory = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: newCategory.name,
      color: newCategory.color,
      icon: newCategory.icon,
      is_default: false,
    });

    if (error) {
      if (error.message.includes('duplicate')) {
        toast({
          title: 'Erro',
          description: 'Já existe uma categoria com esse nome',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Falha ao adicionar categoria',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Sucesso',
        description: 'Categoria adicionada com sucesso',
      });
      setIsOpen(false);
      setNewCategory({ name: '', color: '#3b82f6', icon: '🏷️' });
      fetchCategories();
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      if (error.message.includes('violates foreign key constraint')) {
        toast({
          title: 'Não é possível excluir',
          description:
            'Esta categoria possui despesas. Exclua as despesas primeiro.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Falha ao excluir categoria',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso',
      });
      fetchCategories();
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorias</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar nova categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={newCategory.name}
                  onChange={e =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Nome da categoria"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ícone</label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map(icon => (
                    <Button
                      key={icon}
                      variant={
                        newCategory.icon === icon ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className="text-xl"
                      disabled={loading}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
                {errors.icon && (
                  <p className="text-sm text-destructive">{errors.icon}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-8 gap-2 flex-1">
                    {defaultColors.map(color => (
                      <button
                        key={color}
                        onClick={() =>
                          setNewCategory({ ...newCategory, color })
                        }
                        className="w-8 h-8 rounded-md border-2"
                        style={{
                          backgroundColor: color,
                          borderColor:
                            newCategory.color === color
                              ? '#000'
                              : 'transparent',
                        }}
                        disabled={loading}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="color"
                      value={newCategory.color}
                      onChange={e =>
                        setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                      }
                      className="w-16 h-8 p-1"
                      disabled={loading}
                    />
                  </div>
                </div>
                {errors.color && (
                  <p className="text-sm text-destructive">{errors.color}</p>
                )}
              </div>

              <Button
                onClick={handleAddCategory}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={loading}
              >
                Criar categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.is_default && (
                    <span className="text-xs text-muted-foreground">
                      Padrão
                    </span>
                  )}
                </div>
              </div>
              {!category.is_default && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
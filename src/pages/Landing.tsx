import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  PieChart, 
  Receipt, 
  Shield, 
  Smartphone, 
  BarChart3,
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Receipt,
      title: "Controle de Despesas",
      description: "Registre e organize todas suas despesas em um só lugar"
    },
    {
      icon: PieChart,
      title: "Visualização Inteligente",
      description: "Gráficos interativos para entender seus gastos"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Análises completas por categoria e período"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Seus dados protegidos com criptografia de ponta"
    },
    {
      icon: Smartphone,
      title: "Acesso em Qualquer Lugar",
      description: "Use no computador, tablet ou celular"
    },
    {
      icon: Sparkles,
      title: "Interface Moderna",
      description: "Design limpo e intuitivo para melhor experiência"
    }
  ];

  const benefits = [
    "Controle total das suas finanças",
    "Economize mais com insights inteligentes",
    "Categorização automática de despesas",
    "Metas financeiras personalizadas",
    "Exportação de relatórios",
    "Suporte prioritário"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-accent/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PocketInsight
          </h1>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Organize suas finanças de forma inteligente</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Tome o Controle das Suas Finanças Pessoais
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie suas despesas, visualize seus gastos e alcance suas metas financeiras com nossa plataforma intuitiva e poderosa.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="group">
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Ver Demonstração
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              <span>Grátis para começar</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Recursos Poderosos</h3>
          <p className="text-lg text-muted-foreground">
            Tudo que você precisa para gerenciar suas finanças em um só lugar
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow card-hover glass">
              <feature.icon className="h-12 w-12 text-accent mb-4" />
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-white/80">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">R$ 2M+</div>
              <div className="text-white/80">Economizados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/80">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center glass">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para Transformar suas Finanças?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão no controle de suas finanças pessoais
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-left">
                <Check className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Button size="lg" onClick={() => navigate("/auth")} className="group">
            Criar Conta Gratuita
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 PocketInsight. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
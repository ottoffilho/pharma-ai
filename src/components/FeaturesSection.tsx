
import React from 'react';
import { 
  FileSearch, 
  ChartBar, 
  Users, 
  Calendar, 
  Database, 
  ShieldCheck 
} from 'lucide-react';

const features = [
  {
    icon: <FileSearch className="h-10 w-10 text-homeo-blue" />,
    title: 'Atendimento Ágil e Inteligente',
    description: 'Interprete receitas homeopáticas com precisão e rapidez, reduzindo o tempo de atendimento e eliminando erros comuns.'
  },
  {
    icon: <Users className="h-10 w-10 text-homeo-green" />,
    title: 'Gestão de Clientes',
    description: 'Mantenha um histórico completo de cada cliente, incluindo receitas anteriores, preferências e informações de contato.'
  },
  {
    icon: <ChartBar className="h-10 w-10 text-homeo-blue" />,
    title: 'Orçamento em Segundos',
    description: 'Gere orçamentos precisos e automáticos para qualquer fórmula homeopática complexa com apenas alguns cliques.'
  },
  {
    icon: <Database className="h-10 w-10 text-homeo-green" />,
    title: 'Estoque Sob Controle',
    description: 'Gerencie seu inventário de insumos homeopáticos com alertas automáticos para reposição e rastreamento de validade.'
  },
  {
    icon: <Calendar className="h-10 w-10 text-homeo-blue" />,
    title: 'Agendamento Inteligente',
    description: 'Organize retiradas e entregas com um sistema de agendamento que se integra ao fluxo de produção.'
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-homeo-green" />,
    title: 'Segurança e Compliance',
    description: 'Mantenha-se em conformidade com regulamentações do setor e LGPD com nossa estrutura de segurança avançada.'
  }
];

const FeaturesSection = () => {
  return (
    <section id="recursos" className="bg-white">
      <div className="container-section">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="heading-lg gradient-text mb-6">
            Recursos que Transformam sua Farmácia
          </h2>
          <p className="paragraph">
            O Homeo-AI oferece um conjunto completo de funcionalidades desenvolvidas especificamente para farmácias homeopáticas, 
            integrando todos os processos em uma única plataforma inteligente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group"
            >
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col relative overflow-hidden group-hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-homeo-green to-homeo-blue transition-all duration-300"></div>
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="heading-sm mb-3 text-homeo-gray-dark">
                  {feature.title}
                </h3>
                <p className="text-homeo-gray flex-grow">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

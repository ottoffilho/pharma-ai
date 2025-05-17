
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-gradient-homeo">
      <div className="container-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="heading-xl gradient-text">
              Gestão Inteligente para Farmácias Homeopáticas
            </h1>
            
            <p className="paragraph max-w-xl">
              Transforme sua farmácia homeopática com uma plataforma de gestão completa potencializada por IA. Aumente a precisão na interpretação de receitas, ganhe eficiência no atendimento e tenha total controle do seu negócio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-primary text-base group" onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}>
                Solicitar Demonstração Gratuita
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button className="btn-secondary text-base" onClick={() => document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' })}>
                Conheça os Recursos
              </Button>
            </div>
          </div>
          
          <div className="relative lg:h-[500px] opacity-0 lg:opacity-100 animate-fade-in-delayed">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-10 bg-homeo-gray-light flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="pt-12 px-6">
                <div className="bg-homeo-blue-light p-4 mb-4 rounded-lg">
                  <h3 className="font-semibold text-homeo-blue-dark">Homeo-AI Dashboard</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-homeo-green-light p-4 rounded-lg h-32">
                    <h4 className="font-medium text-sm">Atendimentos do Dia</h4>
                    <p className="text-3xl font-bold mt-4">32</p>
                  </div>
                  <div className="bg-homeo-blue-light p-4 rounded-lg h-32">
                    <h4 className="font-medium text-sm">Receitas Interpretadas</h4>
                    <p className="text-3xl font-bold mt-4">28</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Análise IA em andamento...</h4>
                  <div className="space-y-2">
                    <div className="h-4 bg-homeo-gray-light rounded w-full"></div>
                    <div className="h-4 bg-homeo-gray-light rounded w-3/4"></div>
                    <div className="h-4 bg-homeo-gray-light rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="hidden lg:block absolute bottom-10 right-10 w-64 h-64 bg-homeo-green-light rounded-full opacity-30 blur-3xl"></div>
      <div className="hidden lg:block absolute top-32 left-10 w-32 h-32 bg-homeo-blue-light rounded-full opacity-30 blur-3xl"></div>
    </section>
  );
};

export default HeroSection;

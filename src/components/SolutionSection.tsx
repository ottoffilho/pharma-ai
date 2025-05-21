
import React from 'react';
import { Check } from 'lucide-react';

const SolutionSection = () => {
  return (
    <section className="bg-homeo-green-light/50">
      <div className="container-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Mockup/Image */}
          <div className="relative rounded-lg shadow-xl overflow-hidden bg-white">
            <div className="aspect-video relative">
              {/* Browser-like header */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-homeo-gray-light flex items-center px-4 z-10">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              {/* System interface mockup */}
              <div className="absolute inset-0 pt-8 px-4 pb-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 p-2 bg-homeo-blue-light rounded">
                  <div className="text-homeo-blue-dark font-medium">Sistema Integrado Homeo-AI</div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-homeo-gray-light/50 rounded-full"></div>
                    <div className="w-8 h-8 bg-homeo-blue/20 rounded-full flex items-center justify-center text-xs font-bold text-homeo-blue">AI</div>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div className="bg-homeo-gray-light/30 rounded p-2 col-span-1">
                    <div className="h-4 bg-homeo-gray-light w-3/4 mb-2 rounded"></div>
                    <div className="h-3 bg-homeo-gray-light w-full mb-1 rounded"></div>
                    <div className="h-3 bg-homeo-gray-light w-5/6 mb-1 rounded"></div>
                    <div className="h-3 bg-homeo-gray-light w-4/6 rounded"></div>
                  </div>
                  
                  <div className="col-span-2 bg-homeo-green-light/30 rounded p-2">
                    <div className="h-4 bg-homeo-gray-light w-2/3 mb-2 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="h-3 bg-homeo-gray-light w-full mb-1 rounded"></div>
                        <div className="h-3 bg-homeo-gray-light w-5/6 mb-1 rounded"></div>
                      </div>
                      <div>
                        <div className="h-3 bg-homeo-gray-light w-full mb-1 rounded"></div>
                        <div className="h-3 bg-homeo-gray-light w-5/6 mb-1 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <h2 className="heading-lg gradient-text gradient-border pb-3">
              A Solução Completa
            </h2>
            
            <p className="paragraph">
              O Homeo-AI é um sistema de gestão especialmente desenvolvido para farmácias de manipulação homeopáticas, 
              integrando todas as etapas do processo em uma única plataforma inteligente.
            </p>
            
            <p className="paragraph">
              Nossa plataforma utiliza inteligência artificial para interpretar receitas homeopáticas, 
              automatizar cálculos complexos e fornecer insights valiosos para o seu negócio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-homeo-green/20 p-1 rounded-full">
                  <Check className="h-4 w-4 text-homeo-green" />
                </div>
                <span className="text-homeo-gray-dark">Interpretação de receitas via IA</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-homeo-green/20 p-1 rounded-full">
                  <Check className="h-4 w-4 text-homeo-green" />
                </div>
                <span className="text-homeo-gray-dark">Gestão completa de estoque</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-homeo-green/20 p-1 rounded-full">
                  <Check className="h-4 w-4 text-homeo-green" />
                </div>
                <span className="text-homeo-gray-dark">Cadastro e controle de clientes</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-homeo-green/20 p-1 rounded-full">
                  <Check className="h-4 w-4 text-homeo-green" />
                </div>
                <span className="text-homeo-gray-dark">Orçamento automático de fórmulas</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-homeo-green/20 p-1 rounded-full">
                  <Check className="h-4 w-4 text-homeo-green" />
                </div>
                <span className="text-homeo-gray-dark">Análises e relatórios detalhados</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-homeo-green/20 p-1 rounded-full">
                  <Check className="h-4 w-4 text-homeo-green" />
                </div>
                <span className="text-homeo-gray-dark">Segurança e conformidade com LGPD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;

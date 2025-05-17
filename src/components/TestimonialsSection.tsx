
import React from 'react';

// This section is optional as mentioned in the requirements
// Currently using placeholders for future testimonials
const TestimonialsSection = () => {
  return (
    <section className="bg-homeo-blue-light/30 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="heading-lg gradient-text mb-6">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="paragraph">
            Depoimentos de farmácias que já transformaram sua operação com o Homeo-AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6 relative">
            <div className="text-homeo-accent text-5xl font-serif absolute top-4 left-4 opacity-20">"</div>
            <p className="italic text-homeo-gray-dark mb-6 pt-8">
              Espaço reservado para futuros depoimentos de clientes satisfeitos com a plataforma Homeo-AI.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-homeo-green/20 rounded-full flex items-center justify-center">
                <span className="text-homeo-green font-bold">FH</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Nome do Cliente</h4>
                <p className="text-sm text-homeo-gray">Farmácia Homeopática</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 relative">
            <div className="text-homeo-accent text-5xl font-serif absolute top-4 left-4 opacity-20">"</div>
            <p className="italic text-homeo-gray-dark mb-6 pt-8">
              Espaço reservado para futuros depoimentos de clientes satisfeitos com a plataforma Homeo-AI.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-homeo-blue/20 rounded-full flex items-center justify-center">
                <span className="text-homeo-blue font-bold">MF</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Nome do Cliente</h4>
                <p className="text-sm text-homeo-gray">Farmácia Homeopática</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 relative">
            <div className="text-homeo-accent text-5xl font-serif absolute top-4 left-4 opacity-20">"</div>
            <p className="italic text-homeo-gray-dark mb-6 pt-8">
              Espaço reservado para futuros depoimentos de clientes satisfeitos com a plataforma Homeo-AI.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-homeo-accent/20 rounded-full flex items-center justify-center">
                <span className="text-homeo-accent font-bold">NH</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Nome do Cliente</h4>
                <p className="text-sm text-homeo-gray">Farmácia Homeopática</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

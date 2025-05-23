import React from 'react';

// This section is optional as mentioned in the requirements
// Currently using placeholders for future testimonials
const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-16 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Depoimentos de farmácias que já transformaram sua operação com o Pharma.AI.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600 italic mb-4">
              "Espaço reservado para futuros depoimentos de clientes satisfeitos com a plataforma Pharma.AI."
            </p>
            <p className="text-gray-800 font-semibold">Nome do Cliente 1</p>
            <p className="text-gray-500 text-sm">Cargo, Nome da Farmácia 1</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600 italic mb-4">
              "Espaço reservado para futuros depoimentos de clientes satisfeitos com a plataforma Pharma.AI."
            </p>
            <p className="text-gray-800 font-semibold">Nome do Cliente 2</p>
            <p className="text-gray-500 text-sm">Cargo, Nome da Farmácia 2</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600 italic mb-4">
              "Espaço reservado para futuros depoimentos de clientes satisfeitos com a plataforma Pharma.AI."
            </p>
            <p className="text-gray-800 font-semibold">Nome do Cliente 3</p>
            <p className="text-gray-500 text-sm">Cargo, Nome da Farmácia 3</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

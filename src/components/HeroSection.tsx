import React from 'react';
import { Button } from '@/components/ui/button'
// import heroImage from '@/assets/images/hero-image-placeholder.jpg' // Comentado pois a imagem não está sendo usada diretamente no código JSX por enquanto

export const HeroSection: React.FC = () => {
  const scrollToFeatures = (): void => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative flex h-screen flex-col items-center justify-center bg-gradient-to-br from-green-600 via-teal-500 to-emerald-400 text-white"
    >
      {/* Imagem de fundo ou sobreposição (opcional) - Descomente e ajuste se necessário */}
      {/* <img
        src={heroImage}
        alt="Farmácia Homeopática Moderna"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      /> */}
      <div className="container z-10 mx-auto px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-50 md:text-6xl lg:text-7xl">
          Homeo-AI: A Revolução Inteligente para sua Farmácia de Manipulação
        </h1>
        <p className="mb-10 text-lg text-gray-100 md:text-xl lg:text-2xl">
          Otimize seus processos, reduza erros e melhore o atendimento com a
          primeira plataforma de gestão homeopática com Inteligência Artificial
          integrada.
        </p>
        <div className="space-x-4">
          <Button
            onClick={scrollToFeatures}
            variant="default"
            size="lg"
            className="bg-white text-green-700 hover:bg-gray-100"
          >
            Conheça os Recursos
          </Button>
          <Button
            onClick={(): void =>
              document
                .getElementById('cta')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-green-700"
          >
            Entre em Contato
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  )
}

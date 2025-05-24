import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
// import ambienteInternoImg from '@/assets/images/ambiente_interno.jpg'; // Imagem antiga removida
import video1Path from '@/assets/videos/Animação_D_PharmaAI_em_Ação.mp4'; 
import video2Path from '@/assets/videos/Vídeo_PharmaAI_Solução_Completa.mp4';

const SolutionSection = () => {
  const [activeVideoKey, setActiveVideoKey] = useState<'video1' | 'video2'>('video1');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handler para quando o vídeo 1 terminar
  const handleVideo1End = () => {
    console.log("Vídeo 1 terminou. Ativando vídeo 2.");
    setActiveVideoKey('video2');
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Parar e resetar listeners antigos para evitar múltiplos handlers
    videoElement.onended = null;

    if (activeVideoKey === 'video1') {
      console.log("Configurando para vídeo 1");
      videoElement.src = video1Path;
      videoElement.loop = false;
      videoElement.onended = handleVideo1End; // Anexar o handler específico
      videoElement.load(); // Carregar a nova fonte
      videoElement.play().catch(error => console.error("Erro ao tocar vídeo 1:", error));
    } else if (activeVideoKey === 'video2') {
      console.log("Configurando para vídeo 2");
      videoElement.src = video2Path;
      videoElement.loop = true;
      // videoElement.onended = null; // Já resetado acima, e não é necessário para vídeo em loop
      videoElement.load(); // Carregar a nova fonte
      videoElement.play().catch(error => console.error("Erro ao tocar vídeo 2:", error));
    }
  }, [activeVideoKey]); // Re-executar este efeito quando activeVideoKey mudar

  return (
    <section className="relative bg-homeo-green-light/50">
      <div className="container-section pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Vídeo Player */}
          <div className="relative rounded-lg shadow-xl overflow-hidden aspect-video">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover" 
              muted
              playsInline
              aria-label="Vídeo demonstrando o Pharma.AI em ação"
            />
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <h2 className="heading-lg gradient-text gradient-border pb-3">
              A Solução Completa para Sua Farmácia de Manipulação
            </h2>
            
            <p className="paragraph mb-8">
              O Pharma.AI é um sistema de gestão especialmente desenvolvido para farmácias de manipulação,
              oferecendo uma plataforma completa e intuitiva para otimizar todas as áreas do seu negócio.
              Desde o atendimento ao cliente até a gestão financeira e de estoque, nossa solução integra
            </p>
            
            <p className="paragraph">
              Nossa plataforma utiliza inteligência artificial para interpretar receitas, 
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
      
      {/* Novo degradê com posicionamento absoluto */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-homeo-green-light/50 via-homeo-green-light/25 to-white pointer-events-none"></div>
    </section>
  );
};

export default SolutionSection;

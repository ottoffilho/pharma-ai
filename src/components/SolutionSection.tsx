import { useState, useRef, useEffect } from 'react';
import { Check, Play } from 'lucide-react';
// import ambienteInternoImg from '@/assets/images/ambiente_interno.jpg'; // Imagem antiga removida
import video1Path from '@/assets/videos/Animação_D_PharmaAI_em_Ação.mp4'; 
import video2Path from '@/assets/videos/Vídeo_PharmaAI_Solução_Completa.mp4';

const SolutionSection = () => {
  const [activeVideoKey, setActiveVideoKey] = useState<'video1' | 'video2'>('video1');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handler para quando o vídeo 1 terminar
  const handleVideo1End = () => {
    console.log("Vídeo 1 terminou. Ativando vídeo 2.");
    setActiveVideoKey('video2');
  };

  // Função para iniciar reprodução de vídeo
  const startVideoPlayback = async () => {
    if (showVideo) return; // Já está reproduzindo
    
    setShowVideo(true);
    setIsLoading(true);
    setHasError(false);

    const videoElement = videoRef.current;
    if (!videoElement) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Configurar timeout de 5 segundos (mais conservador)
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Timeout no carregamento do vídeo - usando fallback');
        setHasError(true);
        setIsLoading(false);
      }, 5000);

      // Configurar vídeo inicial
      const video1Path = '/src/assets/videos/Animação_D_PharmaAI_em_Ação.mp4';
      const video2Path = '/src/assets/videos/Vídeo_PharmaAI_Solução_Completa.mp4';
      
      videoElement.src = activeVideoKey === 'video1' ? video1Path : video2Path;
      videoElement.loop = activeVideoKey === 'video2';
      videoElement.muted = true;
      videoElement.playsInline = true;

      // Aguardar carregamento
      await new Promise<void>((resolve, reject) => {
        const handleLoad = () => {
          console.log(`✅ Vídeo carregado: ${videoElement.src}`);
          clearTimeout(timeoutRef.current!);
          setIsLoading(false);
          
          // Configurar handler de fim apenas para vídeo 1
          if (activeVideoKey === 'video1') {
            videoElement.onended = handleVideo1End;
          }
          
          resolve();
        };

        const handleError = (error: Event | string) => {
          console.error(`❌ Erro ao carregar vídeo:`, error);
          clearTimeout(timeoutRef.current!);
          reject(error);
        };

        videoElement.onloadeddata = handleLoad;
        videoElement.onerror = handleError;
        videoElement.load();
      });

      // Tentar reproduzir
      await videoElement.play();
      console.log(`🎬 Reproduzindo vídeo: ${activeVideoKey}`);

    } catch (error) {
      console.error(`❌ Erro ao reproduzir vídeo:`, error);
      clearTimeout(timeoutRef.current!);
      setHasError(true);
      setIsLoading(false);
      
      // Se for erro de interrupção, não mostrar como erro crítico
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('interrupted'))) {
        console.log('⚠️ Reprodução interrompida (normal durante troca de vídeo)');
        setHasError(false);
      }
    }
  };

  // Effect para mudança de vídeo
  useEffect(() => {
    if (!showVideo) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const loadNewVideo = async () => {
      try {
        setIsLoading(true);
        
        // Parar vídeo atual
        videoElement.pause();
        videoElement.currentTime = 0;
        videoElement.onended = null;

        const video1Path = '/src/assets/videos/Animação_D_PharmaAI_em_Ação.mp4';
        const video2Path = '/src/assets/videos/Vídeo_PharmaAI_Solução_Completa.mp4';
        
        videoElement.src = activeVideoKey === 'video1' ? video1Path : video2Path;
        videoElement.loop = activeVideoKey === 'video2';

        await new Promise<void>((resolve) => {
          videoElement.onloadeddata = () => {
            setIsLoading(false);
            if (activeVideoKey === 'video1') {
              videoElement.onended = handleVideo1End;
            }
            resolve();
          };
          videoElement.load();
        });

        await videoElement.play();
        console.log(`🔄 Vídeo trocado para: ${activeVideoKey}`);

      } catch (error) {
        console.error('Erro ao trocar vídeo:', error);
        setIsLoading(false);
      }
    };

    loadNewVideo();
  }, [activeVideoKey, showVideo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="relative bg-homeo-green-light/50">
      <div className="container-section pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Vídeo Player */}
          <div className="relative rounded-lg shadow-xl overflow-hidden aspect-video bg-gradient-to-br from-homeo-green/20 to-homeo-blue/20">
            
            {/* Placeholder/Thumbnail quando vídeo não está carregado */}
            {!showVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-homeo-green/10 to-homeo-blue/10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Play className="h-8 w-8 text-homeo-green ml-1" />
                  </div>
                  <button 
                    onClick={startVideoPlayback}
                    className="px-6 py-3 bg-homeo-green text-white rounded-lg hover:bg-homeo-green/80 transition-colors font-medium"
                  >
                    Assistir Demonstração
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {showVideo && isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-homeo-green mb-3 mx-auto"></div>
                  <span className="text-gray-600">Carregando vídeo...</span>
                </div>
              </div>
            )}
            
            {/* Error state */}
            {showVideo && hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="text-gray-500 mb-3">⚠️ Erro ao carregar vídeo</div>
                  <div className="space-x-2">
                    <button 
                      onClick={() => {
                        setHasError(false);
                        setShowVideo(false);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={() => {
                        setHasError(false);
                        startVideoPlayback();
                      }}
                      className="px-4 py-2 bg-homeo-green text-white rounded hover:bg-homeo-green/80"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Video element */}
            {showVideo && (
              <video 
                ref={videoRef}
                className={`w-full h-full object-cover ${isLoading || hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                muted
                playsInline
                preload="none"
                aria-label="Vídeo demonstrando o Pharma.AI em ação"
              />
            )}
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
              tecnologia avançada com a expertise farmacêutica.
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

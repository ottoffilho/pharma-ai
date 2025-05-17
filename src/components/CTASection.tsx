
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin } from 'lucide-react';

const CTASection = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // In a real implementation, you would send this data to your backend
    toast({
      title: "Formulário enviado!",
      description: "Entraremos em contato em breve.",
      duration: 5000,
    });
    
    // Reset form
    e.currentTarget.reset();
  };
  
  return (
    <section id="contato" className="bg-gradient-homeo">
      <div className="container-section">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Form */}
              <div className="p-8 md:p-12">
                <h2 className="heading-md gradient-text mb-6">
                  Pronto para Transformar sua Farmácia?
                </h2>
                <p className="text-homeo-gray mb-8">
                  Solicite uma demonstração gratuita ou entre em contato para saber mais sobre como o Homeo-AI pode revolucionar sua farmácia homeopática.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1 text-homeo-gray-dark">
                        Nome
                      </label>
                      <Input 
                        id="name" 
                        name="name" 
                        type="text" 
                        placeholder="Seu nome completo" 
                        required 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="pharmacy" className="block text-sm font-medium mb-1 text-homeo-gray-dark">
                        Farmácia
                      </label>
                      <Input 
                        id="pharmacy" 
                        name="pharmacy" 
                        type="text" 
                        placeholder="Nome da farmácia" 
                        required 
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1 text-homeo-gray-dark">
                        E-mail
                      </label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        required 
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1 text-homeo-gray-dark">
                        Telefone
                      </label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        placeholder="(00) 00000-0000" 
                        required 
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1 text-homeo-gray-dark">
                      Mensagem (opcional)
                    </label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Como podemos ajudar sua farmácia?" 
                      className="w-full" 
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" className="btn-primary w-full">
                    Solicitar Demonstração Gratuita
                  </Button>
                </form>
              </div>
              
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-homeo-green to-homeo-blue text-white p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <h3 className="heading-md mb-6">
                    Informações de Contato
                  </h3>
                  <p className="text-white/80 mb-8">
                    Nós adoraríamos conversar sobre como podemos ajudar sua farmácia homeopática a crescer e se tornar mais eficiente.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-white/90 mt-1" />
                      <div>
                        <h4 className="font-medium text-white">Telefone</h4>
                        <p className="text-white/80">(00) 0000-0000</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-white/90 mt-1" />
                      <div>
                        <h4 className="font-medium text-white">E-mail</h4>
                        <p className="text-white/80">contato@homeo-ai.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-white/90 mt-1" />
                      <div>
                        <h4 className="font-medium text-white">Endereço</h4>
                        <p className="text-white/80">
                          Av. Principal, 1000<br />
                          CEP 00000-000<br />
                          São Paulo, SP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <p className="text-white/60 text-sm">
                    Horário de Atendimento:<br />
                    Segunda a Sexta: 9h às 18h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

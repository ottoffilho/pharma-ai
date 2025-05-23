import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoPharmaAI from '@/assets/logo/phama-horizon.png';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Classes para os links de navegação principais
  const navLinkClasses = "text-homeo-green hover:text-homeo-green-dark transition-colors";
  // Classes para o logo Pharma.AI
  const logoTextClasses = isScrolled ? 'text-homeo-gray-dark' : 'text-white';
  // Classes para o botão Solicitar Demo
  const demoButtonClasses = isScrolled ? 'btn-primary' : 'bg-white text-homeo-green hover:bg-gray-100';
  // Classes para o ícone do menu mobile e cor do texto dos links mobile quando não scrollado
  const mobileMenuIconColor = isScrolled ? 'text-homeo-gray-dark' : 'text-white';
  const mobileLinkColorUnscrolled = 'text-white'; // Mantendo branco para bom contraste com bg-black/80
  const mobileLinkColorScrolled = 'text-homeo-gray-dark';

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'}
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logoPharmaAI} alt="Logo Pharma-AI" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#recursos" className={navLinkClasses}>
              Recursos
            </a>
            <a href="#ai" className={navLinkClasses}>
              IA
            </a>
            <a href="#funcionamento" className={navLinkClasses}>
              Como Funciona
            </a>
            <a href="#diferenciais" className={navLinkClasses}>
              Diferenciais
            </a>
            <Button 
              className={`ml-4 ${demoButtonClasses}`}
              onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Solicitar Demo
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${mobileMenuIconColor} focus:outline-none`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 w-full ${isScrolled ? 'bg-white' : 'bg-black/80'} shadow-md py-4 px-6 flex flex-col space-y-4 animate-fade-in`}>
            <a 
              href="#recursos" 
              className={`${isScrolled ? mobileLinkColorScrolled : mobileLinkColorUnscrolled} hover:text-homeo-green-dark transition-colors py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              Recursos
            </a>
            <a 
              href="#ai" 
              className={`${isScrolled ? mobileLinkColorScrolled : mobileLinkColorUnscrolled} hover:text-homeo-green-dark transition-colors py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              IA
            </a>
            <a 
              href="#funcionamento" 
              className={`${isScrolled ? mobileLinkColorScrolled : mobileLinkColorUnscrolled} hover:text-homeo-green-dark transition-colors py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
            </a>
            <a 
              href="#diferenciais" 
              className={`${isScrolled ? mobileLinkColorScrolled : mobileLinkColorUnscrolled} hover:text-homeo-green-dark transition-colors py-2`}
              onClick={() => setIsMenuOpen(false)}
            >
              Diferenciais
            </a>
            <Button 
              className="btn-primary" 
              onClick={() => {
                document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
                setIsMenuOpen(false);
              }}
            >
              Solicitar Demo
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;

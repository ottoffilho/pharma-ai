
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

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

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-montserrat font-bold gradient-text">
              Homeo-AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#recursos" className="text-homeo-gray-dark hover:text-homeo-green transition-colors">
              Recursos
            </a>
            <a href="#ai" className="text-homeo-gray-dark hover:text-homeo-green transition-colors">
              IA
            </a>
            <a href="#funcionamento" className="text-homeo-gray-dark hover:text-homeo-green transition-colors">
              Como Funciona
            </a>
            <a href="#diferenciais" className="text-homeo-gray-dark hover:text-homeo-green transition-colors">
              Diferenciais
            </a>
            <Button className="btn-primary ml-4" onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}>
              Solicitar Demo
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-homeo-gray-dark focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md py-4 px-6 flex flex-col space-y-4 animate-fade-in">
            <a 
              href="#recursos" 
              className="text-homeo-gray-dark hover:text-homeo-green transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Recursos
            </a>
            <a 
              href="#ai" 
              className="text-homeo-gray-dark hover:text-homeo-green transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              IA
            </a>
            <a 
              href="#funcionamento" 
              className="text-homeo-gray-dark hover:text-homeo-green transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
            </a>
            <a 
              href="#diferenciais" 
              className="text-homeo-gray-dark hover:text-homeo-green transition-colors py-2"
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

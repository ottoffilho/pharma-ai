import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const PrivateRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Verificar sessão existente primeiro
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setIsAuthenticated(!!session);
        }
        
        // Configurar listener para mudanças de estado após confirmar estado inicial
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (isMounted) {
              setIsAuthenticated(!!session);
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking authentication status:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthenticated === null) {
    // Still loading authentication status
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-homeo-green" />
        <span className="ml-2 text-lg">Verificando autenticação...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected route
  return <Outlet />;
};

export default PrivateRoute;

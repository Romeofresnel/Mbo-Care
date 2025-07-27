import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Vérification simple du localStorage
    
    const checkAuth = () => {
      const userId = localStorage.getItem('_id');
    const token = localStorage.getItem('token');
      // Définir l'état d'authentification
      setIsAuthenticated(!!(token && userId));
    };

    checkAuth();
  }, []);

  // Pendant la vérification, ne rien afficher (ou un loader simple)
  if (isAuthenticated === null) {
    return null;
  }

  // Si pas authentifié, rediriger
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Si authentifié, afficher le contenu
  return children;
}
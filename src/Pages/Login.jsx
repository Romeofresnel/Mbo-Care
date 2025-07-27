import React, { useState, useEffect } from "react";
import { AlignJustify, LockKeyhole, Mail } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";

import { accountService } from "../services/Account.service";
import toast, { Toaster } from "react-hot-toast";
import { medecinInfo, setAuthenticated } from "../redux/AuthSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('_id');

        if (token && userId) {
          console.log("Utilisateur déjà connecté, redirection...");
          // Définir l'état d'authentification dans Redux
          dispatch(setAuthenticated(true));
          toast.success("Vous êtes déjà connecté !");

          setTimeout(() => {
            navigate("/medecin/dashbord", { replace: true });
          }, 500);
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [navigate, dispatch]);

  // Composant de chargement
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Vérification de l'authentification...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Validation du formulaire
  const validateForm = () => {
    if (!email) {
      toast.error("Veuillez saisir votre email");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Le format de votre email est invalide");
      return false;
    }
    if (!password) {
      toast.error("Veuillez saisir votre mot de passe");
      return false;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    return true;
  };

  // Fonction pour extraire le message d'erreur de manière sûre
  const getErrorMessage = (error) => {
    // Si c'est une erreur réseau
    if (!error.response) {
      return "Erreur de connexion. Vérifiez votre connexion internet.";
    }

    const { data, status } = error.response;

    // Si data est une chaîne de caractères
    if (typeof data === 'string') {
      return data;
    }

    // Si data est un objet avec une propriété message
    if (data && typeof data === 'object') {
      if (data.message) {
        return data.message;
      }
      if (data.error) {
        return data.error;
      }
      if (data.msg) {
        return data.msg;
      }
      // Si c'est un objet mais sans propriété connue
      return JSON.stringify(data);
    }

    // Messages d'erreur par défaut selon le statut HTTP
    switch (status) {
      case 400:
        return "Données invalides. Vérifiez vos informations.";
      case 401:
        return "Email ou mot de passe incorrect.";
      case 403:
        return "Accès interdit.";
      case 404:
        return "Service non trouvé.";
      case 500:
        return "Erreur du serveur. Réessayez plus tard.";
      default:
        return `Erreur ${status}. Réessayez plus tard.`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const data = { email, password };

    try {
      const response = await axios.post("https://mboa-care-api.onrender.com/api/auth/login", data);

      console.log("Réponse du serveur:", response.data);

      // Vérifier que les données nécessaires sont présentes
      if (!response.data.access_token) {
        throw new Error("Token d'accès manquant dans la réponse");
      }

      if (!response.data.id) {
        throw new Error("ID utilisateur manquant dans la réponse");
      }

      // Sauvegarder les données dans localStorage
      accountService.saveToken(response.data.access_token);
      accountService.saveId(response.data.id);

      // Mettre à jour l'état Redux d'authentification
      dispatch(setAuthenticated(true));

      // Pré-charger les informations du médecin immédiatement après la connexion
      try {
        await dispatch(medecinInfo(response.data.id)).unwrap();
        console.log("Informations du médecin chargées avec succès");
      } catch (medecinError) {
        console.warn("Erreur lors du chargement des informations du médecin:", medecinError);
        // Ne pas bloquer la navigation même si le chargement des infos échoue
      }

      toast.success("Connexion réussie !");

      // Navigation après un délai plus court
      setTimeout(() => {
        navigate("/medecin/dashbord", { replace: true });
      }, 800);

    } catch (error) {
      console.error("Erreur de connexion:", error);

      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);

      // Nettoyer les données en cas d'erreur
      dispatch(setAuthenticated(false));

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container-login">
        <div className="nav-login">
          <nav>
            <div className="container-structure">
              <div className="img"></div>
              <h2>MBOA CARE</h2>
            </div>
            <AlignJustify className="icon" />
            <h3>Connexion ?</h3>
          </nav>
        </div>
        <div className="contain-form">
          <form onSubmit={handleSubmit}>
            <div className="form-left">
              <div className="survol">
                <span>Welcome back to you</span>
                <p>
                  Log in to access patient records, review medical history, and
                  manage your consultations securely. Your dedication makes a
                  difference in healthcare quality.
                </p>
              </div>
            </div>
            <div className="form-rigth">
              <div className="top-form">
                <h1>Connect Account</h1>
                <button type="button">Continuer avec Google</button>
                <p>Or</p>
                <p>use Email and password</p>
              </div>
              <div className="middle-form">
                <div className="container-input">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  <Mail />
                </div>
                <div className="container-input">
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <LockKeyhole />
                </div>
              </div>
              <div className="bottom-form">
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </button>
                <a href="#">Mot de passe oublié ?</a>
              </div>
            </div>
          </form>
        </div>
        <div className="circle one"></div>
        <div className="circle two"></div>
      </div>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: 'font-principal',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ff4444',
              color: 'white',
            },
          },
        }}
      />
    </>
  );
}
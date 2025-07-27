import { Eye, Stethoscope } from "lucide-react";
import React, { useContext, useEffect } from "react";
import { UidContext } from "../AppContext";
import { useSelector, useDispatch } from "react-redux";
import { medecinInfo, selectMedecinInfo, selectAuthStatus } from "../redux/AuthSlice";
import { useNavigate } from "react-router";
import profil from '../img/doc1.jpg'

export default function MedicalBar() {
  const uid = useContext(UidContext);
  const medecin = useSelector(selectMedecinInfo);
  const status = useSelector(selectAuthStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    // Vérifier que l'UID existe et que les données ne sont pas déjà chargées
    if (uid?.uid && (status === 'idle' || (!medecin.nom && status !== 'loading'))) {
      console.log("Chargement des informations du médecin pour MedicalBar, UID:", uid.uid);
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid?.uid, medecin.nom]);

  // Fonction pour obtenir une valeur sûre (évite les undefined)
  const getSafeValue = (value, defaultValue = '') => {
    return value && value !== undefined ? value : defaultValue;
  };

  // Fonction pour obtenir le titre et la salutation selon le rôle
  const getRoleGreeting = (role) => {
    if (!role) return { title: 'Utilisateur', greeting: 'Hello' };

    const normalizedRole = role.toLowerCase();

    switch (normalizedRole) {
      case 'medecin':
        return { title: 'Dr.', greeting: 'Hello Dr.' };
      case 'infirmier(e)':
      case 'infirmier':
      case 'infirmiere':
        return { title: 'Infirmier(e)', greeting: 'Hello Infirmier(e)' };
      case 'chef':
        return { title: 'Médecin Chef', greeting: 'Hello Médecin Chef' };
      case 'caissiere':
      case 'caissière':
        return { title: 'Caissière', greeting: 'Hello' };
      default:
        return { title: 'Utilisateur', greeting: 'Hello' };
    }
  };

  // Affichage de chargement
  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#666'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '10px'
        }}></div>
        Chargement des informations...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Affichage d'erreur
  if (status === 'failed') {
    return (
      <div style={{
        padding: '20px',
        color: '#ff4444',
        textAlign: 'center'
      }}>
        <p>Erreur lors du chargement des informations du médecin.</p>
        <button
          onClick={() => uid?.uid && dispatch(medecinInfo(uid.uid))}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Obtenir la salutation et le titre selon le rôle
  const { title, greeting } = getRoleGreeting(medecin.poste);

  return (
    <>
      <div className="left">
        <div className="pic-medical">
          <img src={profil} alt="Photo du médecin" />
        </div>
        <section>
          <span>{greeting}.....</span>
          <h1>
            {getSafeValue(medecin.nom, title)} {getSafeValue(medecin.prenom, '')}
          </h1>
        </section>
      </div>
      <div className="rigth">
        <button onClick={() => navigate('/medecin/profil')}>
          <Eye />
          <span>Voir le Profil</span>
        </button>
        <div className="service">
          <p>
            <Stethoscope />
            <span>Service de médecine :</span>
          </p>
          <h5>{getSafeValue(medecin.service, 'Service non défini')}</h5>
        </div>
      </div>
    </>
  );
}
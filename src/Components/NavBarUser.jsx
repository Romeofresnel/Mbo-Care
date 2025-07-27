import React, { useContext, useEffect } from "react";
import { Bell, ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { UidContext } from "../AppContext";
import { medecinInfo, selectMedecinInfo, selectAuthStatus } from "../redux/AuthSlice";
import profil from '../img/doc1.jpg'


export default function NavBarUser() {
  const uid = useContext(UidContext);
  const medecin = useSelector(selectMedecinInfo);
  const status = useSelector(selectAuthStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    // Vérifier que l'UID existe et que les données ne sont pas déjà chargées
    if (uid?.uid && (status === 'idle' || (!medecin.email && status !== 'loading'))) {
      console.log("Chargement des informations du médecin pour NavBarUser, UID:", uid.uid);
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid?.uid, medecin.email]);

  // Fonction pour obtenir une valeur sûre (évite les undefined)
  const getSafeValue = (value, defaultValue = '') => {
    return value && value !== undefined ? value : defaultValue;
  };

  // Fonction pour obtenir l'email avec un fallback approprié
  const getDisplayEmail = () => {
    if (medecin.email) {
      return medecin.email;
    }
    // Si pas d'email mais qu'on a nom et prénom
    if (medecin.nom || medecin.prenom) {
      return `${getSafeValue(medecin.prenom)} ${getSafeValue(medecin.nom)}`;
    }
    return 'Utilisateur';
  };

  return (
    <>
      <div className="container-navUser">
        <div className="responsive">
          <h3>Book Hearth</h3>
          <EllipsisVertical size={27} />
        </div>
        <nav>
          <div className="container-entete">
            <Search className="icon-2" size={20} />
            <Bell className="icon-3" size={20} />
            <div className="container-profil">
              <div className="pic-profil">
                <img src={profil} alt="Photo de profil" />
              </div>
              <span>
                {status === 'loading' ? 'Chargement...' : getDisplayEmail()}
              </span>
              <ChevronDown className="icon-1" size={25} />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
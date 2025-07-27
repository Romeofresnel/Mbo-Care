import { ChevronRight, Cloud, Plus, UserCog, UserRound, Users } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUserDoctor, faUserGear, faUserNurse, faUserSlash } from "@fortawesome/free-solid-svg-icons";
import { faSistrix } from "@fortawesome/free-brands-svg-icons";
import PageMedecin from "./PageMedecin";
import AddNewMedecin from "../forms/AddNewMedecin";
import { useSelector, useDispatch } from "react-redux";
import {
  selectMedecinsList,
  selectMedecinStatus,
  selectMedecinErrors,
  getAllMedecins,
  clearErrors
} from "../redux/MedecinSlice";
import profil from '../img/doc1.jpg'


export default function Medecin() {
  // États locaux pour la gestion de l'interface
  const [showSearch, setShowSearch] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMedecinDetail, setShowMedecinDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedecinId, setSelectedMedecinId] = useState(null);
  const [selectedMedecinI, setSelectedMedecin] = useState([]);

  // Redux hooks
  const dispatch = useDispatch();
  const medecins = useSelector(selectMedecinsList);
  const status = useSelector(selectMedecinStatus);
  const errors = useSelector(selectMedecinErrors);

  // Chargement initial des médecins
  useEffect(() => {
    // Charger les médecins si la liste est vide ou si on vient de démarrer
    if (medecins.length === 0 && status === 'idle') {
      dispatch(getAllMedecins());
    }
  }, [dispatch, medecins.length, status]);

  // Gestion des erreurs
  useEffect(() => {
    if (errors.getAll) {
      console.error("Erreur lors du chargement des médecins:", errors.getAll);
      // Vous pouvez ajouter ici une notification toast ou autre feedback utilisateur
    }
  }, [errors.getAll]);

  // Filtrage des médecins basé sur le terme de recherche
  const filteredMedecins = useMemo(() => {
    if (!searchTerm.trim()) {
      return medecins;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();

    return medecins.filter(medecin => {
      // Recherche dans le nom complet (nom + prénom)
      const fullName = `${medecin.nom} ${medecin.prenom}`.toLowerCase();

      // Recherche dans le matricule
      const matricule = medecin.matricule?.toString().toLowerCase() || '';

      // Recherche dans le téléphone
      const telephone = medecin.telephone?.toString().toLowerCase() || '';

      // Recherche dans l'email
      const email = medecin.email?.toLowerCase() || '';

      // Recherche dans le service
      const service = medecin.service?.toLowerCase() || '';

      return (
        fullName.includes(searchTermLower) ||
        matricule.includes(searchTermLower) ||
        telephone.includes(searchTermLower) ||
        email.includes(searchTermLower) ||
        service.includes(searchTermLower)
      );
    });
  }, [medecins, searchTerm]);

  // Statistiques par catégorie de personnel
  const statistics = useMemo(() => {
    const stats = {
      docteurs: 0,
      infirmiers: 0,
      techniciens: 0,
      licencies: 0,
      total: medecins.length
    };

    medecins.forEach(medecin => {
      switch (medecin.poste?.toLowerCase()) {
        case 'medecin':
        case 'docteur':
          stats.docteurs++;
          break;
        case 'infirmier':
        case 'infirmiere':
          stats.infirmiers++;
          break;
        case 'technicien':
        case 'laboratoire':
          stats.techniciens++;
          break;
        case 'licencie':
          stats.licencies++;
          break;
        default:
          // Médecin par défaut si service non spécifié
          stats.docteurs++;
      }
    });

    return stats;
  }, [medecins]);

  // Gestionnaire pour ouvrir le détail d'un médecin
  const handleShowMedecinDetail = (medecinId) => {
    setSelectedMedecinId(medecinId);
    setShowMedecinDetail(true);
  };

  // Gestionnaire pour la recherche
  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      // Réinitialiser la recherche quand on ferme
      setSearchTerm("");
    }
  };

  // Gestionnaire pour le changement de terme de recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gestionnaire pour l'ajout d'un nouveau médecin
  const handleAddNewMedecin = () => {
    setShowAddForm(true);
  };

  // Gestionnaire pour fermer le formulaire d'ajout
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    // Optionnel: recharger la liste si nécessaire
    // dispatch(getAllMedecins());
  };

  // Gestionnaire pour fermer le détail du médecin
  const handleCloseMedecinDetail = () => {
    setShowMedecinDetail(false);
    setSelectedMedecinId(null);
  };

  // Rendu du composant de détail du médecin
  if (showMedecinDetail) {
    return (
      <PageMedecin
        aff={handleCloseMedecinDetail}
        medecinId={selectedMedecinId}
      />
    );
  }

  return (
    <>
      <div className='container-medecin'>
        <div className='medecin-top'>
          <div className='medecin-entete'>
            <Users size={35} />
            <p>Personnel Medicales</p>
          </div>

          {/* Cartes de récapitulatif avec statistiques dynamiques */}
          <div className="medecin-cards-recap">
            <div className="cards-recap medecin">
              <FontAwesomeIcon icon={faUserDoctor} className="child" />
              <div className="circle"></div>
              <p className="pp-2">
                <h2>Docteurs Medicales</h2>
                <p><span>{statistics.docteurs}</span> médecins</p>
              </p>
            </div>

            <div className="cards-recap infirmiere">
              <FontAwesomeIcon icon={faUserNurse} className="child" />
              <div className="circle"></div>
              <p className="pp-2">
                <h2>Infirmier(e)s Medicales</h2>
                <p><span>{statistics.infirmiers}</span> Infirmier(e)s</p>
              </p>
            </div>

            <div className="cards-recap admin">
              <FontAwesomeIcon icon={faUserGear} className="child" />
              <div className="circle"></div>
              <p className="pp-2">
                <h2>Technicien Laboratoire</h2>
                <p><span>{statistics.techniciens}</span> techniciens</p>
              </p>
            </div>

            <div className="cards-recap licencier">
              <FontAwesomeIcon icon={faUserSlash} className="child" />
              <div className="circle"></div>
              <p className="pp-2">
                <h2>Personnels licenciés</h2>
                <p><span>{statistics.licencies}</span> licenciés</p>
              </p>
            </div>
          </div>
        </div>

        <div className='medecin-bottom'>
          <div className="medecin-nav">
            <div className="medecin-link">
              <a href="#">
                <span>Tout le personnel</span>
                <div className="medecin-count">{statistics.total}</div>
              </a>
            </div>

            <div className="medecin-middle">
              {showSearch && (
                <input
                  type="search"
                  placeholder="Rechercher par nom, matricule, téléphone..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  autoFocus
                />
              )}
            </div>

            <div className="medecin-option">
              <FontAwesomeIcon
                icon={faSistrix}
                onClick={handleSearchToggle}
                style={{ cursor: 'pointer' }}
              />
              <button onClick={handleAddNewMedecin}>
                <FontAwesomeIcon icon={faPlus} />
                <span>Ajouter un nouveau personnel</span>
              </button>
            </div>
          </div>

          <div className="medecin-container-cards">
            <div className="nav-medecin">
              <ul>
                <li>Nom et Prénom du personnel</li>
                <li>Matricule du personnel</li>
                <li>Contact du personnel</li>
                <li>Service du personnel</li>
                <li>Poste Occupeé</li>
              </ul>
            </div>

            <div className="container-all-medecin">
              {/* Affichage du statut de chargement */}
              {status === 'loading' && (
                <div className="loading-message">
                  <p>Chargement des médecins...</p>
                </div>
              )}

              {/* Affichage des erreurs */}
              {status === 'failed' && errors.getAll && (
                <div className="error-message">
                  <p>Erreur: {errors.getAll}</p>
                  <button onClick={() => dispatch(getAllMedecins())}>
                    Réessayer
                  </button>
                </div>
              )}

              {/* Affichage des médecins */}
              {status === 'succeeded' && filteredMedecins.length === 0 && searchTerm && (
                <div className="no-results">
                  <p>Aucun médecin trouvé pour "{searchTerm}"</p>
                </div>
              )}

              {status === 'succeeded' && filteredMedecins.length === 0 && !searchTerm && (
                <div className="no-medecins">
                  <p>Aucun médecin enregistré</p>
                </div>
              )}

              {/* Liste des médecins filtrés */}
              {filteredMedecins.map((medecin) => (
                <div key={medecin._id || medecin.id} className="card-personnel">
                  <ul>
                    <li>
                      <p>
                        <div className="img">
                          <img
                            src={profil}
                            alt={`Photo de ${medecin.nom} ${medecin.prenom}`}
                          />
                        </div>
                        <span>
                          Dr. {medecin.nom} {medecin.prenom}
                        </span>
                      </p>
                    </li>
                    <li>{medecin.matricule || 'N/A'}</li>
                    <li>{medecin.telephone || 'N/A'}</li>
                    <li>{medecin.service || 'Médecin'}</li>
                    <li>
                      {medecin.poste}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout de nouveau médecin */}
      {showAddForm && (
        <AddNewMedecin aff={handleCloseAddForm} />
      )}
    </>
  );
}
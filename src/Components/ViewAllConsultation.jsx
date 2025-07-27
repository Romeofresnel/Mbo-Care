import { ClipboardList, Eye, SquarePen, Trash, X } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { UidContext } from "../AppContext";
import { useDispatch, useSelector } from "react-redux";
import { medecinInfo } from "../redux/AuthSlice";
import {
  getAllConsultationByPatient,
  deleteConsultation,
  clearErrors,
  clearSuccessMessages,
  setCurrentPatientId
} from "../redux/ConsultationSlice";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import EditConsultation from "../forms/EditConsultation";
import ConsultationDetails from "./ConsultationDetails";
// import ConsultationDetails from "../components/ConsultationDetails";

// Créer l'instance SweetAlert2 avec React
const MySwal = withReactContent(Swal);

export default function ViewAllConsultation({ aff, patient }) {
  const uid = useContext(UidContext);
  const dispatch = useDispatch();
  const [view, setView] = useState(false);
  const [consultation, setConsultation] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Sélecteurs Redux - Utilisation des bonnes propriétés du state
  const { medecinInfo: medecin, status } = useSelector((state) => state.auth);
  const {
    consultationListPatient: consultations,
    consultationCount,
    currentPatientId,
    statut,
    loading,
    errors,
    successMessages
  } = useSelector((state) => state.consultation);

  // Effect pour charger les infos du médecin si nécessaire
  useEffect(() => {
    if (uid?.uid && status === 'idle') {
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid?.uid]);

  // Effect pour charger les consultations du patient
  useEffect(() => {
    if (patient?._id) {
      // Nettoyer les erreurs précédentes
      dispatch(clearErrors());

      // Définir le patient actuel
      dispatch(setCurrentPatientId(patient._id));

      // Charger les consultations uniquement si nécessaire
      // (patient différent ou pas encore chargé)
      if (currentPatientId !== patient._id || consultations.length === 0) {
        console.log('Chargement des consultations pour le patient:', patient._id);
        dispatch(getAllConsultationByPatient(patient._id));
      }
    }
  }, [dispatch, patient?._id, currentPatientId, consultations.length]);

  // Effect pour gérer les messages de succès de suppression
  useEffect(() => {
    if (successMessages?.delete) {
      MySwal.fire({
        title: 'Succès !',
        text: successMessages.delete,
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true
      }).then(() => {
        dispatch(clearSuccessMessages());
      });
    }
  }, [successMessages?.delete, dispatch]);

  // Effect pour gérer les erreurs de suppression
  useEffect(() => {
    if (errors?.delete) {
      MySwal.fire({
        title: 'Erreur !',
        text: errors.delete,
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        dispatch(clearErrors());
      });
    }
  }, [errors?.delete, dispatch]);

  // Fonction pour formater la date de manière sécurisée
  const formatDate = (dateString) => {
    if (!dateString) return "Date non disponible";

    try {
      const date = new Date(dateString);

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }

      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return "Date invalide";
    }
  };

  // Fonction pour obtenir le nom du médecin de manière sécurisée
  const getMedecinName = (consultation) => {
    // Vérifier les différentes structures possibles
    if (consultation?.medecin?.nom && consultation?.medecin?.prenom) {
      return `Dr ${consultation.medecin.prenom} ${consultation.medecin.nom}`;
    }

    if (consultation?.medecin?.nom) {
      return `Dr ${consultation.medecin.nom}`;
    }

    if (consultation?.medecin?.prenom) {
      return `Dr ${consultation.medecin.prenom}`;
    }

    if (consultation?.docteur) {
      return consultation.docteur;
    }

    // Si le médecin actuel est disponible et correspond
    if (medecin && (consultation?.medecin === medecin._id || consultation?.IdMedecin === medecin._id)) {
      return `Dr ${medecin.prenom || ''} ${medecin.nom || ''}`.trim();
    }

    return "Médecin non spécifié";
  };

  // Fonction pour obtenir le motif de la consultation
  const getConsultationMotif = (consultation) => {
    return consultation?.label ||
      consultation?.motif ||
      consultation?.diagnostic ||
      "Motif non spécifié";
  };

  // Fonction pour afficher les détails d'une consultation
  const handleViewConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetails(true);
  };

  // Fonction pour fermer les détails
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedConsultation(null);
  };

  // Fonction pour supprimer une consultation avec confirmation
  const handleDeleteConsultation = (consultation) => {
    if (!consultation?._id) {
      console.error('ID de consultation manquant');
      return;
    }

    const motif = getConsultationMotif(consultation);
    const dateConsultation = formatDate(consultation.dateConsultation || consultation.createdAt);
    const nomMedecin = getMedecinName(consultation);

    MySwal.fire({
      title: 'Confirmer la suppression',
      html: `
        <div style="text-align: left; margin: 20px 0;" class="confirm">
          <p><strong>Motif:</strong> ${motif}</p>
          <p><strong>Date:</strong> ${dateConsultation}</p>
          <p><strong>Médecin:</strong> ${nomMedecin}</p>
          <hr style="margin: 15px 0;">
          <p style="color: #d33; text-align: center;"><strong>⚠️ Cette action est irréversible !</strong></p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--color-principal)',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Dispatch de l'action de suppression
        dispatch(deleteConsultation(consultation._id))
          .unwrap()
          .then(() => {
            console.log('Consultation supprimée avec succès');
          })
          .catch((error) => {
            console.error('Erreur lors de la suppression:', error.message);
          });
      }
    });
  };

  return (
    <>
      {
        view ? (
          <EditConsultation aff={setView} consultation={consultation} />
        ) : showDetails ? (
          <ConsultationDetails
            consultation={selectedConsultation}
            patient={patient}
            onClose={handleCloseDetails}
          />
        ) : (
          <>
            <div className="containers-params " onClick={(e) => e.target === e.currentTarget && aff(false)}>
              <div className="container-alls">
                {/* En-tête avec titre et bouton de fermeture */}
                <section>
                  <p>
                    <ClipboardList size={30} />
                    <span>
                      Toutes les consultations
                      {patient && ` de ${patient.nom || ''} ${patient.prenom || ''}`.trim()}
                      {consultationCount > 0 && ` (${consultationCount})`}
                    </span>
                  </p>
                  <X size={30} className="svg" onClick={() => aff(false)} />
                </section>
                <div className="container-data">
                  {/* Affichage du loader pendant le chargement */}
                  {loading?.getAllByPatient && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p>Chargement des consultations...</p>
                    </div>
                  )}
                  {/* Affichage des erreurs */}
                  {errors?.getAllByPatient && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                      <p>Erreur : {errors.getAllByPatient}</p>
                      <button
                        onClick={() => {
                          dispatch(clearErrors());
                          if (patient?._id) {
                            dispatch(getAllConsultationByPatient(patient._id));
                          }
                        }}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                  {/* Affichage si aucune consultation trouvée */}
                  {!loading?.getAllByPatient &&
                    statut === 'succeeded' &&
                    Array.isArray(consultations) &&
                    consultations.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p>
                          Aucune consultation trouvée pour ce patient.
                          {patient && ` (${patient.nom || ''} ${patient.prenom || ''}`.trim() + ')'}
                        </p>
                      </div>
                    )}
                  {/* Affichage des consultations */}
                  {!loading?.getAllByPatient &&
                    Array.isArray(consultations) &&
                    consultations.length > 0 && (
                      <>
                        {/* Tri des consultations par date décroissante */}
                        {consultations
                          .slice() // Créer une copie pour ne pas muter le state
                          .sort((a, b) => {
                            const dateA = new Date(a.dateConsultation || a.createdAt);
                            const dateB = new Date(b.dateConsultation || b.createdAt);
                            return dateB - dateA; // Tri décroissant (plus récent en premier)
                          })
                          .map((consultation, index) => (
                            <div key={consultation._id || `consultation-${index}`} className="card-consultes">
                              <section>
                                {/* Motif de la consultation */}
                                <div className="infos">
                                  <h4>{getConsultationMotif(consultation)}</h4>
                                </div>
                                {/* Informations supplémentaires si disponibles */}
                                {consultation.diagnostic && consultation.diagnostic !== consultation.label && (
                                  <div className="infos">
                                    <h4>{consultation.diagnostic}</h4>
                                  </div>
                                )}
                                {/* Date de la consultation */}
                                <div className="infos">
                                  <h4>{formatDate(consultation.dateConsultation || consultation.createdAt)}</h4>
                                </div>
                                {/* Nom du médecin */}
                                <div className="infos">
                                  <h4>{getMedecinName(consultation)}</h4>
                                </div>
                              </section>
                              <div className="btns">
                                <span
                                  title="voir la consultation"
                                  onClick={() => handleViewConsultation(consultation)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <Eye />
                                </span>
                                <span title="modifier la consultation" onClick={() => {
                                  setView(true)
                                  setConsultation(consultation)
                                }}><SquarePen /></span>
                                <span
                                  title="supprimer cette consultation"
                                  onClick={() => handleDeleteConsultation(consultation)}
                                  style={{
                                    cursor: loading?.delete ? 'not-allowed' : 'pointer',
                                    opacity: loading?.delete ? 0.6 : 1,
                                    pointerEvents: loading?.delete ? 'none' : 'auto'
                                  }}
                                >
                                  <Trash />
                                </span>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                </div>
              </div>
            </div>
          </>
        )
      }
    </>
  );
}
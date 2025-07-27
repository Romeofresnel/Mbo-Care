import React, { useEffect, useMemo, useState } from "react";
import { Eye, FileText, Printer, Trash2, X, Activity } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getHospitalisationsByPatient, deleteHospitalisation } from "../redux/HospitalisationSlice";
import { getPatientOperations, deleteOperation } from "../redux/OperationSlice";
import DetailModal from "./DetailModal"; // Import du nouveau composant
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Initialiser SweetAlert2 avec React
const MySwal = withReactContent(Swal);

export default function Hospitalisation({ aff, patient, count }) {
  const dispatch = useDispatch();

  // État local pour gérer le modal de détails
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sélection des données depuis le store Redux
  const {
    patientHospitalisations,
    loading: hospitalisationLoading,
    errors: hospitalisationErrors,
    successMessages: hospitalisationSuccessMessages
  } = useSelector((state) => state.hospitalisation);

  const {
    patientOperations,
    loading: operationLoading,
    errors: operationErrors,
    successMessages: operationSuccessMessages
  } = useSelector((state) => state.operation);

  /**
   * Effet pour charger les données du patient à chaque changement
   * Se déclenche quand le patient change ou au montage du composant
   */
  useEffect(() => {
    if (patient && patient._id) {
      // Récupération des hospitalisations du patient
      dispatch(getHospitalisationsByPatient(patient._id));

      // Récupération des opérations du patient
      dispatch(getPatientOperations(patient._id));
    }
  }, [dispatch, patient?._id]); // Dépendance sur l'ID du patient

  /**
   * Formatage et tri des données combinées (hospitalisations + opérations)
   * Utilisation de useMemo pour optimiser les performances
   */
  const combinedData = useMemo(() => {
    const allItems = [];

    // Ajout des hospitalisations avec transformation des données
    if (patientHospitalisations && Array.isArray(patientHospitalisations)) {
      const hospitalisations = patientHospitalisations.map(hospi => {
        // Gestion sécurisée des dates
        const dateDebut = hospi.datedebut || hospi.dateDebut || hospi.createdAt || hospi.created_at;
        const dateFin = hospi.datefin || hospi.dateFin || hospi.updatedAt || hospi.updated_at;

        return {
          id: hospi._id,
          type: 'hospitalisation',
          title: hospi.motif || 'Hospitalisation',
          description: hospi.description || 'Aucune description',
          date: dateDebut,
          dateEnd: dateFin,
          chambre: hospi.numerochambre || hospi.numeroeChambre,
          status: dateFin && new Date(dateFin) < new Date() ? 'terminée' : 'en cours',
          icon: FileText,
          originalData: hospi
        };
      });
      allItems.push(...hospitalisations);
    }

    // Ajout des opérations avec transformation des données
    if (patientOperations && Array.isArray(patientOperations)) {
      const operations = patientOperations.map(op => {
        // Gestion sécurisée des dates pour les opérations
        const dateOperation = op.dateOperation || op.date_operation || op.createdAt || op.created_at;
        const dateFin = op.dateFin || op.date_fin || op.updatedAt || op.updated_at;

        return {
          id: op._id,
          type: 'operation',
          title: op.typeOperation || op.type_operation || op.nom || 'Opération',
          description: op.description || 'Aucune description',
          date: dateOperation,
          dateEnd: dateFin,
          status: op.statut || op.status || 'programmée',
          icon: Activity,
          originalData: op
        };
      });
      allItems.push(...operations);
    }

    // Tri par date décroissante (plus récent en premier)
    // Filtre les éléments sans date valide avant le tri
    return allItems
      .filter(item => item.date) // Supprime les éléments sans date
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        // Vérification que les dates sont valides
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1; // a va à la fin
        if (isNaN(dateB.getTime())) return -1; // b va à la fin

        return dateB - dateA; // Tri décroissant
      });

  }, [patientHospitalisations, patientOperations]);

  /**
   * Formatage de la date pour l'affichage
   * Gère les différents formats de date et les cas d'erreur
   */
  const formatDate = (dateString) => {
    // Vérification si la date existe
    if (!dateString || dateString === null || dateString === undefined) {
      return 'Date non définie';
    }

    // Conversion en string si c'est un objet
    const dateStr = typeof dateString === 'object' ? dateString.toString() : String(dateString);

    // Vérification si c'est une chaîne vide ou whitespace
    if (dateStr.trim() === '' || dateStr === 'null' || dateStr === 'undefined') {
      return 'Date non définie';
    }

    try {
      const date = new Date(dateStr);

      // Vérification si la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide détectée:', dateString);
        return 'Date invalide';
      }

      // Vérification si c'est une date réaliste (pas trop ancienne ou future)
      const currentYear = new Date().getFullYear();
      const dateYear = date.getFullYear();

      if (dateYear < 1900 || dateYear > currentYear + 10) {
        console.warn('Date hors plage réaliste:', dateString);
        return 'Date incorrecte';
      }

      // Formatage de la date
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', dateString, error);
      return 'Date invalide';
    }
  };

  /**
   * Détermination de la couleur du statut
   */
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'en cours':
      case 'programmée':
        return '#2563eb'; // Bleu
      case 'terminée':
      case 'terminé':
        return '#16a34a'; // Vert
      case 'annulée':
      case 'annulé':
        return '#dc2626'; // Rouge
      default:
        return '#6b7280'; // Gris
    }
  };

  /**
   * Gestion de l'affichage des détails
   * Ouvre le modal avec les informations de l'élément sélectionné
   */
  const handleView = (item) => {
    console.log(`Voir ${item.type}:`, item.originalData);
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  /**
   * Fermeture du modal de détails
   */
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  /**
   * Fonction de suppression avec confirmation SweetAlert2
   */
  const handleDelete = async (item) => {
    try {
      const result = await MySwal.fire({
        title: 'Confirmer la suppression',
        html: (
          <div class="confirm">
            <p>Êtes-vous sûr de vouloir supprimer cette <strong>{item.type}</strong> ?</p>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <p><strong>Titre:</strong> {item.title}</p>
              <p><strong>Date:</strong> {formatDate(item.date)}</p>
              {item.type === 'hospitalisation' && item.chambre && (
                <p><strong>Chambre:</strong> {item.chambre}</p>
              )}
              <p><strong>Statut:</strong> {item.status}</p>
            </div>
            <p style={{ color: '#dc2626', marginTop: '10px' }}>
              <strong>Cette action est irréversible !</strong>
            </p>
          </div>
        ),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: 'var(--color-principal)',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        focusCancel: true
      });

      if (result.isConfirmed) {
        // Affichage du loader pendant la suppression
        MySwal.fire({
          title: 'Suppression en cours...',
          text: `Suppression de la ${item.type} en cours`,
          icon: 'info',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Dispatch de l'action de suppression selon le type
        let deleteResult;
        if (item.type === 'hospitalisation') {
          deleteResult = await dispatch(deleteHospitalisation(item.id));
        } else if (item.type === 'operation') {
          deleteResult = await dispatch(deleteOperation(item.id));
        }

        // Vérification du résultat de la suppression
        if (deleteResult.meta.requestStatus === 'fulfilled') {
          // Succès
          MySwal.fire({
            title: 'Supprimé !',
            text: `La ${item.type} a été supprimée avec succès.`,
            icon: 'success',
            confirmButtonColor: '#16a34a',
            timer: 2000,
            timerProgressBar: true
          });

          // Recharger les données après suppression
          if (patient && patient._id) {
            dispatch(getHospitalisationsByPatient(patient._id));
            dispatch(getPatientOperations(patient._id));
          }
        } else {
          // Erreur
          const errorMessage = deleteResult.payload || `Erreur lors de la suppression de la ${item.type}`;
          MySwal.fire({
            title: 'Erreur !',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#dc2626'
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      MySwal.fire({
        title: 'Erreur !',
        text: 'Une erreur inattendue s\'est produite lors de la suppression.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // États de chargement
  const isLoading = hospitalisationLoading.getByPatient || operationLoading.getPatientOps;
  const isDeleting = hospitalisationLoading.delete || operationLoading.delete;

  // Gestion des erreurs
  const hasErrors = hospitalisationErrors.getByPatient || operationErrors.getPatientOps;
  count(combinedData.length);

  // Affichage des messages de succès pour les suppressions
  useEffect(() => {
    if (hospitalisationSuccessMessages.delete) {
      console.log('Hospitalisation supprimée:', hospitalisationSuccessMessages.delete);
    }
    if (operationSuccessMessages.delete) {
      console.log('Opération supprimée:', operationSuccessMessages.delete);
    }
  }, [hospitalisationSuccessMessages.delete, operationSuccessMessages.delete]);

  return (
    <>
      <div className="containers-params" onClick={(e) => e.target === e.currentTarget && aff(false)}>
        <div className="container-alls">
          {/* En-tête avec titre et bouton fermer */}
          <section>
            <p>
              <FileText size={30} />
              <span>
                Toutes les hospitalisations et opérations ({combinedData.length})
                {patient && ` - ${patient.nom} ${patient.prenom}`}
              </span>
            </p>
            <X size={30} className="svg" onClick={() => aff(false)} />
          </section>

          {/* Contenu principal */}
          <div className="container-data">
            {/* Affichage du loader */}
            {(isLoading || isDeleting) && (
              <div className="loading-container">
                <p>{isDeleting ? 'Suppression en cours...' : 'Chargement des données...'}</p>
              </div>
            )}

            {/* Affichage des erreurs */}
            {hasErrors && !isLoading && !isDeleting && (
              <div className="error-container">
                <p style={{ color: '#dc2626' }}>
                  Erreur lors du chargement: {hospitalisationErrors.getByPatient || operationErrors.getPatientOps}
                </p>
              </div>
            )}

            {/* Affichage des données */}
            {!isLoading && !isDeleting && !hasErrors && combinedData.length === 0 && (
              <div className="empty-container">
                <p>Aucune hospitalisation ou opération trouvée pour ce patient</p>
              </div>
            )}

            {/* Liste des éléments */}
            {!isLoading && !isDeleting && combinedData.length > 0 && combinedData.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={`${item.type}-${item.id}`} className="card-alls">
                  <div className="left">
                    {/* Icône et titre */}
                    <p>
                      <IconComponent size={20} />
                      <span>{item.title}</span>
                    </p>

                    {/* Type d'élément */}
                    <p style={{
                      textTransform: 'capitalize',
                      color: item.type === 'hospitalisation' ? '#2563eb' : '#16a34a',
                      fontWeight: '500'
                    }}>
                      {item.type}
                    </p>

                    {/* Date */}
                    <p>{formatDate(item.date)}</p>
                  </div>

                  {/* Actions */}
                  <div className="rigth">
                    <span
                      onClick={() => handleView(item)}
                      style={{ cursor: 'pointer' }}
                      title={`Voir les détails de cette ${item.type}`}
                    >
                      <Eye />
                    </span>
                    <span
                      onClick={() => handleDelete(item)}
                      style={{
                        cursor: 'pointer',
                        opacity: isDeleting ? 0.5 : 1,
                        pointerEvents: isDeleting ? 'none' : 'auto'
                      }}
                      title={`Supprimer cette ${item.type}`}
                    >
                      <Trash2 />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      <DetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </>
  );
}
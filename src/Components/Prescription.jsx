import { Eye, FileText, Printer, Trash2, X } from "lucide-react";
import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  getPrescriptionsByPatient,
  clearPrescriptionList,
  resetStatus,
  deletePrescription,
  selectPrescriptionList,
  selectIsGettingPrescriptionsByPatient,
  selectIsDeletingPrescription,
  selectPrescriptionErrors,
  selectPrescriptionSuccessMessages,
  clearSpecificError,
  clearSpecificSuccessMessage
} from "../redux/PrescriptionSlice";
import EditPrescription from "../forms/EditPrescription";

// Initialiser SweetAlert2 avec React
const MySwal = withReactContent(Swal);

export default function Prescription({ aff, patient }) {
  const [view, setView] = useState(false)
  const [ordonnance, setOrdonnance] = useState({})

  // Sélection des données depuis le store Redux avec les sélecteurs optimisés
  const prescriptionList = useSelector(selectPrescriptionList);
  const isLoading = useSelector(selectIsGettingPrescriptionsByPatient);
  const isDeleting = useSelector(selectIsDeletingPrescription);
  const error = useSelector(selectPrescriptionErrors);
  const successMessages = useSelector(selectPrescriptionSuccessMessages);

  const dispatch = useDispatch();

  // Fonction pour charger les prescriptions d'un patient
  const loadPatientPrescriptions = useCallback(async (patientId) => {
    try {
      // Nettoie les données précédentes avant de charger les nouvelles
      dispatch(clearPrescriptionList());

      // Lance la requête pour récupérer les prescriptions du patient
      await dispatch(getPrescriptionsByPatient(patientId)).unwrap();
    } catch (error) {
      console.error("Erreur lors du chargement des prescriptions:", error);
    }
  }, [dispatch]);

  // Fonction pour supprimer une prescription avec confirmation
  const handleDeletePrescription = useCallback(async (prescription) => {
    const prescriptionLabel = getPrescriptionLabel(prescription);

    const result = await MySwal.fire({
      title: 'Êtes-vous sûr ?',
      html: `
        <div class='confirm'>
          <p>Voulez-vous vraiment supprimer cette prescription ?</p>
        <p><strong>${prescriptionLabel}</strong></p>
        <p style="color: #dc3545; font-size: 0.9em; font-family: "font-principale"">
          Cette action est irréversible !
        </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: 'var(--color-principal)',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        // Supprimer la prescription
        await dispatch(deletePrescription(prescription._id)).unwrap();

        // Recharger automatiquement la liste après suppression
        await dispatch(getPrescriptionsByPatient(patient._id)).unwrap();

        // Afficher un message de succès
        MySwal.fire({
          title: 'Supprimée !',
          text: 'La prescription a été supprimée avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error("Erreur lors de la suppression:", error);

        // Afficher un message d'erreur avec plus de détails
        MySwal.fire({
          title: 'Erreur !',
          text: typeof error === 'string' ? error : 'Une erreur est survenue lors de la suppression.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  }, [dispatch, patient._id]);

  // Fonction d'impression
  const handlePrint = useCallback((prescription) => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour l\'impression');
      return;
    }

    // Contenu HTML à imprimer
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${getPrescriptionLabel(prescription)}</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .patient-info {
              background: #f8f9fa;
              padding: 15px;
              border: 1px solid #ddd;
              margin-bottom: 20px;
            }
            .prescription-details {
              margin-bottom: 30px;
            }
            .detail-row {
              margin-bottom: 10px;
              border-bottom: 1px dotted #ddd;
              padding-bottom: 5px;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 150px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .print-button {
              position: fixed;
              top: 10px;
              right: 10px;
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              border-radius: 5px;
              font-size: 14px;
              z-index: 1000;
            }
            .print-button:hover {
              background: #0056b3;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Imprimer</button>
          
          <div class="header">
            <div class="title">PRESCRIPTION MÉDICALE</div>
          </div>
          
          <div class="patient-info">
            <h3>Informations Patient</h3>
            <div class="detail-row">
              <span class="label">Nom :</span>
              <span>${patient?.nom || 'Non renseigné'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Prénom :</span>
              <span>${patient?.prenom || 'Non renseigné'}</span>
            </div>
            <div class="detail-row">
              <span class="label">ID Patient :</span>
              <span>${patient?._id || 'Non renseigné'}</span>
            </div>
          </div>
          
          <div class="prescription-details">
            <h3>Détails de la Prescription</h3>
            <div class="detail-row">
              <span class="label">Libellé :</span>
              <span>${getPrescriptionLabel(prescription)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date de création :</span>
              <span>${formatDate(prescription.createdAt)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Dernière modification :</span>
              <span>${formatDate(prescription.updatedAt)}</span>
            </div>
            <div class="detail-row">
              <span class="label">ID Prescription :</span>
              <span>${prescription._id}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
        </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Donner le focus à la nouvelle fenêtre
    printWindow.focus();
  }, []);

  // Fonction pour recharger les prescriptions après modification
  const handlePrescriptionUpdate = useCallback(() => {
    if (patient && patient._id) {
      loadPatientPrescriptions(patient._id);
    }
  }, [patient, loadPatientPrescriptions]);

  // Effect pour gérer les messages de succès et d'erreur de suppression
  useEffect(() => {
    if (successMessages?.delete) {
      // Nettoyer le message de succès après affichage
      const timer = setTimeout(() => {
        dispatch(clearSpecificSuccessMessage('delete'));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessages?.delete, dispatch]);

  useEffect(() => {
    if (error?.delete) {
      // Nettoyer le message d'erreur après affichage
      const timer = setTimeout(() => {
        dispatch(clearSpecificError('delete'));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error?.delete, dispatch]);

  // Effect principal pour charger les prescriptions
  useEffect(() => {
    // Vérifie que le patient existe et a un ID valide
    if (patient && patient._id) {
      console.log("Chargement des prescriptions pour le patient:", patient._id);
      loadPatientPrescriptions(patient._id);
    }

    // Fonction de nettoyage : réinitialise l'état quand le composant se démonte
    // ou quand on change de patient
    return () => {
      dispatch(resetStatus());
    };
  }, [patient?._id, loadPatientPrescriptions, dispatch]); // Dépendance sur l'ID du patient

  // Fonction pour fermer le modal avec nettoyage
  const handleClose = useCallback(() => {
    // Nettoie les données avant de fermer
    dispatch(clearPrescriptionList());
    dispatch(resetStatus());
    aff(false);
  }, [dispatch, aff]);

  // Fonction pour fermer le modal d'édition et recharger les données
  const handleCloseEdit = useCallback((shouldReload = false) => {
    setView(false);
    setOrdonnance({});

    // Recharger les prescriptions si nécessaire (après une modification)
    if (shouldReload && patient && patient._id) {
      loadPatientPrescriptions(patient._id);
    }
  }, [patient, loadPatientPrescriptions]);

  // Fonction pour formater la date d'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "Date non disponible";

    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Fonction pour obtenir le libellé d'affichage
  const getPrescriptionLabel = (prescription) => {
    return prescription.libelle && prescription.libelle.trim()
      ? prescription.libelle
      : 'Prescription sans libellé';
  };

  // Calcul du nombre total de prescriptions
  const totalPrescriptions = prescriptionList ? prescriptionList.length : 0;
  return (
    <>
      <div className="containers-params" onClick={(e) => e.target === e.currentTarget && aff(false)}>
        {view ? (
          <EditPrescription
            aff={handleCloseEdit}
            prescription={ordonnance}
            onUpdate={handlePrescriptionUpdate}
          />
        ) : (
          <div className="container-alls">
            {/* En-tête avec titre dynamique et bouton de fermeture */}
            <section>
              <p>
                <FileText size={30} />
                <span>
                  Toutes les Prescriptions ({totalPrescriptions})
                  {patient?.nom && ` - ${patient.nom}`}
                </span>
              </p>
              <X size={30} className="svg" onClick={handleClose} />
            </section>

            {/* Contenu principal avec gestion des différents états */}
            <div className="container-data">
              {/* État de chargement */}
              {isLoading && (
                <div className="loading-state">
                  <p>Chargement des prescriptions...</p>
                </div>
              )}

              {/* État d'erreur */}
              {error?.getByPatient && !isLoading && (
                <div className="error-state">
                  <p>Erreur : {error.getByPatient}</p>
                  <button
                    onClick={() => loadPatientPrescriptions(patient._id)}
                    className="retry-button"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* État avec données : affichage des prescriptions */}
              {!isLoading && !error?.getByPatient && prescriptionList && Array.isArray(prescriptionList) && prescriptionList.length > 0 && (
                prescriptionList.map((prescription, index) => (
                  <div key={prescription._id || `prescription-${index}`} className="card-alls">
                    <div className="left">
                      <p>
                        <FileText />
                        <span>{getPrescriptionLabel(prescription)}</span>
                      </p>
                      <p>{formatDate(prescription.updatedAt)}</p>
                    </div>
                    <div className="rigth">
                      <span onClick={() => {
                        setView(true)
                        setOrdonnance(prescription)
                      }}>
                        <Eye />
                      </span>
                      <span onClick={() => handlePrint(prescription)} style={{ cursor: 'pointer' }}>
                        <Printer />
                      </span>
                      <span
                        onClick={() => handleDeletePrescription(prescription)}
                        style={{
                          cursor: 'pointer',
                          opacity: isDeleting ? 0.5 : 1,
                          pointerEvents: isDeleting ? 'none' : 'auto'
                        }}
                      >
                        <Trash2 />
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* État vide : aucune prescription trouvée */}
              {!isLoading && !error?.getByPatient && (!prescriptionList || prescriptionList.length === 0) && (
                <div className="empty-state">
                  <div className="state">
                    <FileText size={48} style={{ opacity: 0.3 }} />
                    <p>Aucune prescription disponible pour ce patient</p>
                    {patient?.nom && (
                      <p style={{ fontSize: '0.9em', opacity: 0.7 }}>
                        Patient : {patient.nom}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* État d'erreur : patient non valide */}
              {!patient || !patient._id ? (
                <div className="error-state">
                  <p>Erreur : Informations patient manquantes</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
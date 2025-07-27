import { CircleUser, FilePlus2, Printer } from "lucide-react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { medecinInfo } from "../redux/AuthSlice";
import { UidContext } from "../AppContext";
import { addPrescription } from "../redux/PrescriptionSlice";
import toast, { Toaster } from "react-hot-toast";

export default function AddPrescription({ aff, aff1, patients }) {
  const [libelle, setLibelle] = useState('')
  const [Consultation, setConsultation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const uid = useContext(UidContext);

  const { medecinInfo: medecins, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid.uid]);

  // Fonction d'impression pour la prescription en cours
  const handlePrint = useCallback(() => {
    // Vérifier que les champs requis sont remplis
    if (!libelle.trim()) {
      toast.error('Veuillez saisir un libellé pour la prescription');
      return;
    }

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      toast.error('Veuillez autoriser les pop-ups pour l\'impression');
      return;
    }

    // Fonction pour formater la date
    const formatDate = (dateString) => {
      if (!dateString) return new Date().toLocaleDateString('fr-FR');
      try {
        return new Date(dateString).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return new Date().toLocaleDateString('fr-FR');
      }
    };

    // Contenu HTML à imprimer
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${libelle}</title>
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
            .doctor-info {
              background: #e8f4f8;
              padding: 15px;
              border: 1px solid #bee5eb;
              margin-bottom: 20px;
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
            .consultation-text {
              background: #f8f9fa;
              padding: 15px;
              border: 1px solid #ddd;
              margin-top: 15px;
              white-space: pre-wrap;
              min-height: 100px;
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
            .draft-notice {
              background: #fff3cd;
              color: #856404;
              padding: 10px;
              border: 1px solid #ffeaa7;
              border-radius: 4px;
              margin-bottom: 20px;
              text-align: center;
              font-weight: bold;
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
          
          <div class="draft-notice">
            ⚠️ PRESCRIPTION EN COURS DE CRÉATION - BROUILLON
          </div>
          
          <div class="header">
            <div class="title">PRESCRIPTION MÉDICALE</div>
          </div>
          
          <div class="doctor-info">
            <h3>Informations Médecin</h3>
            <div class="detail-row">
              <span class="label">Nom :</span>
              <span>${medecins?.nom || 'Non renseigné'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Prénom :</span>
              <span>${medecins?.prenom || 'Non renseigné'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Spécialité :</span>
              <span>${medecins?.specialite || 'Non renseigné'}</span>
            </div>
          </div>
          
          <div class="patient-info">
            <h3>Informations Patient</h3>
            <div class="detail-row">
              <span class="label">Nom :</span>
              <span>${patients?.nom || 'Non renseigné'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Prénom :</span>
              <span>${patients?.prenom || 'Non renseigné'}</span>
            </div>
            <div class="detail-row">
              <span class="label">ID Patient :</span>
              <span>${patients?._id || 'Non renseigné'}</span>
            </div>
          </div>
          
          <div class="prescription-details">
            <h3>Détails de la Prescription</h3>
            <div class="detail-row">
              <span class="label">Libellé :</span>
              <span>${libelle || 'Non renseigné'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date de création :</span>
              <span>${formatDate()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Statut :</span>
              <span>Brouillon - En cours de création</span>
            </div>
            
            ${Consultation ? `
              <div style="margin-top: 20px;">
                <h4>Consultation / Instructions :</h4>
                <div class="consultation-text">${Consultation}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <div>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
            <div><strong>⚠️ ATTENTION : Cette prescription n'est pas encore enregistrée</strong></div>
          </div>
        </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Donner le focus à la nouvelle fenêtre
    printWindow.focus();
  }, [libelle, Consultation, medecins, patients]);

  // Fonction pour gérer la soumission du formulaire
  async function handleSubmit(e) {
    e.preventDefault();

    // Validation des champs
    if (!libelle.trim()) {
      toast.error('Veuillez saisir un libellé pour la prescription');
      return;
    }

    if (!patients?._id) {
      toast.error('Aucun patient sélectionné');
      return;
    }

    if (!medecins?._id) {
      toast.error('Informations médecin non disponibles');
      return;
    }

    setIsSubmitting(true);

    try {
      const patient = patients._id;
      const medecin = medecins._id;
      const data = { libelle, Consultation, medecin, patient };

      // Dispatch de l'action avec unwrap pour gérer les erreurs
      const result = await dispatch(addPrescription(data)).unwrap();

      // Succès
      toast.success('Prescription enregistrée avec succès !');

      // Réinitialiser le formulaire
      setLibelle('');
      setConsultation('');

      // Fermer le formulaire
      aff(false);
      aff1(true);

    } catch (error) {
      // Erreur
      const errorMessage = error?.message || 'Une erreur est survenue lors de l\'enregistrement';
      toast.error(errorMessage);
      console.error('Erreur lors de l\'ajout de la prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="container-form-prescription">
        <p className="pp">
          <FilePlus2 size={30} />
          <span>Prescription medicale</span>
        </p>
        <section>
          <input
            type="text"
            placeholder="Libelle de l'ordonnance :"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            disabled={isSubmitting}
          />
          <textarea
            cols={2}
            rows={2}
            placeholder="Consultation / Instructions..."
            value={Consultation}
            onChange={(e) => setConsultation(e.target.value)}
            disabled={isSubmitting}
          />
        </section>
        <div className="boutons">
          <button
            onClick={handlePrint}
            type="button"
            disabled={isSubmitting}
          >
            <Printer />
          </button>
          <button
            className="cancel"
            onClick={() => {
              aff(false);
              aff1(true);
            }}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Prescrire'}
          </button>
        </div>
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
            fontSize: '14px',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minWidth: '300px',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}
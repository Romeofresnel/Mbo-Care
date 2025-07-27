import { HandHeart } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UidContext } from "../AppContext";
import { medecinInfo } from "../redux/AuthSlice";
import {
  addOperation,
  clearSpecificError,
  clearSpecificSuccess,
  selectOperationLoading,
  selectOperationErrors,
  selectOperationSuccessMessages
} from "../redux/OperationSlice";
import toast, { Toaster } from "react-hot-toast";

export default function AddOperation({ aff, patient }) {
  // ================================
  // ÉTATS LOCAUX - Données du formulaire
  // ================================
  const [formData, setFormData] = useState({
    contacturgence: '',
    libelleoperation: '',
    fraisoperation: '',
    datedebuts: '',
    heuredebut: ''
  });

  // État pour les erreurs de validation côté client
  const [validationErrors, setValidationErrors] = useState({});

  // ================================
  // CONTEXTE ET HOOKS REDUX
  // ================================
  const uid = useContext(UidContext);
  const dispatch = useDispatch();

  // Sélecteurs Redux pour l'authentification
  const { medecinInfo: medecins, status: authStatus } = useSelector((state) => state.auth);

  // Sélecteurs Redux pour les opérations
  const operationLoading = useSelector(selectOperationLoading);
  const operationErrors = useSelector(selectOperationErrors);
  const operationSuccessMessages = useSelector(selectOperationSuccessMessages);

  // ================================
  // EFFETS DE BORD
  // ================================

  /**
   * Charger les informations du médecin au montage du composant
   */
  useEffect(() => {
    if (authStatus === 'idle' && uid?.uid) {
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, authStatus, uid?.uid]);

  /**
   * Initialiser l'heure de début avec l'heure actuelle
   */
  useEffect(() => {
    const maintenant = new Date();
    const heureActuelle = maintenant
      .toTimeString()
      .split(" ")[0]
      .substring(0, 5);

    setFormData(prev => ({
      ...prev,
      heuredebut: heureActuelle
    }));
  }, []);

  /**
   * Gérer les messages de succès avec toast
   */
  useEffect(() => {
    if (operationSuccessMessages.add) {
      toast.success('Opération programmée avec succès!', {
        duration: 3000,
        position: 'top-right',
      });

      // Fermer le modal après succès
      const timer = setTimeout(() => {
        dispatch(clearSpecificSuccess('add'));
        resetForm();
        aff(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [operationSuccessMessages.add, dispatch, aff]);

  /**
   * Gérer les messages d'erreur avec toast
   */
  useEffect(() => {
    if (operationErrors.add) {
      toast.error(`Erreur lors de la programmation: ${operationErrors.add}`, {
        duration: 5000,
        position: 'top-right',
      });

      // Nettoyer l'erreur après l'affichage
      const timeout = setTimeout(() => {
        dispatch(clearSpecificError('add'));
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [operationErrors.add, dispatch]);

  /**
   * Nettoyer les erreurs lors du démontage
   */
  useEffect(() => {
    return () => {
      dispatch(clearSpecificError('add'));
      dispatch(clearSpecificSuccess('add'));
    };
  }, [dispatch]);

  // ================================
  // FONCTIONS UTILITAIRES
  // ================================

  /**
   * Réinitialiser le formulaire
   */
  const resetForm = () => {
    setFormData({
      contacturgence: '',
      libelleoperation: '',
      fraisoperation: '',
      datedebuts: '',
      heuredebut: ''
    });
    setValidationErrors({});
  };

  /**
   * Formater une date au format français
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée en français
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      // Vérifier que la date est valide
      if (isNaN(date.getTime())) {
        console.error('Date invalide:', dateString);
        return '';
      }

      // Format DD/MM/YYYY pour être cohérent avec l'ancien code
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  };

  /**
   * Valider les données du formulaire
   * @returns {Object} Objet contenant les erreurs de validation
   */
  const validateForm = () => {
    const errors = {};

    // Validation du contact d'urgence
    if (!formData.contacturgence.trim()) {
      errors.contacturgence = 'Le contact d\'urgence est requis';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.contacturgence)) {
      errors.contacturgence = 'Format de téléphone invalide';
    }

    // Validation du libellé de l'opération
    if (!formData.libelleoperation.trim()) {
      errors.libelleoperation = 'Le motif d\'opération est requis';
    } else if (formData.libelleoperation.trim().length < 3) {
      errors.libelleoperation = 'Le motif doit contenir au moins 3 caractères';
    }

    // Validation des frais d'opération
    if (!formData.fraisoperation.trim()) {
      errors.fraisoperation = 'Les frais d\'opération sont requis';
    } else if (isNaN(formData.fraisoperation) || parseFloat(formData.fraisoperation) <= 0) {
      errors.fraisoperation = 'Veuillez entrer un montant valide';
    }

    // Validation de la date
    if (!formData.datedebuts) {
      errors.datedebuts = 'La date d\'opération est requise';
    } else {
      const selectedDate = new Date(formData.datedebuts);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.datedebuts = 'La date ne peut pas être antérieure à aujourd\'hui';
      }
    }

    // Validation de l'heure
    if (!formData.heuredebut.trim()) {
      errors.heuredebut = 'L\'heure de début est requise';
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.heuredebut)) {
      errors.heuredebut = 'Format d\'heure invalide (HH:MM)';
    }

    return errors;
  };

  // ================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ================================

  /**
   * Gérer les changements dans les champs du formulaire
   * @param {string} field - Nom du champ
   * @param {string} value - Nouvelle valeur
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * Gérer la soumission du formulaire
   * @param {Event} e - Événement de soumission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);

      // Afficher les erreurs de validation via toast
      const errorMessages = Object.values(errors);
      toast.error(errorMessages.join(', '), {
        duration: 5000,
        position: 'top-right',
      });
      return;
    }

    // Vérifier que les données du médecin et du patient sont disponibles
    if (!medecins || !patient) {
      toast.error('Informations du médecin ou du patient manquantes', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    try {
      // Préparer les données pour l'API
      const operationData = {
        // Informations du patient (attention à la casse)
        patientId: patient._id,
        nomPatient: patient.nom,
        prenomPatient: patient.prenom,

        // Informations du médecin
        nomMedecin: medecins.nom,
        prenomMedecin: medecins.prenom,
        telephoneMedecin: medecins.telephone,

        // Données du formulaire
        contacturgence: formData.contacturgence.trim(),
        libelleoperation: formData.libelleoperation.trim(),
        fraisoperation: parseFloat(formData.fraisoperation),
        datedebut: formatDate(formData.datedebuts),
        heuredebut: formData.heuredebut.trim()
      };

      // Debug : Vérifier les données avant envoi
      console.log('Données envoyées:', operationData);

      // Validation finale des champs requis côté serveur
      const requiredFields = ['patientId', 'libelleoperation', 'datedebut', 'heuredebut'];
      const missingFields = requiredFields.filter(field => !operationData[field]);

      if (missingFields.length > 0) {
        console.error('Champs manquants:', missingFields);
        toast.error(`Champs requis manquants: ${missingFields.join(', ')}`, {
          duration: 5000,
          position: 'top-right',
        });
        return;
      }

      // Envoyer les données via Redux
      dispatch(addOperation(operationData));

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Erreur inattendue lors de la soumission', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  /**
   * Gérer l'annulation du formulaire
   */
  const handleCancel = () => {
    // Nettoyer les états avant de fermer
    dispatch(clearSpecificError('add'));
    dispatch(clearSpecificSuccess('add'));
    resetForm();
    aff(false);
  };

  // ================================
  // FONCTIONS D'AIDE POUR LE RENDU
  // ================================

  /**
   * Afficher une erreur pour un champ spécifique
   * @param {string} field - Nom du champ
   * @returns {JSX.Element|null} Élément d'erreur ou null
   */
  const renderFieldError = (field) => {
    const error = validationErrors[field];
    if (!error) return null;

    return (
      <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
        {error}
      </div>
    );
  };

  // ================================
  // RENDU DU COMPOSANT
  // ================================

  // Affichage de chargement pendant la récupération des infos médecin
  if (authStatus === 'loading') {
    return (
      <div className="containers-form-patients">
        <div className="section-operation">
          <p>Chargement des informations...</p>
        </div>
      </div>
    );
  }

  // Vérification des données requises
  if (!medecins || !patient) {
    return (
      <div className="containers-form-patients">
        <div className="section-operation">
          <p>Erreur: Informations manquantes</p>
          <button onClick={handleCancel}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="containers-form-patients" onClick={(e) => e.target === e.currentTarget && aff(false)}>
        <div className="section-operation">
          <p>
            <HandHeart size={30} />
            <span>Formulaire d'admission en salle d'opération</span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Section Patient */}
            <section>
              <span>Information sur le patient</span>
              <div className="section">
                <div className="info">
                  <label htmlFor="nomPatient">Nom patient</label>
                  <input
                    id="nomPatient"
                    type="text"
                    value={patient.nom}
                    disabled
                  />
                </div>
                <div className="info">
                  <label htmlFor="prenomPatient">Prénom patient</label>
                  <input
                    id="prenomPatient"
                    type="text"
                    value={patient.prenom}
                    disabled
                  />
                </div>
                <div className="info">
                  <label htmlFor="contactUrgence">Contact d'urgence *</label>
                  <input
                    id="contactUrgence"
                    type="tel"
                    value={formData.contacturgence}
                    onChange={(e) => handleInputChange('contacturgence', e.target.value)}
                    placeholder="Ex: +237 6XX XXX XXX"
                    disabled={operationLoading.add}
                  />
                  {renderFieldError('contacturgence')}
                </div>
              </div>
            </section>

            {/* Section Opération */}
            <section>
              <span>Information sur l'opération</span>
              <div className="info">
                <label htmlFor="motifOperation">Motif d'opération *</label>
                <input
                  id="motifOperation"
                  type="text"
                  value={formData.libelleoperation}
                  onChange={(e) => handleInputChange('libelleoperation', e.target.value)}
                  placeholder="Décrivez le motif de l'opération"
                  disabled={operationLoading.add}
                />
                {renderFieldError('libelleoperation')}
              </div>
              <div className="section">
                <div className="info">
                  <label htmlFor="fraisOperation">Frais Opératoire (FCFA) *</label>
                  <input
                    id="fraisOperation"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.fraisoperation}
                    onChange={(e) => handleInputChange('fraisoperation', e.target.value)}
                    placeholder="Ex: 50000"
                    disabled={operationLoading.add}
                  />
                  {renderFieldError('fraisoperation')}
                </div>
                <div className="info">
                  <label htmlFor="dateOperation">Date d'opération *</label>
                  <input
                    id="dateOperation"
                    type="date"
                    value={formData.datedebuts}
                    onChange={(e) => handleInputChange('datedebuts', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={operationLoading.add}
                  />
                  {renderFieldError('datedebuts')}
                </div>
                <div className="info">
                  <label htmlFor="heureDebut">Heure de début *</label>
                  <input
                    id="heureDebut"
                    type="time"
                    value={formData.heuredebut}
                    onChange={(e) => handleInputChange('heuredebut', e.target.value)}
                    disabled={operationLoading.add}
                  />
                  {renderFieldError('heuredebut')}
                </div>
              </div>
            </section>

            {/* Section Médecin */}
            <section>
              <span>Information sur le médecin</span>
              <div className="section">
                <div className="info">
                  <label htmlFor="nomChirurgien">Nom chirurgien</label>
                  <input
                    id="nomChirurgien"
                    type="text"
                    value={`${medecins.nom} ${medecins.prenom}`}
                    disabled
                  />
                </div>
                <div className="info">
                  <label htmlFor="specialisation">Spécialisation</label>
                  <input
                    id="specialisation"
                    type="text"
                    value={medecins.service || 'Non spécifié'}
                    disabled
                  />
                </div>
                <div className="info">
                  <label htmlFor="serviceMedical">Service médical</label>
                  <input
                    id="serviceMedical"
                    type="text"
                    value={medecins.service || 'Non spécifié'}
                    disabled
                  />
                </div>
                <div className="info">
                  <label htmlFor="telephoneMedecin">Numéro téléphone</label>
                  <input
                    id="telephoneMedecin"
                    type="tel"
                    value={medecins.telephone || 'Non spécifié'}
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Boutons d'action */}
            <div className="btns">
              <button
                type="button"
                className="cancel"
                onClick={handleCancel}
                disabled={operationLoading.add}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={operationLoading.add}
                className={operationLoading.add ? 'loading' : ''}
              >
                {operationLoading.add ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Configuration du Toaster */}
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
import { Bed } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addHospitalisation,
  clearSpecificError,
  clearSpecificSuccess
} from "../redux/HospitalisationSlice";

import toast, { Toaster } from "react-hot-toast";

/**
 * Composant pour ajouter une nouvelle hospitalisation
 * @param {Function} aff - Fonction pour contrôler l'affichage du formulaire
 * @param {Object} patient - Objet patient contenant les informations du patient
 */
export default function AddHospitalisation({ aff, patient }) {
  // ====== ÉTATS LOCAUX ======
  const [formData, setFormData] = useState({
    motif: '',
    description: '',
    numerochambre: '',
    datedebuts: '',
    datefins: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ====== REDUX HOOKS ======
  const dispatch = useDispatch();
  const {
    loading,
    errors,
    successMessages
  } = useSelector((state) => state.hospitalisation);

  // ====== EFFETS ======

  /**
   * Nettoyage des erreurs et messages au montage du composant
   */
  useEffect(() => {
    dispatch(clearSpecificError({ errorType: 'add' }));
    dispatch(clearSpecificSuccess({ successType: 'add' }));
  }, [dispatch]);

  /**
   * Gestion des messages de succès avec toast
   */
  useEffect(() => {
    if (successMessages.add) {
      toast.success(successMessages.add);
      dispatch(clearSpecificSuccess({ successType: 'add' }));

      // Réinitialiser le formulaire
      setFormData({
        motif: '',
        description: '',
        numerochambre: '',
        datedebuts: '',
        datefins: ''
      });
      setFormErrors({});
      setIsSubmitting(false);

      // Fermer le formulaire après un délai pour laisser voir le toast
      setTimeout(() => {
        aff(false);
      }, 1500);
    }
  }, [successMessages.add, dispatch, aff]);

  /**
   * Gestion des messages d'erreur avec toast
   */
  useEffect(() => {
    if (errors.add) {
      toast.error(errors.add);
      dispatch(clearSpecificError({ errorType: 'add' }));
      setIsSubmitting(false);
    }
  }, [errors.add, dispatch]);

  // ====== FONCTIONS UTILITAIRES ======

  /**
   * Formate une date au format français
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée en français
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  };

  /**
   * Valide les données du formulaire
   * @param {Object} data - Données du formulaire à valider
   * @returns {Object} Objet contenant les erreurs de validation
   */
  const validateForm = (data) => {
    const errors = {};

    // Validation du motif
    if (!data.motif.trim()) {
      errors.motif = 'Le motif d\'hospitalisation est requis';
    } else if (data.motif.trim().length < 3) {
      errors.motif = 'Le motif doit contenir au moins 3 caractères';
    }

    // Validation du numéro de chambre
    if (!data.numerochambre) {
      errors.numerochambre = 'Le numéro de chambre est requis';
    } else if (parseInt(data.numerochambre) <= 0) {
      errors.numerochambre = 'Le numéro de chambre doit être supérieur à 0';
    }

    // Validation de la description
    if (!data.description.trim()) {
      errors.description = 'La description est requise';
    } else if (data.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }

    // Validation des dates
    if (!data.datedebuts) {
      errors.datedebuts = 'La date de début est requise';
    }

    if (!data.datefins) {
      errors.datefins = 'La date de fin est requise';
    }

    // Validation de la cohérence des dates
    if (data.datedebuts && data.datefins) {
      const dateDebut = formatDate(data.datedebuts);
      const dateFin = formatDate(data.datefins);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateDebut < today) {
        errors.datedebuts = 'La date de début ne peut pas être antérieure à aujourd\'hui';
      }

      // if (dateFin <= dateDebut) {
      //   errors.datefins = 'La date de fin doit être postérieure à la date de début';
      // }
    }

    return errors;
  };

  // ====== GESTIONNAIRES D'ÉVÉNEMENTS ======

  /**
   * Gestion des changements dans les champs du formulaire
   * @param {Event} e - Événement de changement
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Gestion de la soumission du formulaire
   * @param {Event} e - Événement de soumission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier si le patient existe
    if (!patient || !patient._id) {
      console.error('Patient non défini ou ID manquant');
      return;
    }

    // Éviter les soumissions multiples
    if (isSubmitting || loading.add) {
      return;
    }

    // Validation du formulaire
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'envoi
      const hospitalData = {
        patientId: patient._id,
        motif: formData.motif.trim(),
        description: formData.description.trim(),
        numerochambre: parseInt(formData.numerochambre),
        datedebut: formatDate(formData.datedebuts),
        datefin: formatDate(formData.datefins)
      };

      console.log('Données d\'hospitalisation à envoyer:', hospitalData);

      // Dispatch de l'action Redux
      dispatch(addHospitalisation(hospitalData));

    } catch (error) {
      console.error('Erreur lors de la préparation des données:', error);
      setIsSubmitting(false);
    }
  };

  /**
   * Gestion de l'annulation
   */
  const handleCancel = () => {
    // Nettoyer les erreurs et messages
    dispatch(clearSpecificError({ errorType: 'add' }));
    dispatch(clearSpecificSuccess({ successType: 'add' }));

    // Fermer le formulaire
    aff(false);
  };

  // ====== RENDU ======
  return (
    <>
      <div className="containers-form-patients" onClick={(e) => e.target === e.currentTarget && aff(false)}>
        <div className="section-hospitalisation">
          <p>
            <Bed size={30} />
            <span>Formulaire d'hospitalisation</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="section">
              <div className="info">
                <label htmlFor="motif">Motif d'hospitalisation *</label>
                <input
                  type="text"
                  id="motif"
                  name="motif"
                  value={formData.motif}
                  onChange={handleInputChange}
                  disabled={loading.add}
                  placeholder="Entrez le motif d'hospitalisation"
                />
                {formErrors.motif && (
                  <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                    {formErrors.motif}
                  </span>
                )}
              </div>

              <div className="info">
                <label htmlFor="numerochambre">Numéro de chambre *</label>
                <input
                  type="number"
                  id="numerochambre"
                  name="numerochambre"
                  value={formData.numerochambre}
                  onChange={handleInputChange}
                  disabled={loading.add}
                  placeholder="Ex: 101"
                  min="1"
                />
                {formErrors.numerochambre && (
                  <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                    {formErrors.numerochambre}
                  </span>
                )}
              </div>
            </div>

            <div className="info">
              <label htmlFor="description">Description de l'hospitalisation *</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading.add}
                placeholder="Décrivez les détails de l'hospitalisation"
              />
              {formErrors.description && (
                <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                  {formErrors.description}
                </span>
              )}
            </div>

            <section>
              <div className="info">
                <label htmlFor="datedebuts">Date début *</label>
                <input
                  type="date"
                  id="datedebuts"
                  name="datedebuts"
                  value={formData.datedebuts}
                  onChange={handleInputChange}
                  disabled={loading.add}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.datedebuts && (
                  <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                    {formErrors.datedebuts}
                  </span>
                )}
              </div>

              <div className="info">
                <label htmlFor="datefins">Date fin *</label>
                <input
                  type="date"
                  id="datefins"
                  name="datefins"
                  value={formData.datefins}
                  onChange={handleInputChange}
                  disabled={loading.add}
                  min={formData.datedebuts || new Date().toISOString().split('T')[0]}
                />
                {formErrors.datefins && (
                  <span className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                    {formErrors.datefins}
                  </span>
                )}
              </div>
            </section>

            <div className="btns">
              <button
                type="button"
                className="cancel"
                onClick={handleCancel}
                disabled={loading.add}
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading.add || isSubmitting}
              >
                {loading.add ? 'Ajout en cours...' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster
        position="top"
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
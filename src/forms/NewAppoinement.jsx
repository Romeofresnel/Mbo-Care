import { AlarmClock, CheckCheck } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAppointment, clearMessages, clearError } from "../redux/AppoinementSlice";
import { UidContext } from "../AppContext";
import { medecinInfo } from "../redux/AuthSlice";
import toast, { Toaster } from "react-hot-toast";

export default function NewAppoinement({ aff, patient }) {
  const dispatch = useDispatch();
  const uid = useContext(UidContext);
  const { medecinInfo: medecins, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid.uid]);

  // Sélecteurs Redux (séparés pour éviter les re-renders inutiles)
  const loading = useSelector((state) => state.appointments.loading.create);
  const error = useSelector((state) => state.appointments.error.create);
  const successMessage = useSelector((state) => state.appointments.successMessage);

  // État local du formulaire
  const [formData, setFormData] = useState({
    motif: "",
    dateRendezVous: "",
    heureRendezVous: "",
  });

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
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  };

  // État pour la validation
  const [formErrors, setFormErrors] = useState({});

  // Effet pour gérer les messages de succès et d'erreur avec toast
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError('create'));
    }
  }, [error, dispatch]);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur pour ce champ si elle existe
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.motif.trim()) {
      errors.motif = "Le motif du rendez-vous est requis";
    }

    if (!formData.dateRendezVous) {
      errors.dateRendezVous = "La date du rendez-vous est requise";
    } else {
      // Vérifier que la date n'est pas dans le passé
      const selectedDate = new Date(formData.dateRendezVous);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.dateRendezVous = "La date ne peut pas être dans le passé";
      }
    }

    if (!formData.heureRendezVous) {
      errors.heureRendezVous = "L'heure du rendez-vous est requise";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Effacer les messages précédents
    dispatch(clearMessages());

    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

    // Préparer les données pour l'API
    const appointmentData = {
      label: formData.motif.trim(),
      appoinement_date: formatDate(formData.dateRendezVous),
      appoinement_heure: formData.heureRendezVous,
      PatientId: patient._id,
      medecinId: medecins._id
    };

    try {
      // Envoyer la requête de création
      const result = await dispatch(createAppointment(appointmentData));

      // Si la création est réussie
      if (createAppointment.fulfilled.match(result)) {
        // Réinitialiser le formulaire
        setFormData({
          motif: "",
          dateRendezVous: "",
          heureRendezVous: "",
        });

        // Fermer le modal après un délai pour permettre à l'utilisateur de voir le toast
        setTimeout(() => {
          aff(false);
        }, 1500);
      }
    } catch (error) {
      console.log(appointmentData);
      console.error("Erreur lors de la création du rendez-vous:", error);
    }
  };

  // Gérer l'annulation
  const handleCancel = () => {
    // Effacer les messages et erreurs
    dispatch(clearMessages());
    dispatch(clearError('create'));

    // Réinitialiser le formulaire
    setFormData({
      motif: "",
      dateRendezVous: "",
      heureRendezVous: "",
    });
    setFormErrors({});

    // Fermer le modal
    aff(false);
  };

  return (
    <>
      <div className="containers-params" onClick={(e) => e.target === e.currentTarget && aff(false)}>
        <div className="container-form app">
          <section>
            <AlarmClock size={30} />
            <span>New Rendez-vous</span>
          </section>

          <form onSubmit={handleSubmit}>
            <div className="params">
              <label htmlFor="motif">
                <span>Motif/Type rendez-vous</span>
              </label>
              <input
                type="text"
                id="motif"
                name="motif"
                value={formData.motif}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.motif && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {formErrors.motif}
                </span>
              )}
            </div>

            <div className="params">
              <label htmlFor="dateRendezVous">
                <span>Date rendez-vous</span>
              </label>
              <input
                type="date"
                id="dateRendezVous"
                name="dateRendezVous"
                value={formData.dateRendezVous}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.dateRendezVous && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {formErrors.dateRendezVous}
                </span>
              )}
            </div>

            <div className="params">
              <label htmlFor="heureRendezVous">
                <span>Heure rendez-vous</span>
              </label>
              <input
                type="time"
                id="heureRendezVous"
                name="heureRendezVous"
                value={formData.heureRendezVous}
                onChange={handleInputChange}
                disabled={loading}
              />
              {formErrors.heureRendezVous && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {formErrors.heureRendezVous}
                </span>
              )}
            </div>

            <div className="btns">
              <button
                type="button"
                className="btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
              >
                <CheckCheck />
                <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
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
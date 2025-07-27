import React, { useState, useEffect } from "react";
import {
  CircleUserRound,
  ClipboardList,
  UserCog,
} from "lucide-react";
import {
  faChildReaching,
  faUserNurse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  addPatient,
  selectAddPatientError,
  selectAddPatientSuccess,
  selectAddPatientStatus,
  clearAddError,
  clearAddSuccess
} from "../redux/PatientSlice";

export default function AddNewPatient({ aff }) {
  const dispatch = useDispatch();

  // États du formulaire avec initialisation propre
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissances: '',
    lieuNaissance: '',
    telephone: '',
    nomPere: '',
    nomMere: '',
    profession: '',
    sexe: '',
    domicile: '',
    age: '',
    numeroCni: '',
    groupeSanguin: ''
  });

  // État pour gérer la soumission du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sélecteurs Redux pour suivre l'état de l'ajout
  const addError = useSelector(selectAddPatientError);
  const addSuccess = useSelector(selectAddPatientSuccess);
  const addStatus = useSelector(selectAddPatientStatus);

  // Options pour les sélects
  const sexeOptions = [
    { value: "Masculin", label: "Masculin", id: "Masculin" },
    { value: "Feminin", label: "Feminin", id: "Feminin" },
  ];

  const sanguinOptions = [
    { value: "O+", label: "O+", id: "O+" },
    { value: "O-", label: "O-", id: "O-" },
    { value: "A+", label: "A+", id: "A+" },
    { value: "A-", label: "A-", id: "A-" },
    { value: "B+", label: "B+", id: "B+" },
    { value: "B-", label: "B-", id: "B-" },
    { value: "AB-", label: "AB-", id: "AB-" },
    { value: "AB+", label: "AB+", id: "AB+" },
  ];

  // Fonction pour mettre à jour les données du formulaire
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction de validation du formulaire
  const validateForm = () => {
    const errors = [];

    // Vérifications obligatoires
    if (!formData.nom.trim()) {
      errors.push("Le nom est obligatoire");
    }

    if (!formData.prenom.trim()) {
      errors.push("Le prénom est obligatoire");
    }

    // Vérifications optionnelles mais utiles
    if (formData.telephone && !/^[0-9+\s-()]+$/.test(formData.telephone)) {
      errors.push("Le numéro de téléphone n'est pas valide");
    }

    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 150)) {
      errors.push("L'âge doit être un nombre valide entre 0 et 150");
    }

    return errors;
  };

  // Fonction pour formater la date
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

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      dateNaissances: '',
      lieuNaissance: '',
      telephone: '',
      nomPere: '',
      nomMere: '',
      profession: '',
      sexe: '',
      domicile: '',
      age: '',
      numeroCni: '',
      groupeSanguin: ''
    });
  };

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Empêcher les soumissions multiples
    if (isSubmitting) return;

    // Nettoyer les erreurs précédentes
    dispatch(clearAddError());
    dispatch(clearAddSuccess());

    // Validation du formulaire
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(', '));
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparation des données avec formatage de la date
      const dataToSend = {
        ...formData,
        dateNaissance: formatDate(formData.dateNaissances),
        // Conversion de l'âge en nombre si fourni
        age: formData.age ? parseInt(formData.age, 10) : null,
        // Nettoyage des espaces en début et fin
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        profession: formData.profession.trim(),
        lieuNaissance: formData.lieuNaissance.trim(),
        domicile: formData.domicile.trim(),
        nomPere: formData.nomPere.trim(),
        nomMere: formData.nomMere.trim(),
      };

      // Dispatch de l'action d'ajout
      await dispatch(addPatient(dataToSend)).unwrap();

    } catch (error) {
      // L'erreur sera gérée par l'useEffect qui surveille addError
      console.error('Erreur lors de l\'ajout du patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour fermer le modal
  const handleClose = () => {
    // Nettoyer les erreurs et succès avant de fermer
    dispatch(clearAddError());
    dispatch(clearAddSuccess());
    resetForm();
    aff(false);
  };

  // Effect pour gérer les notifications d'erreur
  useEffect(() => {
    if (addError) {
      toast.error(`Erreur lors de l'enregistrement: ${addError}`, {
        duration: 5000,
        position: 'top-right',
      });
      // Nettoyer l'erreur après l'affichage
      const timeout = setTimeout(() => {
        dispatch(clearAddError());
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [addError, dispatch]);

  // Effect pour gérer les notifications de succès
  useEffect(() => {
    if (addSuccess) {
      toast.success('Patient enregistré avec succès!', {
        duration: 3000,
        position: 'top-right',
      });

      // Réinitialiser le formulaire et fermer le modal après succès
      const timeout = setTimeout(() => {
        dispatch(clearAddSuccess());
        resetForm();
        aff(false);
      }, 1500); // Délai pour voir le toast

      return () => clearTimeout(timeout);
    }
  }, [addSuccess, dispatch, aff]);

  // Fonction pour gérer la fermeture avec les touches du clavier
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <>
      <div className='containers-params-add' onClick={(e) => e.target === e.currentTarget && aff(false)}>
        <div className='section-new-patient center'>
          <p className='pp'>
            <ClipboardList size={30} />
            <span>Formulaire d'ajout d'un patient</span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* SECTION INFORMATIONS PERSONNELLES */}
            <div className='information personnel'>
              <div className='part-description'>
                <h3>
                  <CircleUserRound />
                  <span>Informations Personnelles</span>
                </h3>
                <p>
                  Saisissez les informations personnelles du patient.
                  Les champs marqués d'un astérisque (*) sont obligatoires.
                </p>
              </div>

              <div className='part-form'>
                <section>
                  <div className='info'>
                    <label htmlFor='nom'>Nom patient *</label>
                    <input
                      id='nom'
                      type='text'
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder="Nom du patient"
                      required
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='prenom'>Prénom patient *</label>
                    <input
                      id='prenom'
                      type='text'
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      placeholder="Prénom du patient"
                      required
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='dateNaissance'>Date de Naissance</label>
                    <input
                      id='dateNaissance'
                      type='date'
                      value={formData.dateNaissances}
                      onChange={(e) => handleInputChange('dateNaissances', e.target.value)}
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='lieuNaissance'>Lieu de Naissance</label>
                    <input
                      id='lieuNaissance'
                      type='text'
                      value={formData.lieuNaissance}
                      onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                      placeholder="Lieu de naissance"
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='age'>Âge patient</label>
                    <input
                      id='age'
                      type='number'
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="Âge"
                      min="0"
                      max="150"
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='nomPere'>Nom du père</label>
                    <input
                      id='nomPere'
                      type='text'
                      value={formData.nomPere}
                      onChange={(e) => handleInputChange('nomPere', e.target.value)}
                      placeholder="Nom du père"
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='nomMere'>Nom de la mère</label>
                    <input
                      id='nomMere'
                      type='text'
                      value={formData.nomMere}
                      onChange={(e) => handleInputChange('nomMere', e.target.value)}
                      placeholder="Nom de la mère"
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='telephone'>Téléphone</label>
                    <input
                      id='telephone'
                      type='tel'
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="Numéro de téléphone"
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='numeroCni'>Numéro CNI</label>
                    <input
                      id='numeroCni'
                      type='text'
                      value={formData.numeroCni}
                      onChange={(e) => handleInputChange('numeroCni', e.target.value)}
                      placeholder="Numéro de carte d'identité"
                    />
                  </div>

                  <div className='info'>
                    <label htmlFor='domicile'>Domicile</label>
                    <input
                      id='domicile'
                      type='text'
                      value={formData.domicile}
                      onChange={(e) => handleInputChange('domicile', e.target.value)}
                      placeholder="Adresse de domicile"
                    />
                  </div>

                  <div className='info full'>
                    <label htmlFor='profession'>Profession</label>
                    <input
                      id='profession'
                      type='text'
                      value={formData.profession}
                      onChange={(e) => handleInputChange('profession', e.target.value)}
                      placeholder="Profession du patient"
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* SECTION INFORMATIONS MÉDICALES */}
            <div className='information medicale'>
              <div className='part-description'>
                <h3>
                  <UserCog />
                  <span>Informations Médicales</span>
                </h3>
                <p>
                  Informations médicales de base du patient pour
                  constituer son dossier médical.
                </p>
              </div>

              <div className='part-form'>
                <section>
                  <div className='info'>
                    <label htmlFor='sexe' className='genre'>Genre/Sexe</label>
                    <select
                      id='sexe'
                      name="sexe"
                      value={formData.sexe}
                      onChange={(e) => handleInputChange('sexe', e.target.value)}
                    >
                      <option value="">Choisir le sexe</option>
                      {sexeOptions.map((sex) => (
                        <option key={sex.id} value={sex.value}>
                          {sex.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='info'>
                    <label htmlFor='groupeSanguin' className='genre'>Groupe sanguin</label>
                    <select
                      id='groupeSanguin'
                      name="groupeSanguin"
                      value={formData.groupeSanguin}
                      onChange={(e) => handleInputChange('groupeSanguin', e.target.value)}
                    >
                      <option value="">Choisir le groupe sanguin</option>
                      {sanguinOptions.map((sang) => (
                        <option key={sang.id} value={sang.value}>
                          {sang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
              </div>
            </div>

            {/* BOUTONS D'ACTION */}
            <div className='btns'>
              <button
                type='button'
                className='cancel'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className={isSubmitting ? 'loading' : ''}
              >
                {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
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
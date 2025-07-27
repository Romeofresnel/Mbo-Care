import { PenLine, User, UserRoundPen } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    updatePatient,
    selectPatientStatus,
    selectPatientErrors,
    selectPatientSuccessMessages,
    clearErrors,
    clearSuccessMessages
} from '../redux/PatientSlice';
import { toast } from 'react-toastify';

/**
 * Composant pour modifier les informations d'un patient
 * @param {Object} props - Les propriétés du composant
 * @param {Function} props.aff - Fonction pour afficher/masquer le modal
 * @param {Object} props.patient - Les données du patient à modifier
 */
export default function EditPatient({ aff, patient }) {
    const dispatch = useDispatch();

    // Sélecteurs Redux pour le state management
    const status = useSelector(selectPatientStatus);
    const errors = useSelector(selectPatientErrors);
    const successMessages = useSelector(selectPatientSuccessMessages);

    // États locaux pour le formulaire
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        dateNaissance: '',
        lieuNaissance: '',
        telephone: '',
        nomPere: '',
        nomMere: '',
        profession: '',
        sexe: '',
        domicile: '',
        quartier: '',
        age: '',
        numeroCni: '',
        groupeSanguin: ''
    });

    // État pour indiquer si le formulaire est en cours de soumission
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Formate une date ISO en format date HTML input
     * @param {string} dateString - Date au format ISO
     * @returns {string} Date formatée pour l'input HTML
     */
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            // Vérifier si la date est valide
            if (isNaN(date.getTime())) return '';

            // Formater en YYYY-MM-DD pour l'input de type date
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
            return '';
        }
    };

    /**
     * Formate une date pour l'affichage français
     * @param {string} dateString - Date au format ISO
     * @returns {string} Date formatée en français
     */
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

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
     * Initialise les champs du formulaire avec les données du patient
     */
    useEffect(() => {
        if (patient) {
            console.log('Patient reçu:', patient);
            console.log('Date de naissance brute:', patient.dateNaissance);

            setFormData({
                nom: patient.nom || '',
                prenom: patient.prenom || '',
                dateNaissance: formatDateForInput(patient.dateNaissance),
                lieuNaissance: patient.lieuNaissance || '',
                telephone: patient.telephone || '',
                nomPere: patient.nomPere || '',
                nomMere: patient.nomMere || '',
                profession: patient.profession || '',
                sexe: patient.sexe || '',
                domicile: patient.domicile || '',
                quartier: patient.quartier || '',
                age: patient.age ? String(patient.age) : '',
                numeroCni: patient.numeroCni || '',
                groupeSanguin: patient.groupeSanguin || ''
            });

            console.log('Date formatée pour input:', formatDateForInput(patient.dateNaissance));
        }
    }, [patient]);

    /**
     * Gère les messages de succès et d'erreur
     */
    useEffect(() => {
        if (successMessages.update) {
            toast.success(successMessages.update);
            dispatch(clearSuccessMessages());
            setIsSubmitting(false);

            // Fermer le modal après un court délai pour que l'utilisateur voie le message
            setTimeout(() => {
                aff(false);
            }, 1000);
        }

        if (errors.update) {
            toast.error(errors.update);
            dispatch(clearErrors());
            setIsSubmitting(false);
        }
    }, [successMessages.update, errors.update, dispatch, aff]);

    /**
     * Gère les changements dans les champs du formulaire
     * @param {string} field - Le nom du champ
     * @param {string} value - La nouvelle valeur
     */
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    /**
     * Valide les données du formulaire
     * @returns {boolean} True si les données sont valides
     */
    const validateForm = () => {
        const errors = [];

        // Validation des champs obligatoires
        if (!formData.nom.trim()) {
            errors.push('Le nom est obligatoire');
        }
        if (!formData.prenom.trim()) {
            errors.push('Le prénom est obligatoire');
        }

        // Validation de l'âge si fourni
        if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 150)) {
            errors.push('L\'âge doit être un nombre entre 0 et 150');
        }

        // Validation du numéro de téléphone si fourni
        if (formData.telephone && !/^[0-9+\s-()]*$/.test(formData.telephone)) {
            errors.push('Le numéro de téléphone contient des caractères invalides');
        }

        if (errors.length > 0) {
            toast.error(errors.join('\n'));
            return false;
        }

        return true;
    };

    /**
     * Prépare les données pour l'envoi au serveur
     * @returns {Object} Données formatées pour l'API
     */
    const prepareDataForSubmission = () => {
        const submissionData = {
            nom: formData.nom.trim(),
            prenom: formData.prenom.trim(),
            profession: formData.profession.trim(),
            lieuNaissance: formData.lieuNaissance.trim(),
            telephone: formData.telephone.trim(),
            nomMere: formData.nomMere.trim(),
            nomPere: formData.nomPere.trim(),
            sexe: formData.sexe,
            groupeSanguin: formData.groupeSanguin,
            numeroCni: formData.numeroCni.trim(),
            domicile: formData.domicile.trim(),
            quartier: formData.quartier.trim()
        };

        // Traitement de la date de naissance
        if (formData.dateNaissance) {
            submissionData.dateNaissance = formatDateForDisplay(formData.dateNaissance);
        }

        // Traitement de l'âge
        if (formData.age) {
            submissionData.age = parseInt(formData.age);
        }

        return submissionData;
    };

    /**
     * Gestionnaire de soumission du formulaire
     * @param {Event} e - Événement de soumission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Éviter les soumissions multiples
        if (isSubmitting) return;

        // Validation du formulaire
        if (!validateForm()) return;

        // Vérifier l'ID du patient
        if (!patient?._id && !patient?.id) {
            toast.error('Erreur: ID du patient introuvable');
            return;
        }

        setIsSubmitting(true);

        try {
            // Préparer les données
            const patientData = prepareDataForSubmission();
            const patientId = patient._id || patient.id;

            console.log('Données envoyées:', patientData);

            // Dispatch de l'action de modification
            await dispatch(updatePatient({
                patientId,
                patientData
            })).unwrap();

            // Le succès est géré dans l'useEffect
        } catch (error) {
            // L'erreur est gérée dans l'useEffect
            console.error('Erreur lors de la modification:', error);
            setIsSubmitting(false);
        }
    };

    /**
     * Gestionnaire pour annuler la modification
     */
    const handleCancel = () => {
        // Nettoyer les erreurs et messages
        dispatch(clearErrors());
        dispatch(clearSuccessMessages());

        // Réinitialiser l'état de soumission
        setIsSubmitting(false);

        // Fermer le modal
        aff(false);
    };

    // Options pour les sélecteurs
    const sexeOptions = [
        { value: "Masculin", label: "Masculin", id: "Masculin" },
        { value: "Feminin", label: "Féminin", id: "Feminin" },
    ];

    const sanguinOptions = [
        { value: "O+", label: "O+", id: "O+" },
        { value: "O-", label: "O-", id: "O-" },
        { value: "A+", label: "A+", id: "A+" },
        { value: "A-", label: "A-", id: "A-" },
        { value: "B+", label: "B+", id: "B+" },
        { value: "B-", label: "B-", id: "B-" },
        { value: "AB+", label: "AB+", id: "AB+" },
        { value: "AB-", label: "AB-", id: "AB-" },
    ];

    // Détermine si les champs doivent être désactivés
    const isFormDisabled = status === 'loading' || isSubmitting;

    return (
        <div className='form-container-edit' onClick={(e) => e.target === e.currentTarget && aff(false)}>
            <form onSubmit={handleSubmit}>
                <div className='left'>
                    <div className='img pa'>
                        <User size={70} />
                    </div>
                    <div className='circle'></div>
                </div>
                <div className='rigth'>
                    <p>
                        <UserRoundPen size={35} />
                        <span>Modifier les informations personnelles du patient</span>
                    </p>
                    <div className='section-form'>
                        <section>
                            {/* Nom du patient */}
                            <div className='info'>
                                <label htmlFor="nom">Nom Patient *</label>
                                <input
                                    type="text"
                                    name="nom"
                                    id="nom"
                                    value={formData.nom}
                                    onChange={(e) => handleInputChange('nom', e.target.value)}
                                    required
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le nom du patient"
                                />
                            </div>

                            {/* Prénom du patient */}
                            <div className='info'>
                                <label htmlFor="prenom">Prénom Patient *</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    id="prenom"
                                    value={formData.prenom}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                    required
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le prénom du patient"
                                />
                            </div>

                            {/* Date de naissance */}
                            <div className='info'>
                                <label htmlFor="dateNaissance">Date de Naissance</label>
                                <input
                                    type="date"
                                    name="dateNaissance"
                                    id="dateNaissance"
                                    value={formData.dateNaissance}
                                    onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                                    disabled={isFormDisabled}
                                />
                            </div>

                            {/* Lieu de naissance */}
                            <div className='info'>
                                <label htmlFor="lieuNaissance">Lieu de Naissance</label>
                                <input
                                    type="text"
                                    name="lieuNaissance"
                                    id="lieuNaissance"
                                    value={formData.lieuNaissance}
                                    onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le lieu de naissance"
                                />
                            </div>

                            {/* Âge */}
                            <div className='info'>
                                <label htmlFor="age">Âge</label>
                                <input
                                    type="number"
                                    name="age"
                                    id="age"
                                    value={formData.age}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    min="0"
                                    max="150"
                                    disabled={isFormDisabled}
                                    placeholder="Entrez l'âge"
                                />
                            </div>

                            {/* Téléphone */}
                            <div className='info'>
                                <label htmlFor="telephone">Téléphone</label>
                                <input
                                    type="tel"
                                    name="telephone"
                                    id="telephone"
                                    value={formData.telephone}
                                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le numéro de téléphone"
                                />
                            </div>

                            {/* Nom du père */}
                            <div className='info'>
                                <label htmlFor="nomPere">Nom du père</label>
                                <input
                                    type="text"
                                    name="nomPere"
                                    id="nomPere"
                                    value={formData.nomPere}
                                    onChange={(e) => handleInputChange('nomPere', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le nom du père"
                                />
                            </div>

                            {/* Nom de la mère */}
                            <div className='info'>
                                <label htmlFor="nomMere">Nom de la mère</label>
                                <input
                                    type="text"
                                    name="nomMere"
                                    id="nomMere"
                                    value={formData.nomMere}
                                    onChange={(e) => handleInputChange('nomMere', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le nom de la mère"
                                />
                            </div>

                            {/* Profession */}
                            <div className='info'>
                                <label htmlFor="profession">Profession</label>
                                <input
                                    type="text"
                                    name="profession"
                                    id="profession"
                                    value={formData.profession}
                                    onChange={(e) => handleInputChange('profession', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez la profession"
                                />
                            </div>

                            {/* Sexe */}
                            <div className='info'>
                                <label htmlFor="sexe">Sexe</label>
                                <select
                                    name="sexe"
                                    id="sexe"
                                    value={formData.sexe}
                                    onChange={(e) => handleInputChange('sexe', e.target.value)}
                                    disabled={isFormDisabled}
                                >
                                    <option value="">Choisir le sexe</option>
                                    {sexeOptions.map((sex) => (
                                        <option key={sex.id} value={sex.value}>
                                            {sex.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Groupe sanguin */}
                            <div className='info'>
                                <label htmlFor="groupeSanguin">Groupe sanguin</label>
                                <select
                                    name="groupeSanguin"
                                    id="groupeSanguin"
                                    value={formData.groupeSanguin}
                                    onChange={(e) => handleInputChange('groupeSanguin', e.target.value)}
                                    disabled={isFormDisabled}
                                >
                                    <option value="">Choisir le groupe sanguin</option>
                                    {sanguinOptions.map((sang) => (
                                        <option key={sang.id} value={sang.value}>
                                            {sang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Domicile */}
                            <div className='info'>
                                <label htmlFor="domicile">Domicile</label>
                                <input
                                    type="text"
                                    name="domicile"
                                    id="domicile"
                                    value={formData.domicile}
                                    onChange={(e) => handleInputChange('domicile', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le domicile"
                                />
                            </div>

                            {/* Numéro de CNI */}
                            <div className='info'>
                                <label htmlFor="numeroCni">Numéro de CNI</label>
                                <input
                                    type="text"
                                    name="numeroCni"
                                    id="numeroCni"
                                    value={formData.numeroCni}
                                    onChange={(e) => handleInputChange('numeroCni', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le numéro de CNI"
                                />
                            </div>

                            {/* Quartier */}
                            <div className='info'>
                                <label htmlFor="quartier">Quartier</label>
                                <input
                                    type="text"
                                    name="quartier"
                                    id="quartier"
                                    value={formData.quartier}
                                    onChange={(e) => handleInputChange('quartier', e.target.value)}
                                    disabled={isFormDisabled}
                                    placeholder="Entrez le quartier"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Boutons d'action */}
                    <div className='btn'>
                        <button
                            type="button"
                            className='cancel'
                            onClick={handleCancel}
                            disabled={isFormDisabled}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isFormDisabled}
                        >
                            {isSubmitting ? 'Modification en cours...' : 'Modifier'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
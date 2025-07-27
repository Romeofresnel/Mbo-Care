import React, { useState, useCallback, useEffect } from 'react';
import { X, AlertCircle, Calendar, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
    endHospitalisation,
    clearSpecificError,
    clearSpecificSuccess,
    getActiveHospitalisationsByPatient
} from '../redux/HospitalisationSlice';
import toast from 'react-hot-toast';

const EndHospitalizationModal = ({ onClose, patient, hospitalizationId: patientId }) => {
    // États locaux pour la gestion de l'interface
    const [isConfirming, setIsConfirming] = useState(false);
    const [hospitalizationNotFound, setHospitalizationNotFound] = useState(false);

    // Sélecteurs Redux pour l'état de l'hospitalisation
    const dispatch = useDispatch();
    const {
        loading,
        errors,
        successMessages,
        activePatientHospitalisations,
        currentPatientInfo
    } = useSelector(state => state.hospitalisation);

    // Récupération de l'hospitalisation active du patient (première de la liste car un patient ne peut avoir qu'une hospitalisation active)
    const currentHospitalization = activePatientHospitalisations && activePatientHospitalisations.length > 0
        ? activePatientHospitalisations[0]
        : null;

    console.log(currentHospitalization);

    /**
     * 
     * Effet pour récupérer les hospitalisations actives du patient au montage du composant
     */
    useEffect(() => {
        if (patientId) {
            console.log('Récupération des hospitalisations actives pour le patient:', patientId);
            // Utiliser l'action spécifique pour récupérer les hospitalisations actives du patient
            dispatch(getActiveHospitalisationsByPatient(patientId));
        } else {
            console.error('ID du patient manquant');
            setHospitalizationNotFound(true);
        }
    }, [dispatch, patientId]);

    /**
     * Effet pour gérer l'état "hospitalisation non trouvée"
     */
    useEffect(() => {
        // Attendre que le chargement soit terminé avant de déterminer si l'hospitalisation existe
        if (!loading.getActiveByPatient && activePatientHospitalisations !== undefined) {
            if (activePatientHospitalisations.length === 0) {
                console.warn('Aucune hospitalisation active trouvée pour le patient:', patientId);
                setHospitalizationNotFound(true);
            } else {
                console.log('Hospitalisation active trouvée:', activePatientHospitalisations[0]);
                setHospitalizationNotFound(false);
            }
        }
    }, [loading.getActiveByPatient, activePatientHospitalisations, patientId]);

    /**
     * Fonction pour formater une date de manière sécurisée
     * @param {string} dateString - Date à formater
     * @returns {string} Date formatée ou message par défaut
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
     * Fonction pour calculer la durée d'hospitalisation en jours
     * @param {string} dateDebut - Date de début d'hospitalisation
     * @returns {number} Nombre de jours depuis le début
     */
    const calculateHospitalizationDuration = useCallback((dateDebut) => {
        if (!dateDebut) return 0;

        try {
            const debut = new Date(dateDebut);
            const maintenant = new Date();
            const diffTime = Math.abs(maintenant - debut);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            console.error('Erreur lors du calcul de la durée:', error);
            return 0;
        }
    }, []);

    /**
     * Fonction pour gérer la fermeture de la modale avec nettoyage
     */
    const handleClose = useCallback(() => {
        // Nettoyer les erreurs et messages de succès spécifiques à la fin d'hospitalisation
        dispatch(clearSpecificError({ errorType: 'end' }));
        dispatch(clearSpecificError({ errorType: 'getActiveByPatient' }));
        dispatch(clearSpecificSuccess({ successType: 'end' }));

        // Fermer la modale
        onClose();
    }, [dispatch, onClose]);

    /**
     * Fonction pour gérer la soumission de la fin d'hospitalisation
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!currentHospitalization || !currentHospitalization._id) {
            toast.error('Hospitalisation introuvable ou ID manquant');
            console.error('Hospitalisation courante:', currentHospitalization);
            return;
        }

        try {
            // Dispatch de l'action pour terminer l'hospitalisation avec le bon ID
            const result = await dispatch(endHospitalisation(currentHospitalization._id)).unwrap();

            // Afficher un message de succès
            toast.success(result.message || 'Hospitalisation terminée avec succès');
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error) {
            // Gestion des erreurs avec message détaillé
            const errorMessage = error || 'Erreur lors de la fin de l\'hospitalisation';
            toast.error(errorMessage);
            console.error('Erreur fin hospitalisation:', error);
        } finally {
            setIsConfirming(false);
        }
    }, [dispatch, currentHospitalization, handleClose]);


    /**
     * Fonction pour empêcher la propagation des clics à l'intérieur de la modale
     */
    const handleModalClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    // Vérifications de sécurité
    if (!patient) {
        console.error('Données patient manquantes');
        return null;
    }

    // Affichage en cas d'hospitalisation non trouvée
    if (hospitalizationNotFound) {
        return (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-container end-hospitalization-modal" onClick={handleModalClick}>
                    <div className="modal-header">
                        <div className="modal-title-section">
                            <AlertCircle size={24} className="warning-icon" />
                            <h2>Hospitalisation introuvable</h2>
                        </div>
                        <button className="modal-close-btn" onClick={handleClose}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-content">
                        <div className="error-message">
                            <AlertCircle size={16} />
                            <span>
                                Aucune hospitalisation active n'a été trouvée pour ce patient.
                                Le patient n'est peut-être pas actuellement hospitalisé ou ses données ne sont pas accessibles.
                            </span>
                        </div>

                        {/* Informations du patient pour debug */}
                        <div className="patient-info-debug">
                            <p><strong>Patient :</strong> {patient.nom} {patient.prenom}</p>
                            <p><strong>ID recherché :</strong> {patientId}</p>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={handleClose}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage de chargement pendant la récupération des hospitalisations actives
    if (loading.getActiveByPatient) {
        return (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-container end-hospitalization-modal" onClick={handleModalClick}>
                    <div className="modal-header">
                        <div className="modal-title-section">
                            <AlertCircle size={24} className="info-icon" />
                            <h2>Chargement...</h2>
                        </div>
                        <button className="modal-close-btn" onClick={handleClose}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-content">
                        <div className="loading-section">
                            <span className="loading-spinner"></span>
                            <p>Recherche de l'hospitalisation active du patient...</p>
                            <p className="loading-details">Patient : {patient.nom} {patient.prenom}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Vérification finale de la présence de l'hospitalisation
    if (!currentHospitalization) {
        return (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-container end-hospitalization-modal" onClick={handleModalClick}>
                    <div className="modal-header">
                        <div className="modal-title-section">
                            <AlertCircle size={24} className="warning-icon" />
                            <h2>Erreur de données</h2>
                        </div>
                        <button className="modal-close-btn" onClick={handleClose}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-content">
                        <div className="error-message">
                            <AlertCircle size={16} />
                            <span>
                                Impossible de récupérer les données d'hospitalisation.
                                Veuillez réessayer ou contacter l'administrateur.
                            </span>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={handleClose}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container end-hospitalization-modal" onClick={handleModalClick}>
                {/* En-tête de la modale */}
                <div className="modal-header">
                    <div className="modal-title-section">
                        <AlertCircle size={24} className="warning-icon" />
                        <h2>Terminer l'hospitalisation</h2>
                    </div>
                    <button
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={loading.end || isConfirming}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenu de la modale */}
                <div className="modal-content">
                    {/* Informations du patient */}
                    <div className="patient-info-section">
                        <div className="patient-header">
                            <User size={20} />
                            <h3>Informations du patient</h3>
                        </div>
                        <div className="patient-details">
                            <p><strong>Nom complet :</strong> {patient.nom || 'N/A'} {patient.prenom || 'N/A'}</p>
                            <p><strong>Date de naissance :</strong> {patient.dateNaissance || 'Non renseigné'}</p>
                            <p><strong>Téléphone :</strong> {patient.telephone || 'Non renseigné'}</p>
                            <p><strong>ID Patient :</strong> {patientId}</p>
                        </div>
                    </div>

                    {/* Informations de l'hospitalisation active */}
                    <div className="hospitalization-info-section">
                        <div className="hospitalization-header">
                            <Calendar size={20} />
                            <h3>Détails de l'hospitalisation active</h3>
                        </div>
                        <div className="hospitalization-details">
                            <p><strong>ID de l'hospitalisation :</strong> {currentHospitalization._id}</p>
                            <p><strong>Statut actuel :</strong>
                                <span className="status-badge active">Hospitalisé</span>
                            </p>
                            <p><strong>Motif :</strong> {currentHospitalization.motif || 'Non renseigné'}</p>
                            <p><strong>Date de début :</strong> {currentHospitalization.datedebut}</p>
                            <p><strong>Durée actuelle :</strong>
                                {calculateHospitalizationDuration(currentHospitalization.datedebut)} jour(s)
                            </p>
                            <p><strong>Numéro de chambre :</strong> {currentHospitalization.numerochambre || 'Non renseigné'}</p>
                            <p><strong>Dernière mise à jour :</strong> {formatDate(currentHospitalization.updatedAt)}</p>
                        </div>
                    </div>

                    {/* Avertissement */}
                    <div className="warning-section">
                        <AlertCircle size={20} className="warning-icon" />
                        <div className="warning-text">
                            <p><strong>⚠️ Attention :</strong> Cette action va marquer définitivement la fin de l'hospitalisation du patient.</p>
                            <ul className="warning-list">
                                <li>Le statut médical du patient sera automatiquement mis à jour</li>
                                <li>La date de fin sera enregistrée avec l'heure actuelle</li>
                                <li>Cette action est <strong>irréversible</strong></li>
                                <li>Le patient ne sera plus considéré comme hospitalisé dans le système</li>
                            </ul>
                        </div>
                    </div>

                    {/* Formulaire de confirmation */}
                    <form onSubmit={handleSubmit} className="confirmation-form">
                        {/* Affichage des erreurs spécifiques */}
                        {errors.end && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                <span>Erreur lors de la fin d'hospitalisation : {errors.end}</span>
                            </div>
                        )}

                        {errors.getActiveByPatient && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                <span>Erreur lors de la récupération des données : {errors.getActiveByPatient}</span>
                            </div>
                        )}

                        {/* Messages de succès */}
                        {successMessages.end && (
                            <div className="success-message">
                                <span>✅ {successMessages.end}</span>
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleClose}
                                disabled={loading.end || isConfirming}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn-danger"
                            >
                                {loading.end || isConfirming ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Traitement en cours...
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={16} />
                                        Terminer l'hospitalisation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EndHospitalizationModal;
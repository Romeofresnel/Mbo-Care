import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Clock, User, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { endAppointment, selectAppointmentLoading, selectAppointmentErrors } from '../redux/AppoinementSlice';

/**
 * Composant modal pour mettre fin à un rendez-vous
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.appointment - L'objet rendez-vous à terminer
 * @param {Function} props.onClose - Fonction appelée pour fermer le modal
 * @param {Object} props.patient - Les informations du patient
 */
const EndAppointmentModal = ({ appointment, onClose, patient }) => {
    const dispatch = useDispatch();
    const loading = useSelector(selectAppointmentLoading);
    const errors = useSelector(selectAppointmentErrors);

    // État local pour gérer la confirmation et les notes
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Formate une date au format français
     * @param {string} dateString - La date à formater
     * @returns {string} Date formatée
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'Non renseigné';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date invalide';
            return date.toLocaleDateString("fr-FR", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
            return 'Date invalide';
        }
    };

    /**
     * Formate une heure au format français
     * @param {string} timeString - L'heure à formater
     * @returns {string} Heure formatée
     */
    const formatTime = (timeString) => {
        if (!timeString) return "Heure non définie";
        try {
            const time = new Date(`2000-01-01T${timeString}`);
            return time.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Erreur lors du formatage de l\'heure:', error);
            return 'Heure invalide';
        }
    };

    /**
     * Gère la soumission du formulaire pour terminer le rendez-vous
     */
    const handleEndAppointment = async () => {
        if (!confirmEnd) {
            alert('Veuillez confirmer que vous souhaitez terminer ce rendez-vous');
            return;
        }

        setIsSubmitting(true);

        try {
            // Dispatch de l'action pour terminer le rendez-vous
            const result = await dispatch(endAppointment(appointment._id));

            if (endAppointment.fulfilled.match(result)) {
                // Succès - fermer le modal après un court délai
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.log('Erreur lors de la finalisation du rendez-vous:', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Gère la fermeture du modal avec confirmation si nécessaire
     */
    const handleClose = () => {
        if (isSubmitting) {
            return; // Empêcher la fermeture pendant la soumission
        }

        if (confirmEnd || notes.trim()) {
            const confirmClose = window.confirm('Êtes-vous sûr de vouloir fermer sans terminer le rendez-vous ?');
            if (!confirmClose) return;
        }

        onClose();
    };

    // Déterminer l'état actuel du processus
    const isLoading = loading.end || isSubmitting;
    const hasError = errors.end;
    const canEnd = appointment.status !== 'terminer';

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className="modal-container">
                {/* En-tête du modal */}
                <div className="modal-header">
                    <div className="modal-title">
                        <Clock size={24} />
                        <h2>Terminer le rendez-vous</h2>
                    </div>
                    <button
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenu du modal */}
                <div className="modal-content">
                    {/* Informations du rendez-vous */}
                    <div className="appointment-info-section">
                        <h3>Informations du rendez-vous</h3>

                        <div className="info-grid">
                            <div className="info-item">
                                <User size={16} />
                                <div>
                                    <span>Patient</span>
                                    <strong>{patient?.nom} {patient?.prenom}</strong>
                                </div>
                            </div>

                            <div className="info-item">
                                <Calendar size={16} />
                                <div>
                                    <span>Date</span>
                                    <strong>{formatDate(appointment.appoinement_date)}</strong>
                                </div>
                            </div>

                            <div className="info-item">
                                <Clock size={16} />
                                <div>
                                    <span>Heure</span>
                                    <strong>{formatTime(appointment.appoinement_heure)}</strong>
                                </div>
                            </div>

                            <div className="info-item">
                                <FileText size={16} />
                                <div>
                                    <span>Motif</span>
                                    <strong>{appointment.label}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Statut actuel */}
                        <div className="current-status">
                            <span>Statut actuel:</span>
                            <span className={`status-badge status-${appointment.status}`}>
                                {appointment.status}
                            </span>
                        </div>
                    </div>

                    {/* Section pour terminer le rendez-vous */}
                    {canEnd ? (
                        <div className="end-appointment-section">
                            <h3>Finalisation du rendez-vous</h3>

                            {/* Notes optionnelles */}
                            <div className="notes-section">
                                <label htmlFor="appointment-notes">
                                    Notes de fin de consultation (optionnel)
                                </label>
                                <textarea
                                    id="appointment-notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ajoutez des notes sur cette consultation..."
                                    rows={4}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Confirmation */}
                            <div className="confirmation-section">
                                <label className="confirmation-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={confirmEnd}
                                        onChange={(e) => setConfirmEnd(e.target.checked)}
                                        disabled={isLoading}
                                    />
                                    <span>Je confirme que ce rendez-vous est terminé</span>
                                </label>
                            </div>

                            {/* Messages d'erreur */}
                            {hasError && (
                                <div className="error-message">
                                    <AlertCircle size={16} />
                                    <span>{hasError}</span>
                                </div>
                            )}

                            {/* Message de succès */}
                            {loading.end === false && !hasError && isSubmitting && (
                                <div className="success-message">
                                    <CheckCircle size={16} />
                                    <span>Rendez-vous terminé avec succès!</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="already-ended-section">
                            <CheckCircle size={48} />
                            <h3>Rendez-vous déjà terminé</h3>
                            <p>Ce rendez-vous a déjà été marqué comme terminé.</p>
                        </div>
                    )}
                </div>

                {/* Pied du modal */}
                <div className="modal-footer">
                    <button
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Annuler
                    </button>

                    {canEnd && (
                        <button
                            className="btn-primary"
                            onClick={handleEndAppointment}
                            disabled={!confirmEnd || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Finalisation...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    <span>Terminer le rendez-vous</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EndAppointmentModal;
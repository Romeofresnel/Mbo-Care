import React from 'react';
import { X, FileText, Activity, Calendar, MapPin, Clock, User, Stethoscope, Bed, AlertCircle } from 'lucide-react';

const DetailModal = ({ item, isOpen, onClose }) => {
    if (!isOpen || !item) return null;

    /**
     * Formatage de la date pour l'affichage
     */
    const formatDate = (dateString) => {
        if (!dateString || dateString === null || dateString === undefined) {
            return 'Date non définie';
        }

        const dateStr = typeof dateString === 'object' ? dateString.toString() : String(dateString);

        if (dateStr.trim() === '' || dateStr === 'null' || dateStr === 'undefined') {
            return 'Date non définie';
        }

        try {
            const date = new Date(dateStr);

            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }

            const currentYear = new Date().getFullYear();
            const dateYear = date.getFullYear();

            if (dateYear < 1900 || dateYear > currentYear + 10) {
                return 'Date incorrecte';
            }

            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Date invalide';
        }
    };

    /**
     * Formatage de l'heure
     */
    const formatTime = (dateString) => {
        if (!dateString) return 'Heure non définie';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Heure invalide';

            return date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Heure invalide';
        }
    };

    /**
     * Détermination de la couleur du statut
     */
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'en cours':
            case 'programmée':
                return '#2563eb';
            case 'terminée':
            case 'terminé':
                return '#16a34a';
            case 'annulée':
            case 'annulé':
                return '#dc2626';
            default:
                return '#6b7280';
        }
    };

    /**
     * Calcul de la durée entre deux dates
     */
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return null;

        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
            }

            return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } catch (error) {
            return null;
        }
    };

    const { originalData, type } = item;
    const isHospitalisation = type === 'hospitalisation';
    const IconComponent = isHospitalisation ? FileText : Activity;

    return (
        <div className="detail-modal-overlay" onClick={onClose}>
            <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* En-tête */}
                <div className="detail-modal-header">
                    <div className="detail-modal-header-left">
                        <IconComponent size={24} className="detail-modal-icon" />
                        <h2 className="detail-modal-title">
                            {isHospitalisation ? 'Détails de l\'hospitalisation' : 'Détails de l\'opération'}
                        </h2>
                    </div>
                    <button
                        className="detail-modal-close"
                        onClick={onClose}
                        aria-label="Fermer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Contenu principal */}
                <div className="detail-modal-content">
                    {/* Informations générales */}
                    <div className="detail-modal-section">
                        <h3 className="detail-modal-section-title">
                            <AlertCircle size={20} />
                            Informations générales
                        </h3>
                        <div className="detail-modal-info-grid">
                            <div className="detail-modal-info-item">
                                <label>Titre/Motif</label>
                                <span>{item.title}</span>
                            </div>
                            <div className="detail-modal-info-item">
                                <label>Type</label>
                                <span className="detail-modal-type" style={{ color: getStatusColor(item.status) }}>
                                    {type}
                                </span>
                            </div>
                            <div className="detail-modal-info-item">
                                <label>Statut</label>
                                <span
                                    className="detail-modal-status"
                                    style={{ color: getStatusColor(item.status) }}
                                >
                                    {item.status}
                                </span>
                            </div>
                            <div className="detail-modal-info-item full-width">
                                <label>Description</label>
                                <span>{item.description}</span>
                            </div>
                        </div>
                    </div>

                    {/* Informations temporelles */}
                    <div className="detail-modal-section">
                        <h3 className="detail-modal-section-title">
                            <Calendar size={20} />
                            Informations temporelles
                        </h3>
                        <div className="detail-modal-info-grid">
                            <div className="detail-modal-info-item">
                                <label>Date de {isHospitalisation ? 'début' : 'l\'opération'}</label>
                                <span>{formatDate(item.date)}</span>
                            </div>
                            <div className="detail-modal-info-item">
                                <label>Heure de {isHospitalisation ? 'début' : 'l\'opération'}</label>
                                <span>{formatTime(item.date)}</span>
                            </div>
                            {item.dateEnd && (
                                <>
                                    <div className="detail-modal-info-item">
                                        <label>Date de fin</label>
                                        <span>{formatDate(item.dateEnd)}</span>
                                    </div>
                                    <div className="detail-modal-info-item">
                                        <label>Heure de fin</label>
                                        <span>{formatTime(item.dateEnd)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Informations spécifiques selon le type */}
                    {isHospitalisation ? (
                        <div className="detail-modal-section">
                            <h3 className="detail-modal-section-title">
                                <Bed size={20} />
                                Informations d'hospitalisation
                            </h3>
                            <div className="detail-modal-info-grid">
                                {item.chambre && (
                                    <div className="detail-modal-info-item">
                                        <label>Numéro de chambre</label>
                                        <span>{item.chambre}</span>
                                    </div>
                                )}
                                {originalData.service && (
                                    <div className="detail-modal-info-item">
                                        <label>Service</label>
                                        <span>{originalData.service}</span>
                                    </div>
                                )}
                                {originalData.medecin && (
                                    <div className="detail-modal-info-item">
                                        <label>Médecin responsable</label>
                                        <span>{originalData.medecin}</span>
                                    </div>
                                )}
                                {originalData.diagnostic && (
                                    <div className="detail-modal-info-item full-width">
                                        <label>Diagnostic</label>
                                        <span>{originalData.diagnostic}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="detail-modal-section">
                            <h3 className="detail-modal-section-title">
                                <Stethoscope size={20} />
                                Informations d'opération
                            </h3>
                            <div className="detail-modal-info-grid">
                                {originalData.chirurgien && (
                                    <div className="detail-modal-info-item">
                                        <label>Chirurgien</label>
                                        <span>{originalData.chirurgien}</span>
                                    </div>
                                )}
                                {originalData.salleOperation && (
                                    <div className="detail-modal-info-item">
                                        <label>Salle d'opération</label>
                                        <span>{originalData.salleOperation}</span>
                                    </div>
                                )}
                                {originalData.anesthesie && (
                                    <div className="detail-modal-info-item">
                                        <label>Type d'anesthésie</label>
                                        <span>{originalData.anesthesie}</span>
                                    </div>
                                )}
                                {originalData.dureeEstimee && (
                                    <div className="detail-modal-info-item">
                                        <label>Durée estimée</label>
                                        <span>{originalData.dureeEstimee}</span>
                                    </div>
                                )}
                                {originalData.complications && (
                                    <div className="detail-modal-info-item full-width">
                                        <label>Complications</label>
                                        <span>{originalData.complications}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Informations supplémentaires */}
                    <div className="detail-modal-section">
                        <h3 className="detail-modal-section-title">
                            <Clock size={20} />
                            Informations système
                        </h3>
                        <div className="detail-modal-info-grid">
                            {originalData.createdAt && (
                                <div className="detail-modal-info-item">
                                    <label>Créé le</label>
                                    <span>{formatDate(originalData.createdAt)}</span>
                                </div>
                            )}
                            {originalData.updatedAt && (
                                <div className="detail-modal-info-item">
                                    <label>Modifié le</label>
                                    <span>{formatDate(originalData.updatedAt)}</span>
                                </div>
                            )}
                            {originalData.createdBy && (
                                <div className="detail-modal-info-item">
                                    <label>Créé par</label>
                                    <span>{originalData.createdBy}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pied de page */}
                <div className="detail-modal-footer">
                    <button
                        className="detail-modal-button detail-modal-button-secondary"
                        onClick={onClose}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
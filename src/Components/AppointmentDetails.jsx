import {
    Calendar,
    CalendarClock,
    Check,
    Clock,
    Edit,
    MapPin,
    Phone,
    Trash,
    User,
    X,
    Mail,
    FileText,
    CircleSlash2,
    AlertCircle
} from 'lucide-react'
import React, { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux';
import { selectPatientsList } from '../redux/PatientSlice';

export default function AppointmentDetails({ appointment, isVisible, onClose, onEdit, onDelete, onComplete, onCancel }) {
    const patients = useSelector(selectPatientsList);

    // Formatage de la date
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Non renseigné';

        try {
            const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const match = dateString.match(dateRegex);

            if (!match) return 'Format de date invalide';

            const [, day, month, year] = match;
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);

            if (isNaN(date.getTime())) return 'Date invalide';

            return date.toLocaleDateString("fr-FR", {
                weekday: 'long',
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
            return 'Date invalide';
        }
    }, []);

    // Trouver les informations du patient
    const patientInfo = useMemo(() => {
        if (!appointment || !patients) return null;
        return patients.find(patient => patient._id === appointment.PatientId);
    }, [appointment, patients]);

    // Fonction pour déterminer la classe CSS du statut
    const getStatusClass = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case 'confirme':
            case 'confirmé':
                return 'status-confirmed';
            case 'en attente':
            case 'attente':
                return 'status-pending';
            case 'termine':
            case 'terminé':
                return 'status-completed';
            case 'annule':
            case 'annulé':
                return 'status-cancelled';
            default:
                return 'status-default';
        }
    }, []);

    // Fonction pour obtenir l'icône du statut
    const getStatusIcon = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case 'confirme':
            case 'confirmé':
                return <Check size={16} />;
            case 'en attente':
            case 'attente':
                return <Clock size={16} />;
            case 'termine':
            case 'terminé':
                return <Check size={16} />;
            case 'annule':
            case 'annulé':
                return <CircleSlash2 size={16} />;
            default:
                return <AlertCircle size={16} />;
        }
    }, []);

    if (!isVisible || !appointment) return null;

    return (
        <div className="appointment-details-overlay">
            <div className="appointment-details-modal">
                {/* Header */}
                <div className="modal-header">
                    <div className="header-title">
                        <CalendarClock size={24} />
                        <h2>Détails du rendez-vous</h2>
                    </div>
                    <button className="close-btn" onClick={() => isVisible(false)}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="modal-content">
                    {/* Informations principales */}
                    <div className="appointment-main-info">
                        <div className="appointment-title">
                            <h3>{appointment.label}</h3>
                            <div className={`status-badge ${getStatusClass(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                <span>{appointment.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Date et heure */}
                    <div className="appointment-datetime">
                        <div className="datetime-item">
                            <Calendar size={20} />
                            <div>
                                <span className="label">Date</span>
                                <span className="value">{formatDate(appointment.appoinement_date)}</span>
                            </div>
                        </div>
                        <div className="datetime-item">
                            <Clock size={20} />
                            <div>
                                <span className="label">Heure</span>
                                <span className="value">{appointment.appoinement_heure}</span>
                            </div>
                        </div>
                    </div>

                    {/* Informations patient */}
                    {patientInfo && (
                        <div className="patient-info">
                            <div className="section-title">
                                <User size={20} />
                                <h4>Informations patient</h4>
                            </div>
                            <div className="patient-details">
                                <div className="patient-main">
                                    <div className="patient-avatar">
                                        <User size={32} />
                                    </div>
                                    <div className="patient-name">
                                        <h5>{patientInfo.nom} {patientInfo.prenom}</h5>
                                        <span className="patient-id">ID: {patientInfo._id}</span>
                                    </div>
                                </div>
                                <div className="patient-contact">
                                    {patientInfo.telephone && (
                                        <div className="contact-item">
                                            <Phone size={16} />
                                            <span>{patientInfo.telephone}</span>
                                        </div>
                                    )}
                                    {patientInfo.email && (
                                        <div className="contact-item">
                                            <Mail size={16} />
                                            <span>{patientInfo.email}</span>
                                        </div>
                                    )}
                                    {patientInfo.adresse && (
                                        <div className="contact-item">
                                            <MapPin size={16} />
                                            <span>{patientInfo.adresse}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <div className="actions-left">
                        <button className="btn-edit" onClick={() => onEdit && onEdit(appointment)}>
                            <Edit size={16} />
                            Modifier
                        </button>
                    </div>
                    <div className="actions-right">
                        {appointment.status !== 'terminé' && appointment.status !== 'termine' && (
                            <button className="btn-complete" onClick={() => onComplete && onComplete(appointment)}>
                                <Check size={16} />
                                Terminer
                            </button>
                        )}
                        {appointment.status !== 'annulé' && appointment.status !== 'annule' && (
                            <button className="btn-cancel" onClick={() => onCancel && onCancel(appointment)}>
                                <CircleSlash2 size={16} />
                                Annuler
                            </button>
                        )}
                        <button className="btn-delete" onClick={() => onDelete && onDelete(appointment)}>
                            <Trash size={16} />
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
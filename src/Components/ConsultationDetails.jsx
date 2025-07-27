import React from 'react';
import { X, Calendar, User, Stethoscope, FileText, Clock, MapPin, Phone, Mail } from 'lucide-react';

export default function ConsultationDetails({ consultation, patient, onClose }) {
    // Fonction pour formater la date de manière sécurisée
    const formatDate = (dateString) => {
        if (!dateString) return "Date non disponible";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Date invalide";
            }

            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
            return "Date invalide";
        }
    };

    // Fonction pour obtenir le nom du médecin
    const getMedecinName = (consultation) => {
        if (consultation?.medecin?.nom && consultation?.medecin?.prenom) {
            return `Dr ${consultation.medecin.prenom} ${consultation.medecin.nom}`;
        }
        if (consultation?.medecin?.nom) {
            return `Dr ${consultation.medecin.nom}`;
        }
        if (consultation?.medecin?.prenom) {
            return `Dr ${consultation.medecin.prenom}`;
        }
        if (consultation?.docteur) {
            return consultation.docteur;
        }
        return "Médecin non spécifié";
    };

    // Fonction pour obtenir le motif de la consultation
    const getConsultationMotif = (consultation) => {
        return consultation?.label ||
            consultation?.motif ||
            consultation?.diagnostic ||
            "Motif non spécifié";
    };

    // Fonction pour calculer l'âge
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch (error) {
            return null;
        }
    };

    return (
        <div className="consultation-details-overlay">
            <div className="consultation-details-container">
                {/* Header */}
                <div className="consultation-details-header">
                    <div className="header-title">
                        <Stethoscope size={24} />
                        <h2>Détails de la consultation</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="consultation-details-content">
                    {/* Patient Info Section */}
                    <div className="details-section">
                        <div className="section-header">
                            <User size={20} />
                            <h3>Informations du patient</h3>
                        </div>
                        <div className="section-content">
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Nom complet</label>
                                    <p>{patient ? `${patient.nom || ''} ${patient.prenom || ''}`.trim() : 'Non disponible'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Âge</label>
                                    <p>{patient?.age + ` ans`}</p>
                                </div>
                                <div className="info-item">
                                    <label>Sexe</label>
                                    <p>{patient?.sexe || 'Non spécifié'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Téléphone</label>
                                    <p>{patient?.telephone || 'Non disponible'}</p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Adresse</label>
                                    <p>{patient?.domicile || 'Non disponible'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consultation Info Section */}
                    <div className="details-section">
                        <div className="section-header">
                            <Calendar size={20} />
                            <h3>Informations de la consultation</h3>
                        </div>
                        <div className="section-content">
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Date et heure</label>
                                    <p>{formatDate(consultation?.dateConsultation || consultation?.createdAt)}</p>
                                </div>
                                <div className="info-item">
                                    <label>Médecin</label>
                                    <p>{getMedecinName(consultation)}</p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Motif de consultation</label>
                                    <p>{getConsultationMotif(consultation)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Details Section */}
                    <div className="details-section">
                        <div className="section-header">
                            <FileText size={20} />
                            <h3>Détails médicaux</h3>
                        </div>
                        <div className="section-content">
                            <div className="medical-details">
                                {consultation?.diagnostic && (
                                    <div className="medical-item">
                                        <label>Diagnostic</label>
                                        <p>{consultation.diagnostic}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer with creation date */}
                    <div className="consultation-footer">
                        <div className="footer-info">
                            <Clock size={16} />
                            <span>
                                Consultation créée le {formatDate(consultation?.createdAt)}
                                {consultation?.updatedAt && consultation.updatedAt !== consultation.createdAt &&
                                    ` • Modifiée le ${formatDate(consultation.updatedAt)}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
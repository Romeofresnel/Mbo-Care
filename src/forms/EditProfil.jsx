import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import {
    updateMedecin,
    selectUpdateMedecinStatus,
    selectUpdateMedecinError,
    selectUpdateMedecinSuccess,
    clearUpdateError,
    clearUpdateSuccess
} from '../redux/MedecinSlice';
import { medecinInfo } from '../redux/AuthSlice';

export default function EditProfil({ aff, medecin }) {
    const dispatch = useDispatch();
    const updateStatus = useSelector(selectUpdateMedecinStatus);
    const updateError = useSelector(selectUpdateMedecinError);
    const updateSuccess = useSelector(selectUpdateMedecinSuccess);

    // État local pour le formulaire
    const [formData, setFormData] = useState({
        nom: medecin?.nom || '',
        prenom: medecin?.prenom || '',
        email: medecin?.email || '',
        matricule: medecin?.matricule || '',
        service: medecin?.service || '',
        poste: medecin?.poste || '',
        ville: medecin?.ville || '',
        domicile: medecin?.domicile || '',
        dateNaissance: medecin?.dateNaissance || '',
        telephone: medecin?.telephone || ''
    });

    // État pour les erreurs de validation côté client
    const [validationErrors, setValidationErrors] = useState({});

    // Initialiser le formulaire avec les données du médecin
    useEffect(() => {
        if (medecin) {
            setFormData({
                nom: medecin.nom || '',
                prenom: medecin.prenom || '',
                email: medecin.email || '',
                matricule: medecin.matricule || '',
                service: medecin.service || '',
                poste: medecin.poste || '',
                ville: medecin.ville || '',
                domicile: medecin.domicile || '',
                dateNaissance: medecin.dateNaissance || '',
                telephone: medecin.telephone || ''
            });
        }
    }, [medecin]);

    // Gérer la fermeture automatique après succès
    useEffect(() => {
        if (updateSuccess) {
            const timer = setTimeout(() => {
                dispatch(clearUpdateSuccess());
                // Actualiser les données dans AuthSlice pour synchroniser avec Profil.jsx
                if (medecin?._id) {
                    dispatch(medecinInfo(medecin._id));
                }
                aff(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [updateSuccess, dispatch, aff, medecin]);

    // Nettoyer les erreurs au démontage
    useEffect(() => {
        return () => {
            dispatch(clearUpdateError());
            dispatch(clearUpdateSuccess());
        };
    }, [dispatch]);

    // Fonction de validation
    const validateForm = () => {
        const errors = {};

        // Validation des champs obligatoires
        if (!formData.nom.trim()) {
            errors.nom = 'Le nom est obligatoire';
        }

        if (!formData.prenom.trim()) {
            errors.prenom = 'Le prénom est obligatoire';
        }

        if (!formData.email.trim()) {
            errors.email = 'L\'email est obligatoire';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Format d\'email invalide';
        }

        if (!formData.matricule.trim()) {
            errors.matricule = 'Le matricule est obligatoire';
        }

        // Validation du téléphone si fourni
        if (formData.telephone && !/^[\d\s\-\+\(\)]{8,}$/.test(formData.telephone)) {
            errors.telephone = 'Format de téléphone invalide';
        }

        // Validation de la date de naissance si fournie
        if (formData.dateNaissance) {
            const date = new Date(formData.dateNaissance);
            const today = new Date();
            if (date > today) {
                errors.dateNaissance = 'La date de naissance ne peut pas être dans le futur';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Gérer les changements dans les champs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Nettoyer l'erreur de validation pour ce champ
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Gérer la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!medecin?._id) {
            console.error('ID du médecin manquant');
            return;
        }

        // Préparer les données pour la mise à jour (enlever les champs vides)
        const dataToUpdate = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] && formData[key].trim() !== '') {
                dataToUpdate[key] = formData[key].trim();
            }
        });

        // Lancer la mise à jour
        dispatch(updateMedecin({
            medecinId: medecin._id,
            medecinData: dataToUpdate
        }));
        aff(false)
    };

    // Gérer la fermeture du modal
    const handleClose = () => {
        dispatch(clearUpdateError());
        dispatch(clearUpdateSuccess());
        aff(false);
    };

    // Rendu du composant de champ avec gestion d'erreurs
    const renderField = (name, label, type = 'text', required = false) => (
        <div className="form-group">
            <label htmlFor={name}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                disabled={updateStatus === 'loading'}
                style={{
                    borderColor: validationErrors[name] ? 'red' : '',
                    backgroundColor: updateStatus === 'loading' ? '#f5f5f5' : ''
                }}
            />
            {validationErrors[name] && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                    {validationErrors[name]}
                </span>
            )}
        </div>
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Modifier le profil</h2>
                    <button
                        className="close-button"
                        onClick={handleClose}
                        disabled={updateStatus === 'loading'}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-sections">
                        {/* Section Informations personnelles */}
                        <div className="form-section">
                            <h3>Informations personnelles</h3>
                            {renderField('nom', 'Nom', 'text', true)}
                            {renderField('prenom', 'Prénom', 'text', true)}
                            {renderField('dateNaissance', 'Date de naissance', 'date')}
                            {renderField('telephone', 'Téléphone')}
                        </div>

                        {/* Section Informations professionnelles */}
                        <div className="form-section">
                            <h3>Informations professionnelles</h3>
                            {renderField('matricule', 'Matricule', 'text', true)}
                            {renderField('email', 'Email', 'email', true)}
                            {renderField('service', 'Service médical')}
                            {renderField('poste', 'Poste occupé')}
                        </div>

                        {/* Section Adresse */}
                        <div className="form-section">
                            <h3>Adresse</h3>
                            {renderField('ville', 'Ville de résidence')}
                            {renderField('domicile', 'Domicile')}
                        </div>
                    </div>

                    {/* Messages d'erreur et de succès */}
                    {updateError && (
                        <div className="message error-message">
                            <AlertCircle size={16} />
                            <span>{updateError}</span>
                        </div>
                    )}

                    {updateSuccess && (
                        <div className="message success-message">
                            <span>✓ {updateSuccess}</span>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={handleClose}
                            disabled={updateStatus === 'loading'}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="save-button"
                            disabled={updateStatus === 'loading'}
                        >
                            {updateStatus === 'loading' ? (
                                <>
                                    <Loader2 size={16} className="spinning" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          color: #666;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: #333;
        }

        .edit-form {
          padding: 20px;
        }

        .form-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 5px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .error-message {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .success-message {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .cancel-button {
          padding: 10px 20px;
          border: 1px solid #ddd;
          background: white;
          color: #666;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .cancel-button:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #bbb;
        }

        .save-button {
          padding: 10px 20px;
          border: none;
          background: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .save-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .save-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .form-sections {
            grid-template-columns: 1fr;
          }
          
          .modal-content {
            width: 95%;
            margin: 10px;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
}
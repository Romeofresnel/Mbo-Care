import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateCaisse,
    clearUpdateError,
    clearUpdateSuccess,
    selectUpdateCaisseError,
    selectUpdateCaisseSuccess,
    selectUpdateCaisseStatus
} from '../redux/CaisseSlice'; // Ajustez le chemin selon votre structure
import { Edit } from 'lucide-react';
import toast, { Toaster } from "react-hot-toast";

export default function EditFacture1({ aff, patient, factureData }) {
    // ==================== HOOKS REDUX ====================
    const dispatch = useDispatch();
    const updateError = useSelector(selectUpdateCaisseError);
    const updateSuccess = useSelector(selectUpdateCaisseSuccess);
    const updateStatus = useSelector(selectUpdateCaisseStatus);

    // ==================== ÉTAT LOCAL DU FORMULAIRE ====================
    const [formData, setFormData] = useState({
        libelle: '',
        type: '',
        montant: ''
    });

    // État pour gérer l'affichage des erreurs de validation côté client
    const [validationErrors, setValidationErrors] = useState({});

    // ==================== INITIALISATION DU FORMULAIRE ====================
    useEffect(() => {
        if (factureData) {
            setFormData({
                libelle: factureData.libelle || '',
                type: factureData.type || '',
                montant: factureData.montant ? factureData.montant.toString() : ''
            });
        }
    }, [factureData]);

    // ==================== FONCTION D'IMPRESSION ====================
    const handlePrintFacture = (updatedFactureData) => {
        try {
            // Créer le contenu HTML pour l'impression
            const printContent = `
                <html>
                    <head>
                        <title>Facture - ${updatedFactureData.libelle}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                            .patient-info { margin-bottom: 20px; }
                            .facture-details { margin-bottom: 20px; }
                            .amount { font-size: 18px; font-weight: bold; color: #333; }
                            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                            .updated-stamp { color: #ff6b35; font-weight: bold; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>FACTURE MÉDICALE</h1>
                            <p class="updated-stamp">FACTURE MODIFIÉE</p>
                            <p>Date de modification: ${new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                        
                        <div class="patient-info">
                            <h3>Informations Patient</h3>
                            <p><strong>Nom:</strong> ${patient?.nom || 'N/A'} ${patient?.prenom || 'N/A'}</p>
                            <p><strong>ID Patient:</strong> ${patient?._id || 'N/A'}</p>
                        </div>
                        
                        <div class="facture-details">
                            <h3>Détails de la Facture</h3>
                            <table>
                                <tr>
                                    <th>Libellé</th>
                                    <td>${updatedFactureData.libelle}</td>
                                </tr>
                                <tr>
                                    <th>Type</th>
                                    <td>${updatedFactureData.type}</td>
                                </tr>
                                <tr>
                                    <th>Montant</th>
                                    <td class="amount">${parseFloat(updatedFactureData.montant).toFixed(2)} €</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="footer">
                            <p>Facture modifiée automatiquement le ${new Date().toLocaleString('fr-FR')}</p>
                            <p>ID Facture: ${factureData._id}</p>
                        </div>
                    </body>
                </html>
            `;

            // Créer une nouvelle fenêtre pour l'impression
            const printWindow = window.open('', '_blank', 'width=800,height=600');

            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();

                // Attendre que le contenu soit chargé puis imprimer
                printWindow.onload = function () {
                    printWindow.print();

                    // Fermer la fenêtre d'impression après impression
                    printWindow.onafterprint = function () {
                        printWindow.close();
                    };
                };
            } else {
                // Fallback si la fenêtre popup est bloquée
                toast.error('Veuillez autoriser les fenêtres popup pour imprimer la facture');
            }
        } catch (error) {
            console.error('Erreur lors de l\'impression:', error);
            toast.error('Erreur lors de l\'impression de la facture');
        }
    };

    // ==================== GESTION DES CHANGEMENTS DE FORMULAIRE ====================
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Mettre à jour les données du formulaire
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Nettoyer l'erreur de validation pour ce champ spécifique
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // ==================== VALIDATION CÔTÉ CLIENT ====================
    const validateForm = () => {
        const errors = {};

        // Validation du libellé
        if (!formData.libelle.trim()) {
            errors.libelle = 'Le libellé est obligatoire';
        } else if (formData.libelle.trim().length < 2) {
            errors.libelle = 'Le libellé doit contenir au moins 2 caractères';
        }

        // Validation du type
        if (!formData.type) {
            errors.type = 'Le type de facture est obligatoire';
        }

        // Validation du montant
        if (!formData.montant) {
            errors.montant = 'Le montant est obligatoire';
        } else if (isNaN(parseFloat(formData.montant)) || parseFloat(formData.montant) <= 0) {
            errors.montant = 'Le montant doit être un nombre positif';
        }

        // Validation de la présence du patient
        if (!patient || !patient._id) {
            errors.patient = 'Aucun patient sélectionné';
        }

        // Validation de la présence des données de facture
        if (!factureData || !factureData._id) {
            errors.facture = 'Aucune facture sélectionnée pour modification';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ==================== VÉRIFICATION DES CHANGEMENTS ====================
    const hasChanges = () => {
        if (!factureData) return false;

        return (
            formData.libelle.trim() !== (factureData.libelle || '') ||
            formData.type !== (factureData.type || '') ||
            parseFloat(formData.montant) !== (factureData.montant || 0)
        );
    };

    // ==================== SOUMISSION DU FORMULAIRE ====================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Valider le formulaire avant soumission
        if (!validateForm()) {
            return;
        }

        // Vérifier s'il y a des changements
        if (!hasChanges()) {
            toast.info('Aucune modification détectée');
            return;
        }

        // Préparer les données pour la modification
        const updatedCaisseData = {
            libelle: formData.libelle.trim(),
            type: formData.type,
            montant: parseFloat(formData.montant)
        };

        try {
            // Modifier la facture
            const result = await dispatch(updateCaisse({
                caisseId: factureData._id,
                caisseData: updatedCaisseData
            })).unwrap();

            // Afficher un toast de succès
            toast.success('Facture modifiée avec succès !');

            // Préparer les données complètes pour l'impression
            const completeFactureData = {
                ...updatedCaisseData,
                _id: factureData._id
            };

            // Lancer l'impression immédiatement
            handlePrintFacture(completeFactureData);

            // Fermer le formulaire après 100ms
            setTimeout(() => {
                handleCancel();
            }, 100);

        } catch (error) {
            // Afficher un toast d'erreur
            toast.error(error.message || 'Erreur lors de la modification de la facture');
            console.error('Erreur lors de la modification de la facture:', error);
        }
    };

    // ==================== GESTION DE L'ANNULATION ====================
    const handleCancel = () => {
        // Nettoyer les erreurs et succès avant fermeture
        dispatch(clearUpdateError());
        dispatch(clearUpdateSuccess());

        // Réinitialiser le formulaire avec les données originales
        if (factureData) {
            setFormData({
                libelle: factureData.libelle || '',
                type: factureData.type || '',
                montant: factureData.montant ? factureData.montant.toString() : ''
            });
        }
        setValidationErrors({});

        // Fermer le modal/composant
        aff(false);
    };

    // ==================== EFFETS ====================
    useEffect(() => {
        // Nettoyer les erreurs et succès au montage du composant
        return () => {
            dispatch(clearUpdateError());
            dispatch(clearUpdateSuccess());
        };
    }, [dispatch]);

    // ==================== GÉRER LES CHANGEMENTS D'ÉTAT REDUX ====================
    useEffect(() => {
        // Gérer les erreurs venant du Redux
        if (updateError) {
            toast.error(updateError);
            dispatch(clearUpdateError());
        }
    }, [updateError, dispatch]);

    useEffect(() => {
        // Gérer les succès venant du Redux
        if (updateSuccess) {
            toast.success(updateSuccess);
            dispatch(clearUpdateSuccess());
        }
    }, [updateSuccess, dispatch]);

    // ==================== FONCTION D'AFFICHAGE DES ERREURS ====================
    const renderFieldError = (fieldName) => {
        const error = validationErrors[fieldName];
        if (error) {
            return (
                <div
                    className="error-message"
                    style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}
                >
                    {error}
                </div>
            );
        }
        return null;
    };

    // ==================== RENDU DU COMPOSANT ====================
    return (
        <div className="containers-params">
            <div className="container-form">
                <section>
                    <Edit size={30} />
                    <span>Modifier Facture</span>
                </section>
                <form onSubmit={handleSubmit}>
                    {/* Champ Libellé */}
                    <div className='params'>
                        <label htmlFor="libelle">Libellé : </label>
                        <input
                            type="text"
                            id="libelle"
                            name="libelle"
                            value={formData.libelle}
                            onChange={handleInputChange}
                            placeholder="Entrez le libellé de la facture"
                            disabled={updateStatus === 'loading'}
                        />
                        {renderFieldError('libelle')}
                    </div>

                    {/* Champ Type de facture */}
                    <div className='params'>
                        <label htmlFor="type">Type facture : </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            disabled={updateStatus === 'loading'}
                        >
                            <option value="">-- Sélectionnez un type --</option>
                            <option value="frais d'hospitalisation">Frais d'hospitalisation</option>
                            <option value="frais d'operation">Frais d'opération</option>
                            <option value="frais de consultation">Frais de consultation</option>
                        </select>
                        {renderFieldError('type')}
                    </div>

                    {/* Champ Montant */}
                    <div className='params'>
                        <label htmlFor="montant">Montant : </label>
                        <input
                            type="number"
                            id="montant"
                            name="montant"
                            value={formData.montant}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            disabled={updateStatus === 'loading'}
                        />
                        {renderFieldError('montant')}
                    </div>

                    {/* Affichage des erreurs patient et facture si elles existent */}
                    {renderFieldError('patient')}
                    {renderFieldError('facture')}

                    {/* Informations sur les changements */}
                    {!hasChanges() && formData.libelle && formData.type && formData.montant && (
                        <div style={{
                            color: '#666',
                            fontSize: '14px',
                            marginBottom: '10px',
                            fontStyle: 'italic'
                        }}>
                            Aucune modification détectée
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="btns">
                        <button
                            type="button"
                            className='btn'
                            onClick={handleCancel}
                            disabled={updateStatus === 'loading'}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
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
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#4caf50',
                            color: 'white',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#ff4444',
                            color: 'white',
                        },
                    },
                    info: {
                        duration: 3000,
                        style: {
                            background: '#2196f3',
                            color: 'white',
                        },
                    },
                }}
            />
        </div>
    );
}
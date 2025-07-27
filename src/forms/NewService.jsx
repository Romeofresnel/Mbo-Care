import { Hospital } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    addService,
    clearAddError,
    clearAddSuccess,
    selectAddServiceError,
    selectAddServiceSuccess,
    selectAddServiceStatus,
    selectIsServiceLoading
} from '../redux/ServiceSlice' // Ajustez le chemin selon votre structure
import toast, { Toaster } from "react-hot-toast";

export default function NewService({ onClose }) {
    // ==================== HOOKS REDUX ====================
    const dispatch = useDispatch()

    // Sélecteurs pour obtenir l'état du store
    const addError = useSelector(selectAddServiceError)
    const addSuccess = useSelector(selectAddServiceSuccess)
    const addStatus = useSelector(selectAddServiceStatus)
    const isLoading = useSelector(selectIsServiceLoading)

    // ==================== ÉTAT LOCAL ====================
    const [formData, setFormData] = useState({
        nom: '',
        description: ''
    })

    // État pour la validation côté client
    const [validationErrors, setValidationErrors] = useState({})

    // État pour savoir si le formulaire a été soumis
    const [isSubmitted, setIsSubmitted] = useState(false)

    // ==================== EFFECTS ====================

    // Nettoyer les erreurs et succès au montage du composant
    useEffect(() => {
        dispatch(clearAddError())
        dispatch(clearAddSuccess())
    }, [dispatch])

    // Gérer la fermeture automatique en cas de succès
    useEffect(() => {
        if (addSuccess && isSubmitted) {
            // Attendre un peu pour que l'utilisateur puisse voir le message de succès
            const timer = setTimeout(() => {
                onClose()
            }, 1500)

            return () => clearTimeout(timer)
        }
    }, [addSuccess, isSubmitted, onClose])

    // ==================== FONCTIONS DE VALIDATION ====================

    /**
     * Valide un champ spécifique
     * @param {string} field - Le nom du champ à valider
     * @param {string} value - La valeur du champ
     * @returns {string|null} - Message d'erreur ou null si valide
     */
    const validateField = (field, value) => {
        switch (field) {
            case 'nom':
                if (!value.trim()) {
                    return 'Le nom du service est obligatoire'
                }
                if (value.trim().length < 2) {
                    return 'Le nom doit contenir au moins 2 caractères'
                }
                if (value.trim().length > 100) {
                    return 'Le nom ne peut pas dépasser 100 caractères'
                }
                return null

            case 'description':
                if (!value.trim()) {
                    return 'La description est obligatoire'
                }
                if (value.trim().length < 10) {
                    return 'La description doit contenir au moins 10 caractères'
                }
                if (value.trim().length > 500) {
                    return 'La description ne peut pas dépasser 500 caractères'
                }
                return null

            default:
                return null
        }
    }

    /**
     * Valide tout le formulaire
     * @returns {Object} - Objet contenant les erreurs de validation
     */
    const validateForm = () => {
        const errors = {}

        // Valider chaque champ
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field])
            if (error) {
                errors[field] = error
            }
        })

        return errors
    }

    // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================

    /**
     * Gère les changements dans les champs du formulaire
     * @param {Event} e - L'événement de changement
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Mettre à jour les données du formulaire
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Nettoyer l'erreur de validation pour ce champ si elle existe
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }

        // Nettoyer l'erreur Redux si elle existe
        if (addError) {
            dispatch(clearAddError())
        }
    }

    /**
     * Gère la soumission du formulaire
     * @param {Event} e - L'événement de soumission
     */
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Marquer le formulaire comme soumis
        setIsSubmitted(true)

        // Valider le formulaire
        const errors = validateForm()

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        // Nettoyer les erreurs de validation
        setValidationErrors({})

        // Préparer les données à envoyer (nettoyer les espaces)
        const dataToSend = {
            nom: formData.nom.trim(),
            description: formData.description.trim()
        }

        // Envoyer les données via Redux
        try {
            await dispatch(addService(dataToSend)).unwrap()
            // Le succès est géré par l'useEffect
        } catch (error) {
            // L'erreur est gérée automatiquement par Redux
            console.error('Erreur lors de l\'ajout du service:', error)
        }
    }

    /**
     * Gère l'annulation du formulaire
     * @param {Event} e - L'événement de clic
     */
    const handleCancel = (e) => {
        e.preventDefault()

        // Nettoyer les états avant de fermer
        dispatch(clearAddError())
        dispatch(clearAddSuccess())
        setValidationErrors({})
        setFormData({ nom: '', description: '' })
        setIsSubmitted(false)

        // Fermer le modal
        onClose()
    }

    // ==================== RENDU ====================

    return (
        <>
            <div className='containers-form-patients'>
                <form onSubmit={handleSubmit} className='forms'>
                    {/* En-tête du formulaire */}
                    <p>
                        <Hospital />
                        <span>Ajouter un service médical</span>
                    </p>

                    {/* Affichage des messages d'erreur globaux */}
                    {addError && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                            {addError}
                        </div>
                    )}

                    {/* Affichage des messages de succès */}
                    {addSuccess && (
                        <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>
                            {addSuccess}
                        </div>
                    )}

                    <div className='container-input'>
                        {/* Champ nom du service */}
                        <div className='info'>
                            <label htmlFor="nom">Nom du service *</label>
                            <input
                                type="text"
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Ex: Cardiologie, Pédiatrie..."
                                maxLength={100}
                                autoComplete="off"
                            />
                            {/* Affichage de l'erreur de validation pour le nom */}
                            {validationErrors.nom && (
                                <span className="field-error" style={{ color: 'red', fontSize: '0.8rem' }}>
                                    {validationErrors.nom}
                                </span>
                            )}
                        </div>

                        {/* Champ description du service */}
                        <div className='info'>
                            <label htmlFor="description">Description du service *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Décrivez les activités et spécialités de ce service..."
                                maxLength={500}
                                cols="30"
                                rows="10"
                            />
                            {/* Affichage de l'erreur de validation pour la description */}
                            {validationErrors.description && (
                                <span className="field-error" style={{ color: 'red', fontSize: '0.8rem' }}>
                                    {validationErrors.description}
                                </span>
                            )}
                            {/* Compteur de caractères */}
                            <span className="char-counter" style={{ fontSize: '0.7rem', color: '#666' }}>
                                {formData.description.length}/500 caractères
                            </span>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className='btn'>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className='cancel'
                            disabled={isLoading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Ajout en cours...' : 'Ajouter'}
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
    )
}
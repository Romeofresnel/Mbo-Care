import { BedSingle } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    getAllServices,
    selectServicesList,
    selectIsServiceLoading,
    selectGetAllServicesError
} from '../redux/ServiceSlice' // Ajustez le chemin selon votre structure
import toast, { Toaster } from "react-hot-toast";

// Imports manquants pour les actions et sélecteurs de chambres
import {
    addChambre,
    clearAddError,
    clearAddSuccess,
    selectAddChambreError,
    selectAddChambreSuccess,
    selectAddChambreStatus,
    selectIsChambreNumberExists
} from '../redux/ChambreSlice' // Ajustez le chemin selon votre structure

export default function NewChambre({ onClose }) {
    // ==================== ÉTAT LOCAL ====================
    const [formData, setFormData] = useState({
        numeroChambre: '',
        serviceId: ''
    })
    const [formErrors, setFormErrors] = useState({})

    // ==================== HOOKS REDUX ====================
    const dispatch = useDispatch()

    // Sélecteurs pour les services
    const servicesList = useSelector(selectServicesList)
    const isServicesLoading = useSelector(selectIsServiceLoading)
    const servicesError = useSelector(selectGetAllServicesError)

    // Sélecteurs pour l'ajout de chambres
    const addChambreError = useSelector(selectAddChambreError)
    const addChambreSuccess = useSelector(selectAddChambreSuccess)
    const addChambreStatus = useSelector(selectAddChambreStatus)
    const isChambreNumberExists = useSelector(selectIsChambreNumberExists(formData.numeroChambre))

    // ==================== EFFETS ====================
    /**
     * Récupère la liste des services au montage du composant
     */
    useEffect(() => {
        dispatch(getAllServices())
    }, [dispatch])

    /**
     * Nettoie les erreurs et messages de succès au montage
     */
    useEffect(() => {
        dispatch(clearAddError())
        dispatch(clearAddSuccess())
    }, [dispatch])

    /**
     * Gère le succès de l'ajout de chambre avec toast
     */
    useEffect(() => {
        if (addChambreSuccess) {
            // Afficher le toast de succès
            toast.success('Chambre ajoutée avec succès !');

            // Réinitialiser le formulaire
            setFormData({
                numeroChambre: '',
                serviceId: ''
            })
            setFormErrors({})

            // Fermer le formulaire après un délai pour que l'utilisateur voie le message
            setTimeout(() => {
                dispatch(clearAddSuccess())
                onClose()
            }, 1500)
        }
    }, [addChambreSuccess, dispatch, onClose])

    /**
     * Gère les erreurs d'ajout de chambre avec toast
     */
    useEffect(() => {
        if (addChambreError) {
            // Afficher le toast d'erreur
            toast.error(addChambreError);

            // Nettoyer l'erreur après affichage
            setTimeout(() => {
                dispatch(clearAddError())
            }, 100)
        }
    }, [addChambreError, dispatch])

    /**
     * Gère les erreurs de chargement des services avec toast
     */
    useEffect(() => {
        if (servicesError) {
            toast.error('Erreur lors du chargement des services');
        }
    }, [servicesError])

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

        // Nettoyer l'erreur du champ modifié
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    /**
     * Valide les données du formulaire
     * @returns {Object} - Objet contenant les erreurs de validation
     */
    const validateForm = () => {
        const errors = {}

        // Validation du numéro de chambre
        if (!formData.numeroChambre) {
            errors.numeroChambre = 'Le numéro de chambre est obligatoire'
        } else if (formData.numeroChambre.trim() === '') {
            errors.numeroChambre = 'Le numéro de chambre ne peut pas être vide'
        } else if (isChambreNumberExists) {
            errors.numeroChambre = 'Ce numéro de chambre existe déjà'
        }

        // Validation du service
        if (!formData.serviceId) {
            errors.serviceId = 'Veuillez sélectionner un service'
        }

        return errors
    }

    /**
     * Gère la soumission du formulaire
     * @param {Event} e - L'événement de soumission
     */
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation du formulaire
        const errors = validateForm()

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)

            // Afficher les erreurs de validation avec toast
            Object.values(errors).forEach(error => {
                toast.error(error);
            });

            return
        }

        try {
            // Préparer les données pour l'envoi (conformément aux attentes du backend)
            const chambreData = {
                numerochambre: formData.numeroChambre.trim(), // Nom de propriété attendu par le backend
                serviceId: formData.serviceId
            }

            // Dispatch de l'action d'ajout de chambre avec unwrap pour gérer les erreurs
            await dispatch(addChambre(chambreData)).unwrap()

            // Le succès est géré dans useEffect
        } catch (error) {
            // L'erreur est gérée dans useEffect
            console.error('Erreur lors de l\'ajout de la chambre:', error)
        }
    }

    /**
     * Gère l'annulation du formulaire
     * @param {Event} e - L'événement de clic
     */
    const handleCancel = (e) => {
        e.preventDefault()

        // Nettoyer les erreurs et messages avant de fermer
        dispatch(clearAddError())
        dispatch(clearAddSuccess())
        setFormErrors({})

        onClose()
    }

    // ==================== VARIABLES DÉRIVÉES ====================
    const isSubmitting = addChambreStatus === 'loading'
    const isFormDisabled = isSubmitting || isServicesLoading

    // ==================== COMPOSANTS UTILITAIRES ====================
    /**
     * Affiche un message de chargement pour les services
     */
    const LoadingServices = () => (
        <option value="" disabled>
            Chargement des services...
        </option>
    )

    /**
     * Affiche un message d'erreur pour les services
     */
    const ErrorServices = () => (
        <option value="" disabled>
            Erreur lors du chargement des services
        </option>
    )

    // ==================== RENDU ====================
    return (
        <>
            <div className='containers-form-patients'>
                <form onSubmit={handleSubmit} className='forms'>
                    {/* En-tête du formulaire */}
                    <p>
                        <BedSingle />
                        <span>Ajouter une chambre</span>
                    </p>

                    <div className='container-input'>
                        <section>
                            {/* Champ numéro de chambre */}
                            <div className='info'>
                                <label htmlFor="numeroChambre">
                                    Numéro de la chambre
                                </label>
                                <input
                                    type="text"
                                    id="numeroChambre"
                                    name="numeroChambre"
                                    value={formData.numeroChambre}
                                    onChange={handleInputChange}
                                    placeholder="Ex: 101, A12, B-205"
                                    disabled={isFormDisabled}
                                />
                                {/* Affichage de l'erreur pour le numéro de chambre */}
                                {formErrors.numeroChambre && (
                                    <span className="error-message">
                                        {formErrors.numeroChambre}
                                    </span>
                                )}
                            </div>

                            {/* Champ service d'appartenance */}
                            <div className='info'>
                                <label htmlFor="serviceId">
                                    Service d'appartenance
                                </label>
                                <select
                                    name="serviceId"
                                    id="serviceId"
                                    value={formData.serviceId}
                                    onChange={handleInputChange}
                                    disabled={isFormDisabled}
                                >
                                    <option value="">
                                        Choisir le service
                                    </option>

                                    {/* Gestion des différents états des services */}
                                    {isServicesLoading ? (
                                        <LoadingServices />
                                    ) : servicesError ? (
                                        <ErrorServices />
                                    ) : (
                                        servicesList.map((service) => (
                                            <option
                                                key={service._id}
                                                value={service._id}
                                            >
                                                {service.nom}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {/* Affichage de l'erreur pour le service */}
                                {formErrors.serviceId && (
                                    <span className="error-message">
                                        {formErrors.serviceId}
                                    </span>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Boutons d'action */}
                    <div className='btn'>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className='cancel'
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isFormDisabled}
                        >
                            {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
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
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";

// ==================== ACTIONS ASYNCHRONES ====================

// Action pour récupérer tous les services enregistrés
export const getAllServices = createAsyncThunk(
    'service/getAllServices',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/service/all');
            // Vérifier que la réponse contient bien des données
            return response.data?.data || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la liste des services'
            );
        }
    }
);

// Action pour récupérer un service par son ID
export const getServiceById = createAsyncThunk(
    'service/getServiceById',
    async (serviceId, { rejectWithValue }) => {
        try {
            if (!serviceId) {
                return rejectWithValue('ID du service manquant');
            }

            const response = await Axios.get(`/service/${serviceId}`);
            return response.data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération du service'
            );
        }
    }
);

// Action pour ajouter un nouveau service
export const addService = createAsyncThunk(
    'service/addService',
    async (serviceData, { rejectWithValue }) => {
        try {
            // Validation côté client avant envoi
            if (!serviceData.nom || !serviceData.description) {
                return rejectWithValue('Le nom et la description sont obligatoires');
            }

            // Validation supplémentaire pour la longueur des champs
            if (serviceData.nom.trim().length < 2) {
                return rejectWithValue('Le nom du service doit contenir au moins 2 caractères');
            }

            if (serviceData.description.trim().length < 10) {
                return rejectWithValue('La description doit contenir au moins 10 caractères');
            }

            const response = await Axios.post('/service/new', serviceData);
            return response.data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout du service'
            );
        }
    }
);

// Action pour modifier un service existant
export const updateService = createAsyncThunk(
    'service/updateService',
    async ({ serviceId, serviceData }, { rejectWithValue }) => {
        try {
            if (!serviceId) {
                return rejectWithValue('ID du service manquant');
            }

            // Validation côté client des données de modification
            if (serviceData.nom && serviceData.nom.trim().length < 2) {
                return rejectWithValue('Le nom du service doit contenir au moins 2 caractères');
            }

            if (serviceData.description && serviceData.description.trim().length < 10) {
                return rejectWithValue('La description doit contenir au moins 10 caractères');
            }

            const response = await Axios.put(`/service/${serviceId}`, serviceData);
            return response.data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification du service'
            );
        }
    }
);

// Action pour supprimer un service
export const deleteService = createAsyncThunk(
    'service/deleteService',
    async (serviceId, { rejectWithValue }) => {
        try {
            if (!serviceId) {
                return rejectWithValue('ID du service manquant');
            }

            const response = await Axios.delete(`/service/${serviceId}`);
            return { serviceId, message: response.data?.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression du service'
            );
        }
    }
);

// ==================== SLICE PRINCIPAL ====================

const serviceSlice = createSlice({
    name: "service",
    initialState: {
        // Informations d'un service spécifique
        currentService: null,
        // Liste de tous les services - Initialisation avec un tableau vide pour éviter undefined
        servicesList: [],
        // Service unique récupéré par ID
        serviceOneList: null,
        // Gestion des erreurs séparées par action
        errors: {
            get: null,
            add: null,
            update: null,
            delete: null,
            getAll: null,
            getById: null
        },
        // Messages de succès pour les feedbacks utilisateur
        successMessages: {
            add: null,
            update: null,
            delete: null
        },
        // État de chargement global
        status: "idle"
    },
    reducers: {
        // Nettoyer toutes les erreurs
        clearErrors: (state) => {
            state.errors = {
                get: null,
                add: null,
                update: null,
                delete: null,
                getAll: null,
                getById: null
            };
        },
        // Nettoyer tous les messages de succès
        clearSuccessMessages: (state) => {
            state.successMessages = {
                add: null,
                update: null,
                delete: null
            };
        },
        // Définir le service actuel
        setCurrentService: (state, action) => {
            state.currentService = action.payload;
        },
        // Réinitialiser le statut de chargement
        resetStatus: (state) => {
            state.status = "idle";
        },
        // Vider la liste des services
        clearServicesList: (state) => {
            state.servicesList = [];
        },
        // Supprimer un service de la liste (pour la suppression optimiste)
        removeServiceFromList: (state, action) => {
            state.servicesList = state.servicesList.filter(
                service => service._id !== action.payload
            );
        },
        // Nettoyer spécifiquement l'erreur d'ajout
        clearAddError: (state) => {
            state.errors.add = null;
        },
        // Nettoyer spécifiquement le message de succès d'ajout
        clearAddSuccess: (state) => {
            state.successMessages.add = null;
        },
        // Nettoyer spécifiquement l'erreur de modification
        clearUpdateError: (state) => {
            state.errors.update = null;
        },
        // Nettoyer spécifiquement le message de succès de modification
        clearUpdateSuccess: (state) => {
            state.successMessages.update = null;
        },
        // Nettoyer spécifiquement l'erreur de suppression
        clearDeleteError: (state) => {
            state.errors.delete = null;
        },
        // Nettoyer spécifiquement le message de succès de suppression
        clearDeleteSuccess: (state) => {
            state.successMessages.delete = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ==================== RÉCUPÉRATION DE LA LISTE DES SERVICES ====================
            .addCase(getAllServices.pending, (state) => {
                state.status = 'loading';
                state.errors.getAll = null;
            })
            .addCase(getAllServices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // S'assurer que servicesList est toujours un tableau
                state.servicesList = Array.isArray(action.payload) ? action.payload : [];
                state.errors.getAll = null;
            })
            .addCase(getAllServices.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getAll = action.payload;
                // Garder la liste existante en cas d'erreur
                state.servicesList = state.servicesList || [];
            })
            // ==================== RÉCUPÉRATION D'UN SERVICE PAR ID ====================
            .addCase(getServiceById.pending, (state) => {
                state.status = 'loading';
                state.errors.getById = null;
            })
            .addCase(getServiceById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.serviceOneList = action.payload;
                state.currentService = action.payload;
                state.errors.getById = null;
            })
            .addCase(getServiceById.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getById = action.payload;
                state.serviceOneList = null;
            })
            // ==================== AJOUT D'UN NOUVEAU SERVICE ====================
            .addCase(addService.pending, (state) => {
                state.status = 'loading';
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addService.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = 'Service ajouté avec succès';

                // Ajouter le nouveau service à la liste seulement s'il existe
                if (action.payload && action.payload._id) {
                    const newService = action.payload;

                    // Vérifier que le service n'existe pas déjà dans la liste
                    const existingService = state.servicesList.find(
                        service => service._id === newService._id
                    );

                    if (!existingService) {
                        state.servicesList.push(newService);
                    }
                }
            })
            .addCase(addService.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })
            // ==================== MODIFICATION D'UN SERVICE EXISTANT ====================
            .addCase(updateService.pending, (state) => {
                state.status = 'loading';
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updateService.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = 'Service modifié avec succès';

                // Mettre à jour le service dans la liste
                const updatedService = action.payload;
                if (updatedService && updatedService._id) {
                    const index = state.servicesList.findIndex(
                        service => service._id === updatedService._id
                    );

                    if (index !== -1) {
                        state.servicesList[index] = updatedService;
                    }

                    // Mettre à jour le service actuel s'il correspond
                    if (state.currentService && state.currentService._id === updatedService._id) {
                        state.currentService = updatedService;
                    }

                    // Mettre à jour serviceOneList s'il correspond
                    if (state.serviceOneList && state.serviceOneList._id === updatedService._id) {
                        state.serviceOneList = updatedService;
                    }
                }
            })
            .addCase(updateService.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.update = action.payload;
                state.successMessages.update = null;
            })
            // ==================== SUPPRESSION D'UN SERVICE ====================
            .addCase(deleteService.pending, (state) => {
                state.status = 'loading';
                state.errors.delete = null;
                state.successMessages.delete = null;
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.delete = null;
                state.successMessages.delete = 'Service supprimé avec succès';

                // Supprimer le service de la liste
                const { serviceId } = action.payload;
                if (serviceId) {
                    state.servicesList = state.servicesList.filter(
                        service => service._id !== serviceId
                    );

                    // Nettoyer les références au service supprimé
                    if (state.currentService && state.currentService._id === serviceId) {
                        state.currentService = null;
                    }

                    if (state.serviceOneList && state.serviceOneList._id === serviceId) {
                        state.serviceOneList = null;
                    }
                }
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.delete = action.payload;
                state.successMessages.delete = null;
            });
    }
});

// ==================== EXPORT DES ACTIONS ====================
export const {
    clearErrors,
    clearSuccessMessages,
    setCurrentService,
    resetStatus,
    clearServicesList,
    removeServiceFromList,
    clearAddError,
    clearAddSuccess,
    clearUpdateError,
    clearUpdateSuccess,
    clearDeleteError,
    clearDeleteSuccess
} = serviceSlice.actions;

// ==================== SÉLECTEURS AVEC VALEURS PAR DÉFAUT ====================

// Sélecteurs principaux
export const selectServicesList = (state) => state.service?.servicesList || [];
export const selectCurrentService = (state) => state.service?.currentService || null;
export const selectServiceOneList = (state) => state.service?.serviceOneList || null;
export const selectServiceStatus = (state) => state.service?.status || 'idle';
export const selectServiceErrors = (state) => state.service?.errors || {};
export const selectServiceSuccessMessages = (state) => state.service?.successMessages || {};

// Sélecteurs spécialisés pour les erreurs et succès d'ajout
export const selectAddServiceError = (state) => state.service?.errors?.add || null;
export const selectAddServiceSuccess = (state) => state.service?.successMessages?.add || null;
export const selectAddServiceStatus = (state) => {
    const status = state.service?.status;
    const hasAddError = state.service?.errors?.add;
    const hasAddSuccess = state.service?.successMessages?.add;

    if (hasAddError) return 'error';
    if (hasAddSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de modification
export const selectUpdateServiceError = (state) => state.service?.errors?.update || null;
export const selectUpdateServiceSuccess = (state) => state.service?.successMessages?.update || null;
export const selectUpdateServiceStatus = (state) => {
    const status = state.service?.status;
    const hasUpdateError = state.service?.errors?.update;
    const hasUpdateSuccess = state.service?.successMessages?.update;

    if (hasUpdateError) return 'error';
    if (hasUpdateSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de suppression
export const selectDeleteServiceError = (state) => state.service?.errors?.delete || null;
export const selectDeleteServiceSuccess = (state) => state.service?.successMessages?.delete || null;
export const selectDeleteServiceStatus = (state) => {
    const status = state.service?.status;
    const hasDeleteError = state.service?.errors?.delete;
    const hasDeleteSuccess = state.service?.successMessages?.delete;

    if (hasDeleteError) return 'error';
    if (hasDeleteSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour la récupération par ID
export const selectGetServiceByIdError = (state) => state.service?.errors?.getById || null;
export const selectGetServiceByIdStatus = (state) => {
    const status = state.service?.status;
    const hasError = state.service?.errors?.getById;

    if (hasError) return 'error';
    return status;
};

// Sélecteurs spécialisés pour la récupération de tous les services
export const selectGetAllServicesError = (state) => state.service?.errors?.getAll || null;
export const selectGetAllServicesStatus = (state) => {
    const status = state.service?.status;
    const hasError = state.service?.errors?.getAll;

    if (hasError) return 'error';
    return status;
};

// Sélecteurs utilitaires
export const selectServiceByNom = (nom) => (state) => {
    const services = state.service?.servicesList || [];
    return services.find(service => service.nom === nom) || null;
};

export const selectServicesByDescription = (searchTerm) => (state) => {
    const services = state.service?.servicesList || [];
    return services.filter(service =>
        service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
};

export const selectServicesCount = (state) => {
    const services = state.service?.servicesList || [];
    return services.length;
};

export const selectIsServiceLoading = (state) => {
    return state.service?.status === 'loading';
};

export const selectHasServiceError = (state) => {
    const errors = state.service?.errors || {};
    return Object.values(errors).some(error => error !== null);
};

export const selectHasServiceSuccess = (state) => {
    const successMessages = state.service?.successMessages || {};
    return Object.values(successMessages).some(message => message !== null);
};

// Export du reducer
export default serviceSlice.reducer;
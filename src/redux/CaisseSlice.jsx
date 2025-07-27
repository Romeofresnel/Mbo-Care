import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";

// ==================== ACTIONS ASYNCHRONES ====================

// Action pour récupérer toutes les caisses enregistrées
export const getAllCaisses = createAsyncThunk(
    'caisse/getAllCaisses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/caisse/all');
            // Vérifier que la réponse contient bien des données
            return response.data?.caisses || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la liste des caisses'
            );
        }
    }
);

// Action pour récupérer une caisse par son ID
export const getCaisseById = createAsyncThunk(
    'caisse/getCaisseById',
    async (caisseId, { rejectWithValue }) => {
        try {
            if (!caisseId) {
                return rejectWithValue('ID de la caisse manquant');
            }

            const response = await Axios.get(`/caisse/${caisseId}`);
            return response.data?.caisse;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la caisse'
            );
        }
    }
);

// Action pour récupérer toutes les caisses d'un patient
export const getCaissesByPatient = createAsyncThunk(
    'caisse/getCaissesByPatient',
    async (patientId, { rejectWithValue }) => {
        try {
            console.log('Tentative de récupération des caisses pour le patient:', patientId);

            if (!patientId) {
                return rejectWithValue('ID du patient manquant');
            }

            const response = await Axios.get(`/caisse/patient/${patientId}`);
            console.log('Réponse de l\'API pour les caisses du patient:', response.data.casses);

            // Vérifier la structure de la réponse
            const caisses = response.data?.data || response.data || [];
            console.log('Caisses extraites:', caisses);

            return caisses;
        } catch (error) {
            console.error('Erreur lors de la récupération des caisses du patient:', error);
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des caisses du patient'
            );
        }
    }
);

// Action pour ajouter une nouvelle caisse
export const addCaisse = createAsyncThunk(
    'caisse/addCaisse',
    async (caisseData, { rejectWithValue }) => {
        try {
            // Validation côté client avant envoi
            if (!caisseData.libelle || !caisseData.patientId || !caisseData.type || !caisseData.montant) {
                return rejectWithValue('Tous les champs obligatoires doivent être remplis');
            }

            // Validation supplémentaire pour la longueur des champs
            if (caisseData.libelle.trim().length < 2) {
                return rejectWithValue('Le libellé doit contenir au moins 2 caractères');
            }

            // Validation du montant
            if (isNaN(parseFloat(caisseData.montant)) || parseFloat(caisseData.montant) <= 0) {
                return rejectWithValue('Le montant doit être un nombre positif');
            }

            const response = await Axios.post('/caisse/new', caisseData);
            return response.data?.caisse;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout de la caisse'
            );
        }
    }
);

// Action pour modifier une caisse existante
export const updateCaisse = createAsyncThunk(
    'caisse/updateCaisse',
    async ({ caisseId, caisseData }, { rejectWithValue }) => {
        try {
            if (!caisseId) {
                return rejectWithValue('ID de la caisse manquant');
            }

            // Validation côté client des données de modification
            if (caisseData.libelle && caisseData.libelle.trim().length < 2) {
                return rejectWithValue('Le libellé doit contenir au moins 2 caractères');
            }

            if (caisseData.montant && (isNaN(parseFloat(caisseData.montant)) || parseFloat(caisseData.montant) <= 0)) {
                return rejectWithValue('Le montant doit être un nombre positif');
            }

            const response = await Axios.put(`/caisse/${caisseId}`, caisseData);
            return response.data?.caisse;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification de la caisse'
            );
        }
    }
);

// Action pour supprimer une caisse
export const deleteCaisse = createAsyncThunk(
    'caisse/deleteCaisse',
    async (caisseId, { rejectWithValue }) => {
        try {
            if (!caisseId) {
                return rejectWithValue('ID de la caisse manquant');
            }

            const response = await Axios.delete(`/caisse/${caisseId}`);
            return { caisseId, message: response.data?.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression de la caisse'
            );
        }
    }
);

// ==================== SLICE PRINCIPAL ====================

const caisseSlice = createSlice({
    name: "caisse",
    initialState: {
        // Informations d'une caisse spécifique
        currentCaisse: null,
        // Liste de toutes les caisses - Initialisation avec un tableau vide pour éviter undefined
        caissesList: [],
        // Liste des caisses d'un patient spécifique
        caissesByPatient: [],
        // Caisse unique récupérée par ID
        caisseOneList: null,
        // Gestion des erreurs séparées par action
        errors: {
            get: null,
            add: null,
            update: null,
            delete: null,
            getAll: null,
            getById: null,
            getByPatient: null
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
                getById: null,
                getByPatient: null
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
        // Définir la caisse actuelle
        setCurrentCaisse: (state, action) => {
            state.currentCaisse = action.payload;
        },
        // Réinitialiser le statut de chargement
        resetStatus: (state) => {
            state.status = "idle";
        },
        // Vider la liste des caisses
        clearCaissesList: (state) => {
            state.caissesList = [];
        },
        // Vider la liste des caisses d'un patient
        clearCaissesByPatient: (state) => {
            state.caissesByPatient = [];
        },
        // Supprimer une caisse de la liste (pour la suppression optimiste)
        removeCaisseFromList: (state, action) => {
            state.caissesList = state.caissesList.filter(
                caisse => caisse._id !== action.payload
            );
            state.caissesByPatient = state.caissesByPatient.filter(
                caisse => caisse._id !== action.payload
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
        },
        // Nettoyer spécifiquement l'erreur de récupération par patient
        clearGetByPatientError: (state) => {
            state.errors.getByPatient = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ==================== RÉCUPÉRATION DE LA LISTE DES CAISSES ====================
            .addCase(getAllCaisses.pending, (state) => {
                state.status = 'loading';
                state.errors.getAll = null;
            })
            .addCase(getAllCaisses.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // S'assurer que caissesList est toujours un tableau
                state.caissesList = Array.isArray(action.payload) ? action.payload : [];
                state.errors.getAll = null;
            })
            .addCase(getAllCaisses.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getAll = action.payload;
                // Garder la liste existante en cas d'erreur
                state.caissesList = state.caissesList || [];
            })
            // ==================== RÉCUPÉRATION D'UNE CAISSE PAR ID ====================
            .addCase(getCaisseById.pending, (state) => {
                state.status = 'loading';
                state.errors.getById = null;
            })
            .addCase(getCaisseById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.caisseOneList = action.payload;
                state.currentCaisse = action.payload;
                state.errors.getById = null;
            })
            .addCase(getCaisseById.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getById = action.payload;
                state.caisseOneList = null;
            })
            // ==================== RÉCUPÉRATION DES CAISSES PAR PATIENT ====================
            .addCase(getCaissesByPatient.pending, (state) => {
                console.log('getCaissesByPatient.pending - État avant:', state.caissesByPatient);
                state.status = 'loading';
                state.errors.getByPatient = null;
                // Ne pas vider la liste pendant le chargement pour éviter les clignotements
            })
            .addCase(getCaissesByPatient.fulfilled, (state, action) => {
                console.log('getCaissesByPatient.fulfilled - Payload reçu:', action.payload);
                state.status = 'succeeded';

                // S'assurer que nous avons un tableau
                const caisses = Array.isArray(action.payload) ? action.payload : [];
                console.log('Caisses à stocker dans le state:', caisses);

                state.caissesByPatient = caisses;
                state.errors.getByPatient = null;

                console.log('État après mise à jour:', state.caissesByPatient);
            })
            .addCase(getCaissesByPatient.rejected, (state, action) => {
                console.log('getCaissesByPatient.rejected - Erreur:', action.payload);
                state.status = 'failed';
                state.errors.getByPatient = action.payload;
                // Ne pas vider la liste en cas d'erreur, garder les données existantes
                // state.caissesByPatient = [];
            })
            // ==================== AJOUT D'UNE NOUVELLE CAISSE ====================
            .addCase(addCaisse.pending, (state) => {
                state.status = 'loading';
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addCaisse.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = 'Caisse ajoutée avec succès';

                // Ajouter la nouvelle caisse à la liste seulement si elle existe
                if (action.payload && action.payload._id) {
                    const newCaisse = action.payload;

                    // Vérifier que la caisse n'existe pas déjà dans la liste
                    const existingCaisse = state.caissesList.find(
                        caisse => caisse._id === newCaisse._id
                    );

                    if (!existingCaisse) {
                        state.caissesList.push(newCaisse);
                    }

                    // Ajouter aussi à la liste des caisses du patient
                    const existingInPatient = state.caissesByPatient.find(
                        caisse => caisse._id === newCaisse._id
                    );
                    if (!existingInPatient) {
                        state.caissesByPatient.push(newCaisse);
                    }
                }
            })
            .addCase(addCaisse.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })
            // ==================== MODIFICATION D'UNE CAISSE EXISTANTE ====================
            .addCase(updateCaisse.pending, (state) => {
                state.status = 'loading';
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updateCaisse.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = 'Caisse modifiée avec succès';

                // Mettre à jour la caisse dans la liste
                const updatedCaisse = action.payload;
                if (updatedCaisse && updatedCaisse._id) {
                    // Mise à jour dans la liste générale
                    const index = state.caissesList.findIndex(
                        caisse => caisse._id === updatedCaisse._id
                    );
                    if (index !== -1) {
                        state.caissesList[index] = updatedCaisse;
                    }

                    // Mise à jour dans la liste des caisses du patient
                    const patientIndex = state.caissesByPatient.findIndex(
                        caisse => caisse._id === updatedCaisse._id
                    );
                    if (patientIndex !== -1) {
                        state.caissesByPatient[patientIndex] = updatedCaisse;
                    }

                    // Mettre à jour la caisse actuelle si elle correspond
                    if (state.currentCaisse && state.currentCaisse._id === updatedCaisse._id) {
                        state.currentCaisse = updatedCaisse;
                    }

                    // Mettre à jour caisseOneList si elle correspond
                    if (state.caisseOneList && state.caisseOneList._id === updatedCaisse._id) {
                        state.caisseOneList = updatedCaisse;
                    }
                }
            })
            .addCase(updateCaisse.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.update = action.payload;
                state.successMessages.update = null;
            })
            // ==================== SUPPRESSION D'UNE CAISSE ====================
            .addCase(deleteCaisse.pending, (state) => {
                state.status = 'loading';
                state.errors.delete = null;
                state.successMessages.delete = null;
            })
            .addCase(deleteCaisse.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.delete = null;
                state.successMessages.delete = 'Caisse supprimée avec succès';

                // Supprimer la caisse de toutes les listes
                const { caisseId } = action.payload;
                if (caisseId) {
                    // Supprimer de la liste générale
                    state.caissesList = state.caissesList.filter(
                        caisse => caisse._id !== caisseId
                    );

                    // Supprimer de la liste des caisses du patient
                    state.caissesByPatient = state.caissesByPatient.filter(
                        caisse => caisse._id !== caisseId
                    );

                    // Nettoyer les références à la caisse supprimée
                    if (state.currentCaisse && state.currentCaisse._id === caisseId) {
                        state.currentCaisse = null;
                    }

                    if (state.caisseOneList && state.caisseOneList._id === caisseId) {
                        state.caisseOneList = null;
                    }
                }
            })
            .addCase(deleteCaisse.rejected, (state, action) => {
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
    setCurrentCaisse,
    resetStatus,
    clearCaissesList,
    clearCaissesByPatient,
    removeCaisseFromList,
    clearAddError,
    clearAddSuccess,
    clearUpdateError,
    clearUpdateSuccess,
    clearDeleteError,
    clearDeleteSuccess,
    clearGetByPatientError
} = caisseSlice.actions;

// ==================== SÉLECTEURS AVEC VALEURS PAR DÉFAUT ====================

// Sélecteurs principaux
export const selectCaissesList = (state) => state.caisse?.caissesList || [];
export const selectCaissesByPatient = (state) => {
    const caisses = state.caisse?.caissesByPatient || [];
    console.log('Sélecteur selectCaissesByPatient - Valeur retournée:', caisses);
    return caisses;
};
export const selectCurrentCaisse = (state) => state.caisse?.currentCaisse || null;
export const selectCaisseOneList = (state) => state.caisse?.caisseOneList || null;
export const selectCaisseStatus = (state) => state.caisse?.status || 'idle';
export const selectCaisseErrors = (state) => state.caisse?.errors || {};
export const selectCaisseSuccessMessages = (state) => state.caisse?.successMessages || {};

// Sélecteurs spécialisés pour les erreurs et succès d'ajout
export const selectAddCaisseError = (state) => state.caisse?.errors?.add || null;
export const selectAddCaisseSuccess = (state) => state.caisse?.successMessages?.add || null;
export const selectAddCaisseStatus = (state) => {
    const status = state.caisse?.status;
    const hasAddError = state.caisse?.errors?.add;
    const hasAddSuccess = state.caisse?.successMessages?.add;

    if (hasAddError) return 'error';
    if (hasAddSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de modification
export const selectUpdateCaisseError = (state) => state.caisse?.errors?.update || null;
export const selectUpdateCaisseSuccess = (state) => state.caisse?.successMessages?.update || null;
export const selectUpdateCaisseStatus = (state) => {
    const status = state.caisse?.status;
    const hasUpdateError = state.caisse?.errors?.update;
    const hasUpdateSuccess = state.caisse?.successMessages?.update;

    if (hasUpdateError) return 'error';
    if (hasUpdateSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de suppression
export const selectDeleteCaisseError = (state) => state.caisse?.errors?.delete || null;
export const selectDeleteCaisseSuccess = (state) => state.caisse?.successMessages?.delete || null;
export const selectDeleteCaisseStatus = (state) => {
    const status = state.caisse?.status;
    const hasDeleteError = state.caisse?.errors?.delete;
    const hasDeleteSuccess = state.caisse?.successMessages?.delete;

    if (hasDeleteError) return 'error';
    if (hasDeleteSuccess) return 'success';
    return status;
};

// Export du reducer
export default caisseSlice.reducer;
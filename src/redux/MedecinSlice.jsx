import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";

// ==================== ACTIONS ASYNCHRONES ====================

// Action pour récupérer tous les médecins enregistrés
export const getAllMedecins = createAsyncThunk(
    'medecin/getAllMedecins',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/medecin/getAll');
            // Vérifier que la réponse contient bien des données
            return response.data || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la liste des médecins'
            );
        }
    }
);

// Action pour récupérer un médecin par son ID
export const getMedecinById = createAsyncThunk(
    'medecin/getMedecinById',
    async (medecinId, { rejectWithValue }) => {
        try {
            if (!medecinId) {
                return rejectWithValue('ID du médecin manquant');
            }

            const response = await Axios.get(`/medecin/${medecinId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération du médecin'
            );
        }
    }
);

// Action pour ajouter un nouveau médecin
export const addMedecin = createAsyncThunk(
    'medecin/addMedecin',
    async (medecinData, { rejectWithValue }) => {
        try {
            // Validation côté client avant envoi
            if (!medecinData.nom || !medecinData.prenom) {
                return rejectWithValue('Le nom et le prénom sont obligatoires');
            }

            if (!medecinData.email || !medecinData.matricule) {
                return rejectWithValue('L\'email et le matricule sont obligatoires');
            }

            if (!medecinData.password || medecinData.password.length < 6) {
                return rejectWithValue('Le mot de passe doit contenir au moins 6 caractères');
            }

            const response = await Axios.post('/medecin/new', medecinData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout du médecin'
            );
        }
    }
);

// Action pour modifier un médecin existant
export const updateMedecin = createAsyncThunk(
    'medecin/updateMedecin',
    async ({ medecinId, medecinData }, { rejectWithValue }) => {
        try {
            if (!medecinId) {
                return rejectWithValue('ID du médecin manquant');
            }

            const response = await Axios.put(`/medecin/${medecinId}`, medecinData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification du médecin'
            );
        }
    }
);

// ==================== SLICE PRINCIPAL ====================

const medecinSlice = createSlice({
    name: "medecin",
    initialState: {
        // Informations d'un médecin spécifique
        currentMedecin: null,
        // Liste de tous les médecins - Initialisation avec un tableau vide pour éviter undefined
        medecinsList: [],
        // Médecin unique récupéré par ID
        medecinOneList: null,
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
        // Définir le médecin actuel
        setCurrentMedecin: (state, action) => {
            state.currentMedecin = action.payload;
        },
        // Réinitialiser le statut de chargement
        resetStatus: (state) => {
            state.status = "idle";
        },
        // Vider la liste des médecins
        clearMedecinsList: (state) => {
            state.medecinsList = [];
        },
        // Supprimer un médecin de la liste (pour la suppression optimiste)
        removeMedecinFromList: (state, action) => {
            state.medecinsList = state.medecinsList.filter(
                medecin => medecin._id !== action.payload
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
        }
    },
    extraReducers: (builder) => {
        builder
            // ==================== RÉCUPÉRATION DE LA LISTE DES MÉDECINS ====================
            .addCase(getAllMedecins.pending, (state) => {
                state.status = 'loading';
                state.errors.getAll = null;
            })
            .addCase(getAllMedecins.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // S'assurer que medecinsList est toujours un tableau
                state.medecinsList = Array.isArray(action.payload) ? action.payload : [];
                state.errors.getAll = null;
            })
            .addCase(getAllMedecins.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getAll = action.payload;
                // Garder la liste existante en cas d'erreur
                state.medecinsList = state.medecinsList || [];
            })
            // ==================== RÉCUPÉRATION D'UN MÉDECIN PAR ID ====================
            .addCase(getMedecinById.pending, (state) => {
                state.status = 'loading';
                state.errors.getById = null;
            })
            .addCase(getMedecinById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.medecinOneList = action.payload;
                state.currentMedecin = action.payload;
                state.errors.getById = null;
            })
            .addCase(getMedecinById.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getById = action.payload;
                state.medecinOneList = null;
            })
            // ==================== AJOUT D'UN NOUVEAU MÉDECIN ====================
            .addCase(addMedecin.pending, (state) => {
                state.status = 'loading';
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addMedecin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = 'Médecin ajouté avec succès';

                // Ajouter le nouveau médecin à la liste seulement s'il existe
                if (action.payload && action.payload.medecin && action.payload.medecin.newMedecin) {
                    const newMedecin = action.payload.medecin.newMedecin;

                    // Vérifier que le médecin n'existe pas déjà dans la liste
                    const existingMedecin = state.medecinsList.find(
                        medecin => medecin._id === newMedecin._id
                    );

                    if (!existingMedecin) {
                        state.medecinsList.push(newMedecin);
                    }
                }
            })
            .addCase(addMedecin.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })
            // ==================== MODIFICATION D'UN MÉDECIN EXISTANT ====================
            .addCase(updateMedecin.pending, (state) => {
                state.status = 'loading';
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updateMedecin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = 'Médecin modifié avec succès';

                // Mettre à jour le médecin dans la liste
                const updatedMedecin = action.payload;
                if (updatedMedecin && updatedMedecin._id) {
                    const index = state.medecinsList.findIndex(
                        medecin => medecin._id === updatedMedecin._id
                    );

                    if (index !== -1) {
                        state.medecinsList[index] = updatedMedecin;
                    }

                    // Mettre à jour le médecin actuel s'il correspond
                    if (state.currentMedecin && state.currentMedecin._id === updatedMedecin._id) {
                        state.currentMedecin = updatedMedecin;
                    }

                    // Mettre à jour medecinOneList s'il correspond
                    if (state.medecinOneList && state.medecinOneList._id === updatedMedecin._id) {
                        state.medecinOneList = updatedMedecin;
                    }
                }
            })
            .addCase(updateMedecin.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.update = action.payload;
                state.successMessages.update = null;
            });
    }
});

// ==================== EXPORT DES ACTIONS ====================
export const {
    clearErrors,
    clearSuccessMessages,
    setCurrentMedecin,
    resetStatus,
    clearMedecinsList,
    removeMedecinFromList,
    clearAddError,
    clearAddSuccess,
    clearUpdateError,
    clearUpdateSuccess
} = medecinSlice.actions;

// ==================== SÉLECTEURS AVEC VALEURS PAR DÉFAUT ====================

// Sélecteurs principaux
export const selectMedecinsList = (state) => state.medecin?.medecinsList || [];
export const selectCurrentMedecin = (state) => state.medecin?.currentMedecin || null;
export const selectMedecinOneList = (state) => state.medecin?.medecinOneList || null;
export const selectMedecinStatus = (state) => state.medecin?.status || 'idle';
export const selectMedecinErrors = (state) => state.medecin?.errors || {};
export const selectMedecinSuccessMessages = (state) => state.medecin?.successMessages || {};

// Sélecteurs spécialisés pour les erreurs et succès d'ajout
export const selectAddMedecinError = (state) => state.medecin?.errors?.add || null;
export const selectAddMedecinSuccess = (state) => state.medecin?.successMessages?.add || null;
export const selectAddMedecinStatus = (state) => {
    const status = state.medecin?.status;
    const hasAddError = state.medecin?.errors?.add;
    const hasAddSuccess = state.medecin?.successMessages?.add;

    if (hasAddError) return 'error';
    if (hasAddSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de modification
export const selectUpdateMedecinError = (state) => state.medecin?.errors?.update || null;
export const selectUpdateMedecinSuccess = (state) => state.medecin?.successMessages?.update || null;
export const selectUpdateMedecinStatus = (state) => {
    const status = state.medecin?.status;
    const hasUpdateError = state.medecin?.errors?.update;
    const hasUpdateSuccess = state.medecin?.successMessages?.update;

    if (hasUpdateError) return 'error';
    if (hasUpdateSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour la récupération par ID
export const selectGetMedecinByIdError = (state) => state.medecin?.errors?.getById || null;
export const selectGetMedecinByIdStatus = (state) => {
    const status = state.medecin?.status;
    const hasError = state.medecin?.errors?.getById;

    if (hasError) return 'error';
    return status;
};

// Sélecteurs utilitaires
export const selectMedecinByMatricule = (matricule) => (state) => {
    const medecins = state.medecin?.medecinsList || [];
    return medecins.find(medecin => medecin.matricule === matricule) || null;
};

export const selectMedecinByService = (service) => (state) => {
    const medecins = state.medecin?.medecinsList || [];
    return medecins.filter(medecin => medecin.service === service) || [];
};

export const selectMedecinByEmail = (email) => (state) => {
    const medecins = state.medecin?.medecinsList || [];
    return medecins.find(medecin => medecin.email === email) || null;
};

// Export du reducer
export default medecinSlice.reducer;
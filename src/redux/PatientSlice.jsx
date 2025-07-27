import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";

// Actions pour récupérer tous les patients enregistrés
export const getAllPatient = createAsyncThunk(
    'patient/getAllPatient',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/patient/getAll');
            // Vérifier que la réponse contient bien des données
            return response.data || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la liste'
            );
        }
    }
);

// Actions pour ajouter un nouveau patient
export const addPatient = createAsyncThunk(
    'patient/addPatient',
    async (patientData, { rejectWithValue }) => {
        try {
            // Validation côté client avant envoi
            if (!patientData.nom || !patientData.prenom) {
                return rejectWithValue('Le nom et le prénom sont obligatoires');
            }

            const response = await Axios.post('/patient/new', patientData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout du patient'
            );
        }
    }
);

// Actions pour modifier un patient existant
export const updatePatient = createAsyncThunk(
    'patient/updatePatient',
    async ({ patientId, patientData }, { rejectWithValue, dispatch }) => {
        try {
            if (!patientId) {
                return rejectWithValue('ID du patient manquant');
            }

            const response = await Axios.put(`/patient/${patientId}`, patientData);

            // Retourner directement les données du patient mis à jour
            // Le reducer se chargera de mettre à jour l'état local
            return {
                ...response.data,
                id: patientId, // S'assurer que l'ID est présent
                _id: patientId // Compatibilité avec les deux formats d'ID
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification du patient'
            );
        }
    }
);

// Actions pour récupérer un patient par ID
export const getPatientById = createAsyncThunk(
    'patient/getPatientById',
    async (patientId, { rejectWithValue }) => {
        try {
            if (!patientId) {
                return rejectWithValue('ID du patient manquant');
            }

            const response = await Axios.get(`/patient/${patientId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération du patient'
            );
        }
    }
);

// Actions pour récupérer toutes les consultations d'un patient spécifique
export const getAllConsultationByPatient = createAsyncThunk(
    'patient/getAllConsultationByPatient',
    async (patientId, { rejectWithValue }) => {
        try {
            if (!patientId) {
                return rejectWithValue('ID du patient manquant');
            }

            const response = await Axios.get(`/patient/consulte/${patientId}`);
            return response.data || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des consultations'
            );
        }
    }
);

const patientSlice = createSlice({
    name: "patient",
    initialState: {
        // Informations d'un patient spécifique
        currentPatient: null,
        // Liste de tous les patients - Initialisation avec un tableau vide pour éviter undefined
        patientsList: [],
        // Suppression de patientOneList qui créait de la confusion
        currentPatientConsultations: [],
        // Gestion des erreurs séparées par action
        errors: {
            get: null,
            add: null,
            update: null,
            delete: null,
            getAll: null,
            getById: null,
            getConsultations: null
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
                getConsultations: null
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
        // Définir le patient actuel
        setCurrentPatient: (state, action) => {
            state.currentPatient = action.payload;
        },
        // Mettre à jour le patient actuel avec de nouvelles données
        updateCurrentPatient: (state, action) => {
            if (state.currentPatient) {
                state.currentPatient = {
                    ...state.currentPatient,
                    ...action.payload
                };
            }
        },
        // Réinitialiser le statut de chargement
        resetStatus: (state) => {
            state.status = "idle";
        },
        // Vider la liste des patients
        clearPatientsList: (state) => {
            state.patientsList = [];
        },
        // Supprimer un patient de la liste (pour la suppression optimiste)
        removePatientFromList: (state, action) => {
            state.patientsList = state.patientsList.filter(
                patient => patient.id !== action.payload
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
            // ==================== RÉCUPÉRATION DE LA LISTE DES PATIENTS ====================
            .addCase(getAllPatient.pending, (state) => {
                state.status = 'loading';
                state.errors.getAll = null;
            })
            .addCase(getAllPatient.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // S'assurer que patientsList est toujours un tableau
                state.patientsList = Array.isArray(action.payload) ? action.payload : [];
                state.errors.getAll = null;
            })
            .addCase(getAllPatient.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getAll = action.payload;
                // Garder la liste existante en cas d'erreur
                state.patientsList = state.patientsList || [];
            })
            // ==================== RÉCUPÉRATION D'UN PATIENT PAR ID ====================
            .addCase(getPatientById.pending, (state) => {
                state.status = 'loading';
                state.errors.getById = null;
            })
            .addCase(getPatientById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // CORRECTION : stocker le patient unique dans currentPatient, pas dans un tableau
                state.currentPatient = action.payload;
                state.errors.getById = null;
            })
            .addCase(getPatientById.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getById = action.payload;
                state.currentPatient = null;
            })
            // ==================== AJOUT D'UN NOUVEAU PATIENT ====================
            .addCase(addPatient.pending, (state) => {
                state.status = 'loading';
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addPatient.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = 'Patient ajouté avec succès';

                // Ajouter le nouveau patient à la liste seulement s'il existe
                if (action.payload && (action.payload.id || action.payload._id)) {
                    // Vérifier que le patient n'existe pas déjà dans la liste
                    const patientId = action.payload.id || action.payload._id;
                    const existingPatient = state.patientsList.find(
                        patient => (patient.id || patient._id) === patientId
                    );

                    if (!existingPatient) {
                        state.patientsList.push(action.payload);
                    }
                }
            })
            .addCase(addPatient.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })
            // ==================== RÉCUPÉRATION DES CONSULTATIONS D'UN PATIENT ====================
            .addCase(getAllConsultationByPatient.pending, (state) => {
                state.status = 'loading';
                state.errors.getConsultations = null;
            })
            .addCase(getAllConsultationByPatient.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentPatientConsultations = Array.isArray(action.payload) ? action.payload : [];
                state.errors.getConsultations = null;
            })
            .addCase(getAllConsultationByPatient.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getConsultations = action.payload;
                state.currentPatientConsultations = [];
            })
            // ==================== MODIFICATION D'UN PATIENT EXISTANT ====================
            .addCase(updatePatient.pending, (state) => {
                state.status = 'loading';
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updatePatient.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = 'Patient modifié avec succès';

                // Mettre à jour le patient dans la liste
                const updatedPatient = action.payload;
                if (updatedPatient && (updatedPatient.id || updatedPatient._id)) {
                    const patientId = updatedPatient.id || updatedPatient._id;

                    // Mettre à jour dans la liste des patients
                    const index = state.patientsList.findIndex(
                        patient => (patient.id || patient._id) === patientId
                    );

                    if (index !== -1) {
                        // Conserver les propriétés existantes et appliquer les nouvelles
                        state.patientsList[index] = {
                            ...state.patientsList[index],
                            ...updatedPatient
                        };
                    }

                    // Mettre à jour le patient actuel s'il correspond
                    if (state.currentPatient &&
                        ((state.currentPatient.id || state.currentPatient._id) === patientId)) {
                        state.currentPatient = {
                            ...state.currentPatient,
                            ...updatedPatient
                        };
                    }
                }
            })
            .addCase(updatePatient.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.update = action.payload;
                state.successMessages.update = null;
            });
    }
});

// Export des actions
export const {
    clearErrors,
    clearSuccessMessages,
    setCurrentPatient,
    updateCurrentPatient,
    resetStatus,
    clearPatientsList,
    removePatientFromList,
    clearAddError,
    clearAddSuccess,
    clearUpdateError,
    clearUpdateSuccess
} = patientSlice.actions;

// Sélecteurs avec valeurs par défaut pour éviter les undefined
export const selectPatientsList = (state) => state.patient?.patientsList || [];
export const selectCurrentPatient = (state) => state.patient?.currentPatient || null;
export const selectPatientStatus = (state) => state.patient?.status || 'idle';
export const selectPatientErrors = (state) => state.patient?.errors || {};
export const selectPatientSuccessMessages = (state) => state.patient?.successMessages || {};

// Sélecteurs spécialisés pour les erreurs et succès d'ajout
export const selectAddPatientError = (state) => state.patient?.errors?.add || null;
export const selectAddPatientSuccess = (state) => state.patient?.successMessages?.add || null;
export const selectAddPatientStatus = (state) => {
    const status = state.patient?.status;
    const hasAddError = state.patient?.errors?.add;
    const hasAddSuccess = state.patient?.successMessages?.add;

    if (hasAddError) return 'error';
    if (hasAddSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de modification
export const selectUpdatePatientError = (state) => state.patient?.errors?.update || null;
export const selectUpdatePatientSuccess = (state) => state.patient?.successMessages?.update || null;
export const selectUpdatePatientStatus = (state) => {
    const status = state.patient?.status;
    const hasUpdateError = state.patient?.errors?.update;
    const hasUpdateSuccess = state.patient?.successMessages?.update;

    if (hasUpdateError) return 'error';
    if (hasUpdateSuccess) return 'success';
    return status;
};

// Sélecteur pour les consultations du patient actuel
export const selectCurrentPatientConsultations = (state) => state.patient?.currentPatientConsultations || [];

export default patientSlice.reducer;
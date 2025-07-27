import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";
import { getAllPatient } from "./PatientSlice";

// ================================
// ASYNC THUNKS - Actions asynchrones
// ================================

/**
 * Ajouter une nouvelle opération médicale
 * @param {Object} operationData - Données de l'opération à créer
 */
export const addOperation = createAsyncThunk(
    'operation/addOperation',
    async (operationData, { rejectWithValue, dispatch }) => {
        try {
            const response = await Axios.post('/operation/new', operationData);
            if (response.data.success) {
                dispatch(getAllPatient());
            }
            return response.data;
        } catch (error) {
            console.log(error);

            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout de l\'opération'
            );
        }
    }
);

/**
 * Récupérer toutes les opérations
 */
export const getAllOperations = createAsyncThunk(
    'operation/getAllOperations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/operation/');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des opérations'
            );
        }
    }
);

/**
 * Récupérer une opération par son ID
 * @param {string} operationId - ID de l'opération
 */
export const getOperationById = createAsyncThunk(
    'operation/getOperationById',
    async (operationId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/operation/${operationId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de l\'opération'
            );
        }
    }
);

/**
 * Modifier une opération existante
 * @param {Object} params - Paramètres contenant l'ID et les nouvelles données
 */
export const updateOperation = createAsyncThunk(
    'operation/updateOperation',
    async ({ operationId, operationData }, { rejectWithValue }) => {
        try {
            const response = await Axios.put(`/operation/${operationId}`, operationData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification de l\'opération'
            );
        }
    }
);

/**
 * Supprimer une opération
 * @param {string} operationId - ID de l'opération à supprimer
 */
export const deleteOperation = createAsyncThunk(
    'operation/deleteOperation',
    async (operationId, { rejectWithValue }) => {
        try {
            const response = await Axios.delete(`/operation/${operationId}`);
            return { ...response.data, deletedId: operationId };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression de l\'opération'
            );
        }
    }
);

/**
 * Terminer manuellement une opération
 * @param {string} operationId - ID de l'opération à terminer
 */
export const finishOperation = createAsyncThunk(
    'operation/finishOperation',
    async (operationId, { rejectWithValue }) => {
        try {
            const response = await Axios.patch(`/operation/${operationId}/terminer`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la finalisation de l\'opération'
            );
        }
    }
);

/**
 * Récupérer toutes les opérations d'un patient
 * @param {string} patientId - ID du patient
 */
export const getPatientOperations = createAsyncThunk(
    'operation/getPatientOperations',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/operation/patient/${patientId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des opérations du patient'
            );
        }
    }
);

/**
 * Récupérer l'opération en cours d'un patient
 * @param {string} patientId - ID du patient
 */
export const getCurrentPatientOperation = createAsyncThunk(
    'operation/getCurrentPatientOperation',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/operation/patient/${patientId}/en-cours`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Aucune opération en cours pour ce patient'
            );
        }
    }
);

// ================================
// SLICE DEFINITION
// ================================

const operationSlice = createSlice({
    name: 'operation',
    initialState: {
        // Données principales
        currentOperation: null,
        operationList: [],
        patientOperations: [],
        currentPatientOperation: null,

        // États de chargement pour chaque action
        loading: {
            add: false,
            getAll: false,
            getById: false,
            update: false,
            delete: false,
            finish: false,
            getPatientOps: false,
            getCurrentPatientOp: false
        },

        // Messages d'erreur spécifiques
        errors: {
            add: null,
            getAll: null,
            getById: null,
            update: null,
            delete: null,
            finish: null,
            getPatientOps: null,
            getCurrentPatientOp: null
        },

        // Messages de succès
        successMessages: {
            add: null,
            update: null,
            delete: null,
            finish: null
        },

        // Statut global (maintenu pour compatibilité)
        statut: "idle"
    },

    reducers: {
        /**
         * Effacer tous les messages d'erreur
         */
        clearErrors: (state) => {
            state.errors = {
                add: null,
                getAll: null,
                getById: null,
                update: null,
                delete: null,
                finish: null,
                getPatientOps: null,
                getCurrentPatientOp: null
            };
        },

        /**
         * Effacer tous les messages de succès
         */
        clearSuccessMessages: (state) => {
            state.successMessages = {
                add: null,
                update: null,
                delete: null,
                finish: null
            };
        },

        /**
         * Effacer une erreur spécifique
         * @param {Object} action - Action contenant le type d'erreur à effacer
         */
        clearSpecificError: (state, action) => {
            const errorType = action.payload;
            if (state.errors.hasOwnProperty(errorType)) {
                state.errors[errorType] = null;
            }
        },

        /**
         * Effacer un message de succès spécifique
         * @param {Object} action - Action contenant le type de message à effacer
         */
        clearSpecificSuccess: (state, action) => {
            const successType = action.payload;
            if (state.successMessages.hasOwnProperty(successType)) {
                state.successMessages[successType] = null;
            }
        },

        /**
         * Définir l'opération courante
         * @param {Object} action - Action contenant l'opération à définir
         */
        setCurrentOperation: (state, action) => {
            state.currentOperation = action.payload;
        },

        /**
         * Réinitialiser le statut global
         */
        resetStatus: (state) => {
            state.statut = "idle";
        },

        /**
         * Réinitialiser complètement l'état
         */
        resetOperationState: (state) => {
            state.currentOperation = null;
            state.operationList = [];
            state.patientOperations = [];
            state.currentPatientOperation = null;
            state.loading = {
                add: false,
                getAll: false,
                getById: false,
                update: false,
                delete: false,
                finish: false,
                getPatientOps: false,
                getCurrentPatientOp: false
            };
            state.errors = {
                add: null,
                getAll: null,
                getById: null,
                update: null,
                delete: null,
                finish: null,
                getPatientOps: null,
                getCurrentPatientOp: null
            };
            state.successMessages = {
                add: null,
                update: null,
                delete: null,
                finish: null
            };
            state.statut = "idle";
        }
    },

    extraReducers: (builder) => {
        builder
            // ================================
            // AJOUTER UNE OPÉRATION
            // ================================
            .addCase(addOperation.pending, (state) => {
                state.loading.add = true;
                state.statut = 'loading';
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addOperation.fulfilled, (state, action) => {
                state.loading.add = false;
                state.statut = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = action.payload.message || 'Opération ajoutée avec succès';

                // Ajouter la nouvelle opération au début de la liste
                if (action.payload.data) {
                    state.operationList.unshift(action.payload.data);
                }
            })
            .addCase(addOperation.rejected, (state, action) => {
                state.loading.add = false;
                state.statut = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })

            // ================================
            // RÉCUPÉRER TOUTES LES OPÉRATIONS
            // ================================
            .addCase(getAllOperations.pending, (state) => {
                state.loading.getAll = true;
                state.errors.getAll = null;
            })
            .addCase(getAllOperations.fulfilled, (state, action) => {
                state.loading.getAll = false;
                state.errors.getAll = null;
                state.operationList = action.payload.data || [];
            })
            .addCase(getAllOperations.rejected, (state, action) => {
                state.loading.getAll = false;
                state.errors.getAll = action.payload;
            })

            // ================================
            // RÉCUPÉRER UNE OPÉRATION PAR ID
            // ================================
            .addCase(getOperationById.pending, (state) => {
                state.loading.getById = true;
                state.errors.getById = null;
            })
            .addCase(getOperationById.fulfilled, (state, action) => {
                state.loading.getById = false;
                state.errors.getById = null;
                state.currentOperation = action.payload.data;
            })
            .addCase(getOperationById.rejected, (state, action) => {
                state.loading.getById = false;
                state.errors.getById = action.payload;
                state.currentOperation = null;
            })

            // ================================
            // MODIFIER UNE OPÉRATION
            // ================================
            .addCase(updateOperation.pending, (state) => {
                state.loading.update = true;
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updateOperation.fulfilled, (state, action) => {
                state.loading.update = false;
                state.errors.update = null;
                state.successMessages.update = action.payload.message || 'Opération modifiée avec succès';

                // Mettre à jour l'opération dans la liste
                if (action.payload.data) {
                    const index = state.operationList.findIndex(
                        op => op._id === action.payload.data._id
                    );
                    if (index !== -1) {
                        state.operationList[index] = action.payload.data;
                    }

                    // Mettre à jour l'opération courante si c'est la même
                    if (state.currentOperation && state.currentOperation._id === action.payload.data._id) {
                        state.currentOperation = action.payload.data;
                    }
                }
            })
            .addCase(updateOperation.rejected, (state, action) => {
                state.loading.update = false;
                state.errors.update = action.payload;
                state.successMessages.update = null;
            })

            // ================================
            // SUPPRIMER UNE OPÉRATION
            // ================================
            .addCase(deleteOperation.pending, (state) => {
                state.loading.delete = true;
                state.errors.delete = null;
                state.successMessages.delete = null;
            })
            .addCase(deleteOperation.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.errors.delete = null;
                state.successMessages.delete = action.payload.message || 'Opération supprimée avec succès';

                // Retirer l'opération de la liste
                if (action.payload.deletedId) {
                    state.operationList = state.operationList.filter(
                        op => op._id !== action.payload.deletedId
                    );

                    // Réinitialiser l'opération courante si c'était celle supprimée
                    if (state.currentOperation && state.currentOperation._id === action.payload.deletedId) {
                        state.currentOperation = null;
                    }
                }
            })
            .addCase(deleteOperation.rejected, (state, action) => {
                state.loading.delete = false;
                state.errors.delete = action.payload;
                state.successMessages.delete = null;
            })

            // ================================
            // TERMINER UNE OPÉRATION
            // ================================
            .addCase(finishOperation.pending, (state) => {
                state.loading.finish = true;
                state.errors.finish = null;
                state.successMessages.finish = null;
            })
            .addCase(finishOperation.fulfilled, (state, action) => {
                state.loading.finish = false;
                state.errors.finish = null;
                state.successMessages.finish = action.payload.message || 'Opération terminée avec succès';
            })
            .addCase(finishOperation.rejected, (state, action) => {
                state.loading.finish = false;
                state.errors.finish = action.payload;
                state.successMessages.finish = null;
            })

            // ================================
            // OPÉRATIONS D'UN PATIENT
            // ================================
            .addCase(getPatientOperations.pending, (state) => {
                state.loading.getPatientOps = true;
                state.errors.getPatientOps = null;
            })
            .addCase(getPatientOperations.fulfilled, (state, action) => {
                state.loading.getPatientOps = false;
                state.errors.getPatientOps = null;
                state.patientOperations = action.payload.data || [];
            })
            .addCase(getPatientOperations.rejected, (state, action) => {
                state.loading.getPatientOps = false;
                state.errors.getPatientOps = action.payload;
                state.patientOperations = [];
            })

            // ================================
            // OPÉRATION COURANTE D'UN PATIENT
            // ================================
            .addCase(getCurrentPatientOperation.pending, (state) => {
                state.loading.getCurrentPatientOp = true;
                state.errors.getCurrentPatientOp = null;
            })
            .addCase(getCurrentPatientOperation.fulfilled, (state, action) => {
                state.loading.getCurrentPatientOp = false;
                state.errors.getCurrentPatientOp = null;
                state.currentPatientOperation = action.payload.data;
            })
            .addCase(getCurrentPatientOperation.rejected, (state, action) => {
                state.loading.getCurrentPatientOp = false;
                state.errors.getCurrentPatientOp = action.payload;
                state.currentPatientOperation = null;
            });
    }
});

// ================================
// EXPORT DES ACTIONS ET SELECTORS
// ================================

// Export des actions synchrones
export const {
    clearErrors,
    clearSuccessMessages,
    clearSpecificError,
    clearSpecificSuccess,
    setCurrentOperation,
    resetStatus,
    resetOperationState
} = operationSlice.actions;

// Sélecteurs utiles pour les composants
export const selectOperationList = (state) => state.operation.operationList;
export const selectCurrentOperation = (state) => state.operation.currentOperation;
export const selectPatientOperations = (state) => state.operation.patientOperations;
export const selectCurrentPatientOperation = (state) => state.operation.currentPatientOperation;
export const selectOperationLoading = (state) => state.operation.loading;
export const selectOperationErrors = (state) => state.operation.errors;
export const selectOperationSuccessMessages = (state) => state.operation.successMessages;

// Export du reducer
export default operationSlice.reducer;
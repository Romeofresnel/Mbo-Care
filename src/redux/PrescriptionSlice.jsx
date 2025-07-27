import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";

// ===== ACTIONS ASYNCHRONES =====

// Ajouter une nouvelle prescription
export const addPrescription = createAsyncThunk(
    'prescription/addPrescription',
    async (data, { rejectWithValue }) => {
        try {
            const response = await Axios.post('/prescription/new', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout de la prescription'
            );
        }
    }
);

// Récupérer toutes les prescriptions
export const getAllPrescriptions = createAsyncThunk(
    'prescription/getAllPrescriptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/prescription/get');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des prescriptions'
            );
        }
    }
);

// Récupérer les prescriptions d'un patient spécifique
export const getPrescriptionsByPatient = createAsyncThunk(
    'prescription/getPrescriptionsByPatient',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/prescription/patient/${patientId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des prescriptions du patient'
            );
        }
    }
);

// Récupérer une prescription spécifique
export const getOnePrescription = createAsyncThunk(
    'prescription/getOnePrescription',
    async (prescriptionId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/prescription/${prescriptionId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la prescription'
            );
        }
    }
);

// Mettre à jour une prescription
export const updatePrescription = createAsyncThunk(
    'prescription/updatePrescription',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await Axios.put(`/prescription/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la mise à jour de la prescription'
            );
        }
    }
);

// Supprimer une prescription
export const deletePrescription = createAsyncThunk(
    'prescription/deletePrescription',
    async (prescriptionId, { rejectWithValue }) => {
        try {
            const response = await Axios.delete(`/prescription/${prescriptionId}`);
            return { id: prescriptionId, message: response.data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression de la prescription'
            );
        }
    }
);

// ===== SLICE =====

const prescriptionSlice = createSlice({
    name: 'prescription',
    initialState: {
        // Données
        currentPrescription: null,
        prescriptionList: [],
        allPrescriptions: [], // Pour stocker toutes les prescriptions (route /get)

        // États de chargement
        loading: {
            add: false,
            getAll: false,
            getByPatient: false,
            getOne: false,
            update: false,
            delete: false
        },

        // Gestion des erreurs
        errors: {
            add: null,
            getAll: null,
            getByPatient: null,
            getOne: null,
            update: null,
            delete: null
        },

        // Messages de succès
        successMessages: {
            add: null,
            update: null,
            delete: null
        },

        // Statut général (pour compatibilité avec l'ancien code)
        statut: "idle"
    },

    reducers: {
        // Nettoyer les erreurs
        clearErrors: (state) => {
            state.errors = {
                add: null,
                getAll: null,
                getByPatient: null,
                getOne: null,
                update: null,
                delete: null
            };
        },

        // Nettoyer les messages de succès
        clearSuccessMessages: (state) => {
            state.successMessages = {
                add: null,
                update: null,
                delete: null
            };
        },

        // Définir la prescription courante
        setCurrentPrescription: (state, action) => {
            state.currentPrescription = action.payload;
        },

        // Réinitialiser le statut
        resetStatus: (state) => {
            state.statut = "idle";
            state.loading = {
                add: false,
                getAll: false,
                getByPatient: false,
                getOne: false,
                update: false,
                delete: false
            };
        },

        // Vider la liste des prescriptions
        clearPrescriptionList: (state) => {
            state.prescriptionList = [];
        },

        // Vider toutes les prescriptions
        clearAllPrescriptions: (state) => {
            state.allPrescriptions = [];
        },

        // Supprimer une prescription de la liste (côté client)
        removePrescriptionFromList: (state, action) => {
            state.prescriptionList = state.prescriptionList.filter(
                prescription => prescription._id !== action.payload
            );
            state.allPrescriptions = state.allPrescriptions.filter(
                prescription => prescription._id !== action.payload
            );
        },

        // Nettoyer une erreur spécifique
        clearSpecificError: (state, action) => {
            if (state.errors[action.payload]) {
                state.errors[action.payload] = null;
            }
        },

        // Nettoyer un message de succès spécifique
        clearSpecificSuccessMessage: (state, action) => {
            if (state.successMessages[action.payload]) {
                state.successMessages[action.payload] = null;
            }
        }
    },

    extraReducers: (builder) => {
        builder
            // ===== AJOUTER UNE PRESCRIPTION =====
            .addCase(addPrescription.pending, (state) => {
                state.loading.add = true;
                state.statut = 'loading';
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addPrescription.fulfilled, (state, action) => {
                state.loading.add = false;
                state.statut = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = action.payload.message || 'Prescription ajoutée avec succès';

                // Extraire la prescription des données de réponse
                const newPrescription = action.payload.prescription?.NewPrescription || action.payload.prescription;
                if (newPrescription) {
                    state.prescriptionList.push(newPrescription);
                    state.allPrescriptions.push(newPrescription);
                }
            })
            .addCase(addPrescription.rejected, (state, action) => {
                state.loading.add = false;
                state.statut = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })

            // ===== RÉCUPÉRER TOUTES LES PRESCRIPTIONS =====
            .addCase(getAllPrescriptions.pending, (state) => {
                state.loading.getAll = true;
                state.statut = 'loading';
                state.errors.getAll = null;
            })
            .addCase(getAllPrescriptions.fulfilled, (state, action) => {
                state.loading.getAll = false;
                state.statut = 'succeeded';
                state.allPrescriptions = action.payload;
                state.errors.getAll = null;
            })
            .addCase(getAllPrescriptions.rejected, (state, action) => {
                state.loading.getAll = false;
                state.statut = 'failed';
                state.errors.getAll = action.payload;
            })

            // ===== RÉCUPÉRER LES PRESCRIPTIONS D'UN PATIENT =====
            .addCase(getPrescriptionsByPatient.pending, (state) => {
                state.loading.getByPatient = true;
                state.statut = 'loading';
                state.errors.getByPatient = null;
            })
            .addCase(getPrescriptionsByPatient.fulfilled, (state, action) => {
                state.loading.getByPatient = false;
                state.statut = 'succeeded';
                state.prescriptionList = action.payload;
                state.errors.getByPatient = null;
            })
            .addCase(getPrescriptionsByPatient.rejected, (state, action) => {
                state.loading.getByPatient = false;
                state.statut = 'failed';
                state.errors.getByPatient = action.payload;
            })

            // ===== RÉCUPÉRER UNE PRESCRIPTION SPÉCIFIQUE =====
            .addCase(getOnePrescription.pending, (state) => {
                state.loading.getOne = true;
                state.statut = 'loading';
                state.errors.getOne = null;
            })
            .addCase(getOnePrescription.fulfilled, (state, action) => {
                state.loading.getOne = false;
                state.statut = 'succeeded';
                state.currentPrescription = action.payload;
                state.errors.getOne = null;
            })
            .addCase(getOnePrescription.rejected, (state, action) => {
                state.loading.getOne = false;
                state.statut = 'failed';
                state.errors.getOne = action.payload;
            })

            // ===== METTRE À JOUR UNE PRESCRIPTION =====
            .addCase(updatePrescription.pending, (state) => {
                state.loading.update = true;
                state.statut = 'loading';
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updatePrescription.fulfilled, (state, action) => {
                state.loading.update = false;
                state.statut = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = 'Prescription mise à jour avec succès';

                // Mettre à jour la prescription dans les listes
                const updatedPrescription = action.payload;
                const updateLists = (list) => {
                    const index = list.findIndex(p => p._id === updatedPrescription._id);
                    if (index !== -1) {
                        list[index] = updatedPrescription;
                    }
                };

                updateLists(state.prescriptionList);
                updateLists(state.allPrescriptions);

                // Mettre à jour la prescription courante si c'est la même
                if (state.currentPrescription?._id === updatedPrescription._id) {
                    state.currentPrescription = updatedPrescription;
                }
            })
            .addCase(updatePrescription.rejected, (state, action) => {
                state.loading.update = false;
                state.statut = 'failed';
                state.errors.update = action.payload;
                state.successMessages.update = null;
            })

            // ===== SUPPRIMER UNE PRESCRIPTION =====
            .addCase(deletePrescription.pending, (state) => {
                state.loading.delete = true;
                state.statut = 'loading';
                state.errors.delete = null;
                state.successMessages.delete = null;
            })
            .addCase(deletePrescription.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.statut = 'succeeded';
                state.errors.delete = null;
                state.successMessages.delete = action.payload.message || 'Prescription supprimée avec succès';

                // Supprimer la prescription des listes
                const deletedId = action.payload.id;
                state.prescriptionList = state.prescriptionList.filter(
                    prescription => prescription._id !== deletedId
                );
                state.allPrescriptions = state.allPrescriptions.filter(
                    prescription => prescription._id !== deletedId
                );

                // Nettoyer la prescription courante si c'est celle supprimée
                if (state.currentPrescription?._id === deletedId) {
                    state.currentPrescription = null;
                }
            })
            .addCase(deletePrescription.rejected, (state, action) => {
                state.loading.delete = false;
                state.statut = 'failed';
                state.errors.delete = action.payload;
                state.successMessages.delete = null;
            });
    }
});

// ===== EXPORT DES ACTIONS =====
export const {
    clearErrors,
    clearSuccessMessages,
    setCurrentPrescription,
    resetStatus,
    clearPrescriptionList,
    clearAllPrescriptions,
    removePrescriptionFromList,
    clearSpecificError,
    clearSpecificSuccessMessage
} = prescriptionSlice.actions;

// ===== SÉLECTEURS =====
export const selectPrescriptionList = (state) => state.prescription.prescriptionList;
export const selectAllPrescriptions = (state) => state.prescription.allPrescriptions;
export const selectCurrentPrescription = (state) => state.prescription.currentPrescription;
export const selectPrescriptionStatus = (state) => state.prescription.statut;
export const selectPrescriptionLoading = (state) => state.prescription.loading;
export const selectPrescriptionErrors = (state) => state.prescription.errors;
export const selectPrescriptionSuccessMessages = (state) => state.prescription.successMessages;

// Sélecteurs spécifiques pour les états de chargement
export const selectIsAddingPrescription = (state) => state.prescription.loading.add;
export const selectIsGettingAllPrescriptions = (state) => state.prescription.loading.getAll;
export const selectIsGettingPrescriptionsByPatient = (state) => state.prescription.loading.getByPatient;
export const selectIsGettingOnePrescription = (state) => state.prescription.loading.getOne;
export const selectIsUpdatingPrescription = (state) => state.prescription.loading.update;
export const selectIsDeletingPrescription = (state) => state.prescription.loading.delete;

export default prescriptionSlice.reducer;
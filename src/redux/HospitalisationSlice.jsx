import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";
// Import des actions du PatientSlice
import { getAllPatient } from "./PatientSlice";

// ====== ACTIONS ASYNCHRONES (THUNKS) ======

/**
 * Ajouter une nouvelle hospitalisation avec mise à jour du patient
 * @param {Object} data - Données de l'hospitalisation (motif, description, patientId, numerochambre, datedebut, datefin)
 */
export const addHospitalisation = createAsyncThunk(
    'hospitalisation/addHospitalisation',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await Axios.post('/hospi/new', data);

            // Si l'hospitalisation est ajoutée avec succès, 
            // rafraîchir la liste des patients pour avoir les statuts à jour
            if (response.data.success) {
                // Dispatch de l'action pour recharger tous les patients
                dispatch(getAllPatient());
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout d\'une hospitalisation'
            );
        }
    }
);

/**
 * Mettre fin à une hospitalisation avec mise à jour du patient
 * @param {string} id - ID de l'hospitalisation
 */
export const endHospitalisation = createAsyncThunk(
    'hospitalisation/endHospitalisation',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await Axios.patch(`/hospi/${id}/fin`);

            // Si la fin d'hospitalisation est réussie,
            // rafraîchir la liste des patients pour avoir les statuts à jour
            if (response.data.success) {
                dispatch(getAllPatient());
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la fin de l\'hospitalisation'
            );
        }
    }
);

/**
 * Récupérer toutes les hospitalisations
 */
export const getAllHospitalisations = createAsyncThunk(
    'hospitalisation/getAllHospitalisations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/hospi/all');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des hospitalisations'
            );
        }
    }
);

/**
 * Récupérer une hospitalisation par son ID
 * @param {string} id - ID de l'hospitalisation
 */
export const getHospitalisationById = createAsyncThunk(
    'hospitalisation/getHospitalisationById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/hospi/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de l\'hospitalisation'
            );
        }
    }
);

/**
 * Modifier une hospitalisation existante
 * @param {Object} payload - {id: string, data: Object}
 */
export const updateHospitalisation = createAsyncThunk(
    'hospitalisation/updateHospitalisation',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await Axios.put(`/hospi/${id}`, data);

            // Si la modification affecte les dates d'hospitalisation,
            // rafraîchir les patients pour les statuts à jour
            if (response.data.success && (data.datedebut || data.datefin)) {
                dispatch(getAllPatient());
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification de l\'hospitalisation'
            );
        }
    }
);

/**
 * Supprimer une hospitalisation
 * @param {string} id - ID de l'hospitalisation
 */
export const deleteHospitalisation = createAsyncThunk(
    'hospitalisation/deleteHospitalisation',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await Axios.delete(`/hospi/${id}`);

            // Après suppression, rafraîchir les patients
            if (response.data.success) {
                dispatch(getAllPatient());
            }

            return { ...response.data, deletedId: id };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression de l\'hospitalisation'
            );
        }
    }
);

/**
 * Récupérer les hospitalisations d'un patient spécifique
 * @param {string} patientId - ID du patient
 */
export const getHospitalisationsByPatient = createAsyncThunk(
    'hospitalisation/getHospitalisationsByPatient',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/patient/${patientId}/hospi`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des hospitalisations du patient'
            );
        }
    }
);

/**
 * Récupérer toutes les hospitalisations actives (en cours)
 */
export const getActiveHospitalisations = createAsyncThunk(
    'hospitalisation/getActiveHospitalisations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/hospi/actives/all');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des hospitalisations actives'
            );
        }
    }
);

/**
 * NOUVELLE ACTION: Récupérer les hospitalisations actives d'un patient spécifique
 * @param {string} patientId - ID du patient
 */
export const getActiveHospitalisationsByPatient = createAsyncThunk(
    'hospitalisation/getActiveHospitalisationsByPatient',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/hospi/actives/${patientId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des hospitalisations actives du patient'
            );
        }
    }
);

// ====== SLICE REDUX ======

const hospitalisationSlice = createSlice({
    name: 'hospitalisation',
    initialState: {
        // Données principales
        currentHospitalisation: null,
        hospitalisationList: [],
        patientHospitalisations: [],
        activeHospitalisations: [],
        activePatientHospitalisations: [], // NOUVEAU: pour les hospitalisations actives d'un patient

        // Gestion des erreurs par action
        errors: {
            get: null,
            add: null,
            update: null,
            delete: null,
            getAll: null,
            getByPatient: null,
            getActive: null,
            getActiveByPatient: null, // NOUVEAU
            end: null
        },

        // Messages de succès par action
        successMessages: {
            add: null,
            update: null,
            delete: null,
            end: null
        },

        // États de chargement par action
        loading: {
            get: false,
            add: false,
            update: false,
            delete: false,
            getAll: false,
            getByPatient: false,
            getActive: false,
            getActiveByPatient: false, // NOUVEAU
            end: false
        },

        // Statut global
        statut: "idle",

        // NOUVELLES DONNÉES: Informations du patient pour les hospitalisations actives
        currentPatientInfo: null,

        // NOUVEAU: Statistiques des hospitalisations
        statistics: {
            totalCount: 0,
            activeCount: 0,
            totalDuration: 0
        }
    },

    reducers: {
        /**
         * Effacer toutes les erreurs
         */
        clearErrors: (state) => {
            state.errors = {
                get: null,
                add: null,
                update: null,
                delete: null,
                getAll: null,
                getByPatient: null,
                getActive: null,
                getActiveByPatient: null,
                end: null
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
                end: null
            };
        },

        /**
         * Effacer une erreur spécifique
         */
        clearSpecificError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        /**
         * Effacer un message de succès spécifique
         */
        clearSpecificSuccess: (state, action) => {
            const { successType } = action.payload;
            if (state.successMessages[successType] !== undefined) {
                state.successMessages[successType] = null;
            }
        },

        /**
         * Réinitialiser l'hospitalisation courante
         */
        clearCurrentHospitalisation: (state) => {
            state.currentHospitalisation = null;
        },

        /**
         * NOUVEAU: Réinitialiser les informations du patient courant
         */
        clearCurrentPatientInfo: (state) => {
            state.currentPatientInfo = null;
        },

        /**
         * NOUVEAU: Mettre à jour les statistiques
         */
        updateStatistics: (state, action) => {
            state.statistics = { ...state.statistics, ...action.payload };
        },

        /**
         * Réinitialiser complètement l'état
         */
        resetHospitalisationState: (state) => {
            return {
                ...hospitalisationSlice.getInitialState()
            };
        }
    },

    extraReducers: (builder) => {
        builder
            // ====== AJOUTER UNE HOSPITALISATION ======
            .addCase(addHospitalisation.pending, (state) => {
                state.loading.add = true;
                state.errors.add = null;
                state.successMessages.add = null;
                state.statut = 'loading';
            })
            .addCase(addHospitalisation.fulfilled, (state, action) => {
                state.loading.add = false;
                state.statut = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = action.payload.message || 'Hospitalisation ajoutée avec succès';

                // Ajouter la nouvelle hospitalisation à la liste si elle existe
                if (action.payload.data) {
                    state.hospitalisationList.unshift(action.payload.data);
                    // Mettre à jour les statistiques
                    state.statistics.totalCount += 1;
                }
            })
            .addCase(addHospitalisation.rejected, (state, action) => {
                state.loading.add = false;
                state.statut = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })

            // ====== RÉCUPÉRER TOUTES LES HOSPITALISATIONS ======
            .addCase(getAllHospitalisations.pending, (state) => {
                state.loading.getAll = true;
                state.errors.getAll = null;
                state.statut = 'loading';
            })
            .addCase(getAllHospitalisations.fulfilled, (state, action) => {
                state.loading.getAll = false;
                state.statut = 'succeeded';
                state.errors.getAll = null;
                state.hospitalisationList = action.payload.data || [];
                // Mettre à jour les statistiques
                state.statistics.totalCount = action.payload.count || 0;
            })
            .addCase(getAllHospitalisations.rejected, (state, action) => {
                state.loading.getAll = false;
                state.statut = 'failed';
                state.errors.getAll = action.payload;
                state.hospitalisationList = [];
            })

            // ====== RÉCUPÉRER UNE HOSPITALISATION PAR ID ======
            .addCase(getHospitalisationById.pending, (state) => {
                state.loading.get = true;
                state.errors.get = null;
                state.statut = 'loading';
            })
            .addCase(getHospitalisationById.fulfilled, (state, action) => {
                state.loading.get = false;
                state.statut = 'succeeded';
                state.errors.get = null;
                state.currentHospitalisation = action.payload.data;
            })
            .addCase(getHospitalisationById.rejected, (state, action) => {
                state.loading.get = false;
                state.statut = 'failed';
                state.errors.get = action.payload;
                state.currentHospitalisation = null;
            })

            // ====== MODIFIER UNE HOSPITALISATION ======
            .addCase(updateHospitalisation.pending, (state) => {
                state.loading.update = true;
                state.errors.update = null;
                state.successMessages.update = null;
                state.statut = 'loading';
            })
            .addCase(updateHospitalisation.fulfilled, (state, action) => {
                state.loading.update = false;
                state.statut = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = action.payload.message || 'Hospitalisation modifiée avec succès';

                // Mettre à jour l'hospitalisation dans la liste
                if (action.payload.data) {
                    const index = state.hospitalisationList.findIndex(
                        h => h._id === action.payload.data._id
                    );
                    if (index !== -1) {
                        state.hospitalisationList[index] = action.payload.data;
                    }

                    // Mettre à jour l'hospitalisation courante si c'est la même
                    if (state.currentHospitalisation &&
                        state.currentHospitalisation._id === action.payload.data._id) {
                        state.currentHospitalisation = action.payload.data;
                    }
                }
            })
            .addCase(updateHospitalisation.rejected, (state, action) => {
                state.loading.update = false;
                state.statut = 'failed';
                state.errors.update = action.payload;
                state.successMessages.update = null;
            })

            // ====== SUPPRIMER UNE HOSPITALISATION ======
            .addCase(deleteHospitalisation.pending, (state) => {
                state.loading.delete = true;
                state.errors.delete = null;
                state.successMessages.delete = null;
                state.statut = 'loading';
            })
            .addCase(deleteHospitalisation.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.statut = 'succeeded';
                state.errors.delete = null;
                state.successMessages.delete = action.payload.message || 'Hospitalisation supprimée avec succès';

                // Supprimer l'hospitalisation de la liste
                const deletedId = action.payload.deletedId;
                if (deletedId) {
                    state.hospitalisationList = state.hospitalisationList.filter(
                        h => h._id !== deletedId
                    );

                    // Mettre à jour les statistiques
                    state.statistics.totalCount = Math.max(0, state.statistics.totalCount - 1);

                    // Effacer l'hospitalisation courante si c'est celle supprimée
                    if (state.currentHospitalisation &&
                        state.currentHospitalisation._id === deletedId) {
                        state.currentHospitalisation = null;
                    }
                }
            })
            .addCase(deleteHospitalisation.rejected, (state, action) => {
                state.loading.delete = false;
                state.statut = 'failed';
                state.errors.delete = action.payload;
                state.successMessages.delete = null;
            })

            // ====== METTRE FIN À UNE HOSPITALISATION ======
            .addCase(endHospitalisation.pending, (state) => {
                state.loading.end = true;
                state.errors.end = null;
                state.successMessages.end = null;
                state.statut = 'loading';
            })
            .addCase(endHospitalisation.fulfilled, (state, action) => {
                state.loading.end = false;
                state.statut = 'succeeded';
                state.errors.end = null;
                state.successMessages.end = action.payload.message || 'Hospitalisation terminée avec succès';

                // Mettre à jour l'hospitalisation dans la liste
                if (action.payload.data) {
                    const index = state.hospitalisationList.findIndex(
                        h => h._id === action.payload.data._id
                    );
                    if (index !== -1) {
                        state.hospitalisationList[index] = action.payload.data;
                    }

                    // Mettre à jour l'hospitalisation courante si c'est la même
                    if (state.currentHospitalisation &&
                        state.currentHospitalisation._id === action.payload.data._id) {
                        state.currentHospitalisation = action.payload.data;
                    }

                    // Retirer des hospitalisations actives
                    state.activeHospitalisations = state.activeHospitalisations.filter(
                        h => h._id !== action.payload.data._id
                    );
                    state.activePatientHospitalisations = state.activePatientHospitalisations.filter(
                        h => h._id !== action.payload.data._id
                    );
                }
            })
            .addCase(endHospitalisation.rejected, (state, action) => {
                state.loading.end = false;
                state.statut = 'failed';
                state.errors.end = action.payload;
                state.successMessages.end = null;
            })

            // ====== RÉCUPÉRER LES HOSPITALISATIONS D'UN PATIENT ======
            .addCase(getHospitalisationsByPatient.pending, (state) => {
                state.loading.getByPatient = true;
                state.errors.getByPatient = null;
                state.statut = 'loading';
            })
            .addCase(getHospitalisationsByPatient.fulfilled, (state, action) => {
                state.loading.getByPatient = false;
                state.statut = 'succeeded';
                state.errors.getByPatient = null;
                state.patientHospitalisations = action.payload.data || [];
            })
            .addCase(getHospitalisationsByPatient.rejected, (state, action) => {
                state.loading.getByPatient = false;
                state.statut = 'failed';
                state.errors.getByPatient = action.payload;
                state.patientHospitalisations = [];
            })

            // ====== RÉCUPÉRER LES HOSPITALISATIONS ACTIVES ======
            .addCase(getActiveHospitalisations.pending, (state) => {
                state.loading.getActive = true;
                state.errors.getActive = null;
                state.statut = 'loading';
            })
            .addCase(getActiveHospitalisations.fulfilled, (state, action) => {
                state.loading.getActive = false;
                state.statut = 'succeeded';
                state.errors.getActive = null;
                state.activeHospitalisations = action.payload.data || [];
                // Mettre à jour les statistiques
                state.statistics.activeCount = action.payload.count || 0;
            })
            .addCase(getActiveHospitalisations.rejected, (state, action) => {
                state.loading.getActive = false;
                state.statut = 'failed';
                state.errors.getActive = action.payload;
                state.activeHospitalisations = [];
            })

            // ====== NOUVEAU: RÉCUPÉRER LES HOSPITALISATIONS ACTIVES D'UN PATIENT ======
            .addCase(getActiveHospitalisationsByPatient.pending, (state) => {
                state.loading.getActiveByPatient = true;
                state.errors.getActiveByPatient = null;
                state.statut = 'loading';
            })
            .addCase(getActiveHospitalisationsByPatient.fulfilled, (state, action) => {
                state.loading.getActiveByPatient = false;
                state.statut = 'succeeded';
                state.errors.getActiveByPatient = null;
                state.activePatientHospitalisations = action.payload.data || [];
                // Sauvegarder les informations du patient
                state.currentPatientInfo = action.payload.patient || null;
            })
            .addCase(getActiveHospitalisationsByPatient.rejected, (state, action) => {
                state.loading.getActiveByPatient = false;
                state.statut = 'failed';
                state.errors.getActiveByPatient = action.payload;
                state.activePatientHospitalisations = [];
                state.currentPatientInfo = null;
            });
    }
});

// ====== SÉLECTEURS UTILES ======

/**
 * Sélecteur pour obtenir les hospitalisations avec durée calculée
 */
export const selectHospitalisationsWithDuration = (state) => {
    return state.hospitalisation.hospitalisationList.map(hospi => {
        const dateDebut = new Date(hospi.datedebut);
        const dateFin = new Date(hospi.datefin);
        const maintenant = new Date();

        // Calculer la durée totale prévue
        const dureeTotale = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));

        // Calculer la durée actuelle (si encore en cours)
        const dureeActuelle = hospi.datefin > maintenant.toISOString()
            ? Math.ceil((maintenant - dateDebut) / (1000 * 60 * 60 * 24))
            : dureeTotale;

        // Calculer les jours restants
        const joursRestants = hospi.datefin > maintenant.toISOString()
            ? Math.ceil((dateFin - maintenant) / (1000 * 60 * 60 * 24))
            : 0;

        return {
            ...hospi,
            dureeTotale,
            dureeActuelle,
            joursRestants,
            estActive: hospi.datefin > maintenant.toISOString() && hospi.datedebut <= maintenant.toISOString()
        };
    });
};

/**
 * Sélecteur pour obtenir les hospitalisations actives avec durée
 */
export const selectActiveHospitalisationsWithDuration = (state) => {
    return state.hospitalisation.activeHospitalisations.map(hospi => {
        const dateDebut = new Date(hospi.datedebut);
        const dateFin = new Date(hospi.datefin);
        const maintenant = new Date();

        const dureeActuelle = Math.ceil((maintenant - dateDebut) / (1000 * 60 * 60 * 24));
        const joursRestants = Math.ceil((dateFin - maintenant) / (1000 * 60 * 60 * 24));

        return {
            ...hospi,
            dureeActuelle,
            joursRestants
        };
    });
};

// ====== EXPORT DES ACTIONS ET REDUCER ======
export const {
    clearErrors,
    clearSuccessMessages,
    clearSpecificError,
    clearSpecificSuccess,
    clearCurrentHospitalisation,
    clearCurrentPatientInfo,
    updateStatistics,
    resetHospitalisationState
} = hospitalisationSlice.actions;
export const selectHospitalisationList = (state) => state.hospitalisation.hospitalisationList;

/**
 * Sélecteur pour obtenir l'état de chargement général
 */
export const selectHospitalisationLoading = (state) => state.hospitalisation.loading;

/**
 * Sélecteur pour obtenir les erreurs
 */
export const selectHospitalisationErrors = (state) => state.hospitalisation.errors;

/**
 * Sélecteur pour obtenir l'état de chargement spécifique à getAllHospitalisations
 */
export const selectHospitalisationLoadingGetAll = (state) => state.hospitalisation.loading.getAll;

export default hospitalisationSlice.reducer;
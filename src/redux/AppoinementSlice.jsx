import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../services/AxiosService';
import axios from 'axios';

// ==================== ACTIONS ASYNCHRONES ====================

/**
 * Créer un nouveau rendez-vous
 */
export const createAppointment = createAsyncThunk(
    'appointments/create',
    async (appointmentData, { rejectWithValue }) => {
        try {
            const response = await Axios.post('/appoinement/new', appointmentData);
            return response.data;
        } catch (error) {
            console.log(error);

            if (error.response) {
                // Erreur de réponse du serveur (4xx, 5xx)
                return rejectWithValue(error.response.data);
            }
            // Erreur de réseau ou timeout
            return rejectWithValue(error);
        }
    }
);

/**
 * Récupérer tous les rendez-vous
 */
export const getAllAppointments = createAsyncThunk(
    'appointments/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/appoinement/getall');
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);

/**
 * Récupérer un rendez-vous par ID
 */
export const getAppointmentById = createAsyncThunk(
    'appointments/getById',
    async (appointmentId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/appoinement/${appointmentId}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);

/**
 * Récupérer tous les rendez-vous d'un médecin
 */
export const getAppointmentsByDoctor = createAsyncThunk(
    'appointments/getByDoctor',
    async (medecinId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/appoinement/doctor/${medecinId}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);

/**
 * Récupérer tous les rendez-vous d'un patient
 */
export const getAppointmentsByPatient = createAsyncThunk(
    'appointments/getByPatient',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/appoinement/patient/${patientId}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);

/**
 * Récupérer les rendez-vous d'aujourd'hui pour un médecin
 */
export const getTodayAppointmentsByDoctor = createAsyncThunk(
    'appointments/getTodayByDoctor',
    async (medecinId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/appoinement/doctor/${medecinId}/today`);
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);

/**
 * Récupérer les statistiques des rendez-vous d'un médecin
 */
export const getDoctorAppointmentStats = createAsyncThunk(
    'appointments/getDoctorStats',
    async (medecinId, { rejectWithValue }) => {
        try {
            const response = await Axios.get(`/appoinement/doctor/${medecinId}/stats`);
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);
/**
 * Mettre à jour un rendez-vous
 */
export const updateAppointment = createAsyncThunk(
    'appointments/update',
    async ({ appointmentId, updateData }, { rejectWithValue }) => {
        try {
            const response = await Axios.put(`/appoinement/${appointmentId}`, updateData);
            return response.data;
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);

/**
 * Terminer un rendez-vous manuellement
 */
export const endAppointment = createAsyncThunk(
    'appointments/end',
    async (appointmentId, { rejectWithValue }) => {
        try {
            // Utiliser Axios au lieu d'axios pour la cohérence avec les autres actions
            const response = await Axios.patch(`/appoinement/${appointmentId}/end`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la finalisation du rendez-vous:', error);

            if (error.response) {
                // Erreur de réponse du serveur (4xx, 5xx)
                return rejectWithValue(error.response.data);
            }
            // Erreur de réseau ou timeout
            return rejectWithValue({
                message: error.message || 'Erreur de connexion lors de la finalisation du rendez-vous'
            });
        }
    }
);


/**
 * Supprimer un rendez-vous
 */
export const deleteAppointment = createAsyncThunk(
    'appointments/delete',
    async (appointmentId, { rejectWithValue }) => {
        try {
            const response = await Axios.delete(`/appoinement/${appointmentId}`);
            return { appointmentId, ...response.data };
        } catch (error) {
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error);
        }
    }
);

// ==================== ÉTAT INITIAL ====================

const initialState = {
    // Données des rendez-vous
    appointments: [],
    currentAppointment: null,
    doctorAppointments: [],
    patientAppointments: [],
    todayAppointments: [],

    // Métadonnées
    totalCount: 0,
    todayDate: null,

    // Statistiques
    stats: {
        'A venir': 0,
        'en cour': 0,
        'terminer': 0,
        total: 0,
    },

    // États de chargement
    loading: {
        create: false,
        getAll: false,
        getById: false,
        getByDoctor: false,
        getByPatient: false,
        getTodayByDoctor: false,
        getStats: false,
        update: false,
        end: false,
        delete: false,
    },

    // États d'erreur
    error: {
        create: null,
        getAll: null,
        getById: null,
        getByDoctor: null,
        getByPatient: null,
        getTodayByDoctor: null,
        getStats: null,
        update: null,
        end: null,
        delete: null,
    },

    // Messages de succès
    successMessage: null,
};

// ==================== SLICE REDUX ====================

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        /**
         * Réinitialiser les messages d'erreur et de succès
         */
        clearMessages: (state) => {
            Object.keys(state.error).forEach(key => {
                state.error[key] = null;
            });
            state.successMessage = null;
        },

        /**
         * Réinitialiser une erreur spécifique
         */
        clearError: (state, action) => {
            const errorType = action.payload;
            if (state.error[errorType] !== undefined) {
                state.error[errorType] = null;
            }
        },

        /**
         * Réinitialiser le rendez-vous courant
         */
        clearCurrentAppointment: (state) => {
            state.currentAppointment = null;
        },

        /**
         * Mettre à jour le statut d'un rendez-vous localement
         */
        updateAppointmentStatus: (state, action) => {
            const { appointmentId, newStatus } = action.payload;

            // Mettre à jour dans la liste principale
            const mainIndex = state.appointments.findIndex(
                app => app._id === appointmentId
            );
            if (mainIndex !== -1) {
                state.appointments[mainIndex].status = newStatus;
            }

            // Mettre à jour dans les rendez-vous du médecin
            const doctorIndex = state.doctorAppointments.findIndex(
                app => app._id === appointmentId
            );
            if (doctorIndex !== -1) {
                state.doctorAppointments[doctorIndex].status = newStatus;
            }

            // Mettre à jour dans les rendez-vous du patient
            const patientIndex = state.patientAppointments.findIndex(
                app => app._id === appointmentId
            );
            if (patientIndex !== -1) {
                state.patientAppointments[patientIndex].status = newStatus;
            }

            // Mettre à jour dans les rendez-vous d'aujourd'hui
            const todayIndex = state.todayAppointments.findIndex(
                app => app._id === appointmentId
            );
            if (todayIndex !== -1) {
                state.todayAppointments[todayIndex].status = newStatus;
            }

            // Mettre à jour le rendez-vous courant
            if (state.currentAppointment && state.currentAppointment._id === appointmentId) {
                state.currentAppointment.status = newStatus;
            }
        },

        /**
         * Filtrer les rendez-vous par statut
         */
        filterAppointmentsByStatus: (state, action) => {
            const status = action.payload;
            if (status === 'all') {
                // Ne pas filtrer, garder tous les rendez-vous
                return;
            }

            state.appointments = state.appointments.filter(
                appointment => appointment.status === status
            );
        },
    },

    extraReducers: (builder) => {
        // ==================== CRÉER UN RENDEZ-VOUS ====================
        builder
            .addCase(createAppointment.pending, (state) => {
                state.loading.create = true;
                state.error.create = null;
            })
            .addCase(createAppointment.fulfilled, (state, action) => {
                state.loading.create = false;
                state.appointments.unshift(action.payload.data);
                state.patientAppointments.unshift(action.payload.data);
                state.successMessage = action.payload.message;
            })
            .addCase(createAppointment.rejected, (state, action) => {
                state.loading.create = false;
                state.error.create = action.payload?.message || 'Erreur lors de la création';
            })

            // ==================== RÉCUPÉRER TOUS LES RENDEZ-VOUS ====================
            .addCase(getAllAppointments.pending, (state) => {
                state.loading.getAll = true;
                state.error.getAll = null;
            })
            .addCase(getAllAppointments.fulfilled, (state, action) => {
                state.loading.getAll = false;
                state.appointments = action.payload.data;
                state.totalCount = action.payload.count;
            })
            .addCase(getAllAppointments.rejected, (state, action) => {
                state.loading.getAll = false;
                state.error.getAll = action.payload?.message || 'Erreur lors de la récupération';
            })

            // ==================== RÉCUPÉRER UN RENDEZ-VOUS PAR ID ====================
            .addCase(getAppointmentById.pending, (state) => {
                state.loading.getById = true;
                state.error.getById = null;
            })
            .addCase(getAppointmentById.fulfilled, (state, action) => {
                state.loading.getById = false;
                state.currentAppointment = action.payload.data;
            })
            .addCase(getAppointmentById.rejected, (state, action) => {
                state.loading.getById = false;
                state.error.getById = action.payload?.message || 'Rendez-vous non trouvé';
            })

            // ==================== RÉCUPÉRER LES RENDEZ-VOUS D'UN MÉDECIN ====================
            .addCase(getAppointmentsByDoctor.pending, (state) => {
                state.loading.getByDoctor = true;
                state.error.getByDoctor = null;
            })
            .addCase(getAppointmentsByDoctor.fulfilled, (state, action) => {
                state.loading.getByDoctor = false;
                state.doctorAppointments = action.payload.data;
            })
            .addCase(getAppointmentsByDoctor.rejected, (state, action) => {
                state.loading.getByDoctor = false;
                state.error.getByDoctor = action.payload?.message || 'Erreur lors de la récupération';
            })

            // ==================== RÉCUPÉRER LES RENDEZ-VOUS D'UN PATIENT ====================
            .addCase(getAppointmentsByPatient.pending, (state) => {
                state.loading.getByPatient = true;
                state.error.getByPatient = null;
            })
            .addCase(getAppointmentsByPatient.fulfilled, (state, action) => {
                state.loading.getByPatient = false;
                state.patientAppointments = action.payload.data;
            })
            .addCase(getAppointmentsByPatient.rejected, (state, action) => {
                state.loading.getByPatient = false;
                state.error.getByPatient = action.payload?.message || 'Erreur lors de la récupération';
            })

            // ==================== RÉCUPÉRER LES RENDEZ-VOUS D'AUJOURD'HUI ====================
            .addCase(getTodayAppointmentsByDoctor.pending, (state) => {
                state.loading.getTodayByDoctor = true;
                state.error.getTodayByDoctor = null;
            })
            .addCase(getTodayAppointmentsByDoctor.fulfilled, (state, action) => {
                state.loading.getTodayByDoctor = false;
                state.todayAppointments = action.payload.data;
                state.todayDate = action.payload.date;
            })
            .addCase(getTodayAppointmentsByDoctor.rejected, (state, action) => {
                state.loading.getTodayByDoctor = false;
                state.error.getTodayByDoctor = action.payload?.message || 'Erreur lors de la récupération';
            })

            // ==================== RÉCUPÉRER LES STATISTIQUES ====================
            .addCase(getDoctorAppointmentStats.pending, (state) => {
                state.loading.getStats = true;
                state.error.getStats = null;
            })
            .addCase(getDoctorAppointmentStats.fulfilled, (state, action) => {
                state.loading.getStats = false;
                state.stats = action.payload.data;
            })
            .addCase(getDoctorAppointmentStats.rejected, (state, action) => {
                state.loading.getStats = false;
                state.error.getStats = action.payload?.message || 'Erreur lors de la récupération des statistiques';
            })

            // ==================== METTRE À JOUR UN RENDEZ-VOUS ====================
            .addCase(updateAppointment.pending, (state) => {
                state.loading.update = true;
                state.error.update = null;
            })
            .addCase(updateAppointment.fulfilled, (state, action) => {
                state.loading.update = false;
                const updatedAppointment = action.payload.data;

                // Mettre à jour dans toutes les listes
                const updateInArray = (array) => {
                    const index = array.findIndex(app => app._id === updatedAppointment._id);
                    if (index !== -1) {
                        array[index] = updatedAppointment;
                    }
                };

                updateInArray(state.appointments);
                updateInArray(state.doctorAppointments);
                updateInArray(state.patientAppointments);
                updateInArray(state.todayAppointments);

                if (state.currentAppointment && state.currentAppointment._id === updatedAppointment._id) {
                    state.currentAppointment = updatedAppointment;
                }

                state.successMessage = action.payload.message;
            })
            .addCase(updateAppointment.rejected, (state, action) => {
                state.loading.update = false;
                state.error.update = action.payload?.message || 'Erreur lors de la mise à jour';
            })

            // ==================== TERMINER UN RENDEZ-VOUS ====================
            .addCase(endAppointment.pending, (state) => {
                state.loading.end = true;
                state.error.end = null;
            })
            .addCase(endAppointment.fulfilled, (state, action) => {
                state.loading.end = false;
                const endedAppointment = action.payload.data;

                // Mettre à jour le statut dans toutes les listes
                const updateStatusInArray = (array) => {
                    const index = array.findIndex(app => app._id === endedAppointment._id);
                    if (index !== -1) {
                        array[index].status = 'terminer';
                    }
                };

                updateStatusInArray(state.appointments);
                updateStatusInArray(state.doctorAppointments);
                updateStatusInArray(state.patientAppointments);
                updateStatusInArray(state.todayAppointments);

                if (state.currentAppointment && state.currentAppointment._id === endedAppointment._id) {
                    state.currentAppointment.status = 'terminer';
                }

                state.successMessage = action.payload.message;
            })
            .addCase(endAppointment.rejected, (state, action) => {
                state.loading.end = false;
                state.error.end = action.payload?.message || 'Erreur lors de la finalisation';
            })

            // ==================== SUPPRIMER UN RENDEZ-VOUS ====================
            .addCase(deleteAppointment.pending, (state) => {
                state.loading.delete = true;
                state.error.delete = null;
            })
            .addCase(deleteAppointment.fulfilled, (state, action) => {
                state.loading.delete = false;
                const deletedId = action.payload.appointmentId;

                // Supprimer de toutes les listes
                state.appointments = state.appointments.filter(app => app._id !== deletedId);
                state.doctorAppointments = state.doctorAppointments.filter(app => app._id !== deletedId);
                state.patientAppointments = state.patientAppointments.filter(app => app._id !== deletedId);
                state.todayAppointments = state.todayAppointments.filter(app => app._id !== deletedId);

                if (state.currentAppointment && state.currentAppointment._id === deletedId) {
                    state.currentAppointment = null;
                }

                state.successMessage = action.payload.message;
                state.totalCount = Math.max(0, state.totalCount - 1);
            })
            .addCase(deleteAppointment.rejected, (state, action) => {
                state.loading.delete = false;
                state.error.delete = action.payload?.message || 'Erreur lors de la suppression';
            });
    },
});

// ==================== ACTIONS ET SÉLECTEURS ====================

// Actions
export const {
    clearMessages,
    clearError,
    clearCurrentAppointment,
    updateAppointmentStatus,
    filterAppointmentsByStatus,
} = appointmentSlice.actions;

// Sélecteurs
export const selectAppointments = (state) => state.appointments.appointments;
export const selectCurrentAppointment = (state) => state.appointments.currentAppointment;
export const selectDoctorAppointments = (state) => state.appointments.doctorAppointments;
export const selectPatientAppointments = (state) => state.appointments.patientAppointments;
export const selectTodayAppointments = (state) => state.appointments.todayAppointments;
export const selectAppointmentStats = (state) => state.appointments.stats;
export const selectAppointmentLoading = (state) => state.appointments.loading;
export const selectAppointmentErrors = (state) => state.appointments.error;
export const selectSuccessMessage = (state) => state.appointments.successMessage;
export const selectTotalCount = (state) => state.appointments.totalCount;
export const selectTodayDate = (state) => state.appointments.todayDate;

// Sélecteurs avancés
export const selectAppointmentsByStatus = (status) => (state) =>
    state.appointments.appointments.filter(appointment => appointment.status === status);

export const selectIsLoading = (state) =>
    Object.values(state.appointments.loading).some(loading => loading);

export const selectHasErrors = (state) =>
    Object.values(state.appointments.error).some(error => error !== null);

// Export du reducer
export default appointmentSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";

/**
 * Action asynchrone pour ajouter une nouvelle consultation
 * @param {Object} data - Données de la consultation (label, diagnostic, medecin, IdPatient)
 */
export const addConsultation = createAsyncThunk(
    'consultation/addConsultation',
    async (data, { rejectWithValue }) => {
        try {
            const response = await Axios.post('/consulte/new', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout de la consultation'
            );
        }
    }
);

/**
 * Action asynchrone pour modifier une consultation existante
 * @param {Object} params - Contient l'id de la consultation et les nouvelles données
 */
export const updateConsultation = createAsyncThunk(
    'consultation/updateConsultation',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await Axios.put(`/consulte/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification de la consultation'
            );
        }
    }
);

/**
 * Action asynchrone pour récupérer toutes les consultations d'un patient
 * @param {string} patientId - ID du patient
 */
export const getAllConsultationByPatient = createAsyncThunk(
    'consultation/getAllConsultationByPatient',
    async (patientId, { rejectWithValue }) => {
        try {
            // Validation de l'ID patient
            if (!patientId || patientId.trim() === '') {
                throw new Error('L\'ID du patient est requis et ne peut pas être vide');
            }

            console.log('Récupération des consultations pour le patient:', patientId);

            const response = await Axios.get(`/consulte/get/patient/${patientId}`);

            console.log('Réponse complète:', response.data);

            // Gestion flexible de la structure de réponse
            let consultations = [];
            let count = 0;

            if (response.data) {
                // Cas 1: Structure { data: [...], count: X }
                if (response.data.data && Array.isArray(response.data.data)) {
                    consultations = response.data.data;
                    count = response.data.count || response.data.data.length;
                }
                // Cas 2: Structure { consultations: [...], count: X }
                else if (response.data.consultations && Array.isArray(response.data.consultations)) {
                    consultations = response.data.consultations;
                    count = response.data.count || response.data.consultations.length;
                }
                // Cas 3: Tableau direct dans response.data
                else if (Array.isArray(response.data)) {
                    consultations = response.data;
                    count = response.data.length;
                }
                // Cas 4: Structure imbriquée plus complexe
                else if (response.data.data && response.data.data.consultations) {
                    consultations = response.data.data.consultations;
                    count = response.data.data.count || response.data.data.consultations.length;
                }
            }

            console.log('Consultations extraites:', consultations);
            console.log('Nombre de consultations:', count);

            return {
                consultations: Array.isArray(consultations) ? consultations : [],
                count: count || 0,
                patientId: patientId,
                message: response.data?.message || 'Consultations récupérées avec succès'
            };

        } catch (error) {
            console.error('Erreur lors de la récupération des consultations:', error);

            // Gestion détaillée des erreurs
            let errorMessage = 'Erreur lors de la récupération des consultations';

            if (error.response) {
                // Erreur de réponse HTTP
                errorMessage = error.response.data?.message ||
                    `Erreur ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                // Erreur de réseau
                errorMessage = 'Erreur de réseau: impossible de contacter le serveur';
            } else {
                // Autres erreurs
                errorMessage = error.message || errorMessage;
            }

            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Action asynchrone pour récupérer toutes les consultations (tous patients)
 */
export const getAllConsultations = createAsyncThunk(
    'consultation/getAllConsultations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/consulte/get');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de toutes les consultations'
            );
        }
    }
);

/**
 * Action asynchrone pour supprimer une consultation
 * @param {string} consultationId - ID de la consultation à supprimer
 */
export const deleteConsultation = createAsyncThunk(
    'consultation/deleteConsultation',
    async (consultationId, { rejectWithValue }) => {
        try {
            await Axios.delete(`/consulte/${consultationId}`);
            return consultationId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression de la consultation'
            );
        }
    }
);

const consultationSlice = createSlice({
    name: 'consultation',
    initialState: {
        // Consultation actuellement en cours d'édition
        currentConsultation: null,
        // Liste de toutes les consultations du patient actuel
        consultationListPatient: [],
        // Liste de toutes les consultations (tous patients)
        consultationList: [],
        // ID du patient actuellement consulté
        currentPatientId: null,
        // Nombre de consultations trouvées
        consultationCount: 0,
        // Mode d'édition (true = modification, false = ajout)
        isEditMode: false,
        // États de chargement pour chaque opération
        loading: {
            add: false,
            update: false,
            getAllByPatient: false,
            getAll: false,
            delete: false
        },
        // Messages d'erreur pour chaque opération
        errors: {
            add: null,
            update: null,
            getAllByPatient: null,
            getAll: null,
            delete: null
        },
        // Messages de succès pour chaque opération
        successMessages: {
            add: null,
            update: null,
            delete: null
        },
        // Statut général
        statut: "idle"
    },
    reducers: {
        /**
         * Nettoie tous les messages d'erreur
         */
        clearErrors: (state) => {
            state.errors = {
                add: null,
                update: null,
                getAllByPatient: null,
                getAll: null,
                delete: null
            };
        },

        /**
         * Nettoie tous les messages de succès
         */
        clearSuccessMessages: (state) => {
            state.successMessages = {
                add: null,
                update: null,
                delete: null
            };
        },

        /**
         * Définit la consultation courante pour l'édition
         * @param {Object} action.payload - Données de la consultation
         */
        setCurrentConsultation: (state, action) => {
            state.currentConsultation = action.payload;
            state.isEditMode = !!action.payload;
        },

        /**
         * Réinitialise la consultation courante et sort du mode édition
         */
        resetCurrentConsultation: (state) => {
            state.currentConsultation = null;
            state.isEditMode = false;
        },

        /**
         * Définit l'ID du patient actuellement consulté
         */
        setCurrentPatientId: (state, action) => {
            state.currentPatientId = action.payload;
        },

        /**
         * Réinitialise le statut à "idle"
         */
        resetStatut: (state) => {
            state.statut = "idle";
        },

        /**
         * Vide la liste des consultations du patient
         */
        clearConsultationListPatient: (state) => {
            state.consultationListPatient = [];
            state.consultationCount = 0;
            state.currentPatientId = null;
        },

        /**
         * Vide la liste de toutes les consultations
         */
        clearConsultationList: (state) => {
            state.consultationList = [];
        },

        /**
         * Met à jour une consultation dans les listes locales
         */
        updateConsultationInList: (state, action) => {
            const { id, updatedData } = action.payload;

            // Mise à jour dans consultationListPatient
            const indexPatient = state.consultationListPatient.findIndex(
                consultation => consultation._id === id
            );
            if (indexPatient !== -1) {
                state.consultationListPatient[indexPatient] = {
                    ...state.consultationListPatient[indexPatient],
                    ...updatedData
                };
            }

            // Mise à jour dans consultationList (toutes les consultations)
            const indexAll = state.consultationList.findIndex(
                consultation => consultation._id === id
            );
            if (indexAll !== -1) {
                state.consultationList[indexAll] = {
                    ...state.consultationList[indexAll],
                    ...updatedData
                };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // ===== AJOUTER UNE CONSULTATION =====
            .addCase(addConsultation.pending, (state) => {
                state.statut = 'loading';
                state.loading.add = true;
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addConsultation.fulfilled, (state, action) => {
                state.statut = 'succeeded';
                state.loading.add = false;
                state.errors.add = null;
                state.successMessages.add = 'Consultation ajoutée avec succès';

                // Extraire la consultation selon la structure de réponse du backend
                const newConsultation = action.payload.consultation?.NewConsultation ||
                    action.payload.consultation ||
                    action.payload.data ||
                    action.payload;

                if (newConsultation) {
                    // Ajouter à la liste du patient si c'est le bon patient
                    if (!state.currentPatientId || newConsultation.IdPatient === state.currentPatientId) {
                        state.consultationListPatient.unshift(newConsultation);
                        state.consultationCount = state.consultationListPatient.length;
                    }

                    // Ajouter à la liste générale
                    if (!Array.isArray(state.consultationList)) {
                        state.consultationList = [];
                    }
                    state.consultationList.unshift(newConsultation);

                    // Définir comme consultation courante
                    state.currentConsultation = newConsultation;
                    state.isEditMode = true;
                }
            })
            .addCase(addConsultation.rejected, (state, action) => {
                state.statut = 'failed';
                state.loading.add = false;
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })

            // ===== MODIFIER UNE CONSULTATION =====
            .addCase(updateConsultation.pending, (state) => {
                state.statut = 'loading';
                state.loading.update = true;
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updateConsultation.fulfilled, (state, action) => {
                state.loading.update = false;
                state.statut = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = 'Consultation modifiée avec succès';

                const updatedConsultation = action.payload;

                if (updatedConsultation && updatedConsultation._id) {
                    // Mettre à jour dans consultationListPatient
                    const indexPatient = state.consultationListPatient.findIndex(
                        consultation => consultation._id === updatedConsultation._id
                    );
                    if (indexPatient !== -1) {
                        state.consultationListPatient[indexPatient] = updatedConsultation;
                    }

                    // Mettre à jour dans consultationList
                    const indexAll = state.consultationList.findIndex(
                        consultation => consultation._id === updatedConsultation._id
                    );
                    if (indexAll !== -1) {
                        state.consultationList[indexAll] = updatedConsultation;
                    }

                    // Mettre à jour la consultation courante
                    state.currentConsultation = updatedConsultation;
                }
            })
            .addCase(updateConsultation.rejected, (state, action) => {
                state.statut = 'failed';
                state.loading.update = false;
                state.errors.update = action.payload;
                state.successMessages.update = null;
            })

            // ===== RÉCUPÉRER TOUTES LES CONSULTATIONS D'UN PATIENT =====
            .addCase(getAllConsultationByPatient.pending, (state) => {
                state.statut = 'loading';
                state.loading.getAllByPatient = true;
                state.errors.getAllByPatient = null;
            })
            .addCase(getAllConsultationByPatient.fulfilled, (state, action) => {
                state.loading.getAllByPatient = false;
                state.errors.getAllByPatient = null;
                state.statut = 'succeeded';

                const { consultations, count, patientId, message } = action.payload;

                // Validation des données reçues
                if (Array.isArray(consultations)) {
                    state.consultationListPatient = consultations;
                    state.consultationCount = count || consultations.length;

                    // Mettre à jour l'ID du patient actuel si fourni
                    if (patientId) {
                        state.currentPatientId = patientId;
                    }
                } else {
                    console.warn('Format inattendu pour les consultations:', consultations);
                    state.consultationListPatient = [];
                    state.consultationCount = 0;
                }

                // Log du message pour debug
                if (message) {
                    console.log('Message du serveur:', message);
                }
            })
            .addCase(getAllConsultationByPatient.rejected, (state, action) => {
                state.loading.getAllByPatient = false;
                state.errors.getAllByPatient = action.payload;
                state.statut = 'failed';
                state.consultationListPatient = [];
                state.consultationCount = 0;
            })

            // ===== RÉCUPÉRER TOUTES LES CONSULTATIONS =====
            .addCase(getAllConsultations.pending, (state) => {
                state.statut = 'loading';
                state.loading.getAll = true;
                state.errors.getAll = null;
            })
            .addCase(getAllConsultations.fulfilled, (state, action) => {
                state.loading.getAll = false;
                state.errors.getAll = null;
                state.statut = 'succeeded';
                state.consultationList = action.payload;
            })
            .addCase(getAllConsultations.rejected, (state, action) => {
                state.loading.getAll = false;
                state.errors.getAll = action.payload;
                state.statut = 'failed';
                state.consultationList = [];
            })

            // ===== SUPPRIMER UNE CONSULTATION =====
            .addCase(deleteConsultation.pending, (state) => {
                state.loading.delete = true;
                state.errors.delete = null;
                state.successMessages.delete = null;
            })
            .addCase(deleteConsultation.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.errors.delete = null;
                state.successMessages.delete = 'Consultation supprimée avec succès';

                const deletedId = action.payload;

                // Retirer de consultationListPatient
                state.consultationListPatient = state.consultationListPatient.filter(
                    consultation => consultation._id !== deletedId
                );
                state.consultationCount = state.consultationListPatient.length;

                // Retirer de consultationList
                state.consultationList = state.consultationList.filter(
                    consultation => consultation._id !== deletedId
                );

                // Si c'était la consultation courante, la réinitialiser
                if (state.currentConsultation?._id === deletedId) {
                    state.currentConsultation = null;
                    state.isEditMode = false;
                }
            })
            .addCase(deleteConsultation.rejected, (state, action) => {
                state.loading.delete = false;
                state.errors.delete = action.payload;
                state.successMessages.delete = null;
            });
    }
});

// Export des actions
export const {
    clearErrors,
    clearSuccessMessages,
    setCurrentConsultation,
    resetCurrentConsultation,
    setCurrentPatientId,
    resetStatut,
    clearConsultationListPatient,
    clearConsultationList,
    updateConsultationInList
} = consultationSlice.actions;
export const selectConsultationList = (state) => state.consultation.consultationList;
export const selectConsultationListPatient = (state) => state.consultation.consultationListPatient;
export const selectConsultationCount = (state) => state.consultation.consultationCount;
export const selectCurrentPatientId = (state) => state.consultation.currentPatientId;
export const selectCurrentConsultation = (state) => state.consultation.currentConsultation;
export const selectIsEditMode = (state) => state.consultation.isEditMode;
export const selectStatut = (state) => state.consultation.statut;

// Sélecteurs pour les états de chargement
export const selectConsultationLoadingAdd = (state) => state.consultation.loading.add;
export const selectConsultationLoadingUpdate = (state) => state.consultation.loading.update;
export const selectConsultationLoadingGetAllByPatient = (state) => state.consultation.loading.getAllByPatient;
export const selectConsultationLoadingGetAll = (state) => state.consultation.loading.getAll;
export const selectConsultationLoadingDelete = (state) => state.consultation.loading.delete;

// Sélecteurs pour les erreurs
export const selectConsultationErrorAdd = (state) => state.consultation.errors.add;
export const selectConsultationErrorUpdate = (state) => state.consultation.errors.update;
export const selectConsultationErrorGetAllByPatient = (state) => state.consultation.errors.getAllByPatient;
export const selectConsultationErrorGetAll = (state) => state.consultation.errors.getAll;
export const selectConsultationErrorDelete = (state) => state.consultation.errors.delete;

// Sélecteurs pour les messages de succès
export const selectConsultationSuccessAdd = (state) => state.consultation.successMessages.add;
export const selectConsultationSuccessUpdate = (state) => state.consultation.successMessages.update;
export const selectConsultationSuccessDelete = (state) => state.consultation.successMessages.delete;

export default consultationSlice.reducer;
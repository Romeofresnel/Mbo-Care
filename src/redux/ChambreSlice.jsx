import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Axios from "../services/AxiosService";

// ==================== ACTIONS ASYNCHRONES ====================

// Action pour récupérer toutes les chambres enregistrées
export const getAllChambres = createAsyncThunk(
    'chambre/getAllChambres',
    async (_, { rejectWithValue }) => {
        try {
            const response = await Axios.get('/chambre/all');
            // Vérifier que la réponse contient bien des données
            return response.data?.data || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la liste des chambres'
            );
        }
    }
);

// Action pour récupérer une chambre par son ID
export const getChambreById = createAsyncThunk(
    'chambre/getChambreById',
    async (chambreId, { rejectWithValue }) => {
        try {
            if (!chambreId) {
                return rejectWithValue('ID de la chambre manquant');
            }

            const response = await Axios.get(`/chambre/${chambreId}`);
            return response.data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération de la chambre'
            );
        }
    }
);

// Action pour ajouter une nouvelle chambre
export const addChambre = createAsyncThunk(
    'chambre/addChambre',
    async (chambreData, { rejectWithValue }) => {
        try {
            // Validation côté client avant envoi
            if (!chambreData.numerochambre || !chambreData.serviceId) {
                return rejectWithValue('Le numéro de chambre et l\'ID du service sont obligatoires');
            }

            // Validation du format du numéro de chambre
            if (typeof chambreData.numerochambre !== 'string' || chambreData.numerochambre.trim().length < 1) {
                return rejectWithValue('Le numéro de chambre doit être une chaîne non vide');
            }

            // Validation de l'ID du service
            if (!chambreData.serviceId.trim()) {
                return rejectWithValue('L\'ID du service ne peut pas être vide');
            }

            const response = await Axios.post('/chambre/new', chambreData);
            return response.data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'ajout de la chambre'
            );
        }
    }
);

// Action pour modifier une chambre existante
export const updateChambre = createAsyncThunk(
    'chambre/updateChambre',
    async ({ chambreId, chambreData }, { rejectWithValue }) => {
        try {
            if (!chambreId) {
                return rejectWithValue('ID de la chambre manquant');
            }

            // Validation côté client des données de modification
            if (chambreData.numerochambre && typeof chambreData.numerochambre !== 'string') {
                return rejectWithValue('Le numéro de chambre doit être une chaîne');
            }

            if (chambreData.numerochambre && chambreData.numerochambre.trim().length < 1) {
                return rejectWithValue('Le numéro de chambre ne peut pas être vide');
            }

            if (chambreData.serviceId && !chambreData.serviceId.trim()) {
                return rejectWithValue('L\'ID du service ne peut pas être vide');
            }

            const response = await Axios.put(`/chambre/${chambreId}`, chambreData);
            return response.data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la modification de la chambre'
            );
        }
    }
);

// Action pour supprimer une chambre
export const deleteChambre = createAsyncThunk(
    'chambre/deleteChambre',
    async (chambreId, { rejectWithValue }) => {
        try {
            if (!chambreId) {
                return rejectWithValue('ID de la chambre manquant');
            }

            const response = await Axios.delete(`/chambre/${chambreId}`);
            return { chambreId, message: response.data?.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression de la chambre'
            );
        }
    }
);

// ==================== SLICE PRINCIPAL ====================

const chambreSlice = createSlice({
    name: "chambre",
    initialState: {
        // Informations d'une chambre spécifique
        currentChambre: null,
        // Liste de toutes les chambres - Initialisation avec un tableau vide pour éviter undefined
        chambresList: [],
        // Chambre unique récupérée par ID
        chambreOneList: null,
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
        // Définir la chambre actuelle
        setCurrentChambre: (state, action) => {
            state.currentChambre = action.payload;
        },
        // Réinitialiser le statut de chargement
        resetStatus: (state) => {
            state.status = "idle";
        },
        // Vider la liste des chambres
        clearChambresList: (state) => {
            state.chambresList = [];
        },
        // Supprimer une chambre de la liste (pour la suppression optimiste)
        removeChambreFromList: (state, action) => {
            state.chambresList = state.chambresList.filter(
                chambre => chambre._id !== action.payload
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
            // ==================== RÉCUPÉRATION DE LA LISTE DES CHAMBRES ====================
            .addCase(getAllChambres.pending, (state) => {
                state.status = 'loading';
                state.errors.getAll = null;
            })
            .addCase(getAllChambres.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // S'assurer que chambresList est toujours un tableau
                state.chambresList = Array.isArray(action.payload) ? action.payload : [];
                state.errors.getAll = null;
            })
            .addCase(getAllChambres.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getAll = action.payload;
                // Garder la liste existante en cas d'erreur
                state.chambresList = state.chambresList || [];
            })
            // ==================== RÉCUPÉRATION D'UNE CHAMBRE PAR ID ====================
            .addCase(getChambreById.pending, (state) => {
                state.status = 'loading';
                state.errors.getById = null;
            })
            .addCase(getChambreById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.chambreOneList = action.payload;
                state.currentChambre = action.payload;
                state.errors.getById = null;
            })
            .addCase(getChambreById.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.getById = action.payload;
                state.chambreOneList = null;
            })
            // ==================== AJOUT D'UNE NOUVELLE CHAMBRE ====================
            .addCase(addChambre.pending, (state) => {
                state.status = 'loading';
                state.errors.add = null;
                state.successMessages.add = null;
            })
            .addCase(addChambre.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.add = null;
                state.successMessages.add = 'Chambre ajoutée avec succès';

                // Ajouter la nouvelle chambre à la liste seulement si elle existe
                if (action.payload && action.payload._id) {
                    const newChambre = action.payload;

                    // Vérifier que la chambre n'existe pas déjà dans la liste
                    const existingChambre = state.chambresList.find(
                        chambre => chambre._id === newChambre._id
                    );

                    if (!existingChambre) {
                        state.chambresList.push(newChambre);
                    }
                }
            })
            .addCase(addChambre.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.add = action.payload;
                state.successMessages.add = null;
            })
            // ==================== MODIFICATION D'UNE CHAMBRE EXISTANTE ====================
            .addCase(updateChambre.pending, (state) => {
                state.status = 'loading';
                state.errors.update = null;
                state.successMessages.update = null;
            })
            .addCase(updateChambre.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.update = null;
                state.successMessages.update = 'Chambre modifiée avec succès';

                // Mettre à jour la chambre dans la liste
                const updatedChambre = action.payload;
                if (updatedChambre && updatedChambre._id) {
                    const index = state.chambresList.findIndex(
                        chambre => chambre._id === updatedChambre._id
                    );

                    if (index !== -1) {
                        state.chambresList[index] = updatedChambre;
                    }

                    // Mettre à jour la chambre actuelle si elle correspond
                    if (state.currentChambre && state.currentChambre._id === updatedChambre._id) {
                        state.currentChambre = updatedChambre;
                    }

                    // Mettre à jour chambreOneList si elle correspond
                    if (state.chambreOneList && state.chambreOneList._id === updatedChambre._id) {
                        state.chambreOneList = updatedChambre;
                    }
                }
            })
            .addCase(updateChambre.rejected, (state, action) => {
                state.status = 'failed';
                state.errors.update = action.payload;
                state.successMessages.update = null;
            })
            // ==================== SUPPRESSION D'UNE CHAMBRE ====================
            .addCase(deleteChambre.pending, (state) => {
                state.status = 'loading';
                state.errors.delete = null;
                state.successMessages.delete = null;
            })
            .addCase(deleteChambre.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.errors.delete = null;
                state.successMessages.delete = 'Chambre supprimée avec succès';

                // Supprimer la chambre de la liste
                const { chambreId } = action.payload;
                if (chambreId) {
                    state.chambresList = state.chambresList.filter(
                        chambre => chambre._id !== chambreId
                    );

                    // Nettoyer les références à la chambre supprimée
                    if (state.currentChambre && state.currentChambre._id === chambreId) {
                        state.currentChambre = null;
                    }

                    if (state.chambreOneList && state.chambreOneList._id === chambreId) {
                        state.chambreOneList = null;
                    }
                }
            })
            .addCase(deleteChambre.rejected, (state, action) => {
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
    setCurrentChambre,
    resetStatus,
    clearChambresList,
    removeChambreFromList,
    clearAddError,
    clearAddSuccess,
    clearUpdateError,
    clearUpdateSuccess,
    clearDeleteError,
    clearDeleteSuccess
} = chambreSlice.actions;

// ==================== SÉLECTEURS AVEC VALEURS PAR DÉFAUT ====================

// Sélecteurs principaux
export const selectChambresList = (state) => state.chambre?.chambresList || [];
export const selectCurrentChambre = (state) => state.chambre?.currentChambre || null;
export const selectChambreOneList = (state) => state.chambre?.chambreOneList || null;
export const selectChambreStatus = (state) => state.chambre?.status || 'idle';
export const selectChambreErrors = (state) => state.chambre?.errors || {};
export const selectChambreSuccessMessages = (state) => state.chambre?.successMessages || {};

// Sélecteurs spécialisés pour les erreurs et succès d'ajout
export const selectAddChambreError = (state) => state.chambre?.errors?.add || null;
export const selectAddChambreSuccess = (state) => state.chambre?.successMessages?.add || null;
export const selectAddChambreStatus = (state) => {
    const status = state.chambre?.status;
    const hasAddError = state.chambre?.errors?.add;
    const hasAddSuccess = state.chambre?.successMessages?.add;

    if (hasAddError) return 'error';
    if (hasAddSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de modification
export const selectUpdateChambreError = (state) => state.chambre?.errors?.update || null;
export const selectUpdateChambreSuccess = (state) => state.chambre?.successMessages?.update || null;
export const selectUpdateChambreStatus = (state) => {
    const status = state.chambre?.status;
    const hasUpdateError = state.chambre?.errors?.update;
    const hasUpdateSuccess = state.chambre?.successMessages?.update;

    if (hasUpdateError) return 'error';
    if (hasUpdateSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour les erreurs et succès de suppression
export const selectDeleteChambreError = (state) => state.chambre?.errors?.delete || null;
export const selectDeleteChambreSuccess = (state) => state.chambre?.successMessages?.delete || null;
export const selectDeleteChambreStatus = (state) => {
    const status = state.chambre?.status;
    const hasDeleteError = state.chambre?.errors?.delete;
    const hasDeleteSuccess = state.chambre?.successMessages?.delete;

    if (hasDeleteError) return 'error';
    if (hasDeleteSuccess) return 'success';
    return status;
};

// Sélecteurs spécialisés pour la récupération par ID
export const selectGetChambreByIdError = (state) => state.chambre?.errors?.getById || null;
export const selectGetChambreByIdStatus = (state) => {
    const status = state.chambre?.status;
    const hasError = state.chambre?.errors?.getById;

    if (hasError) return 'error';
    return status;
};

// Sélecteurs spécialisés pour la récupération de toutes les chambres
export const selectGetAllChambresError = (state) => state.chambre?.errors?.getAll || null;
export const selectGetAllChambresStatus = (state) => {
    const status = state.chambre?.status;
    const hasError = state.chambre?.errors?.getAll;

    if (hasError) return 'error';
    return status;
};

// Sélecteurs utilitaires
export const selectChambreByNumeroChambre = (numerochambre) => (state) => {
    const chambres = state.chambre?.chambresList || [];
    return chambres.find(chambre => chambre.numerochambre === numerochambre) || null;
};

export const selectChambresByServiceId = (serviceId) => (state) => {
    const chambres = state.chambre?.chambresList || [];
    return chambres.filter(chambre => chambre.serviceId === serviceId) || [];
};

export const selectChambresCount = (state) => {
    const chambres = state.chambre?.chambresList || [];
    return chambres.length;
};

export const selectChambresCountByService = (serviceId) => (state) => {
    const chambres = state.chambre?.chambresList || [];
    return chambres.filter(chambre => chambre.serviceId === serviceId).length;
};

export const selectAvailableChambres = (state) => {
    const chambres = state.chambre?.chambresList || [];
    // Supposons qu'il y ait un champ 'disponible' ou 'statut' pour filtrer
    return chambres.filter(chambre => chambre.disponible !== false) || [];
};

export const selectIsChambreLoading = (state) => {
    return state.chambre?.status === 'loading';
};

export const selectHasChambreError = (state) => {
    const errors = state.chambre?.errors || {};
    return Object.values(errors).some(error => error !== null);
};

export const selectHasChambreSuccess = (state) => {
    const successMessages = state.chambre?.successMessages || {};
    return Object.values(successMessages).some(message => message !== null);
};

// Sélecteur pour obtenir les numéros de chambres existants (utile pour la validation)
export const selectExistingChambreNumbers = (state) => {
    const chambres = state.chambre?.chambresList || [];
    return chambres.map(chambre => chambre.numerochambre);
};

// Sélecteur pour vérifier si un numéro de chambre existe déjà
export const selectIsChambreNumberExists = (numerochambre) => (state) => {
    const chambres = state.chambre?.chambresList || [];
    return chambres.some(chambre => chambre.numerochambre === numerochambre);
};

// Export du reducer
export default chambreSlice.reducer;
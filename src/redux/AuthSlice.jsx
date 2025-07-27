import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../services/AxiosService';

// Action asynchrone pour récupérer les informations du médecin
export const medecinInfo = createAsyncThunk(
    'medecin/medecinInfo',
    async (uid, { rejectWithValue }) => {
        try {
            // Vérification que l'uid existe avant de faire la requête
            if (!uid) {
                return rejectWithValue('UID manquant pour récupérer les informations du médecin');
            }

            const response = await Axios.get(`/medecin/${uid}`);

            // Vérification que la réponse contient des données
            if (!response.data) {
                return rejectWithValue('Aucune donnée reçue du serveur');
            }

            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des informations du médecin:', error);
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la récupération des informations du médecin'
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        // Initialisation avec un objet vide au lieu d'un tableau pour éviter les erreurs d'accès aux propriétés
        medecinInfo: {},
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        isAuthenticated: false, // Ajout d'un flag d'authentification
    },
    reducers: {
        // Action pour réinitialiser l'état
        resetAuthState: (state) => {
            state.medecinInfo = {};
            state.status = 'idle';
            state.error = null;
            state.isAuthenticated = false;
        },
        // Action pour nettoyer les erreurs
        clearError: (state) => {
            state.error = null;
        },
        // Action pour définir l'état d'authentification
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        // Action pour pré-charger les informations du médecin (optionnel)
        setMedecinInfo: (state, action) => {
            state.medecinInfo = action.payload;
            state.status = 'succeeded';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(medecinInfo.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(medecinInfo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // S'assurer que les données sont un objet et non un tableau
                state.medecinInfo = action.payload || {};
                state.error = null;
                state.isAuthenticated = true;
            })
            .addCase(medecinInfo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Erreur inconnue';
                // Ne pas réinitialiser medecinInfo en cas d'erreur pour éviter les erreurs d'affichage
            });
    }
});

// Export des actions
export const { resetAuthState, clearError, setAuthenticated, setMedecinInfo } = authSlice.actions;

// Sélecteurs pour une meilleure réutilisabilité
export const selectMedecinInfo = (state) => state.auth.medecinInfo;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

// Export du reducer
export default authSlice.reducer;
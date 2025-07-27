import { Bed, CircleOff, Plus, UserRound, Wallet } from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSistrix } from "@fortawesome/free-brands-svg-icons";
import PagePatients from "./PagePatients";
import PatienSquelette from "../Components/PatienSquelette";
import AddNewPatient from "../forms/AddNewPatient";
import EndHospitalizationModal from "../Components/EndHospitalizationModal"; // Import de la nouvelle modale
import { useSelector, useDispatch } from "react-redux";
import {
    getAllPatient,
    selectPatientsList,
    selectPatientStatus,
    selectPatientErrors,
    selectAddPatientSuccess
} from "../redux/PatientSlice";
// Import des sélecteurs pour l'hospitalisation
import {
    clearSpecificSuccess,
    clearSpecificError
} from "../redux/HospitalisationSlice";
import { isEmpty } from "../services/IsEmpty";
import toast from "react-hot-toast";
import PageCaisse from "../Components/PageCaisse";

export default function Caisse() {
    // États locaux pour la gestion de l'interface
    const [showSearch, setShowSearch] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPatientPage, setShowPatientPage] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // États pour la gestion de la fin d'hospitalisation
    const [showEndHospitalizationModal, setShowEndHospitalizationModal] = useState(false);
    const [selectedPatientForEndHospitalization, setSelectedPatientForEndHospitalization] = useState(null);

    // Sélecteurs Redux
    const patients = useSelector(selectPatientsList);
    const status = useSelector(selectPatientStatus);
    const errors = useSelector(selectPatientErrors);
    const addSuccess = useSelector(selectAddPatientSuccess);

    // Sélecteurs pour l'hospitalisation
    const hospitalizationState = useSelector(state => state.hospitalisation);
    const dispatch = useDispatch();

    // Fonction pour formater les dates de manière sécurisée
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Non renseigné';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date invalide';

            return date.toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
            return 'Date invalide';
        }
    }, []);

    // Mémorisation de la liste filtrée des patients pour optimiser les performances
    const filteredPatients = useMemo(() => {
        if (!Array.isArray(patients)) return [];

        if (!searchTerm.trim()) return patients;

        const searchLower = searchTerm.toLowerCase().trim();
        return patients.filter((patient) => {
            if (!patient) return false;

            const fullName = `${patient.nom || ''} ${patient.prenom || ''}`.toLowerCase();
            const telephone = (patient.telephone || '').toLowerCase();
            const numeroCni = (patient.numeroCni || '').toLowerCase();

            return fullName.includes(searchLower) ||
                telephone.includes(searchLower) ||
                numeroCni.includes(searchLower);
        });
    }, [patients, searchTerm]);

    // Mémorisation des patients triés par date de dernière mise à jour
    const sortedPatients = useMemo(() => {
        return [...filteredPatients].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0);
            const dateB = new Date(b.updatedAt || b.createdAt || 0);
            return dateB - dateA; // Tri décroissant (plus récent en premier)
        });
    }, [filteredPatients]);

    // Fonction pour gérer la connexion à un patient
    const handlePatientConnection = useCallback((patient) => {
        if (!patient) {
            toast.error('Impossible de charger les informations du patient');
            return;
        }

        setSelectedPatient(patient);
        setShowPatientPage(true);
    }, []);

    // Fonction pour basculer l'affichage de la recherche
    const toggleSearch = useCallback(() => {
        setShowSearch(prev => {
            if (prev) {
                // Si on ferme la recherche, on vide aussi le terme de recherche
                setSearchTerm('');
            }
            return !prev;
        });
    }, []);

    // Fonction pour ouvrir le modal d'ajout
    const openAddModal = useCallback(() => {
        setShowAddModal(true);
    }, []);

    // Fonction pour fermer le modal d'ajout
    const closeAddModal = useCallback(() => {
        setShowAddModal(false);
    }, []);
    /**
     * Fonction pour ouvrir la modale de fin d'hospitalisation
     * @param {Object} patient - Patient dont l'hospitalisation doit être terminée
     */
    const openEndHospitalizationModal = useCallback((patient) => {
        if (!patient) {
            toast.error('Informations du patient manquantes');
            return;
        }

        // Vérifier que le patient est bien hospitalisé
        if (patient.statusmedical !== 'hospitaliser') {
            toast.error('Ce patient n\'est pas actuellement hospitalisé');
            return;
        }

        setSelectedPatientForEndHospitalization(patient);
        setShowEndHospitalizationModal(true);
    }, []);

    /**
     * Fonction pour fermer la modale de fin d'hospitalisation
     */
    const closeEndHospitalizationModal = useCallback(() => {
        setShowEndHospitalizationModal(false);
        setSelectedPatientForEndHospitalization(null);

        // Nettoyer les messages d'erreur et de succès
        dispatch(clearSpecificError({ errorType: 'end' }));
        dispatch(clearSpecificSuccess({ successType: 'end' }));
    }, [dispatch]);

    // Effect pour charger les patients au montage du composant
    useEffect(() => {
        const loadPatients = async () => {
            if (status === 'idle') {
                try {
                    await dispatch(getAllPatient()).unwrap();
                } catch (error) {
                    console.error('Erreur lors du chargement des patients:', error);
                    toast.error('Erreur lors du chargement de la liste des patients');
                }
            }
        };

        loadPatients();
    }, [dispatch, status]);

    // Effect pour gérer le délai de chargement initial
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Effect pour gérer les erreurs de récupération des patients
    useEffect(() => {
        if (errors.getAll) {
            toast.error(`Erreur: ${errors.getAll}`);
        }
    }, [errors.getAll]);

    // Effect pour actualiser la liste après ajout d'un patient
    useEffect(() => {
        if (addSuccess) {
            // Recharger la liste des patients après un ajout réussi
            // Ceci garantit que la liste est synchronisée avec le serveur
            dispatch(getAllPatient());
        }
    }, [addSuccess, dispatch]);

    // Effect pour gérer le succès de la fin d'hospitalisation
    useEffect(() => {
        if (hospitalizationState.successMessages.end) {
            // Fermer automatiquement la modale après succès
            setTimeout(() => {
                closeEndHospitalizationModal();
            }, 1500);
        }
    }, [hospitalizationState.successMessages.end, closeEndHospitalizationModal]);

    // Fonction pour déterminer le statut d'un patient
    const getPatientStatus = useCallback((patient) => {
        if (!patient) return { icon: <Bed size={16} />, text: 'Inconnu', className: 'status-unknown' };

        switch (patient.statusmedical) {
            case 'hospitaliser':
                return {
                    icon: <Bed size={16} />,
                    text: 'Hospitalisé',
                    className: 'status-hospitalized'
                };
            case 'operation':
                return {
                    icon: <UserRound size={16} />,
                    text: 'En operation',
                    className: 'status-consultation'
                };
            case 'urgence':
                return {
                    icon: <Bed size={16} />,
                    text: 'Urgence',
                    className: 'status-emergency',
                };
            default:
                return {
                    icon: <CircleOff size={16} />,
                    text: 'R.A.S',
                    className: 'status-normal'
                };
        }
    }, []);

    /**
     * Fonction pour gérer le clic sur le statut d'un patient
     * Si le patient est hospitalisé, ouvre la modale de fin d'hospitalisation
     * @param {Object} patient - Patient concerné
     */
    const handleStatusClick = useCallback((patient) => {
        if (patient.statusmedical === 'hospitaliser') {
            openEndHospitalizationModal(patient);
        }
    }, [openEndHospitalizationModal]);

    // Fonction pour nettoyer le terme de recherche
    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setShowSearch(false);
    }, []);

    // Rendu conditionnel pour la page patient
    if (showPatientPage) {
        return (
            <PageCaisse
                aff={setShowPatientPage}
                patient={selectedPatient}
            />
        );
    }

    // Rendu conditionnel pour le chargement initial
    if (isInitialLoading && status === 'loading') {
        return <PatienSquelette />;
    }

    return (
        <>
            <div className="patients-container">
                {/* EN-TÊTE DE LA PAGE PATIENTS */}
                <div className="patients-top">
                    <div className="patient-entete">
                        <Wallet size={35} />
                        <p>Caisse & Factures</p>
                    </div>

                    <div className="patients-nav">
                        {/* STATISTIQUES DES PATIENTS */}
                        <div className="patients-link">
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                <span>Tous les Patients</span>
                                <div className="patients-count">
                                    {Array.isArray(patients) ? patients.length : 0}
                                </div>
                            </a>
                        </div>

                        {/* BARRE DE RECHERCHE */}
                        <div className="patients-middle">
                            {showSearch && (
                                <div className="search-container">
                                    <input
                                        type="search"
                                        placeholder="Rechercher un patient..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CONTENU PRINCIPAL */}
                <div className="patients-bottom">
                    {/* EN-TÊTE DU TABLEAU */}
                    <div className="nav-patients">
                        <ul>
                            <li>Nom et Prénom complet du Patient</li>
                            <li>Date de Naissance</li>
                            <li>Date dernière consultation</li>
                            <li>Statut</li>
                            <li>Actions</li>
                        </ul>
                    </div>

                    {/* LISTE DES PATIENTS */}
                    <div className="container-all-patients">
                        {status === 'loading' && !isInitialLoading ? (
                            <div className="loading-patients">
                                <p>Chargement des patients...</p>
                            </div>
                        ) : errors.getAll ? (
                            <div className="error-patients">
                                <p>Erreur lors du chargement des patients</p>
                                <button onClick={() => dispatch(getAllPatient())}>
                                    Réessayer
                                </button>
                            </div>
                        ) : !Array.isArray(patients) || patients.length === 0 ? (
                            <div className="no-patients">
                                <p>Aucun patient enregistré</p>
                                <button onClick={openAddModal}>
                                    Ajouter le premier patient
                                </button>
                            </div>
                        ) : sortedPatients.length === 0 ? (
                            <div className="no-search-results">
                                <p>Aucun patient trouvé pour "{searchTerm}"</p>
                                <button onClick={clearSearch}>
                                    Afficher tous les patients
                                </button>
                            </div>
                        ) : (
                            sortedPatients.map((patient) => {
                                if (!patient) return null;

                                const patientStatus = getPatientStatus(patient);
                                const patientKey = patient._id || patient.id || `patient-${Math.random()}`;
                                const isHospitalized = patient.statusmedical === 'hospitaliser';

                                return (
                                    <div key={patientKey} className="card-patient">
                                        <ul>
                                            <li>
                                                <p>
                                                    <UserRound />
                                                    <span>
                                                        {`${patient.nom || 'N/A'} ${patient.prenom || 'N/A'}`}
                                                    </span>
                                                </p>
                                            </li>
                                            <li>{patient.dateNaissance || 'Non renseigné'}</li>
                                            <li>{formatDate(patient.updatedAt || patient.createdAt)}</li>
                                            <li>
                                                <section
                                                    className={`${patientStatus.className} ${isHospitalized ? 'clickable-status' : ''}`}
                                                    onClick={() => handleStatusClick(patient)}
                                                    title={isHospitalized ? 'Cliquez pour terminer l\'hospitalisation' : patientStatus.text}
                                                >
                                                    {patientStatus.icon}
                                                    <span>{patientStatus.text}</span>
                                                    {isHospitalized && <span className="status-indicator">●</span>}
                                                </section>
                                            </li>
                                            <li>
                                                <button
                                                    className="connection-btn"
                                                    onClick={() => handlePatientConnection(patient)}
                                                    title={`Accéder au dossier de ${patient.prenom} ${patient.nom}`}
                                                >
                                                    Voir caisse
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            {/* MODAL DE FIN D'HOSPITALISATION */}
            {showEndHospitalizationModal && selectedPatientForEndHospitalization && (
                <EndHospitalizationModal
                    onClose={closeEndHospitalizationModal}
                    patient={selectedPatientForEndHospitalization}
                    hospitalizationId={selectedPatientForEndHospitalization.currentHospitalizationId || selectedPatientForEndHospitalization._id}
                />
            )}
        </>
    );
}

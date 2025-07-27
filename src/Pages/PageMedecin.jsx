import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, Calendar, ChartNoAxesCombined, ChartPie, ChevronRight, UserRoundPen, Users } from 'lucide-react';
import {
    getMedecinById,
    selectMedecinOneList,
    selectCurrentMedecin,
    selectMedecinsList,
    selectGetMedecinByIdStatus,
    selectGetMedecinByIdError,
    clearErrors
} from '../redux/MedecinSlice';
import {
    getAllConsultations,
    selectConsultationList,
    selectConsultationLoadingGetAll,
    selectConsultationErrorGetAll
} from '../redux/ConsultationSlice';
import {
    getAllOperations,
    selectOperationList,
    selectOperationLoading,
    selectOperationErrors
} from '../redux/OperationSlice';
import Chart from 'chart.js/auto';

export default function PageMedecin({ aff, medecinId }) {
    const dispatch = useDispatch();
    const consultationChartRef = useRef(null);
    const operationChartRef = useRef(null);
    const consultationChartInstanceRef = useRef(null);
    const operationChartInstanceRef = useRef(null);

    // ==================== SÉLECTEURS REDUX ====================

    // Médecin
    const currentMedecin = useSelector(selectCurrentMedecin);
    const medecinOneList = useSelector(selectMedecinOneList);
    const medecinsList = useSelector(selectMedecinsList);
    const status = useSelector(selectGetMedecinByIdStatus);
    const error = useSelector(selectGetMedecinByIdError);

    // Consultations
    const consultationList = useSelector(selectConsultationList);
    const consultationLoading = useSelector(selectConsultationLoadingGetAll);
    const consultationError = useSelector(selectConsultationErrorGetAll);

    // Opérations
    const operationList = useSelector(selectOperationList);
    const operationLoading = useSelector(selectOperationLoading);
    const operationErrors = useSelector(selectOperationErrors);

    // ==================== LOGIQUE DE SÉLECTION DU MÉDECIN ====================

    const selectedMedecin = useMemo(() => {
        if (medecinId) {
            return medecinOneList;
        }

        if (currentMedecin) {
            return currentMedecin;
        }

        if (medecinsList.length > 0 && medecinId) {
            return medecinsList.find(medecin => medecin._id === medecinId) || null;
        }

        return null;
    }, [medecinId, medecinOneList, currentMedecin, medecinsList]);

    // ==================== FILTRAGE DES CONSULTATIONS ====================

    const filteredConsultations = useMemo(() => {
        if (!selectedMedecin || !consultationList || consultationList.length === 0) {
            return [];
        }

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return consultationList.filter(consultation => {
            // Vérifier si la consultation appartient au médecin
            const isMedecinConsultation = consultation.medecin === selectedMedecin._id ||
                consultation.medecin?._id === selectedMedecin._id ||
                consultation.IdMedecin === selectedMedecin._id;

            if (!isMedecinConsultation) return false;

            // Filtrer par mois en cours
            const consultationDate = new Date(consultation.dateConsultation || consultation.createdAt);
            return consultationDate.getMonth() === currentMonth && 
                   consultationDate.getFullYear() === currentYear;
        });
    }, [selectedMedecin, consultationList]);

    // ==================== FILTRAGE DES OPÉRATIONS ====================

    const filteredOperations = useMemo(() => {
        if (!selectedMedecin || !operationList || operationList.length === 0) {
            return [];
        }

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return operationList.filter(operation => {
            // Vérifier si l'opération appartient au médecin
            const isMedecinOperation = operation.medecin === selectedMedecin._id ||
                operation.medecin?._id === selectedMedecin._id ||
                operation.IdMedecin === selectedMedecin._id ||
                operation.medecinChirurgien === selectedMedecin._id ||
                operation.medecinChirurgien?._id === selectedMedecin._id;

            if (!isMedecinOperation) return false;

            // Filtrer par mois en cours
            const operationDate = new Date(operation.dateOperation || operation.createdAt);
            return operationDate.getMonth() === currentMonth && 
                   operationDate.getFullYear() === currentYear;
        });
    }, [selectedMedecin, operationList]);

    // ==================== DONNÉES POUR LES GRAPHIQUES CONSULTATIONS ====================

    const consultationChartData = useMemo(() => {
        if (!filteredConsultations || filteredConsultations.length === 0) {
            return {
                dailyData: { labels: [], data: [] },
                weeklyData: { labels: [], data: [] },
                diagnosticData: { labels: [], data: [] }
            };
        }

        // Données par jour du mois
        const dailyConsultations = {};
        const currentDate = new Date();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Initialiser tous les jours du mois
        for (let i = 1; i <= daysInMonth; i++) {
            dailyConsultations[i] = 0;
        }

        // Données par semaine
        const weeklyConsultations = {
            'Semaine 1': 0,
            'Semaine 2': 0,
            'Semaine 3': 0,
            'Semaine 4': 0,
            'Semaine 5': 0
        };

        // Données par diagnostic
        const diagnosticConsultations = {};

        filteredConsultations.forEach(consultation => {
            const consultationDate = new Date(consultation.dateConsultation || consultation.createdAt);
            const day = consultationDate.getDate();
            
            // Compter par jour
            if (dailyConsultations[day] !== undefined) {
                dailyConsultations[day]++;
            }

            // Compter par semaine
            const weekNumber = Math.ceil(day / 7);
            const weekKey = `Semaine ${weekNumber}`;
            if (weeklyConsultations[weekKey] !== undefined) {
                weeklyConsultations[weekKey]++;
            }

            // Compter par diagnostic
            const diagnostic = consultation.diagnostic || 'Non spécifié';
            diagnosticConsultations[diagnostic] = (diagnosticConsultations[diagnostic] || 0) + 1;
        });

        return {
            dailyData: {
                labels: Object.keys(dailyConsultations),
                data: Object.values(dailyConsultations)
            },
            weeklyData: {
                labels: Object.keys(weeklyConsultations),
                data: Object.values(weeklyConsultations)
            },
            diagnosticData: {
                labels: Object.keys(diagnosticConsultations),
                data: Object.values(diagnosticConsultations)
            }
        };
    }, [filteredConsultations]);

    // ==================== DONNÉES POUR LES GRAPHIQUES OPÉRATIONS ====================

    const operationChartData = useMemo(() => {
        if (!filteredOperations || filteredOperations.length === 0) {
            return {
                dailyData: { labels: [], data: [] },
                weeklyData: { labels: [], data: [] },
                typeData: { labels: [], data: [] },
                statusData: { labels: [], data: [] }
            };
        }

        // Données par jour du mois
        const dailyOperations = {};
        const currentDate = new Date();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Initialiser tous les jours du mois
        for (let i = 1; i <= daysInMonth; i++) {
            dailyOperations[i] = 0;
        }

        // Données par semaine
        const weeklyOperations = {
            'Semaine 1': 0,
            'Semaine 2': 0,
            'Semaine 3': 0,
            'Semaine 4': 0,
            'Semaine 5': 0
        };

        // Données par type d'opération
        const typeOperations = {};

        // Données par statut
        const statusOperations = {};

        filteredOperations.forEach(operation => {
            const operationDate = new Date(operation.dateOperation || operation.createdAt);
            const day = operationDate.getDate();
            
            // Compter par jour
            if (dailyOperations[day] !== undefined) {
                dailyOperations[day]++;
            }

            // Compter par semaine
            const weekNumber = Math.ceil(day / 7);
            const weekKey = `Semaine ${weekNumber}`;
            if (weeklyOperations[weekKey] !== undefined) {
                weeklyOperations[weekKey]++;
            }

            // Compter par type d'opération
            const type = operation.typeOperation || operation.type || 'Non spécifié';
            typeOperations[type] = (typeOperations[type] || 0) + 1;

            // Compter par statut
            const status = operation.statut || operation.status || 'Non spécifié';
            statusOperations[status] = (statusOperations[status] || 0) + 1;
        });

        return {
            dailyData: {
                labels: Object.keys(dailyOperations),
                data: Object.values(dailyOperations)
            },
            weeklyData: {
                labels: Object.keys(weeklyOperations),
                data: Object.values(weeklyOperations)
            },
            typeData: {
                labels: Object.keys(typeOperations),
                data: Object.values(typeOperations)
            },
            statusData: {
                labels: Object.keys(statusOperations),
                data: Object.values(statusOperations)
            }
        };
    }, [filteredOperations]);

    // ==================== GESTION DES GRAPHIQUES ====================

    const createConsultationChart = () => {
        if (!consultationChartRef.current || !consultationChartData.dailyData.labels.length) return;

        // Détruire le graphique existant
        if (consultationChartInstanceRef.current) {
            consultationChartInstanceRef.current.destroy();
        }

        const ctx = consultationChartRef.current.getContext('2d');
        
        consultationChartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: consultationChartData.dailyData.labels,
                datasets: [
                    {
                        label: 'Consultations par jour',
                        data: consultationChartData.dailyData.data,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Consultations de ${getFullName(selectedMedecin)} - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours du mois'
                        }
                    }
                }
            }
        });
    };

    const createOperationChart = () => {
        if (!operationChartRef.current || !operationChartData.dailyData.labels.length) return;

        // Détruire le graphique existant
        if (operationChartInstanceRef.current) {
            operationChartInstanceRef.current.destroy();
        }

        const ctx = operationChartRef.current.getContext('2d');
        
        operationChartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: operationChartData.dailyData.labels,
                datasets: [
                    {
                        label: 'Opérations par jour',
                        data: operationChartData.dailyData.data,
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Opérations de ${getFullName(selectedMedecin)} - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours du mois'
                        }
                    }
                }
            }
        });
    };

    // ==================== EFFETS DE BORD ====================

    useEffect(() => {
        if (medecinId) {
            const isMedecinAlreadyLoaded =
                (medecinOneList && medecinOneList._id === medecinId) ||
                (currentMedecin && currentMedecin._id === medecinId);

            if (!isMedecinAlreadyLoaded) {
                dispatch(getMedecinById(medecinId));
            }
        }
    }, [medecinId, dispatch, medecinOneList, currentMedecin]);

    // Charger toutes les consultations
    useEffect(() => {
        if (selectedMedecin && consultationList.length === 0) {
            dispatch(getAllConsultations());
        }
    }, [selectedMedecin, dispatch, consultationList.length]);

    // Charger toutes les opérations
    useEffect(() => {
        if (selectedMedecin && operationList.length === 0) {
            dispatch(getAllOperations());
        }
    }, [selectedMedecin, dispatch, operationList.length]);

    // Créer le graphique des consultations quand les données sont prêtes
    useEffect(() => {
        if (selectedMedecin && consultationChartData.dailyData.labels.length > 0) {
            createConsultationChart();
        }
    }, [selectedMedecin, consultationChartData]);

    // Créer le graphique des opérations quand les données sont prêtes
    useEffect(() => {
        if (selectedMedecin && operationChartData.dailyData.labels.length > 0) {
            createOperationChart();
        }
    }, [selectedMedecin, operationChartData]);

    useEffect(() => {
        return () => {
            if (consultationChartInstanceRef.current) {
                consultationChartInstanceRef.current.destroy();
            }
            if (operationChartInstanceRef.current) {
                operationChartInstanceRef.current.destroy();
            }
            dispatch(clearErrors());
        };
    }, [dispatch]);

    // ==================== GESTION DES ÉTATS DE CHARGEMENT ====================

    if (status === 'loading') {
        return (
            <div className='page-container-medecin'>
                <div className="loading-container">
                    <p>Chargement des informations du médecin...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='page-container-medecin'>
                <div className="error-container">
                    <p>Erreur lors du chargement : {error}</p>
                    <button onClick={() => dispatch(getMedecinById(medecinId))}>
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedMedecin) {
        return (
            <div className='page-container-medecin'>
                <div className="no-data-container">
                    <p>Aucun médecin trouvé pour cet ID.</p>
                    <button onClick={() => aff(false)}>
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    // ==================== FONCTIONS UTILITAIRES ====================

    const getFullName = (medecin) => {
        if (!medecin) return 'Nom non disponible';
        return `${medecin.nom || ''} ${medecin.prenom || ''}`.trim() || 'Nom non disponible';
    };

    const getProfessionalTitle = (medecin) => {
        if (!medecin) return 'Titre non disponible';
        return `Dr ${getFullName(medecin)}`;
    };

    const getSpeciality = (medecin) => {
        return medecin?.service || medecin?.specialite || 'Spécialité non précisée';
    };

    const formatBirthDate = (dateString) => {
        if (!dateString) return 'Non renseigné';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        } catch (error) {
            return dateString;
        }
    };

    const getStatistics = (medecin) => {
        // Utiliser les données filtrées pour les statistiques réelles
        const consultationsCount = filteredConsultations.length;
        const operationsCount = filteredOperations.length;
        
        return {
            patients: medecin?.statistiques?.patients || 0,
            rendezVous: medecin?.statistiques?.rendezVous || 0,
            operations: operationsCount, // Statistique basée sur les données réelles
            consultations: consultationsCount // Statistique basée sur les données réelles
        };
    };

    // ==================== DONNÉES POUR L'AFFICHAGE ====================

    const stats = getStatistics(selectedMedecin);
    const fullName = getFullName(selectedMedecin);
    const professionalTitle = getProfessionalTitle(selectedMedecin);
    const speciality = getSpeciality(selectedMedecin);

    // ==================== RENDU DU COMPOSANT ====================

    return (
        <div className='page-container-medecin'>
            <div className="top">
                <section>
                    <p onClick={() => aff(false)} style={{ cursor: 'pointer' }}>
                        Docteur
                    </p>
                    <ChevronRight size={20} />
                    <span>{fullName}</span>
                </section>
            </div>

            <div className='bottom'>
                <div className='top'>
                    <div className='container-card-info-medecin'>
                        <div className='img'>
                            <img
                                src={selectedMedecin.photo || "/doc1.jpg"}
                                alt={`Photo de ${fullName}`}
                                onError={(e) => {
                                    e.target.src = "/doc1.jpg";
                                }}
                            />
                        </div>
                        <div className='text-info'>
                            <h2>{professionalTitle}</h2>
                            <h3>{speciality}</h3>
                            <h4>{selectedMedecin.email || 'Email non renseigné'}</h4>
                            <span>{selectedMedecin.telephone || 'Téléphone non renseigné'}</span>
                        </div>
                        <div className='circle-1'></div>
                        <div className='circle-2'></div>
                    </div>

                    <div className='container-card-medecin'>
                        <p className='p'>
                            <ChartNoAxesCombined />
                            <span>Statistiques mensuelles</span>
                        </p>
                        <div className='cards-stats'>
                            <div className='card-stat stat1'>
                                <div className="stat-icon">
                                    <Users size={24} />
                                </div>
                                <h3>Nombre total de patients consultés</h3>
                                <p><span>{stats.patients}</span> patients</p>
                            </div>
                            <div className='card-stat stat2'>
                                <div className="stat-icon">
                                    <Calendar size={24} />
                                </div>
                                <h3>Nombre total de rendez-vous</h3>
                                <p><span>{stats.rendezVous}</span> rendez-vous</p>
                            </div>
                            <div className='card-stat stat3'>
                                <div className="stat-icon">
                                    <Activity size={24} />
                                </div>
                                <h3>Nombre total d'opérations menées</h3>
                                <p><span>{stats.operations}</span> opérations</p>
                            </div>
                            <div className='card-stat stat4'>
                                <div className="stat-icon">
                                    <ChartPie size={24} />
                                </div>
                                <h3>Consultations ce mois</h3>
                                <p><span>{stats.consultations}</span> consultations</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bottom'>
                    <div className='left-container-info'>
                        <p className='p'>
                            <UserRoundPen />
                            <span>Informations personnelles</span>
                        </p>
                        <div className='left-info'>
                            <div className='info-perso'>
                                <p>Nom :</p>
                                <h4>{selectedMedecin.nom || 'Non renseigné'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Prénom :</p>
                                <h4>{selectedMedecin.prenom || 'Non renseigné'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Matricule :</p>
                                <h4>{selectedMedecin.matricule || 'Non renseigné'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Date naissance :</p>
                                <h4>{formatBirthDate(selectedMedecin.dateNaissance)}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Téléphone :</p>
                                <h4>{selectedMedecin.telephone || 'Non renseigné'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Email :</p>
                                <h4>{selectedMedecin.email || 'Non renseigné'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Service médical :</p>
                                <h4>{selectedMedecin.serviceMedicale || selectedMedecin.service || 'Non renseigné'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Poste :</p>
                                <h4>{selectedMedecin.poste || 'Médecin'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Ville :</p>
                                <h4>{selectedMedecin.ville || 'Non renseigné'}</h4>
                            </div>
                            <div className='info-perso'>
                                <p>Domicile :</p>
                                <h4>{selectedMedecin.domicile || selectedMedecin.adresse || 'Non renseigné'}</h4>
                            </div>
                        </div>
                        <div className='circle'></div>
                    </div>

                    <div className='rigth-container-chart'>
                        <p className='p'>
                            <ChartPie />
                            <span>Visualisation des données statistiques</span>
                        </p>
                        
                        <div className='cards-chart-graph'>
                            {/* Graphique des consultations */}
                            <div style={{ marginBottom: '30px' }}>
                                {consultationLoading ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '300px' 
                                    }}>
                                        <p>Chargement des données de consultation...</p>
                                    </div>
                                ) : consultationError ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '300px',
                                        flexDirection: 'column' 
                                    }}>
                                        <p>Erreur lors du chargement des consultations</p>
                                        <button onClick={() => dispatch(getAllConsultations())}>
                                            Réessayer
                                        </button>
                                    </div>
                                ) : filteredConsultations.length === 0 ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '300px' 
                                    }}>
                                        <p>Aucune consultation trouvée pour ce médecin ce mois-ci</p>
                                    </div>
                                ) : (
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <canvas ref={consultationChartRef}></canvas>
                                    </div>
                                )}
                            </div>

                            {/* Graphique des opérations */}
                            <div>
                                {operationLoading.getAll ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '300px' 
                                    }}>
                                        <p>Chargement des données d'opération...</p>
                                    </div>
                                ) : operationErrors.getAll ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '300px',
                                        flexDirection: 'column' 
                                    }}>
                                        <p>Erreur lors du chargement des opérations</p>
                                        <button onClick={() => dispatch(getAllOperations())}>
                                            Réessayer
                                        </button>
                                    </div>
                                ) : filteredOperations.length === 0 ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        height: '300px' 
                                    }}>
                                        <p>Aucune opération trouvée pour ce médecin ce mois-ci</p>
                                    </div>
                                ) : (
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <canvas ref={operationChartRef}></canvas>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
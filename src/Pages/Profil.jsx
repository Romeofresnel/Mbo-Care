import { ChartPie, User, UserRoundPen, RefreshCw, Activity, TrendingUp } from 'lucide-react'
import React, { useContext, useEffect, useState, useRef } from 'react'
import { UidContext } from '../AppContext';
import { useSelector, useDispatch } from 'react-redux';
import Portal from '../Components/Portal';
import EditProfil from '../forms/EditProfil';
import profil from '../img/doc1.jpg'

import {
  medecinInfo,
  selectMedecinInfo,
  selectAuthStatus,
  selectAuthError
} from '../redux/AuthSlice';
import {
  selectUpdateMedecinSuccess,
  selectUpdateMedecinStatus,
  clearUpdateSuccess
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
import {
  getAllHospitalisations,
  selectHospitalisationList,
  selectHospitalisationLoading,
  selectHospitalisationErrors
} from '../redux/HospitalisationSlice';
import Chart from 'chart.js/auto';

export default function Profil() {
  const [aff, setAff] = useState(false);
  const uid = useContext(UidContext);
  const medecin = useSelector(selectMedecinInfo);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const updateSuccess = useSelector(selectUpdateMedecinSuccess);
  const updateStatus = useSelector(selectUpdateMedecinStatus);

  // Sélecteurs pour les consultations
  const consultationList = useSelector(selectConsultationList);
  const consultationLoading = useSelector(selectConsultationLoadingGetAll);
  const consultationError = useSelector(selectConsultationErrorGetAll);

  // Sélecteurs pour les opérations
  const operationList = useSelector(selectOperationList);
  const operationLoading = useSelector(selectOperationLoading);
  const operationErrors = useSelector(selectOperationErrors);

  // Sélecteurs pour les hospitalisations
  const hospitalisationList = useSelector(selectHospitalisationList);
  const hospitalisationLoading = useSelector(selectHospitalisationLoading);
  const hospitalisationErrors = useSelector(selectHospitalisationErrors);

  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // État local pour indiquer si on vient de mettre à jour
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Vérifier que l'UID existe et charger les données si nécessaire
    if (uid?.uid && (status === 'idle' || Object.keys(medecin).length === 0)) {
      console.log("Chargement des informations du médecin pour Profil, UID:", uid.uid);
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid?.uid, medecin]);

  // Charger toutes les consultations, opérations et hospitalisations
  useEffect(() => {
    if (uid?.uid) {
      console.log("Chargement de toutes les consultations pour les statistiques");
      dispatch(getAllConsultations());

      console.log("Chargement de toutes les opérations pour les statistiques");
      dispatch(getAllOperations());

      console.log("Chargement de toutes les hospitalisations pour les statistiques");
      dispatch(getAllHospitalisations());
    }
  }, [dispatch, uid?.uid]);

  // Écouter les mises à jour réussies pour actualiser automatiquement
  useEffect(() => {
    if (updateSuccess && uid?.uid) {
      console.log("Mise à jour détectée, actualisation des données...");
      setIsRefreshing(true);

      // Actualiser les informations après une mise à jour réussie
      dispatch(medecinInfo(uid.uid)).then(() => {
        setIsRefreshing(false);
        // Nettoyer le message de succès après l'actualisation
        dispatch(clearUpdateSuccess());
      });
    }
  }, [updateSuccess, uid?.uid, dispatch]);

  // Fonction pour filtrer les consultations du médecin actuel
  const filterConsultationsByMedecin = (consultations, medecinId) => {
    if (!consultations || !Array.isArray(consultations) || !medecinId) {
      return [];
    }

    return consultations.filter(consultation =>
      consultation.medecin === medecinId ||
      consultation.medecin?._id === medecinId ||
      consultation.IdMedecin === medecinId
    );
  };

  // Fonction pour filtrer les opérations du médecin actuel
  const filterOperationsByMedecin = (operations, medecinId) => {
    if (!operations || !Array.isArray(operations) || !medecinId) {
      return [];
    }

    return operations.filter(operation =>
      operation.medecin === medecinId ||
      operation.medecin?._id === medecinId ||
      operation.IdMedecin === medecinId ||
      operation.medecinId === medecinId
    );
  };

  // Fonction pour filtrer les hospitalisations du médecin actuel
  const filterHospitalisationsByMedecin = (hospitalisations, medecinId) => {
    if (!hospitalisations || !Array.isArray(hospitalisations) || !medecinId) {
      return [];
    }

    return hospitalisations.filter(hospitalisation =>
      hospitalisation.medecin === medecinId ||
      hospitalisation.medecin?._id === medecinId ||
      hospitalisation.IdMedecin === medecinId ||
      hospitalisation.medecinId === medecinId ||
      hospitalisation.medecinPrincipal === medecinId ||
      hospitalisation.medecinPrincipal?._id === medecinId
    );
  };

  // Fonction pour obtenir les statistiques par mois
  const getMonthlyStatistics = (items, type = 'consultations') => {
    if (!items || !Array.isArray(items)) {
      return { labels: [], data: [] };
    }

    const monthlyStats = {};
    const currentYear = new Date().getFullYear();

    // Initialiser tous les mois avec 0
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    months.forEach((month, index) => {
      monthlyStats[index] = { month, count: 0 };
    });

    // Compter les items par mois
    items.forEach(item => {
      let createdAt;

      // Adapter selon le type d'item
      if (type === 'hospitalisations') {
        createdAt = item.datedebut || item.dateCreation || item.createdAt;
      } else {
        createdAt = item.createdAt || item.dateCreation || item.date || item.dateOperation;
      }

      if (createdAt) {
        const date = new Date(createdAt);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          if (monthlyStats[month]) {
            monthlyStats[month].count++;
          }
        }
      }
    });

    const labels = Object.values(monthlyStats).map(stat => stat.month);
    const data = Object.values(monthlyStats).map(stat => stat.count);

    return { labels, data };
  };

  // Fonction pour créer le graphique combiné
  const createChart = () => {
    if (!chartRef.current || !medecin._id) return;

    // Détruire le graphique existant s'il existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    const medecinConsultations = filterConsultationsByMedecin(consultationList, medecin._id);
    const medecinOperations = filterOperationsByMedecin(operationList, medecin._id);
    const medecinHospitalisations = filterHospitalisationsByMedecin(hospitalisationList, medecin._id);

    const consultationStats = getMonthlyStatistics(medecinConsultations, 'consultations');
    const operationStats = getMonthlyStatistics(medecinOperations, 'operations');
    const hospitalisationStats = getMonthlyStatistics(medecinHospitalisations, 'hospitalisations');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: consultationStats.labels,
        datasets: [
          {
            label: 'Consultations',
            data: consultationStats.data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointBorderColor: 'rgb(75, 192, 192)',
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: 'Opérations',
            data: operationStats.data,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: 'rgb(255, 99, 132)',
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: 'Hospitalisations',
            data: hospitalisationStats.data,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgb(153, 102, 255)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointBackgroundColor: 'rgb(153, 102, 255)',
            pointBorderColor: 'rgb(153, 102, 255)',
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Activité médicale en ${new Date().getFullYear()}`,
            font: {
              size: 16
            }
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
          }
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      }
    });
  };

  // Effet pour créer/mettre à jour le graphique
  useEffect(() => {
    if (medecin._id && chartRef.current && consultationList && operationList && hospitalisationList) {
      setTimeout(() => {
        createChart();
      }, 100);
    }

    // Nettoyage lors du démontage
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [medecin._id, consultationList, operationList, hospitalisationList]);

  // Fonction pour obtenir une valeur sûre (évite les undefined)
  const getSafeValue = (value, defaultValue = 'Non défini') => {
    return value && value !== undefined && value !== '' ? value : defaultValue;
  };

  // Fonction pour recharger les données manuellement
  const handleRefresh = () => {
    if (uid?.uid) {
      setIsRefreshing(true);
      dispatch(medecinInfo(uid.uid)).then(() => {
        Promise.all([
          dispatch(getAllConsultations()),
          dispatch(getAllOperations()),
          dispatch(getAllHospitalisations())
        ]).then(() => {
          setIsRefreshing(false);
        });
      });
    }
  };

  // Fonction pour fermer le modal d'édition
  const handleCloseEdit = () => {
    setAff(false);
  };

  // Fonction pour obtenir le nombre total de consultations du médecin
  const getTotalConsultations = () => {
    if (!medecin._id || !consultationList) return 0;
    const medecinConsultations = filterConsultationsByMedecin(consultationList, medecin._id);
    return medecinConsultations.length;
  };

  // Fonction pour obtenir le nombre total d'opérations du médecin
  const getTotalOperations = () => {
    if (!medecin._id || !operationList) return 0;
    const medecinOperations = filterOperationsByMedecin(operationList, medecin._id);
    return medecinOperations.length;
  };

  // Fonction pour obtenir le nombre total d'hospitalisations du médecin
  const getTotalHospitalisations = () => {
    if (!medecin._id || !hospitalisationList) return 0;
    const medecinHospitalisations = filterHospitalisationsByMedecin(hospitalisationList, medecin._id);
    return medecinHospitalisations.length;
  };

  // Fonction pour obtenir les consultations du mois en cours
  const getCurrentMonthConsultations = () => {
    if (!medecin._id || !consultationList) return 0;
    const medecinConsultations = filterConsultationsByMedecin(consultationList, medecin._id);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return medecinConsultations.filter(consultation => {
      const createdAt = consultation.createdAt || consultation.dateCreation || consultation.date;
      if (createdAt) {
        const date = new Date(createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }
      return false;
    }).length;
  };

  // Fonction pour obtenir les opérations du mois en cours
  const getCurrentMonthOperations = () => {
    if (!medecin._id || !operationList) return 0;
    const medecinOperations = filterOperationsByMedecin(operationList, medecin._id);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return medecinOperations.filter(operation => {
      const createdAt = operation.createdAt || operation.dateCreation || operation.date || operation.dateOperation;
      if (createdAt) {
        const date = new Date(createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }
      return false;
    }).length;
  };

  // Fonction pour obtenir les hospitalisations du mois en cours
  const getCurrentMonthHospitalisations = () => {
    if (!medecin._id || !hospitalisationList) return 0;
    const medecinHospitalisations = filterHospitalisationsByMedecin(hospitalisationList, medecin._id);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return medecinHospitalisations.filter(hospitalisation => {
      const createdAt = hospitalisation.datedebut || hospitalisation.dateCreation || hospitalisation.createdAt;
      if (createdAt) {
        const date = new Date(createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }
      return false;
    }).length;
  };

  // Fonction pour obtenir les hospitalisations actives du médecin
  const getActiveHospitalisations = () => {
    if (!medecin._id || !hospitalisationList) return 0;
    const medecinHospitalisations = filterHospitalisationsByMedecin(hospitalisationList, medecin._id);
    const maintenant = new Date();

    return medecinHospitalisations.filter(hospitalisation => {
      const dateDebut = new Date(hospitalisation.datedebut);
      const dateFin = hospitalisation.datefin ? new Date(hospitalisation.datefin) : null;

      // Hospitalisation active si elle a commencé et n'est pas encore terminée
      return dateDebut <= maintenant && (!dateFin || dateFin > maintenant);
    }).length;
  };

  // Vérifier si les données sont en cours de chargement
  const isLoadingData = () => {
    return consultationLoading || operationLoading?.getAll || hospitalisationLoading?.getAll || isRefreshing;
  };

  // Vérifier si il y a des erreurs
  const hasErrors = () => {
    return consultationError || operationErrors?.getAll || hospitalisationErrors?.getAll;
  };

  // Composant de chargement
  const LoadingComponent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      minHeight: '300px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <p style={{ color: '#666', fontSize: '16px' }}>
        {isRefreshing ? 'Actualisation des données...' : 'Chargement des informations du profil...'}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Composant d'erreur
  const ErrorComponent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      minHeight: '300px',
      color: '#ff4444'
    }}>
      <p style={{ marginBottom: '20px', textAlign: 'center' }}>
        Erreur lors du chargement des informations du profil:
        <br />
        <em>{error}</em>
      </p>
      <button
        onClick={handleRefresh}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        <RefreshCw size={16} />
        Réessayer
      </button>
    </div>
  );

  // Afficher le chargement si les données sont en cours de récupération
  if ((status === 'loading' || isRefreshing) && Object.keys(medecin).length === 0) {
    return (
      <div className='profil-container'>
        <LoadingComponent />
      </div>
    );
  }

  // Afficher l'erreur si le chargement a échoué
  if (status === 'failed' && Object.keys(medecin).length === 0) {
    return (
      <div className='profil-container'>
        <ErrorComponent />
      </div>
    );
  }

  return (
    <>
      <div className='profil-container'>
        <div className='top'>
          <div className='container-color'>
            <p>
              <UserRoundPen size={35} />
              <span>Profil</span>
              {/* Indicateur de statut */}
              {isLoadingData() && (
                <span style={{
                  marginLeft: '10px',
                  fontSize: '12px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  {isRefreshing ? 'Actualisation...' : 'Chargement...'}
                </span>
              )}
              {updateSuccess && (
                <span style={{
                  marginLeft: '10px',
                  fontSize: '12px',
                  color: '#28a745',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  ✓ Mis à jour avec succès
                </span>
              )}
            </p>
            <section>
              <div className='left'>
                <div className='img'>
                  <img src={profil} alt="Photo de profil" />
                </div>
              </div>
              <div className='rigth'>
                <div className='info'>
                  <h1>
                    {getSafeValue(medecin.nom, 'Dr.')} {getSafeValue(medecin.prenom, 'Médecin')}
                  </h1>
                  <h3>{getSafeValue(medecin.poste)}</h3>
                  <h3>{getSafeValue(medecin.service)}</h3>
                </div>
                <button
                  onClick={() => setAff(true)}
                  disabled={isRefreshing}
                  style={{
                    opacity: isRefreshing ? 0.6 : 1,
                    cursor: isRefreshing ? 'not-allowed' : 'pointer'
                  }}
                >
                  <UserRoundPen size={20} />
                  <span>Modifier Profil</span>
                </button>
              </div>
            </section>
            <div className='circle'></div>
          </div>
        </div>
        <div className='bottom'>
          <div className='visual-graphe'>
            <p>
              <ChartPie />
              <span>Statistiques de Dr. {getSafeValue(medecin.nom, 'Médecin')}</span>
              {isLoadingData() && (
                <span style={{
                  marginLeft: '10px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Chargement des données...
                </span>
              )}
              {hasErrors() && (
                <span style={{
                  marginLeft: '10px',
                  fontSize: '12px',
                  color: '#ff4444'
                }}>
                  Erreur de chargement
                </span>
              )}
            </p>

            <div className='canvas'>
              {isLoadingData() ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '300px',
                  color: '#666'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '10px'
                  }}></div>
                  Chargement des statistiques...
                </div>
              ) : hasErrors() ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '300px',
                  color: '#ff4444',
                  textAlign: 'center'
                }}>
                  <div>
                    <p>Erreur lors du chargement des statistiques</p>
                    <button
                      onClick={handleRefresh}
                      style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={chartRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px'
                  }}
                ></canvas>
              )}
            </div>
          </div>
          <div className='info-plus'>
            <p>
              <User />
              <span>Information supplémentaire</span>
            </p>
            <div className='container-information'>
              <div className='info'>
                <span>E-mail</span>
                <h3>{getSafeValue(medecin.email)}</h3>
              </div>
              <div className='info'>
                <span>Matricule</span>
                <h3>{getSafeValue(medecin.matricule)}</h3>
              </div>
              <div className='info'>
                <span>Service médical</span>
                <h3>{getSafeValue(medecin.service)}</h3>
              </div>
              <div className='info'>
                <span>Poste occupé</span>
                <h3>{getSafeValue(medecin.poste)}</h3>
              </div>
              <div className='info'>
                <span>Ville de résidence</span>
                <h3>{getSafeValue(medecin.ville)}</h3>
              </div>
              <div className='info'>
                <span>Domicile</span>
                <h3>{getSafeValue(medecin.domicile)}</h3>
              </div>
              <div className='info'>
                <span>Date de naissance</span>
                <h3>{getSafeValue(medecin.dateNaissance)}</h3>
              </div>
              <div className='info'>
                <span>Contact/numéro téléphone</span>
                <h3>{getSafeValue(medecin.telephone)}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {aff && (
        <Portal>
          <EditProfil
            aff={handleCloseEdit}
            medecin={medecin}
          />
        </Portal>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
import {
  AlarmClock,
  Calendar,
  CalendarClock,
  ChevronRight,
  Clock,
  MoveRight,
  Phone,
  Plus,
  User
} from 'lucide-react'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import CalandarDynamic from '../Components/CalandarDynamic.jsx'
import { useSelector, useDispatch } from 'react-redux'
import {
  getTodayAppointmentsByDoctor,
  selectTodayAppointments,
  selectAppointmentLoading,
  selectAppointmentErrors,
  selectDoctorAppointments,
  getAppointmentsByDoctor
} from '../redux/AppoinementSlice'
import { UidContext } from '../AppContext'
import { medecinInfo } from '../redux/AuthSlice'
import { getAllPatient, selectPatientsList } from '../redux/PatientSlice'
import ViewAllAppointment from '../Components/ViewAllAppointment'

export default function Agenda() {
  // ==================== HOOKS ET ÉTAT ====================
  const uid = useContext(UidContext);
  const dispatch = useDispatch();

  // États locaux pour gérer l'initialisation
  const [isInitialized, setIsInitialized] = useState(false);
  const [aff, setAff] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);


  // ==================== SÉLECTEURS REDUX ====================
  const todayAppointments = useSelector(selectTodayAppointments);
  const allDoctorAppointments = useSelector(selectDoctorAppointments); // Tous les rendez-vous du médecin
  const { medecinInfo: medecins, status: authStatus } = useSelector((state) => state.auth);
  const patients = useSelector(selectPatientsList);

  const appointmentLoading = useSelector(selectAppointmentLoading);
  const appointmentErrors = useSelector(selectAppointmentErrors);

  // ==================== DONNÉES CALCULÉES ====================

  // Vérifier si le médecin est chargé et valide
  const isDoctorReady = useMemo(() => {
    return medecins && medecins._id && authStatus === 'succeeded';
  }, [medecins, authStatus]);

  // Calculer le nombre total de rendez-vous
  const totalAppointments = useMemo(() => {
    return todayAppointments ? todayAppointments.length : 0;
  }, [todayAppointments]);

  // Extraire toutes les dates de rendez-vous futures pour le calendrier
  const appointmentDates = useMemo(() => {
    if (!allDoctorAppointments || !Array.isArray(allDoctorAppointments)) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer seulement les dates

    return allDoctorAppointments
      .map(appointment => appointment.appoinement_date)
      .filter(date => {
        if (!date || date.trim() === '') return false;

        // Convertir la date string en objet Date
        const [day, month, year] = date.split('/').map(Number);
        const appointmentDate = new Date(year, month - 1, day);

        // Retourner true seulement si la date est dans le futur
        return appointmentDate > today;
      })
      .filter((date, index, self) => self.indexOf(date) === index); // Supprimer les doublons
  }, [allDoctorAppointments]);

  // Vérifier l'état de chargement global
  const isLoading = useMemo(() => {
    return authStatus === 'loading' ||
      appointmentLoading.getTodayByDoctor ||
      !isInitialized;
  }, [authStatus, appointmentLoading.getTodayByDoctor, isInitialized]);

  // ==================== FONCTIONS UTILITAIRES ====================

  /**
   * Formate une date au format français
   * @param {string} dateString - Date au format jj/mm/aaaa
   * @returns {string} Date formatée
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Non renseigné';

    try {
      // Vérifier si la date est au format jj/mm/aaaa
      const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = dateString.match(dateRegex);

      if (!match) return 'Format de date invalide';

      const [, day, month, year] = match;

      // Créer la date en format ISO (aaaa-mm-jj) pour éviter l'ambiguïté
      const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);

      if (isNaN(date.getTime())) return 'Date invalide';

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  }, []);

  /**
   * Récupère les informations du patient pour un rendez-vous
   * @param {Object} appointment - Objet rendez-vous
   * @returns {Object} Informations du patient
   */
  const getPatientInfo = useCallback((appointment) => {
    // Si les informations du patient sont déjà dans l'objet appointment
    if (appointment.patient) {
      return {
        name: appointment.patient.nom || 'Patient inconnu',
        phone: appointment.patient.phone || 'Non renseigné'
      };
    }

    // Valeurs par défaut si pas d'informations patient
    return {
      name: 'Patient inconnu',
      phone: 'Non renseigné'
    };
  }, []);

  // ==================== EFFETS ====================

  /**
   * Effet pour charger les informations du médecin
   * Se déclenche au montage du composant ou si l'UID change
   */
  useEffect(() => {
    if (uid?.uid && authStatus === 'idle') {
      console.log('Chargement des informations du médecin...', uid.uid);
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, authStatus, uid?.uid]);

  /**
   * Effet pour charger les rendez-vous du jour et tous les rendez-vous
   * Se déclenche quand le médecin est prêt
   */
  useEffect(() => {
    if (isDoctorReady && !hasAttemptedFetch) {
      console.log('Chargement des rendez-vous...', medecins._id);
      // Charger les rendez-vous du jour
      dispatch(getTodayAppointmentsByDoctor(medecins._id));
      // Charger tous les rendez-vous pour le calendrier
      dispatch(getAppointmentsByDoctor(medecins._id));
      setHasAttemptedFetch(true);
    }
  }, [dispatch, isDoctorReady, medecins._id, hasAttemptedFetch]);

  useEffect(() => {
    if (todayAppointments) {
      dispatch(getAllPatient())
    }
  }, [dispatch, todayAppointments]);

  /**
   * Effet pour marquer l'initialisation comme terminée
   * Se déclenche quand toutes les données sont chargées ou en cas d'erreur
   */
  useEffect(() => {
    if (isDoctorReady && hasAttemptedFetch && !appointmentLoading.getTodayByDoctor) {
      setIsInitialized(true);
    }
  }, [isDoctorReady, hasAttemptedFetch, appointmentLoading.getTodayByDoctor]);

  // ==================== GESTION DES ERREURS ====================

  /**
   * Fonction pour relancer le chargement en cas d'erreur
   */
  const handleRetry = useCallback(() => {
    if (isDoctorReady) {
      setHasAttemptedFetch(false);
      dispatch(getTodayAppointmentsByDoctor(medecins._id));
      dispatch(getAppointmentsByDoctor(medecins._id));
    }
  }, [dispatch, isDoctorReady, medecins._id]);

  // ==================== RENDU CONDITIONNEL ====================

  /**
   * Rendu en cas d'erreur critique
   */
  if (appointmentErrors.getTodayByDoctor) {
    return (
      <div className='agenda-container'>
        <div className='entete'>
          <p>
            <Calendar size={35} />
            <span>Agenda</span>
          </p>
          <button>
            <Plus />
            <span>Ajouter un rendez-vous</span>
          </button>
        </div>
        <div className='body-container'>
          <div className='error-container'>
            <p>Erreur lors du chargement des rendez-vous</p>
            <button onClick={handleRetry}>Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDU PRINCIPAL ====================

  return (
    <>
      <div className='agenda-container'>
        {/* En-tête de l'agenda */}
        <div className='entete'>
          <p>
            <Calendar size={35} />
            <span>Agenda</span>
          </p>
        </div>

        <div className='body-container'>
          {/* Partie gauche - Calendrier et navigation */}
          <div className='left'>
            <div className='calandar-dynamic'>
              <CalandarDynamic appointmentDates={appointmentDates} />
            </div>
            <div className='list-appointment'>
              <div className='view-all-appointment'>
                <div className='presc'>
                  <CalendarClock />
                  <p>Tous les rendez-vous</p>
                </div>
                <button onClick={() => setAff(true)}>
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>

          {/* Partie droite - Liste des rendez-vous */}
          <div className='rigth'>
            <div className='entetes'>
              <p>
                <AlarmClock size={30} />
                <span>
                  Liste des rendez-vous d'aujourd'hui ({totalAppointments})
                </span>
              </p>
            </div>

            <div className='container-list-actuel'>
              {/* Affichage du loader pendant le chargement */}
              {isLoading ? (
                <div className="loading-appointments">
                  <AlarmClock size={25} />
                  <p>Chargement des rendez-vous...</p>
                </div>
              ) :
                /* Affichage si aucun rendez-vous */
                totalAppointments === 0 ? (
                  <div className="no-appointments">
                    <AlarmClock size={25} />
                    <p>Aucun rendez-vous trouvé pour aujourd'hui</p>
                  </div>
                ) :
                  /* Affichage de la liste des rendez-vous */
                  (
                    todayAppointments.map((appointment, index) => {
                      return (
                        <div key={appointment._id || index} className='agenda'>
                          {/* Informations du rendez-vous */}
                          <div className='info'>
                            <h4>{appointment.label || 'Rendez-vous médical'}</h4>
                            <section>
                              <div className='circle'></div>
                              <span>{appointment.status || 'Non défini'}</span>
                            </section>
                          </div>

                          {/* Date et heure */}
                          <div className='info1'>
                            <h4>
                              <Calendar />
                              <span>{formatDate(appointment.appoinement_date)}</span>
                            </h4>
                            <span>
                              <Clock size={20} />
                              <p>{appointment.appoinement_heure || 'Non renseigné'}</p>
                            </span>
                          </div>

                          {/* Informations patient */}
                          <div className='infos'>
                            <User size={40} />
                            <section>
                              {patients.map((path, index) => (appointment.PatientId === path._id ? (
                                <>
                                  <h4>{path.nom}</h4>
                                  <p>
                                    <Phone size={16} />
                                    <span>{path.telephone}</span>
                                  </p>
                                </>
                              )
                                : "")
                              )}
                            </section>
                          </div>

                          {/* Bouton d'action */}
                          <div className='btn'>
                            <button>
                              <ChevronRight />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
            </div>
          </div>
        </div>
      </div>
      {aff && <ViewAllAppointment aff={setAff} />}
    </>
  );
}
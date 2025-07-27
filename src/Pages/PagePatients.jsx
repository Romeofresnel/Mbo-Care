import {
  AlarmClock,
  Bed,
  ChevronRight,
  ChevronRightCircle,
  ClipboardList,
  File,
  FileText,
  HandHeart,
  Settings,
  Settings2,
  User,
  UserRoundPen,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CardInfoPatient from "../Components/CardInfoPatient";
import ParametreDaysPatient from "../Components/ParametreDaysPatient";
import Prescription from "../Components/Prescription";
import Hospitalisation from "../Components/Hospitalisation";
import Examens from "../Components/Examens";
import NewAppoinement from "../forms/NewAppoinement";
import ViewAllConsultation from "../Components/ViewAllConsultation";
import PageConsultation from "../forms/PageConsultation";
import EditPatient from "../forms/EditPatient";
import EndAppointmentModal from "../Components/EndAppointmentModal"; // Import du nouveau composant
import { useSelector } from "react-redux";
import { getAppointmentsByPatient, selectPatientAppointments } from "../redux/AppoinementSlice";
import { useDispatch } from "react-redux";
import {
  getAllConsultationByPatient,
  clearErrors,
  setCurrentPatientId
} from "../redux/ConsultationSlice";
import { getAllMedecins, selectMedecinsList, selectMedecinStatus } from "../redux/MedecinSlice";
import AddHospitalisation from "../forms/AddHospitalisation";
import AddOperation from "../forms/AddOperation";

const Option = ({ aff, operation, hospi }) => {
  return (
    <div className="option-container" onClick={(e) => e.target === e.currentTarget && aff(false)}>
      <section>
        <button onClick={() => {
          aff(false)
          hospi(true)
        }}>
          <Bed />
          <span>Hospitaliser</span>
        </button>
        <button className="cancel" onClick={() => {
          aff(false)
          operation(true)
        }}>
          <HandHeart />
          <span>Operation</span>
        </button>
      </section>
    </div>
  )
}

export default function PagePatients({ aff, patient }) {
  const [params, setParams] = useState(false);
  const [option, setOption] = useState(false);
  const [hospi, setHospi] = useState(false);
  const [operation, setOperation] = useState(false);
  const [presc, setPresc] = useState(false);
  const [hosp, setHosp] = useState(false);
  const [examen, setExamen] = useState(false);
  const [news, setNews] = useState(false);
  const [consulte, setConsulte] = useState(false);
  const [newConsulte, setNewConsulte] = useState(false);
  const [edit, setEdit] = useState(false);
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);
  const [countC, setCountC] = useState(0);


  // État pour gérer le modal de fin de rendez-vous
  const [endAppointmentModal, setEndAppointmentModal] = useState({
    isOpen: false,
    appointment: null
  });

  const appoinements = useSelector(selectPatientAppointments)
  const {
    consultationListPatient: consultations,
    consultationCount,
    currentPatientId,
    statut,
    loading,
    errors
  } = useSelector((state) => state.consultation);
  const medecins = useSelector(selectMedecinsList);
  const status = useSelector(selectMedecinStatus);

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAppointmentsByPatient(patient._id))
  }, [dispatch])
  useEffect(() => {
    // Charger les médecins si la liste est vide ou si on vient de démarrer
    if (medecins.length === 0 && status === 'idle') {
      dispatch(getAllMedecins());
    }
  }, [dispatch, medecins.length, status]);
  useEffect(() => {
    if (patient?._id) {
      // Nettoyer les erreurs précédentes
      dispatch(clearErrors());

      // Définir le patient actuel
      dispatch(setCurrentPatientId(patient._id));

      // Charger les consultations uniquement si nécessaire
      // (patient différent ou pas encore chargé)
      if (currentPatientId !== patient._id || consultations.length === 0) {
        console.log('Chargement des consultations pour le patient:', patient._id);
        dispatch(getAllConsultationByPatient(patient._id));
      }
    }
    setCountB(consultations.length)
    setCountC(appoinements.length)
  }, [dispatch, patient?._id, currentPatientId, consultations.length]);

  const filter = (activiteData, utilisateurUid) => {
    if (Array.isArray(activiteData) && activiteData) {
      const projectFiltrees = activiteData.filter(
        (project) => project.
          IdPatient === utilisateurUid
      );
      return projectFiltrees;
    }
    return [];
  };
  const getDeuxActivitesRecentes = useMemo(() => {
    let filtered = filter(consultations, patient._id);
    const projectTriees = filtered.sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    const deuxActivitesRecentes = projectTriees.slice(0, 4);
    return deuxActivitesRecentes;
  }, [consultations, patient._id]);
  console.log(appoinements.length);

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
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  }, []);

  // Fonction pour formater l'heure
  const formatTime = (timeString) => {
    if (!timeString) return "Heure non définie";
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  function formatDates(date) {
    // Noms des mois en anglais abrégés
    const months = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];

    let dateObj;

    // Gestion de différents types d'entrée
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      throw new Error('Format de date non supporté');
    }

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      throw new Error('Date invalide');
    }

    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    return `${month} ${day}, ${year}`;
  }
  /**
   * Gère le clic sur le statut d'un rendez-vous
   * Ouvre le modal de fin de rendez-vous si le statut n'est pas "terminer"
   * @param {Object} appointment - Le rendez-vous sélectionné
   */
  const handleStatusClick = (appointment) => {
    // Vérifier si le rendez-vous peut être terminé
    if (appointment.status === 'terminer') {
      // Optionnel: afficher un message ou ne rien faire
      console.log('Ce rendez-vous est déjà terminé');
      return;
    }

    // Ouvrir le modal avec le rendez-vous sélectionné
    setEndAppointmentModal({
      isOpen: true,
      appointment: appointment
    });
  };

  /**
   * Ferme le modal de fin de rendez-vous
   */
  const handleCloseEndAppointmentModal = () => {
    setEndAppointmentModal({
      isOpen: false,
      appointment: null
    });
  };
  function handleClose() {
    setOption(false);
  }
  return (

    <>
      {newConsulte ? (
        <PageConsultation aff={setNewConsulte} patient={patient} />
      ) : (
        <>
          <div className="patient-one-container" onClick={(e) => e.target === e.currentTarget && handleClose()} >
            <div className="top">
              <section>
                <p onClick={() => aff(false)}>Patients</p>
                <ChevronRight size={20} />
                <span>{patient.nom + " " + patient.prenom}</span>
              </section>
              <button onClick={() => setEdit(true)}>
                <UserRoundPen size={20} />
                <span>Modifier Patient</span>
              </button>
            </div>
            <div className="bottom" >
              <div className="container-left-patient">
                <div className="top-patient" >
                  <CardInfoPatient aff={setNewConsulte} patient={patient} count1={countB} count2={countC} />
                </div>
                <div className="bottom-patient">
                  <div className="appoinement-section">
                    <p>
                      <AlarmClock size={30} />
                      <span>Appoinement</span>
                    </p>
                    <button onClick={() => setNews(true)}>
                      Nouveau rendez-vous
                    </button>
                  </div>
                  <div className="container-appoi" >
                    {appoinements && appoinements.length === 0 ? (
                      <div className="no-appointments">
                        <AlarmClock size={25} />
                        <p>Aucun rendez-vous trouvé pour ce patient</p>
                      </div>
                    ) : (
                      appoinements?.map((app, index) => (
                        <div key={index} className="cards-times">
                          <div className="info">
                            <span>Date</span>
                            <h4>{formatDate(app.appoinement_date)}</h4>
                          </div>
                          <div className="info">
                            <span>Time</span>
                            <h4>{formatTime(app.appoinement_heure)}</h4>
                          </div>
                          <div className="info">
                            <span>Motif</span>
                            <h4>{app.label}</h4>
                          </div>
                          <div className="info">
                            <span>Docteur</span>
                            <h4>Mr milan</h4>
                          </div>
                          <div className="infos">
                            <span>Status</span>
                            {/* Modification ici: rendre le statut cliquable */}
                            <h4
                              onClick={() => handleStatusClick(app)}
                              style={{
                                cursor: app.status !== 'terminer' ? 'pointer' : 'default',
                                // color: app.status !== 'terminer' ? '#007bff' : 'inherit',
                                // textDecoration: app.status !== 'terminer' ? 'underline' : 'none'
                              }}
                              title={app.status !== 'terminer' ? 'Cliquez pour terminer ce rendez-vous' : 'Rendez-vous terminé'}
                            >
                              {app.status}
                            </h4>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="container-rigth-patient">
                <section>
                  <button onClick={() => setParams(true)}>
                    <Settings2 />
                    <span>Parametre du jour</span>
                  </button>
                  <button onClick={() => option ? setOption(false) : setOption(true)}>
                    <Settings />
                    <span>formulaires</span>
                  </button>
                </section>
                <div className="All-prescription">
                  <div className="presc">
                    <FileText size={30} />
                    <p>Toutes les Prescriptions</p>
                    <span>13</span>
                  </div>
                  <button onClick={() => setPresc(true)}>
                    <ChevronRight />
                  </button>
                </div>
                <div className="All-prescription">
                  <div className="presc">
                    <FileText size={30} />
                    <p>Hospitalisation & Operations</p>
                    <span>{countA}</span>
                  </div>
                  <button onClick={() => setHosp(true)}>
                    <ChevronRight />
                  </button>
                </div>
                <div className="All-consultation">
                  <div className="top">
                    <div className="presc">
                      <ClipboardList size={30} />
                      <p>Les Consultations</p>
                      <span>{consultations.length}</span>
                    </div>
                    <p id="p" onClick={() => setConsulte(true)}>
                      Tous voir
                    </p>
                  </div>
                  <div className="bottom">
                    {getDeuxActivitesRecentes && getDeuxActivitesRecentes.length === 0 ? (
                      <div className="none">
                        aucune consultation pour ce patient
                      </div>
                    ) : (
                      getDeuxActivitesRecentes.map((consulte, index) => (
                        <div key={index || consulte._id} className="card-consulte">
                          <div className="infos">
                            <span>Date consulte</span>
                            <h4>{formatDates(consulte.updatedAt)}</h4>
                          </div>
                          <div className="infos">
                            <span>Motif</span>
                            <h4>{consulte.label}</h4>
                          </div>
                          <div className="infos">
                            <span>Docteur</span>
                            {medecins.map((medecin, index) => (medecin._id === consulte.medecin) ? (
                              <h4>{medecin.nom}</h4>
                            ) : '')}
                          </div>
                        </div>))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modals existants */}
          {params && <ParametreDaysPatient aff={setParams} />}
          {presc && <Prescription aff={setPresc} patient={patient} />}
          {hosp && <Hospitalisation aff={setHosp} patient={patient} count={setCountA} />}
          {hospi && <AddHospitalisation aff={setHospi} patient={patient} />}
          {operation && <AddOperation aff={setOperation} patient={patient} />}
          {examen && <Examens aff={setExamen} />}
          {news && <NewAppoinement aff={setNews} patient={patient} />}
          {consulte && <ViewAllConsultation aff={setConsulte} patient={patient} />}
          {edit && <EditPatient aff={setEdit} patient={patient} />}
          {option && <Option aff={setOption} operation={setOperation} hospi={setHospi} />}
          {/* Nouveau modal pour terminer un rendez-vous */}
          {endAppointmentModal.isOpen && (
            <EndAppointmentModal
              appointment={endAppointmentModal.appointment}
              patient={patient}
              onClose={handleCloseEndAppointmentModal}
            />
          )}
        </>
      )}
    </>
  );
}
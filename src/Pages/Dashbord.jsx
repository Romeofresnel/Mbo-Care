import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import MedicalBar from "../Components/MedicalBar";
import {
  AlarmClock,
  ChevronRight,
  MessagesSquare,
  User,
  UserPlus,
  UserRound,
} from "lucide-react";
import DashbordSquelette from "../Components/DashbordSquelette";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getAllConsultations } from "../redux/ConsultationSlice";
import { UidContext } from "../AppContext";
import { medecinInfo, selectAuthStatus, selectMedecinInfo } from "../redux/AuthSlice";
import { getAllPatient, selectPatientsList } from "../redux/PatientSlice";
import { useNavigate } from "react-router";
import { getTodayAppointmentsByDoctor, selectAppointmentErrors, selectAppointmentLoading, selectTodayAppointments } from "../redux/AppoinementSlice";


export default function Dashbord() {
  const uid = useContext(UidContext);
  const medecin = useSelector(selectMedecinInfo);
  const status = useSelector(selectAuthStatus);;
  const { consultationList: consultations, status: statut } = useSelector((state) => state.consultation)
  const patients = useSelector(selectPatientsList)
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const todayAppointments = useSelector(selectTodayAppointments);
  const appointmentLoading = useSelector(selectAppointmentLoading);
  const appointmentErrors = useSelector(selectAppointmentErrors);
  useEffect(() => {
    console.log('Chargement des rendez-vous...', medecin._id);
    // Charger les rendez-vous du jour
    dispatch(getTodayAppointmentsByDoctor(medecin._id));

  }, [dispatch, medecin._id]);
  console.log(todayAppointments);


  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  };
  const filter = (activiteData, utilisateurUid) => {
    if (Array.isArray(activiteData) && activiteData) {
      const projectFiltrees = activiteData.filter(
        (project) => project.medecin === utilisateurUid
      );
      return projectFiltrees;
    }
    return [];
  };
  const filters = (activiteData, utilisateurUid) => {
    if (Array.isArray(activiteData) && activiteData) {
      const projectFiltrees = activiteData.filter(
        (project) => project.medecinId === utilisateurUid
      );
      return projectFiltrees;
    }
    return [];
  };
  const getDeuxActivitesRecentes = useMemo(() => {
    let filtered = filter(consultations, uid.uid);
    const projectTriees = filtered.sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    const deuxActivitesRecentes = projectTriees.slice(0, 4);
    return deuxActivitesRecentes;
  }, [consultations, uid.uid]);

  const getDeuxActivitesRecente = useMemo(() => {
    let filtered = filters(todayAppointments, uid.uid);
    const projectTriees = filtered.sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    const deuxActivitesRecentes = projectTriees.slice(0, 4);
    return deuxActivitesRecentes;
  }, [todayAppointments, uid.uid]);


  useEffect(() => {
    // Vérifier que l'UID existe et que les données ne sont pas déjà chargées
    if (uid?.uid && (status === 'idle' || (!medecin.nom && status !== 'loading'))) {
      console.log("Chargement des informations du médecin pour MedicalBar, UID:", uid.uid);
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid?.uid, medecin.nom]);

  useEffect(() => {
    dispatch(getAllConsultations())
    dispatch(getAllPatient())
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);
  console.log(getDeuxActivitesRecente);
  function formatDateFrench(date) {
    // Noms des jours en français
    const jours = [
      'dimanche', 'lundi', 'mardi', 'mercredi',
      'jeudi', 'vendredi', 'samedi'
    ];

    // Noms des mois en français
    const mois = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    // Extraire les composants de la date
    const jourSemaine = jours[date.getDay()];
    const jourMois = date.getDate();
    const nomMois = mois[date.getMonth()];
    const annee = date.getFullYear();
    const heure = date.getHours();

    // Retourner la date formatée
    return `${jourSemaine} ${jourMois} ${nomMois} ${annee}, ${heure}h`;
  }
  function formatSpecificDate(dateString) {
    const date = new Date(dateString);
    return formatDateFrench(date);
  }
  return (
    <>
      {isLoading ? (
        <DashbordSquelette />
      ) : (
        <div className="container-dashbord">
          <div className="dashbord-top">
            <div className="medical-bar">
              <MedicalBar />
            </div>
          </div>
          <div className="dashbord-bottom">
            <div className="bottom-left">
              <div className="top">
                <p>
                  <UserPlus size={36} />
                  <span>Derniers patients consultees</span>
                </p>
                <button onClick={() => navigate("/medecin/patient")}>
                  <span>tous voirs</span>
                  <ChevronRight />
                </button>
              </div>
              <div className="body">
                <div className="nav-patient">
                  <ul>
                    <li>Nom Patient</li>
                    <li>Libelle de consulte</li>
                    <li>date Naissance</li>
                    <li>Derniere consultation</li>
                  </ul>
                </div>
                <div className="container-patient">
                  {getDeuxActivitesRecentes && getDeuxActivitesRecentes.length === 0 ? (
                    <div className="none">
                      <UserRound />
                      <span>Aucun patient consulter recements</span>
                    </div>
                  ) :
                    getDeuxActivitesRecentes.map((consulte, index) => (
                      <div key={index || consulte._id} className="card">
                        <ul>
                          {patients.map((patient, index) => (patient._id === consulte.IdPatient) ? (
                            <>
                              <li>{patient.nom}</li>
                              <li>{consulte.label}</li>
                              <li>{patient.dateNaissance}</li>
                              <li>{formatDate(consulte.updatedAt)}</li>
                            </>

                          ) : "")
                          }
                        </ul>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="bottom-rigth">
              <div className="appoinement-cont">
                <div className="top">
                  <p>
                    <AlarmClock size={36} />
                    <span>Rendez-vous</span>
                  </p>
                  <button onClick={() => navigate('/medecin/agenda')}>
                    <ChevronRight size={30} />
                  </button>
                </div>
                <div className="bottom">
                  {getDeuxActivitesRecente && getDeuxActivitesRecente.length === 0 ? (
                    <div className="none">
                      <AlarmClock />
                      <span>Aucun rendez-vous pour aujourd'hui</span>
                    </div>
                  ) :
                    getDeuxActivitesRecente.map((app, index) => (
                      <div className="card-appoin">
                        <User />
                        <section>
                          <p>{formatSpecificDate(app.updatedAt)}</p>
                          <span>{patients.map((patient, index) => (patient._id === app.PatientId) ? patient.nom : '')}</span>
                        </section>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { Calendar, CalendarClock, Check, ChevronRight, CircleSlash2, Clock, Eye, Phone, Trash, User, X } from 'lucide-react'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';
import { UidContext } from '../AppContext';
import { useSelector } from 'react-redux';
import { medecinInfo } from '../redux/AuthSlice';
import { getAppointmentsByDoctor, selectDoctorAppointments, deleteAppointment, selectAppointmentLoading } from '../redux/AppoinementSlice';
import { getAllPatient, selectPatientsList } from '../redux/PatientSlice';
import AppointmentDetails from './AppointmentDetails';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Initialiser SweetAlert2 avec React
const MySwal = withReactContent(Swal);

export default function ViewAllAppointment({ aff }) {

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const uid = useContext(UidContext);
    const dispatch = useDispatch();
    const { medecinInfo: medecins, status: authStatus } = useSelector((state) => state.auth);
    const appointments = useSelector(selectDoctorAppointments);
    const patients = useSelector(selectPatientsList);
    const appointmentLoading = useSelector(selectAppointmentLoading);

    useEffect(() => {
        if (patients) {
            dispatch(getAllPatient())
        }
    }, [dispatch, patients]);

    const isDoctorReady = useMemo(() => {
        return medecins && medecins._id && authStatus === 'succeeded';
    }, [medecins, authStatus]);

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

    // Fonction pour gérer la suppression avec confirmation
    const handleDeleteAppointment = useCallback(async (appointment) => {
        try {
            // Trouver le patient associé au rendez-vous
            const patient = patients.find(p => p._id === appointment.PatientId);

            const result = await MySwal.fire({
                title: 'Confirmer la suppression',
                html: `
                    <div style="text-align: left; margin: 20px 0;" class='confirm'>
                        <p style="margin-bottom: 15px;">
                            <strong>Êtes-vous sûr de vouloir supprimer ce rendez-vous ?</strong>
                        </p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <p style="margin: 5px 0;"><strong>Libellé :</strong> ${appointment.label}</p>
                            <p style="margin: 5px 0;"><strong>Date :</strong> ${formatDate(appointment.appoinement_date)}</p>
                            <p style="margin: 5px 0;"><strong>Heure :</strong> ${appointment.appoinement_heure}</p>
                            <p style="margin: 5px 0;"><strong>Patient :</strong> ${patient ? patient.nom : 'Patient non trouvé'}</p>
                            <p style="margin: 5px 0;"><strong>Statut :</strong> ${appointment.status}</p>
                        </div>
                        <p style="color: #dc3545; font-weight: 500; margin-top: 15px;">
                            ⚠️ Cette action est irréversible !
                        </p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Oui, supprimer',
                cancelButtonText: 'Annuler',
                reverseButtons: true,
                focusCancel: true,
                customClass: {
                    popup: 'swal-wide',
                    title: 'swal-title',
                    htmlContainer: 'swal-html'
                }
            });

            if (result.isConfirmed) {
                // Afficher un indicateur de chargement
                MySwal.fire({
                    title: 'Suppression en cours...',
                    text: 'Veuillez patienter',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        MySwal.showLoading();
                    }
                });

                // Dispatch de l'action de suppression
                const deleteResult = await dispatch(deleteAppointment(appointment._id));

                if (deleteResult.type === 'appointments/delete/fulfilled') {
                    // Succès - Le tableau se met à jour automatiquement grâce au slice Redux
                    MySwal.fire({
                        title: 'Supprimé !',
                        text: 'Le rendez-vous a été supprimé avec succès.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Fermer les détails si le rendez-vous supprimé était affiché
                    if (selectedAppointment && selectedAppointment._id === appointment._id) {
                        setShowDetails(false);
                        setSelectedAppointment(null);
                    }

                    // Optionnel : Recharger la liste pour être sûr d'avoir les données à jour
                    // dispatch(getAppointmentsByDoctor(medecins._id));

                } else {
                    // Erreur lors de la suppression
                    const errorMessage = deleteResult.payload?.message || 'Erreur lors de la suppression du rendez-vous';
                    MySwal.fire({
                        title: 'Erreur !',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            MySwal.fire({
                title: 'Erreur !',
                text: 'Une erreur inattendue s\'est produite lors de la suppression.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }, [dispatch, patients, selectedAppointment, formatDate]);

    useEffect(() => {
        if (uid?.uid && authStatus === 'idle') {
            console.log('Chargement des informations du médecin...', uid.uid);
            dispatch(medecinInfo(uid.uid));
        }
    }, [dispatch, authStatus, uid?.uid]);

    useEffect(() => {
        if (isDoctorReady) {
            console.log('Chargement des rendez-vous du jour...', medecins._id);
            dispatch(getAppointmentsByDoctor(medecins._id));
        }
    }, [dispatch, isDoctorReady, medecins._id]);

    return (
        <>
            <div className="containers-params" onClick={(e) => e.target === e.currentTarget && aff(false)}>
                {showDetails ? <AppointmentDetails appointment={selectedAppointment}
                    isVisible={setShowDetails} /> : (
                    <div className="container-alls">
                        <section>
                            <p>
                                <CalendarClock size={30} />
                                <span>
                                    Tous vos rendez-vous
                                    ({appointments.length})
                                </span>
                            </p>
                            <X size={30} className="svg" onClick={() => aff(false)} />
                        </section>
                        <div className="container-data">
                            {appointments && appointments.length === 0 ? (
                                ""
                            ) : (
                                appointments.map((app, index) => (
                                    <div key={index} className='agenda'>
                                        {/* Informations du rendez-vous */}
                                        <div className='info'>
                                            <h4>{app.label}</h4>
                                            <section>
                                                <div className='circle'></div>
                                                <span>{app.status}</span>
                                            </section>
                                        </div>

                                        {/* Date et heure */}
                                        <div className='info1'>
                                            <h4>
                                                <Calendar />
                                                <span>{formatDate(app.appoinement_date)}</span>
                                            </h4>
                                            <span>
                                                <Clock size={20} />
                                                <p>{app.appoinement_heure}</p>
                                            </span>
                                        </div>

                                        {/* Informations patient */}
                                        <div className='infos'>
                                            <User size={40} />
                                            <section>
                                                {patients.map((path, index) => (app.PatientId === path._id ? (
                                                    <React.Fragment key={index}>
                                                        <h4>{path.nom}</h4>
                                                        <p>
                                                            <Phone size={16} />
                                                            <span>{path.telephone}</span>
                                                        </p>
                                                    </React.Fragment>
                                                )
                                                    : null)
                                                )}
                                            </section>
                                        </div>

                                        {/* Bouton d'action */}
                                        <div className='btn'>
                                            <button onClick={() => {
                                                setShowDetails(true)
                                                setSelectedAppointment(app);
                                            }}>
                                                <Eye />
                                            </button>
                                            {app.status === 'terminer' ? (
                                                <button >
                                                    <Check />
                                                </button>
                                            ) : (
                                                <button>
                                                    <CircleSlash2 />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteAppointment(app)}
                                                disabled={appointmentLoading.delete}
                                                title="Supprimer le rendez-vous"
                                            >
                                                <Trash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
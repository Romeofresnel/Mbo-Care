import React, { useContext, useEffect, useState } from 'react'
import { UidContext } from '../AppContext';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import AddHospitalisation from './AddHospitalisation';
import AddOperation from './AddOperation';
import { getAllMedecins, selectMedecinsList, selectMedecinStatus } from '../redux/MedecinSlice';
import { medecinInfo } from '../redux/AuthSlice';
import { ArrowLeft, Check, CheckCheck, FilePlus2, ShieldUser } from 'lucide-react';
import ParametreDay from '../Components/ParametreDay';
import AddPrescription from './AddPrescription';
import AddExamen from './AddExamen';
import { getPatientById, selectCurrentPatient, selectPatientStatus } from '../redux/PatientSlice';
import {
    updateConsultation,
    setCurrentConsultation,
    clearErrors,
    clearSuccessMessages
} from '../redux/ConsultationSlice';
import toast, { Toaster } from "react-hot-toast";


export default function EditConsultation({ aff, consultation }) {
    const [label, setLabele] = useState(consultation.label || '');
    const [diagnostic, setDiagnostic] = useState(consultation.diagnostic || '');
    const [aff1, setAff1] = useState(true);
    const [aff2, setAff2] = useState(false);
    const [aff3, setAff3] = useState(false);
    const [aff4, setAff4] = useState(false);
    const [aff5, setAff5] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const uid = useContext(UidContext);
    const dispatch = useDispatch();

    // Sélecteurs Redux
    const { medecinInfo: medecin, status: statut } = useSelector((state) => state.auth);
    const medecins = useSelector(selectMedecinsList);
    const patient = useSelector(selectCurrentPatient);
    const status = useSelector(selectMedecinStatus);
    const stat = useSelector(selectPatientStatus);

    // Sélecteurs pour les consultations
    const {
        loading,
        errors,
        successMessages,
        currentConsultation
    } = useSelector((state) => state.consultation);

    // Effets pour charger les données nécessaires
    useEffect(() => {
        if (statut === 'idle') {
            dispatch(medecinInfo(uid.uid));
        }
    }, [dispatch, statut, uid.uid]);
    console.log(medecin);

    useEffect(() => {
        if (consultation.IdPatient) {
            dispatch(getPatientById(consultation.IdPatient));
        }
    }, [dispatch, consultation.IdPatient]);

    useEffect(() => {
        if (medecins.length === 0 && status === 'idle') {
            dispatch(getAllMedecins());
        }
    }, [dispatch, medecins.length, status]);

    // Définir la consultation courante dans le store Redux
    useEffect(() => {
        dispatch(setCurrentConsultation(consultation));
        return () => {
            dispatch(clearErrors());
            dispatch(clearSuccessMessages());
        };
    }, [dispatch, consultation]);

    // Surveiller les changements dans les champs
    useEffect(() => {
        const labelChanged = label !== (consultation.label || '');
        const diagnosticChanged = diagnostic !== (consultation.diagnostic || '');
        setHasChanges(labelChanged || diagnosticChanged);
    }, [label, diagnostic, consultation]);

    // Gérer les états de chargement
    useEffect(() => {
        setIsLoading(loading.update);
    }, [loading.update]);

    // Gérer les messages de succès avec toast
    useEffect(() => {
        if (successMessages.update) {
            toast.success('Consultation modifiée avec succès !', {
                duration: 4000,
                position: 'top-right',
            });

            // Nettoyer le message après affichage
            setTimeout(() => {
                dispatch(clearSuccessMessages());
            }, 1000);
        }
    }, [successMessages.update, dispatch]);

    // Gérer les erreurs avec toast
    useEffect(() => {
        if (errors.update) {
            toast.error(`Erreur lors de la modification: ${errors.update}`, {
                duration: 5000,
                position: 'top-right',
            });

            // Nettoyer l'erreur après affichage
            setTimeout(() => {
                dispatch(clearErrors());
            }, 1000);
        }
    }, [errors.update, dispatch]);

    // Fonction pour gérer la soumission
    const handleSubmit = async () => {
        if (!label.trim() || !diagnostic.trim()) {
            toast.error('Veuillez remplir tous les champs obligatoires', {
                duration: 4000,
                position: 'top-right',
            });
            return;
        }

        // if (!hasChanges) {
        //     toast.warning('Aucune modification détectée', {
        //         duration: 3000,
        //         position: 'top-right',
        //     });
        //     return;
        // }

        // Préparer les données à envoyer
        const updateData = {
            label: label.trim(),
            diagnostic: diagnostic.trim(),
            // Conserver les autres données existantes
            medecin: medecin._id,
            IdPatient: consultation.IdPatient,
            date: consultation.date || new Date().toISOString()
        };

        try {
            // Afficher un toast de chargement
            const loadingToast = toast.loading('Modification en cours...', {
                position: 'top-right',
            });

            // Dispatch de l'action de mise à jour
            const result = await dispatch(updateConsultation({
                id: consultation._id,
                data: updateData
            })).unwrap();

            // Fermer le toast de chargement
            toast.dismiss(loadingToast);

            console.log('Consultation mise à jour avec succès:', result);

            // Optionnel: fermer le modal après succès
            // setTimeout(() => {
            //     aff(false);
            // }, 2000);

        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            // L'erreur sera gérée par le useEffect des erreurs
        }
    };

    // Fonction pour fermer le modal
    const handleClose = () => {
        if (hasChanges) {
            const confirmClose = window.confirm(
                'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer ?'
            );
            if (!confirmClose) return;
        }

        dispatch(clearErrors());
        dispatch(clearSuccessMessages());
        aff(false);
    };

    return (
        <>
            <div className="container-page-consultation modif">
                <div className="top-container">
                    <button onClick={handleClose} disabled={isLoading}>
                        <ArrowLeft size={30} />
                    </button>
                </div>
                <div className="bottom-container">
                    <div className="left-container">
                        <div className="section-motif">
                            <section>
                                <label htmlFor="">Motif Consultation :</label>
                                <input
                                    type="text"
                                    placeholder="entrer du texte ici"
                                    value={label}
                                    onChange={(e) => setLabele(e.target.value)}
                                    disabled={isLoading}
                                />
                            </section>
                        </div>
                        <div className="section-diagnostic">
                            <textarea
                                value={diagnostic}
                                onChange={(e) => setDiagnostic(e.target.value)}
                                placeholder="ecrivez votre diagnostic ici........."
                                disabled={isLoading}
                            />
                        </div>

                        {/* Les messages d'erreur et de succès sont maintenant gérés par react-hot-toast */}

                        <div className="section-button">
                            <section>
                                <button
                                    onClick={() => {
                                        setAff1(false);
                                        setAff2(false);
                                        setAff3(true);
                                    }}
                                    disabled={isLoading}
                                >
                                    <Check />
                                    <span>Ajouter un examen</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setAff1(false);
                                        setAff2(true);
                                        setAff3(false);
                                    }}
                                    disabled={isLoading}
                                >
                                    <FilePlus2 />
                                    <span>Ajouter une ordonnance</span>
                                </button>
                                {/* Bouton de modification */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !label.trim() || !diagnostic.trim() || !hasChanges}
                                    style={{
                                        opacity: (hasChanges && label.trim() && diagnostic.trim()) ? 1 : 0.5,
                                        cursor: (hasChanges && label.trim() && diagnostic.trim()) ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <CheckCheck />
                                    <span>
                                        {isLoading ? 'Modification en cours...' : 'Modifier'}
                                    </span>
                                </button>
                            </section>
                        </div>
                    </div>
                    <div className="rigth-container">
                        <div className="section-modulaire">
                            {aff1 && <ParametreDay aff={setAff4} aff1={setAff5} />}
                            {aff2 && <AddPrescription aff={setAff2} aff1={setAff1} patients={patient} />}
                            {aff3 && <AddExamen aff={setAff3} aff1={setAff1} />}
                        </div>
                        <div className="section-doctor">
                            <p className="pp">
                                <ShieldUser size={30} />
                                <span>Information medecin</span>
                            </p>
                            <section>
                                <p>
                                    <span>Nom medecin :</span>
                                    <h5>{medecins?.nom || 'jean claude'} {medecins?.prenom || 'bernard'}</h5>
                                </p>
                                <p>
                                    <span>Service medecine :</span>
                                    <h5>{medecins?.specialite || medecins?.service || 'Genicologie'}</h5>
                                </p>
                                <p>
                                    <span>contact :</span>
                                    <h5>{medecins?.telephone || medecins?.contact || '695 65 68 75'}</h5>
                                </p>
                                <p>
                                    <span>Matricule :</span>
                                    <h5>{medecins?.matricule || medecins?._id || '2365987456'}</h5>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            {aff4 && <AddHospitalisation aff={setAff4} patient={patient} />}
            {aff5 && <AddOperation aff={setAff5} patient={patient} />}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        fontFamily: 'font-principal',
                        fontSize: '14px',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        minWidth: '300px',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                            color: 'white',
                        },
                        iconTheme: {
                            primary: 'white',
                            secondary: '#10b981',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#ef4444',
                            color: 'white',
                        },
                        iconTheme: {
                            primary: 'white',
                            secondary: '#ef4444',
                        },
                    },
                    loading: {
                        duration: Infinity,
                        style: {
                            background: '#3b82f6',
                            color: 'white',
                        },
                        iconTheme: {
                            primary: 'white',
                            secondary: '#3b82f6',
                        },
                    },
                }}
            />
        </>
    )
}
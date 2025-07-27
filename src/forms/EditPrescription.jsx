import { FileText } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    updatePrescription,
    selectIsUpdatingPrescription,
    selectPrescriptionErrors,
    selectPrescriptionSuccessMessages,
    clearSpecificError,
    clearSpecificSuccessMessage
} from '../redux/PrescriptionSlice';

export default function EditPrescription({ aff, prescription }) {
    // États locaux pour les champs du formulaire
    const [libelle, setLibelle] = useState(prescription.libelle || '')
    const [Consultation, setConsultation] = useState(prescription.Consultation || '')

    const dispatch = useDispatch();

    // Sélecteurs Redux pour l'état de la mise à jour
    const isUpdating = useSelector(selectIsUpdatingPrescription);
    const errors = useSelector(selectPrescriptionErrors);
    const successMessages = useSelector(selectPrescriptionSuccessMessages);

    // Gérer la fermeture automatique après succès
    useEffect(() => {
        if (successMessages.update) {
            const timer = setTimeout(() => {
                dispatch(clearSpecificSuccessMessage('update'));
                aff(false); // Fermer le modal après succès
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [successMessages.update, dispatch, aff]);

    // Nettoyer les erreurs quand le composant se monte
    useEffect(() => {
        dispatch(clearSpecificError('update'));
        return () => {
            // Nettoyer les messages quand le composant se démonte
            dispatch(clearSpecificError('update'));
            dispatch(clearSpecificSuccessMessage('update'));
        };
    }, [dispatch]);

    // Gérer la soumission du formulaire
    const handleUpdate = async (e) => {
        e.preventDefault();

        // Préparer les données pour la mise à jour
        const updateData = {
            libelle: libelle.trim(),
            Consultation: Consultation.trim(),
            patient: prescription.patient,
            medecin: prescription.medecin
        };

        // Dispatch de l'action de mise à jour
        try {
            await dispatch(updatePrescription({
                id: prescription._id,
                data: updateData
            })).unwrap();
            // Le succès est géré dans useEffect ci-dessus
        } catch (error) {
            // L'erreur est automatiquement gérée par le slice
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    return (
        <>
            <div className='edit-container'>
                <div className='entete'>
                    <FileText size={30} />
                    <span>Prescription : {libelle}</span>
                </div>
                <div className='body'>
                    <div className='libelle'>
                        <label htmlFor="libelle">Libelle :</label>
                        <input
                            type="text"
                            id="libelle"
                            value={libelle}
                            onChange={(e) => setLibelle(e.target.value)}
                            disabled={isUpdating}
                        />
                    </div>
                    <div className='body'>
                        <label htmlFor="consultation">Ordonnance :</label>
                        <textarea
                            id="consultation"
                            cols="30"
                            value={Consultation}
                            onChange={(e) => setConsultation(e.target.value)}
                            disabled={isUpdating}
                        />
                    </div>
                </div>

                {/* Affichage des messages d'erreur */}
                {errors.update && (
                    <div style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid #ff9999', borderRadius: '4px' }}>
                        {errors.update}
                    </div>
                )}

                {/* Affichage des messages de succès */}
                {successMessages.update && (
                    <div style={{ color: 'green', margin: '10px 0', padding: '10px', backgroundColor: '#e6ffe6', border: '1px solid #99ff99', borderRadius: '4px' }}>
                        {successMessages.update}
                    </div>
                )}

                <div className='btn'>
                    <button
                        className='cancel'
                        onClick={() => aff(false)}
                        disabled={isUpdating}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Modification...' : 'Modifier'}
                    </button>
                </div>
            </div>
        </>
    )
}
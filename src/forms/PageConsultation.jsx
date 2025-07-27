import {
  ArrowLeft,
  Check,
  CheckCheck,
  FilePlus2,
  ShieldUser,
} from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import ParametreDay from "../Components/ParametreDay";
import AddPrescription from "./AddPrescription";
import AddExamen from "./AddExamen";
import AddHospitalisation from "./AddHospitalisation";
import AddOperation from "./AddOperation";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { medecinInfo } from "../redux/AuthSlice";
import { UidContext } from "../AppContext";
import { addConsultation, updateConsultation } from "../redux/ConsultationSlice";
import { toast } from 'react-toastify'; // Assumant que vous utilisez react-toastify

export default function PageConsultation({ aff, patient }) {
  const [label, setLabele] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [aff1, setAff1] = useState(true);
  const [aff2, setAff2] = useState(false);
  const [aff3, setAff3] = useState(false);
  const [aff4, setAff4] = useState(false);
  const [aff5, setAff5] = useState(false);

  // État pour gérer le mode modification
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentConsultationId, setCurrentConsultationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const uid = useContext(UidContext);
  const { medecinInfo: medecins, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid.uid]);

  // Validation du formulaire
  const validateForm = () => {
    if (!label.trim()) {
      toast.error('Le motif de consultation est obligatoire');
      return false;
    }
    if (!diagnostic.trim()) {
      toast.error('Le diagnostic est obligatoire');
      return false;
    }
    if (!medecins?._id) {
      toast.error('Informations du médecin manquantes');
      return false;
    }
    return true;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const IdPatient = patient._id;
    const medecin = medecins._id;
    const consultationData = {
      label: label.trim(),
      diagnostic: diagnostic.trim(),
      medecin,
      IdPatient
    };

    try {
      if (isEditMode && currentConsultationId) {
        // Mode modification - Envoyer les données avec l'ID
        const updateData = {
          ...consultationData,
          _id: currentConsultationId
        };

        const resultAction = await dispatch(updateConsultation({
          id: currentConsultationId,
          data: updateData
        }));

        if (updateConsultation.fulfilled.match(resultAction)) {
          toast.success('Consultation modifiée avec succès');
        } else {
          toast.error('Erreur lors de la modification de la consultation');
        }
      } else {
        // Mode ajout
        const resultAction = await dispatch(addConsultation(consultationData));

        if (addConsultation.fulfilled.match(resultAction)) {
          // Récupérer la consultation créée depuis la réponse
          const createdConsultation = resultAction.payload;
          console.log('Consultation créée:', createdConsultation); // Debug

          // Extraire l'ID selon la structure de réponse de votre API
          const consultationId = createdConsultation?._id ||
            createdConsultation?.id ||
            createdConsultation?.data?._id ||
            createdConsultation?.data?.id;

          if (consultationId) {
            // Passer en mode modification
            setIsEditMode(true);
            setCurrentConsultationId(consultationId);

            toast.success('Consultation ajoutée avec succès. Vous pouvez maintenant la modifier.');
          } else {
            toast.success('Consultation ajoutée avec succès');
            console.warn('ID de consultation non trouvé dans la réponse:', createdConsultation);
          }
        } else {
          toast.error('Erreur lors de l\'ajout de la consultation');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="container-page-consultation">
        <div className="top-container">
          <button onClick={() => aff(false)} disabled={isLoading}>
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
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !label.trim() || !diagnostic.trim()}
                >
                  <CheckCheck />
                  <span>
                    {isLoading
                      ? (isEditMode ? 'Modification...' : 'Ajout...')
                      : (isEditMode ? 'Modifier' : 'Soumettre')
                    }
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
    </>
  );
}
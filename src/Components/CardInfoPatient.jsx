import React from "react";
import { User } from "lucide-react";

export default function CardInfoPatient({ aff, patient, count1, count2 }) {
  return (
    <>
      <div className="info-patient-left">
        <User />
        <section>
          <h3>{patient.nom + " " + patient.prenom}</h3>
          <p>+237 {patient.telephone}</p>
        </section>
        <div className="bts">
          <button>
            <p>consultation</p>
            <span>
              <strong>{count1}</strong>
            </span>
          </button>
          <button>
            <p>rendez-vous</p>
            <span>
              <strong>{count2}</strong>
            </span>
          </button>
        </div>
        <button className="btn" onClick={() => aff(true)}>
          Nouvelle Consultation
        </button>
      </div>
      <div className="info-patient-rigth">
        <div className="info">
          <span>Nom</span>
          <h4>{patient.nom}</h4>
        </div>
        <div className="info">
          <span>Prenom</span>
          <h4>{patient.prenom}</h4>
        </div>
        <div className="info">
          <span>Date naissance</span>
          <h4>{patient.dateNaissance}</h4>
        </div>
        <div className="info">
          <span>Lieu naissance</span>
          <h4>{patient.lieuNaissance}</h4>
        </div>
        <div className="info">
          <span>Genre/ Sexe</span>
          <h4>{patient.sexe}</h4>
        </div>
        <div className="info">
          <span>Groupe sanguin</span>
          <h4>{patient.groupeSanguin}</h4>
        </div>
        <div className="info">
          <span>Contact d'urgence</span>
          <h4>699 34 56 21</h4>
        </div>
        <div className="info">
          <span>Ville residence</span>
          <h4>{patient.domicile}</h4>
        </div>
      </div>
    </>
  );
}

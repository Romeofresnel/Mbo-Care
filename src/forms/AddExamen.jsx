import { FilePlus2, HandHeart, Send } from "lucide-react";
import React from "react";

export default function AddExamen({ aff, aff1 }) {
  return (
    <>
      <div className="container-form-prescription">
        <p className="pp">
          <HandHeart size={30} />
          <span>Demande d'examen</span>
        </p>
        <section>
          <input type="text" placeholder="envoyer à :" />
          <textarea cols={2} rows={2}></textarea>
        </section>
        <div className="boutons">
          <button
            className="cancel"
            onClick={() => {
              aff(false);
              aff1(true);
            }}
          >
            Annuler
          </button>
          <button>
            <Send size={19} />
            <span>Envoyer</span>
          </button>
        </div>
      </div>
    </>
  );
}

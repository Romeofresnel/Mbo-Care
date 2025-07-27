import {
  Activity,
  HeartPulse,
  Settings2,
  Thermometer,
  Weight,
} from "lucide-react";
import React from "react";


export default function ParametreDaysPatient({ aff }) {
  return (
    <>
      <div className="containers-params" onClick={(e) => e.target === e.currentTarget && aff(false)}>
        <div className="container-form">
          <section>
            <Settings2 size={30} />
            <span>Parametre du jour</span>
          </section>
          <form action="#">
            <div className="params">
              <label for="">
                <Thermometer />
                <span>Temperature</span>
              </label>
              <input type="number" />
            </div>
            <div className="params grids">
              <div className="grid">
                <label for="">
                  <Weight />
                  <span>Poids</span>
                </label>
                <input type="number" />
              </div>
              <div className="grid">
                <label for="">
                  <Activity />
                  <span>Pul</span>
                </label>
                <input type="number" />
              </div>
            </div>
            <div className="params">
              <label for="">
                <HeartPulse />
                <span>Tension arterielle</span>
              </label>
              <input type="number" />
            </div>
            <div className="btns">
              <button className="btn" onClick={() => aff(false)}>
                Cancel
              </button>
              <button>Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

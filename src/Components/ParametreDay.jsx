import {
  Activity,
  Bed,
  CircleUser,
  HandHeart,
  HeartPulse,
  Hospital,
  Thermometer,
  Weight,
} from "lucide-react";
import React from "react";

export default function ParametreDay({ aff, aff1 }) {
  return (
    <>
      <div className="container-consulte-parametre">
        <div className="container-parametre">
          <p className="pp">
            <CircleUser size={30} />
            <span>Parametre du jour</span>
          </p>
          <section>
            <div className="params">
              <p>
                <Thermometer size={20} />
                <span>Temperature :</span>
              </p>
              <span>32°C</span>
            </div>
            <div className="params">
              <p>
                <Weight size={20} />
                <span>Poids :</span>
              </p>
              <span>32 Kg</span>
            </div>
            <div className="params">
              <p>
                <HeartPulse size={20} />
                <span>Tension arterielle :</span>
              </p>
              <span>32 p/min</span>
            </div>
            <div className="params">
              <p>
                <Activity size={20} />
                <span>Poul :</span>
              </p>
              <span>32°C</span>
            </div>
          </section>
        </div>
        <div className="container-situation">
          <p className="pp">
            <Hospital size={30} />
            <span>Situation hospitaliere</span>
          </p>
          <section>
            <button onClick={() => aff(true)}>
              <Bed />
              <span>Hospitaliser</span>
            </button>
            <button className="operation" onClick={() => aff1(true)}>
              <HandHeart />
              <span>Operation</span>
            </button>
          </section>
        </div>
      </div>
    </>
  );
}

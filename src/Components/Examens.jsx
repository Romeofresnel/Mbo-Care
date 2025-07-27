import React from "react";
import { Download, File, FileText, X } from "lucide-react";

export default function Examens({ aff }) {
  return (
    <>
      <div className="containers-params">
        <div className="container-alls">
          <section>
            <p>
              <FileText size={30} />
              <span>Toutes les documents des examens</span>
            </p>
            <X size={30} className="svg" onClick={() => aff(false)} />
          </section>
          <div className="container-data">
            <div className="card-alls">
              <p>
                <File />
                <span>Ordonnance</span>
              </p>
              <div className="section">
                <p>2025-03-25</p>
                <Download />
              </div>
            </div>
            <div className="card-alls">
              <p>
                <File />
                <span>Ordonnance</span>
              </p>
              <div className="section">
                <p>2025-03-25</p>
                <Download />
              </div>
            </div>
            <div className="card-alls">
              <p>
                <File />
                <span>Ordonnance</span>
              </p>
              <div className="section">
                <p>2025-03-25</p>
                <Download />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

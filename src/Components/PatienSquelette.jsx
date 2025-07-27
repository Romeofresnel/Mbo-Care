import React from "react";

export default function PatienSquelette() {
  return (
    <>
      <div className="patients-container-squelette">
        <div className="patients-top">
          <div className="patient-entete"></div>
          <div className="patients-nav">
            <div className="patients-link">
              <a href="#"></a>
              <a href="#"></a>
            </div>
            <div className="patients-middle"></div>
            <div className="patients-option">
              <span></span>
              <button></button>
            </div>
          </div>
        </div>
        <div className="patients-bottom">
          <div className="nav-patients">
            <ul>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
          <div className="container-all-patients">
            <div className="card-patient">
              <ul></ul>
            </div>
            <div className="card-patient">
              <ul></ul>
            </div>
            <div className="card-patient">
              <ul></ul>
            </div>
            <div className="card-patient">
              <ul></ul>
            </div>
            <div className="card-patient">
              <ul></ul>
            </div>
            <div className="card-patient">
              <ul></ul>
            </div>
            <div className="card-patient">
              <ul></ul>
            </div>
            <div className="card-patient">
              <ul></ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

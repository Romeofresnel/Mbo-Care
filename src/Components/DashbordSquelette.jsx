import React from "react";
import MedicalBar from "./MedicalBar";
import {
  AlarmClock,
  ChevronRight,
  MessagesSquare,
  User,
  UserPlus,
} from "lucide-react";

export default function DashbordSquelette() {
  return (
    <>
      <div className="container-dashbord-squelette">
        <div className="dashbord-top">
          <div className="medical-bar">
            <MedicalBar />
          </div>
        </div>
        <div className="dashbord-bottom">
          <div className="bottom-left">
            <div className="top">
              <p></p>
              <button></button>
            </div>
            <div className="body">
              <div className="nav-patient">
                <ul>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
              </div>
              <div className="container-patient">
                <div className="card">
                  <ul></ul>
                </div>
                <div className="card">
                  <ul></ul>
                </div>
                <div className="card">
                  <ul></ul>
                </div>
                <div className="card">
                  <ul></ul>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-rigth">
            <div className="appoinement-cont">
              <div className="top">
                <p></p>
              </div>
              <div className="bottom">
                <div className="card-appoin">
                  <section></section>
                </div>
              </div>
              <div className="bottom">
                <div className="card-appoin">
                  <section></section>
                </div>
              </div>
            </div>
            <div className="discu-cont">
              <div className="top">
                <p></p>
                <button></button>
              </div>
              <div className="bottom">
                <div className="card-appoin">
                  <div className="img">
                    <img src="/doc.jpg" alt="pic-user" />
                  </div>
                  <section></section>
                </div>
                <div className="card-appoin">
                  <div className="img">
                    <img src="/doc.jpg" alt="pic-user" />
                  </div>
                  <section></section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

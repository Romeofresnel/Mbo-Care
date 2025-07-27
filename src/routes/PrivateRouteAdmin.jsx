import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashbord from "../Pages/Dashbord";
import Patient from "../Pages/Patient";
import Agenda from "../Pages/Agenda";
// import Discussion from "../Pages/Discussion";
import Medecin from "../Pages/Medecin";
import Chambre from "../Pages/Chambre";
import Profil from "../Pages/Profil";
import Layout from "../Pages/Layout";
import Caisse from "../Pages/Caisse";

export default function PrivateRouteAdmin() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashbord />} />
          <Route path="dashbord" element={<Dashbord />} />
          <Route path="patient" element={<Patient />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="caisse" element={<Caisse />} />
          <Route path="medecin" element={<Medecin />} />
          <Route path="chambre" element={<Chambre />} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Routes>
    </div>
  );
}

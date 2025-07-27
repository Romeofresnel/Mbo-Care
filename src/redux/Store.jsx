import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./AuthSlice";
import patientSlice from "./PatientSlice";
import consultationSlice from "./ConsultationSlice";
import prescriptionSlice from "./PrescriptionSlice";
import hospitalisationSlice from "./HospitalisationSlice";
import operationSlice from "./OperationSlice";
import appointmentSlice from "./AppoinementSlice";
import medecinSlice from "./MedecinSlice";
import serviceSlice from "./ServiceSlice";
import chambreSlice from "./ChambreSlice";
import caisseSlice from "./CaisseSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    patient: patientSlice,
    consultation: consultationSlice,
    prescription: prescriptionSlice,
    hospitalisation: hospitalisationSlice,
    operation: operationSlice,
    appointments: appointmentSlice,
    medecin: medecinSlice,
    service: serviceSlice,
    chambre: chambreSlice,
    caisse: caisseSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
  devTools: true,
});
export default store;

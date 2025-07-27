import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./Pages/Login";
import PrivateRouteAdmin from "./routes/PrivateRouteAdmin";
import AuthGuard from "./AuthGuard";
import { useEffect, useState } from "react";
import { UidContext } from "./AppContext";

function App() {
  const [uid, setUid] = useState(() => {
    const storedUserId = localStorage.getItem("_id");
    return storedUserId ? storedUserId.toString() : "";
  });
  
  return (
    <>
      <UidContext.Provider value={{ uid, setUid }}>
        <BrowserRouter>
          <Routes>
            <Route index element={<Login />} />
            <Route path="/auth/login" element={<Login />} />
            <Route
              path="/medecin/*"
              element={
                <AuthGuard>
                  <PrivateRouteAdmin />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </UidContext.Provider>
    </>
  );
}

export default App;

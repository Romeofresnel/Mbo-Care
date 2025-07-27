import React, { useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { UidContext } from "../AppContext";
import { medecinInfo, selectAuthStatus, selectMedecinInfo } from "../redux/AuthSlice";
import { useNavigate } from "react-router";
import logo from '../img/scope.jpg'

import {
  Bed,
  Blocks,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  ScanHeart,
  UserRound,
  UserRoundPen,
  Users,
  Wallet,
} from "lucide-react";
import { accountService } from "../services/Account.service";

export default function NavBarLink() {
  const uid = useContext(UidContext);
  const medecin = useSelector(selectMedecinInfo);
  const status = useSelector(selectAuthStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    // Vérifier que l'UID existe et que les données ne sont pas déjà chargées
    if (uid?.uid && (status === 'idle' || (!medecin.nom && status !== 'loading'))) {
      console.log("Chargement des informations du médecin pour MedicalBar, UID:", medecin);
      dispatch(medecinInfo(uid.uid));
    }
  }, [dispatch, status, uid?.uid, medecin.nom]);

  // Définition des accès par rôle
  const roleAccess = {
    medecin: [
      'dashbord',
      'patient',
      'agenda',
      'profil'
    ],
    infirmier: [
      'dashbord',
      'patient',
      'profil'
    ],
    infirmiere: [
      'dashbord',
      'patient',
      'profil'
    ],
    chef: [
      'dashbord',
      'patient',
      'agenda',
      'caisse',
      'medecin',
      'chambre',
      'profil'
    ],
    caissiere: [
      'dashbord',
      'caisse',
      'profil'
    ]
  };

  // Fonction pour vérifier si un lien est accessible selon le rôle
  const hasAccess = (linkName) => {
    if (!medecin.poste) return false;

    const userRole = medecin.poste.toLowerCase();
    const allowedLinks = roleAccess[userRole] || [];

    return allowedLinks.includes(linkName);
  };

  // Configuration des liens de navigation
  const navigationLinks = [
    {
      path: "/medecin/dashbord",
      name: "dashbord",
      icon: LayoutDashboard,
      label: "Dashbord"
    },
    {
      path: "/medecin/patient",
      name: "patient",
      icon: UserRound,
      label: "Patients"
    },
    {
      path: "/medecin/agenda",
      name: "agenda",
      icon: CalendarDays,
      label: "Agenda"
    },
    {
      path: "/medecin/caisse",
      name: "caisse",
      icon: Wallet,
      label: "Caisse"
    },
    {
      path: "/medecin/medecin",
      name: "medecin",
      icon: Users,
      label: "Personnels"
    },
    {
      path: "/medecin/laboratoire",
      name: "laboratoire",
      icon: ScanHeart,
      label: "Laboratoire"
    },
    {
      path: "/medecin/chambre",
      name: "chambre",
      icon: Blocks,
      label: "Services &"
    },
    {
      path: "/medecin/profil",
      name: "profil",
      icon: UserRoundPen,
      label: "Profil"
    }
  ];

  return (
    <>
      <div className="container-link">
        <div className="container-link-top">
          <div className="container-logo">
            <img src={logo} alt="logo" />
          </div>
          <h3>Mboa Care</h3>
        </div>
        <div className="container-link-bottom">
          <div className="container-menu">
            <ul>
              {navigationLinks.map((link) => {
                // Afficher le lien seulement si l'utilisateur y a accès
                if (!hasAccess(link.name)) {
                  return null;
                }

                const IconComponent = link.icon;

                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={(nav) => (nav.isActive ? "active" : "")}
                    id="use"
                  >
                    <li>
                      <IconComponent className="icons" />
                      <span>{link.label}</span>
                    </li>
                  </NavLink>
                );
              })}
              <li className="lis" onClick={() => {
                accountService.logout()
                navigate('/auth/login')
              }}>
                <LogOut className="icons" />
                <span>Deconnexion</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
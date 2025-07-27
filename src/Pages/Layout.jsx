import React from "react";
import NavBarLink from "../Components/NavBarLink";
import NavBarUser from "../Components/NavBarUser";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <div className="layout-container">
        <div className="container-left">
          <NavBarLink />
        </div>
        <div className="container-rigth">
          <NavBarUser />
          <Outlet />
        </div>
      </div>
    </>
  );
}

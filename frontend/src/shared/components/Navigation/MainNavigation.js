import React from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

import "./MainNavigation.css";
import MainHeader from "./MainHeader";
import SideDrawer from "./SideDrawer";
import NavLinks from "./NavLinks";

const MainNavigation = (props) => {
  return (
    <>
      <SideDrawer>
        <nav className="main-navigation__drawer-nav">
          <NavLinks/>
        </nav>
      </SideDrawer>
      <MainHeader>
        <button className="main-navigation__menu-btn">
          <span />
          <span />
          <span />
        </button>
        <h1 className="main-navigation__title">
          <Link to="/">YourPlaces</Link>
        </h1>
        <nav className="main-navigation__header-nav">
          <NavLinks />
        </nav>
      </MainHeader>
    </>
  );
};

export default MainNavigation;

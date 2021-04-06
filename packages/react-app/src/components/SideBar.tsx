import React from "react";
import SidebarItem from "./SideBarItem";

let SideBar = () => {
    return (
        <div className="wrapper-sidebar">
            <SidebarItem text="Pools" imgsrc="images/ethereumLogo.png" />
            <a target="_blank" href="https://github.com/austintgriffith/scaffold-eth">
                <img className="sidebar-scaffold" src="images/scaffoldeth.png" alt="" />
            </a>
        </div>
    )
}

export default SideBar;
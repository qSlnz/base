import React from "react";
import SidebarItem from "./SideBarItem";

let SideBar = () => {
    return (
        <div className="wrapper-sidebar">
            <SidebarItem text="App1" imgsrc="images/ethereumLogo.png" />
            <SidebarItem text="App2" imgsrc="images/ethereumLogo.png" />
        </div>
    )
}

export default SideBar;
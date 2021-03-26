import React from "react";
import LoginBar from "./LoginBar";
import TopBar from "./TopBar";


let MainScreen = () => {
    return (
        <div className="mainscreen">
            <TopBar />
            <LoginBar />
        </div>
    )
}

export default MainScreen;
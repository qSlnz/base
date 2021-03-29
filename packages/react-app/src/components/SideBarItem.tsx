import React from "react";
/*
    Ne marche pas car l'image est inaccessible pour je ne sais quelle raison
*/


let SideBarItem = ({ text, imgsrc }: { text: string, imgsrc: string }) => {
    return (
        <div className="sidebar-item">
            <img className="sidebar-item-image" src={imgsrc} alt="" />
            <div className="sidebar-item-text">
                {text}
            </div>
        </div>
    )
}

export default SideBarItem;
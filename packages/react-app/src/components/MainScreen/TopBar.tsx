import React from "react";

export default function TopBar() {
    let message: Array<any> = [];

    for (let index = 0; index < 10; index++) {
        message.push(<span className="topbar-unit">
            🔥🔥 New amazing APP 🚀🚀
                </span>);
        message.push(<span className="topbar-space">.</span>);
    }

    return (
        <div className="topbar">
            <div className="topbar-animation">
                {message}
            </div>
        </div>
    );
}


import React from "react";

let Counter = ({ data }: { data: number }) => {
    return (
        <div className="dapp-unitpool-data">
            Remaining time: {data}s
        </div>
    )
};

export default Counter;
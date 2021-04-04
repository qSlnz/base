import React, { useEffect, useState } from "react";

let Counter = ({ remTime, poolId }: { remTime: number, poolId: number }) => {
    const [remainingTime, setRemainingTime] = useState(remTime);
    const [timer, setTimer] = useState<NodeJS.Timeout>();

    useEffect(() => {
        console.log("CreateTimer: " + poolId);

        setTimer(setInterval(() => {
            console.log("Hehe: " + poolId);
            setRemainingTime(oldTime => oldTime - 1 < 0 ? 0 : oldTime - 1);
        }, 1000));
    }, []);

    useEffect(() => {
        console.log("control: " + poolId);
        if (timer && remainingTime <= 0) {
            console.log("On clear: " + poolId);
            clearInterval(timer);
        }
    }, [remainingTime]);

    return (
        ((remainingTime > 0 &&
            <div className="dapp-unitpool-data">
                🕐 Remaining time: {remainingTime}s
            </div>) ||
            <div className="dapp-unitpool-data">
                ⏰ Time elapsed
            </div>
        )
    )
};

export default Counter;
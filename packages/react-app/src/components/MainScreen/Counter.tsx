import React, { useEffect, useState } from "react";

let Counter = ({ remTime, poolId, timeout }: { remTime: number, poolId: number, timeout: () => void }) => {
    const [remainingTime, setRemainingTime] = useState(remTime);
    const [initTimer, setInitTimer] = useState(false);
    const [timer, setTimer] = useState<NodeJS.Timeout>();

    useEffect(() => {
        if (remTime > 0 && !initTimer) {
            let tmptimer = setInterval(() => {
                setRemainingTime(oldTime => oldTime - 1 < 0 ? 0 : oldTime - 1);
            }, 1000);

            setTimer(tmptimer);
            setInitTimer(true);
        }
    }, [remTime]);

    useEffect(() => {
        if (remainingTime <= 0 && initTimer && timer) {
            clearInterval(timer);
            timeout();
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
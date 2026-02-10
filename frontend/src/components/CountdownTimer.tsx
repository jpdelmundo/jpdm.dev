import { useEffect, useState } from "react";

type Props = {
    endTimeMs: number;
    onComplete: () => void;
}

export const CountdownTimer = ({ endTimeMs, onComplete }: Props) => {
    //const [mSecondsLeft, setMSecondsLeft] = useState(endTimeMs);
    const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.ceil(endTimeMs / 1000)));
    // const intervalId = useRef<NodeJS.Timeout | number | undefined>(undefined);

    useEffect(() => {
        let secsLeft = secondsLeft;
        if (secsLeft <= 0) {
            onComplete();
            return;
        }

        const intervalId = setInterval(() => {
            secsLeft--;
            if (secsLeft == 0) {
                clearInterval(intervalId);
                onComplete();
                return;
            }
            setSecondsLeft(secsLeft);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [endTimeMs]);

    return <span>{secondsLeft} second{secondsLeft > 1 ? 's' : ''}</span>;
}
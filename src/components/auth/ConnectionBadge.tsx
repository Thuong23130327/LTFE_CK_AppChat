import {useEffect, useState} from "react";
import {ws} from "../../services/websocket";
import "./ConnectionBadge.css";

export function ConnectionBadge() {
    const [isOnline, setIsOnline] = useState(ws.getStatus());

    useEffect(() => {
        const handleStatus = (status: boolean) => {
            setIsOnline(status);
        };

        ws.addStatusListener(handleStatus);
        return () => {
            ws.removeStatusListener(handleStatus);
        };
    }, []);

    return (
        <span className={isOnline ? "status-badge online" : "status-badge offline"}>
      <span className="status-dot"></span>
            {isOnline ? "Đang hoạt động" : "Offline"}
    </span>
    );
}
import { useEffect } from "react";
import { ws } from "../services/websocket";
import { useAppDispatch } from "./useAppRedux";
import { loginSuccess, logout, setCheckingAuth } from "../store/slices/authSlice";
import type { WsResponse } from "../types/chat";

export function useAuthInit() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const savedUser = localStorage.getItem("username");
        const savedCode = localStorage.getItem("reLoginCode");

        if (!savedUser || !savedCode) {
            dispatch(setCheckingAuth(false));
            return;
        }

        const onMessage = (res: WsResponse) => {
            if (res.event === "RE_LOGIN") {
                if (res.status === "success" && res.data) {
                    const username = localStorage.getItem("username") || "";
                    const newCode = res.data.RE_LOGIN_CODE;

                    if (newCode) {
                        localStorage.setItem("reLoginCode", newCode);
                    }

                    dispatch(
                        loginSuccess({
                            username: username,
                            reLoginCode: newCode || "",
                        })
                    );
                } else {
                    localStorage.removeItem("username");
                    localStorage.removeItem("reLoginCode");
                    dispatch(logout());
                }
            }
        };

        ws.addMessageListener(onMessage);

        ws.send("RE_LOGIN", {
            user: savedUser,
            code: savedCode,
        });

        return () => {
            ws.removeMessageListener(onMessage);
        };
    }, [dispatch]);
}
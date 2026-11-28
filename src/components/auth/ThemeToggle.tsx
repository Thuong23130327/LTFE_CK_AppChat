import { useEffect, useState } from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(
        localStorage.getItem("darkMode") === "true"
    );

    useEffect(() => {
        if (isDark) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
        localStorage.setItem("darkMode", String(isDark));
    }, [isDark]);

    return (
        <button
            type="button"
            className="sidebar-action-btn"
            title={isDark ? "Chế độ sáng" : "Chế độ tối"}
            onClick={() => setIsDark(!isDark)}
        >
            {isDark ? <IoSunnyOutline /> : <IoMoonOutline />}
        </button>
    );
}
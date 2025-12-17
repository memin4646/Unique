import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonPrimaryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    icon?: React.ReactNode;
}

export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
    children,
    className = "",
    isLoading,
    variant = "primary",
    icon,
    ...props
}) => {
    const baseStyles =
        "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-cinema-500 to-fuchsia-500 text-white shadow-lg shadow-purple-900/40 hover:brightness-110",
        secondary: "bg-cinema-800 text-white border border-white/10 hover:bg-cinema-700",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
        ghost: "bg-transparent text-gray-400 hover:text-white",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : icon}
            {children}
        </button>
    );
};

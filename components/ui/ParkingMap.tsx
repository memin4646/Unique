"use client";
import React from "react";
import { Car, Star, Percent, Truck, Info } from "lucide-react";

interface ParkingMapProps {
    onSlotSelect: (rowId: string, colId: number) => void;
    selectedSlot: string | null;
    vehicleType: "sedan" | "suv" | null;
    occupiedSlots?: string[];
    basePrice?: number;
}

const ROWS = [
    { id: "A", type: "sedan" },
    { id: "B", type: "sedan" },
    { id: "C", type: "any" },
    { id: "D", type: "any" },
    { id: "E", type: "suv" },
    { id: "F", type: "suv" },
];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

export const ParkingMap: React.FC<ParkingMapProps> = ({ onSlotSelect, selectedSlot, vehicleType, occupiedSlots = [], basePrice = 200 }) => {
    // ... (logic remains same)
    const getSlotStatus = (rowId: string, colId: number) => {
        const slotId = `${rowId}-${colId}`;
        if (occupiedSlots.includes(slotId)) return "occupied";
        return "available";
    };

    const getTier = (rowId: string, colId: number) => {
        if (colId === 1 || colId === 8 || rowId === "F") return "economy";
        if (["A", "B", "C"].includes(rowId)) return "vip";
        return "standard";
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto relative z-10 px-4">

            {/* Screen Visualization */}
            <div className="w-full mb-10 relative group perspective-[1000px]">
                <div className="w-full h-16 bg-gradient-to-b from-white/20 to-transparent rounded-lg transform rotate-x-12 origin-bottom scale-95 border-t border-white/50 shadow-[0_-20px_60px_rgba(255,255,255,0.3)] animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/50 text-xs font-bold tracking-[0.5em] uppercase drop-shadow-lg">Sinema Perdesi</span>
                </div>
            </div>

            {/* Parking Grid */}
            <div className="flex flex-col gap-4 w-full items-center pb-20 overflow-x-auto no-scrollbar">

                {ROWS.map((row) => (
                    <div key={row.id} className="flex items-center gap-3">
                        {/* Row Label (Left) */}
                        <div className="w-6 text-xs font-bold text-gray-600 flex justify-end">{row.id}</div>

                        <div className="flex gap-1 bg-black/20 p-1.5 rounded-xl border border-white/5">
                            {COLS.map((col) => {
                                const id = `${row.id}-${col}`;
                                const isSelected = selectedSlot === id;
                                const status = getSlotStatus(row.id, col);
                                const tier = getTier(row.id, col);
                                const isOccupied = status === "occupied";

                                // Dynamic Styles
                                let baseStyles = "relative w-7 h-9 md:w-10 md:h-12 rounded-md border flex flex-col items-center justify-center transition-all duration-300 group";
                                let colorStyles = "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"; // Standard/Available

                                if (tier === "vip") colorStyles = "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20";
                                if (tier === "economy") colorStyles = "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20";

                                if (isSelected) colorStyles = "bg-cinema-500 border-cinema-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110 z-20";
                                if (isOccupied) colorStyles = "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed";

                                return (
                                    <button
                                        key={id}
                                        disabled={isOccupied}
                                        onClick={() => onSlotSelect(row.id, col)}
                                        className={`${baseStyles} ${colorStyles}`}
                                    >
                                        <div className="absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black px-2 py-0.5 rounded text-[9px] text-white whitespace-nowrap pointer-events-none z-50 border border-white/10">
                                            {tier === "vip" ? `VIP - ${basePrice + 50}₺` : tier === "economy" ? `Eko - ${basePrice}₺` : `Std - ${basePrice}₺`}
                                        </div>

                                        {isOccupied ? (
                                            <Car size={16} className="opacity-50" />
                                        ) : (
                                            <>
                                                <span className="text-[10px] font-bold z-10">{col}</span>
                                                {/* Visual Car Silhouette for selected */}
                                                {isSelected && <Car size={24} className="absolute opacity-20" />}

                                                {/* Tier Icons */}
                                                {tier === "vip" && !isSelected && <Star size={8} className="absolute top-1 right-1 opacity-50" fill="currentColor" />}
                                                {tier === "economy" && !isSelected && <Percent size={8} className="absolute top-1 right-1 opacity-50" />}
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Row Label (Right) */}
                        <div className="w-6 text-xs font-bold text-gray-600 flex justify-start">{row.id}</div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-400 border-t border-white/10 pt-4 w-full">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-white text-cinema-900 flex items-center justify-center border border-cinema-500"><div className="w-2 h-2 bg-cinema-500 rounded-full" /></div>
                    <span>Seçili</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
                    <span>VIP (+50₺)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-white/10 border border-white/20" />
                    <span>Standart</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-800 border border-gray-700" />
                    <span>Dolu</span>
                </div>
            </div>
        </div>
    );
};

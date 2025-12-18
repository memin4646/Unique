import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullY, setPullY] = useState(0);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const threshold = 120; // Pull distance to trigger refresh

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) {
            startY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing && startY.current > 0) {
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY.current;
            if (diff > 0) {
                // Add resistance
                setPullY(Math.min(diff * 0.4, 200));
            }
        }
    };

    const handleTouchEnd = async () => {
        startY.current = 0;
        if (!isRefreshing && pullY > 80) { // Trigger point
            setIsRefreshing(true);
            setPullY(60); // Snap to loading position
            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullY(0);
                }, 500); // Minimum showing time
            }
        } else {
            setPullY(0);
        }
    };

    useEffect(() => {
        controls.start({ y: pullY });
    }, [pullY, controls]);

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative min-h-screen"
        >
            {/* Loading Indicator */}
            <div
                className="absolute top-0 left-0 w-full flex justify-center items-start pt-4 pointer-events-none"
                style={{
                    height: pullY,
                    opacity: Math.min(pullY / 60, 1),
                    zIndex: 0
                }}
            >
                <div className={`p-2 rounded-full bg-cinema-800 border border-white/10 shadow-lg transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{ transform: `rotate(${pullY * 2}deg)` }}
                >
                    <Loader2 size={24} className="text-cinema-gold" />
                </div>
            </div>

            {/* Content */}
            <motion.div
                animate={controls}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ y: pullY }}
                className="relative z-10 min-h-screen"
            >
                {children}
            </motion.div>
        </div>
    );
};

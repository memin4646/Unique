"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Station Definition
export interface Station {
    freq: number;
    name: string;
    url: string; // Stream URL
    type: 'dune' | 'stream';
}

// KAHRAMANMARAŞ & POPULAR STATIONS (UPDATED WITH MP3 Support)
export const RADIO_STATIONS: Station[] = [
    { freq: 87.5, name: "Radyo 45'lik (Nostalji)", url: "https://stream.radyo45lik.com:4545/", type: 'stream' },
    { freq: 89.0, name: "DRIVE-IN VİZYON (Film Sesi)", url: "https://cdn.pixabay.com/audio/2022/03/10/audio_5b6670q8429.mp3", type: 'dune' },
    { freq: 95.0, name: "Radyo Kent (Elbistan / Kral)", url: "http://46.20.7.103/stream/166/", type: 'stream' }, // King FM Proxy
    { freq: 99.1, name: "Fresh FM (Power Türk)", url: "https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio", type: 'stream' },
    { freq: 100.0, name: "Power FM", url: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio", type: 'stream' }
];

interface RadioContextType {
    isRadioOn: boolean;
    frequency: number;
    activeStation: Station | null;
    signalStrength: number;
    toggleRadio: () => void;
    setFrequency: (freq: number) => void;
    tuneStep: (dir: number) => void;
    analyserData: number[]; // For visualizer
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: React.ReactNode }) {
    const [isRadioOn, setIsRadioOn] = useState(false);
    const [frequency, setFrequency] = useState(87.5);
    const [activeStation, setActiveStation] = useState<Station | null>(null);
    const [signalStrength, setSignalStrength] = useState(0);
    const [analyserData, setAnalyserData] = useState<number[]>(new Array(20).fill(5));

    // Refs for Singleton Audio
    const audioCtxRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const noiseGainRef = useRef<GainNode | null>(null);
    const streamAudioRef = useRef<HTMLAudioElement | null>(null);
    // const streamGainRef = useRef<GainNode | null>(null); // Optional for volume control if needed

    // Initialize Audio
    const initAudio = () => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') return; // Already running

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;

        // -- Create White Noise --
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.8; // Starts loud
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();

        noiseNodeRef.current = noise;
        noiseGainRef.current = noiseGain;

        // -- Setup Stream Element --
        if (!streamAudioRef.current) {
            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            streamAudioRef.current = audio;
            audio.volume = 0;
        }
    };

    const stopAudio = () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(e => console.error("Ctx Close Error", e));
            audioCtxRef.current = null;
        }
        if (streamAudioRef.current) {
            streamAudioRef.current.pause();
            streamAudioRef.current.src = "";
            // Don't nullify streamAudioRef, keep the element instance or recreate if needed
        }
        setIsRadioOn(false);
        setActiveStation(null);
        setSignalStrength(0);
    };

    const toggleRadio = () => {
        if (isRadioOn) {
            stopAudio();
        } else {
            initAudio();
            setIsRadioOn(true);
        }
    };

    // Tuning Logic (Moved from Page to Context)
    useEffect(() => {
        if (!isRadioOn || !noiseGainRef.current || !streamAudioRef.current) return;

        // Find closest station
        const closest = RADIO_STATIONS.reduce((prev, curr) => {
            return (Math.abs(curr.freq - frequency) < Math.abs(prev.freq - frequency) ? curr : prev);
        });

        const diff = Math.abs(frequency - closest.freq);
        const audioEl = streamAudioRef.current;
        const ctx = audioCtxRef.current;

        // Tuning Window: +/- 0.3 MHz
        if (diff < 0.3) {
            const quality = 1 - (diff / 0.3); // 1.0 = Perfect
            setSignalStrength(Math.round(quality * 100));

            // Switch Stream if Station Changed
            if (activeStation?.freq !== closest.freq) {
                console.log("Global Tuning to:", closest.name);
                setActiveStation(closest);
                audioEl.src = closest.url;
                audioEl.play().catch(e => console.error("Global Stream Play Error:", e));
            }

            // Volume Mixing
            audioEl.volume = Math.min(1, Math.max(0, quality));
            if (ctx && noiseGainRef.current) {
                noiseGainRef.current.gain.setTargetAtTime(0.1 * (1 - quality), ctx.currentTime, 0.1);
            }

        } else {
            // Static
            setSignalStrength(0);
            setActiveStation(null);
            audioEl.volume = 0;
            if (ctx && noiseGainRef.current) {
                noiseGainRef.current.gain.setTargetAtTime(0.5, ctx.currentTime, 0.1);
            }
            if (diff > 2.0 && !audioEl.paused) {
                audioEl.pause();
                setActiveStation(null);
            }
        }

    }, [frequency, isRadioOn]);

    // Visualizer Logic (Simplified for global state)
    useEffect(() => {
        if (!isRadioOn) { setAnalyserData(new Array(20).fill(5)); return; }
        const interval = setInterval(() => {
            if (signalStrength > 30) {
                setAnalyserData(prev => prev.map(() => Math.random() * (signalStrength * 0.4) + 5));
            } else {
                setAnalyserData(prev => prev.map(() => Math.random() * 10 + 5)); // Static
            }
        }, 80);
        return () => clearInterval(interval);
    }, [isRadioOn, signalStrength]);


    const tuneStep = (dir: number) => {
        setFrequency(prev => {
            let next = parseFloat((prev + (dir * 0.1)).toFixed(1));
            if (next > 108.0) next = 87.5;
            if (next < 87.5) next = 108.0;
            return next;
        });
    };

    return (
        <RadioContext.Provider value={{
            isRadioOn,
            frequency,
            activeStation,
            signalStrength,
            toggleRadio,
            setFrequency,
            tuneStep,
            analyserData
        }}>
            {children}
        </RadioContext.Provider>
    );
}

export function useRadio() {
    const context = useContext(RadioContext);
    if (context === undefined) {
        throw new Error("useRadio must be used within a RadioProvider");
    }
    return context;
}

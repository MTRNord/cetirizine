import { FC, memo, useEffect, useRef, useState } from "react";
import { Pause, Play } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

type WaveformProps = {
    /**
     * The media url to render
     */
    src_url: string;
};

const Waveform: FC<WaveformProps> = memo(({ src_url }) => {
    const [playing, setPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [waveform, setWaveform] = useState<WaveSurfer | undefined>(undefined);
    const waveformRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (waveformRef.current) {
            if (waveformRef.current.children.length > 0) {
                if (waveform) {
                    setWaveform(prev => {
                        prev?.destroy();
                        if (waveformRef.current) {
                            for (const child of waveformRef.current.children) {
                                child.remove();
                            }
                        }
                        return undefined;
                    });
                }
            }
            if (waveformRef.current.children.length === 0) {
                setWaveform(WaveSurfer.create({
                    barWidth: 5,
                    cursorWidth: 1,
                    container: waveformRef.current,
                    backend: 'WebAudio',
                    height: 45,
                    progressColor: '#f59e0b',
                    responsive: true,
                    waveColor: '#cbd5e1',
                    cursorColor: 'transparent',
                    barRadius: 5,
                    hideScrollbar: true,
                    normalize: true,
                }));
            }
        }
    }, []);


    useEffect(() => {
        if (waveform) {
            waveform.load(src_url);
            waveform.on('ready', () => {
                setDuration(waveform.getDuration());
            });
        }
    }, [waveform])

    const handlePlay = () => {
        if (waveform) {
            setPlaying((prev) => !prev);
            waveform.playPause();
        }
    };

    return (
        <div className="flex w-[min-content] flex-row h-full items-start justify-start gap-3 bg-slate-200 rounded border-2 border-slate-500 p-1">
            <button className="text-center flex justify-center items-center w-12 h-12 min-w-12 min-h-12 rounded-full outline-none cursor-pointer pb-1 bg-orange-500 border-orange-600 border hover:bg-orange-600 group" onClick={handlePlay}>
                {!playing ? <Play viewBox="0 0 21 24" className="stroke-slate-50 group-hover:stroke-slate-100" /> : <Pause size={24} className="stroke-slate-700 group-hover:stroke-slate-600" />}
            </button>
            <div className="flex flex-col w-96 gap-2 justify-between">
                <div className="w-full h-12" id="waveform" ref={waveformRef}></div>
                <span className="w-full text-sm font-medium text-slate-600 text-right">{secondsToHms(duration)}</span>
            </div>
        </div>
    );
})

function secondsToHms(d?: number) {
    if (!d) {
        return "00:00";
    }
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    if (h === 0 && m === 0 && s === 0) {
        return "00:00";
    } else if (h === 0 && m === 0) {
        return `00:${s.toString().padStart(2, "0")}`;
    } else if (h === 0) {
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${h}:${m}:${s}`;
}

export default Waveform;
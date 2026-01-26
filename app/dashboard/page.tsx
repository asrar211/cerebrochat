"use client";

import { useEffect, useRef } from "react";

export default function Dashboard() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const enableAudio = () => {
      audioRef.current?.play();
      document.removeEventListener("click", enableAudio);
    };

    document.addEventListener("click", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-black text-center bg-clip-text text-transparent bg-linear-to-r from-black via-white to-black animate-pulse">
        Waris is the biggest Shit here.
      </h1>

      <audio ref={audioRef} src="/abc.mp3" />
      <p className="text-sm text-gray-500">
        Click here
      </p>
    </div>
  );
}

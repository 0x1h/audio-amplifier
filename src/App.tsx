import { Slider } from "./components/ui/slider";
import audio from "./audio/audio.mp3";
import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctx = useRef<AudioContext>();
  const gain = useRef<GainNode>();
  const biquadFilter = useRef<BiquadFilterNode>();
  const source = useRef<AudioBufferSourceNode>();

  const [bassBoost, setBassBoost] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);

  useEffect(() => {
    (async () => {
      ctx.current = new AudioContext();
      source.current = ctx.current.createBufferSource();

      gain.current = ctx.current.createGain();
      gain.current.gain.value = 0.5;

      biquadFilter.current = ctx.current.createBiquadFilter();
      biquadFilter.current.type = "lowshelf";
      biquadFilter.current.frequency.value = 3000;
      biquadFilter.current.gain.value = 0;

      const audioBuffer = await fetch(audio)
        .then((data) => data.arrayBuffer())
        .then((buffer) => ctx.current?.decodeAudioData(buffer));

      source.current.buffer = audioBuffer as AudioBuffer;
      source.current.connect(biquadFilter.current);
      biquadFilter.current.connect(gain.current);
      gain.current.connect(ctx.current.destination);
    })();
  }, []);

  return (
    <main className="h-screen flex items-center justify-center flex-col">
      <div className="w-80 space-y-6">
        <div>
          <p>Bass {bassBoost}</p>
          <Slider
            value={[bassBoost]}
            defaultValue={[0]}
            max={15}
            min={0}
            step={0.1}
            onValueChange={(value) => {
              biquadFilter.current!.gain.value = value[0];
              setBassBoost(value[0]);
            }}
          />
        </div>
        <div>
          <p>Volume {(volume * 100).toFixed(0)}</p>
          <Slider
            defaultValue={[50]}
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(value) => {
              gain.current!.gain.value = value[0] / 100;
              setVolume(value[0] / 100);
            }}
          />
        </div>
        <div>
          <p>Mid (disabled)</p>
          <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            disabled
            className="opacity-45"
          />
        </div>
        <div>
          <p>Treble (disabled)</p>
          <Slider
            defaultValue={[50]}
            max={100}
            step={1}
            disabled
            className="opacity-45"
          />
        </div>
      </div>
      <Button
        className="mt-3"
        disabled={isPlaying}
        onClick={() => {
          source.current?.start();
          setIsPlaying(true);
        }}
      >
        Play
      </Button>
    </main>
  );
}

export default App;

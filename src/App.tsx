import { Slider } from "./components/ui/slider";
import audio from "./audio/audio.mp3";
import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Filter, Gain, Player } from "tone";

function App() {
  const player = useRef<Player>();
  const bassFilter = useRef<Filter>();
  const trebleFilter = useRef<Filter>();
  const gain = useRef<Gain>();
  const [bassValue, setBassValue] = useState(20000);
  const [volume, setVolume] = useState(0.5);
  const [trebleLevel, setTrebleLevel] = useState(0);

  useEffect(() => {
    bassFilter.current = new Filter({
      type: "lowpass", // Low-pass filter
      frequency: bassValue, // Cutoff frequency in Hz (adjust as needed)
      Q: 1, // Quality factor (resonance)
    });

    trebleFilter.current = new Filter({
      type: "highshelf", // High shelf filter for treble
      frequency: 4000, // Initial cutoff frequency in Hz
      gain: trebleLevel, // Initial gain for treble
    });

    gain.current = new Gain({
      gain: volume,
    }).toDestination();

    player.current = new Player({ url: audio })
      .connect(bassFilter.current)
      .connect(trebleFilter.current)
      .connect(gain.current);

    return () => {
      player.current?.dispose();
      bassFilter.current?.dispose();
      gain.current?.dispose();
      trebleFilter.current?.dispose()
    };
  }, []);

  const handlePlay = () => {
    if (player.current && player.current.loaded) {
      player.current?.start();
    }
  };

  return (
    <main className="h-screen flex items-center justify-center flex-col">
      <div className="w-80 space-y-6">
        <div>
          <p>Bass {bassValue.toLocaleString()}</p>
          <Slider
            defaultValue={[bassValue]}
            max={20_000}
            min={2_000}
            step={100}
            onValueChange={(value) => {              
              bassFilter.current!.frequency.value = value[0];
              setBassValue(value[0]);
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
          <p>Treble</p>
          <Slider
            defaultValue={[0]}
            min={-12}
            max={12}
            step={1}
            onValueChange={(value) => {
              trebleFilter.current!.gain.value = value[0];
              setTrebleLevel(value[0]);
            }}
          />
        </div>
      </div>
      <Button className="mt-3" onClick={handlePlay}>
        Play
      </Button>
    </main>
  );
}

export default App;

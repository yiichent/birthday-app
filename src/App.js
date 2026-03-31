import { useState, useEffect } from "react";
import "./App.css";
import confetti from "canvas-confetti";

function App() {
  const [stage, setStage] = useState(0);

  const blowCandle = () => {
    if (stage === 0) {
      setStage(1);

      confetti();

      setTimeout(() => {
        setStage(2);
      }, 1200);
    }
  };

  // 🎤 Mic detection
  // eslint-disable-next-line
  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let dataArray;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        microphone.connect(analyser);

        const detectSound = () => {
          analyser.getByteFrequencyData(dataArray);

          const volume =
            dataArray.reduce((a, b) => a + b, 0) /
            dataArray.length;

          if (volume > 50) {
            blowCandle();
          }

          requestAnimationFrame(detectSound);
        };

        detectSound();
      })
      .catch(() => {
        console.log("Mic denied");
      });
  }, []);

  return (
    <div className="App">
      <h1>🎂 Happy Birthday 🎉</h1>

      <div onClick={blowCandle}>
        {stage === 0 && (
          <img src="/cake-fire.png" alt="cake" width="220" />
        )}
        {stage === 1 && (
          <img src="/cake-smoke.png" alt="cake" width="220" />
        )}
        {stage === 2 && (
          <img src="/cake-off.png" alt="cake" width="220" />
        )}
      </div>

      {stage === 0 && <p>Click or blow the candle 🎤💨</p>}
      {stage === 2 && <h2>✨ Wish granted ✨</h2>}
    </div>
  );
}

export default App;
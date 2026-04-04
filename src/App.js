import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import confetti from "canvas-confetti";

function App() {
  const [stage, setStage] = useState(0);
  const [giftVisible, setGiftVisible] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const songPlayedRef = useRef(false);
  const audioContextRef = useRef(null);

  const playBirthdaySong = useCallback(() => {
    if (songPlayedRef.current) return;
    songPlayedRef.current = true;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const notes = [
      { freq: 262, duration: 0.35 },
      { freq: 262, duration: 0.35 },
      { freq: 294, duration: 0.75 },
      { freq: 262, duration: 0.75 },
      { freq: 349, duration: 0.75 },
      { freq: 330, duration: 1.25 },
      { freq: 262, duration: 0.35 },
      { freq: 262, duration: 0.35 },
      { freq: 294, duration: 0.75 },
      { freq: 262, duration: 0.75 },
      { freq: 392, duration: 0.75 },
      { freq: 349, duration: 1.25 },
      { freq: 262, duration: 0.35 },
      { freq: 262, duration: 0.35 },
      { freq: 523, duration: 0.75 },
      { freq: 440, duration: 0.75 },
      { freq: 349, duration: 0.75 },
      { freq: 330, duration: 0.75 },
      { freq: 294, duration: 1.25 },
      { freq: 466, duration: 0.35 },
      { freq: 466, duration: 0.35 },
      { freq: 440, duration: 0.75 },
      { freq: 349, duration: 0.75 },
      { freq: 392, duration: 0.75 },
      { freq: 349, duration: 1.25 },
    ];

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.14, audioContext.currentTime);
    gain.connect(audioContext.destination);

    let time = audioContext.currentTime;
    notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(note.freq, time);
      oscillator.connect(gain);
      oscillator.start(time);
      oscillator.stop(time + note.duration);
      time += note.duration;
    });
  }, []);

  const enterParty = useCallback(() => {
    setStage(1);
  }, []);

  const blowCandle = useCallback(() => {
    if (stage !== 1) return;

    setStage(2);
    confetti({ particleCount: 140, spread: 70, origin: { y: 0.55 } });
    playBirthdaySong();
  }, [stage, playBirthdaySong]);

  const handleClaimGift = useCallback(() => {
    if (stage !== 2) return;
    setGiftVisible(true);
  }, [stage]);

  const openGiftBox = useCallback(() => {
    if (!giftVisible) return;
    setGiftOpened(true);
  }, [giftVisible]);

  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let dataArray;
    let animationId;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        microphone.connect(analyser);

        const detectSound = () => {
          analyser.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

          if (volume > 50) {
            blowCandle();
          }

          animationId = requestAnimationFrame(detectSound);
        };

        detectSound();
      })
      .catch(() => {
        console.log("Mic denied");
      });

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContext) audioContext.close();
    };
  }, [blowCandle]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="pixel-grid" />

      {stage === 0 ? (
        <div className="landing-card">
          <div className="balloons">
            <span className="balloon balloon-1" />
            <span className="balloon balloon-2" />
            <span className="balloon balloon-3" />
            <span className="balloon balloon-4" />
            <span className="balloon balloon-5" />
          </div>
          <div className="welcome-box">
            <p className="mini-title">Birthday party incoming</p>
            <h1>
              Happy Birthday, <span className="name">Mummy</span>!
            </h1>
            <p className="landing-text">
              Click the button to enter the party room for your surprise.
            </p>
            <button className="enter-button" type="button" onClick={enterParty}>
              Open the party room
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="sprinkle sprinkle-left" />
          <div className="sprinkle sprinkle-right" />
          <p className="hero-title">Birthday Celebration</p>
          <h1>
            Happy Birthday, <span className="name">Mummy</span>!
          </h1>
          <p className="subtitle">Make a wish and blow the candle.</p>

          <button className={`cake-card ${stage === 2 ? "cake-celebrate" : ""}`} onClick={blowCandle} type="button">
            {stage === 0 && <img src="/cake-fire.png" alt="cake with candle" />}
            {stage === 1 && <img src="/cake-fire.png" alt="cake with candle" />}
            {stage === 2 && <img src="/cake-off.png" alt="cake without flame" />}
          </button>

          <div className="controls">
            {stage === 2 && <h2>✨ Wish granted ✨</h2>}
            {stage === 2 && !giftVisible && (
              <button className="music-button" onClick={handleClaimGift} type="button">
                Claim Gift
              </button>
            )}
            {stage === 2 && giftVisible && (
              <>
                <button
                  className={`gift-box ${giftOpened ? "opened" : ""}`}
                  onClick={openGiftBox}
                  type="button"
                  aria-label="Gift box"
                >
                  <span className="gift-ribbon" />
                  <span className="gift-top" />
                  <span className="gift-label">Tap to open</span>
                </button>
                {giftOpened && (
                  <div className="gift-letter-panel">
                    <div className="gift-letter-sheet">
                      <div className="gift-letter-text">
                        Thank you for being someone awesome to me!!
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



let audioContext;

export function playSound(type, enabled = true) {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext ||= new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.frequency.value = type === "win" ? 720 : type === "move" ? 280 : 180;
    const duration = type === "win" ? 0.55 : 0.12;
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {}
}

export function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  context.scale(ratio, ratio);

  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.4,
    size: 5 + Math.random() * 8,
    speed: 2 + Math.random() * 5,
    drift: -2 + Math.random() * 4,
    rotation: Math.random() * Math.PI * 2,
    hue: Math.random() * 360
  }));

  let frame = 0;
  function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach(piece => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotation += 0.08;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = `hsl(${piece.hue} 95% 60%)`;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.65);
      context.restore();
    });
    frame++;
    if (frame < 210) requestAnimationFrame(draw);
    else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  draw();
}

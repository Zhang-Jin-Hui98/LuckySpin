import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  Play, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Shuffle, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  X, 
  HelpCircle, 
  History, 
  Palette, 
  Heart,
  ChevronRight
} from "lucide-react";

// Predefined gorgeous palettes
const PALETTES = {
  rainbow: {
    name: "七彩霓虹",
    bg: "linear-gradient(135deg, #FF3B30, #FFCC00)",
    colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6", "#84CC16", "#F43F5E"]
  },
  neon: {
    name: "賽博極光",
    bg: "linear-gradient(135deg, #00F2FE, #4FACFE)",
    colors: ["#00FFFF", "#FF007F", "#9D00FF", "#00FF66", "#FFEA00", "#FF5E00", "#00E5FF", "#FF00FF", "#39FF14", "#FF3366"]
  },
  sunset: {
    name: "落日餘暉",
    bg: "linear-gradient(135deg, #F4A261, #E76F51)",
    colors: ["#E76F51", "#F4A261", "#E9C46A", "#2A9D8F", "#264653", "#D946EF", "#F43F5E", "#FB7185", "#F87171", "#FB923C"]
  },
  forest: {
    name: "翡翠山林",
    bg: "linear-gradient(135deg, #52B788, #1B4332)",
    colors: ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D", "#34D399", "#059669", "#047857", "#064E3B", "#10B981"]
  },
  pastel: {
    name: "馬卡龍風",
    bg: "linear-gradient(135deg, #FFB7B2, #C7CEEA)",
    colors: ["#FFF0F5", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA", "#FFC6FF", "#BDB2FF", "#9BF6FF", "#CAFFBF"]
  }
};

type PaletteKey = keyof typeof PALETTES;

// Dynamic built-in presets
const PRESETS = [
  {
    name: "午餐吃什麼 🍔",
    label: "Lunch Decide",
    items: ["拉麵 🍜", "小火鍋 🍲", "日式壽司 🍣", "經典便當 🍱", "手工水餃 🥟", "義式披薩 🍕", "美式漢堡 🍔", "健康沙拉 🥗", "泰式料理 🇹🇭", "義大利麵 🍝", "美式炸雞 🍗"]
  },
  {
    name: "真心話大冒險 🫣",
    label: "Truth or Dare",
    items: ["真心話 🫣", "大冒險 🤪", "真心話 🫣", "大冒險 🤪", "自選真心話", "自選大冒險", "免罰安全牌 🛡️", "自罰一杯 🍺"]
  },
  {
    name: "數字抽籤 (1-10) 🔢",
    label: "Numbers 1-10",
    items: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]
  },
  {
    name: "硬幣決定 🪙",
    label: "Yes or No",
    items: ["絕對要 👍", "千萬別 🛑", "再想想 💤", "先等下 ⌛"]
  },
  {
    name: "今天誰洗碗 🧽",
    label: "Who Cleans Dishes",
    items: ["爸爸 👨", "媽媽 👩", "哥哥 👦", "姐姐 👧", "我本人 🤓", "猜拳決定 ✊"]
  },
  {
    name: "骰子點數 (1-6) 🎲",
    label: "Dice Roll",
    items: ["⚀ 1 點", "⚁ 2 點", "⚂ 3 點", "⚃ 4 點", "⚄ 5 點", "⚅ 6 點"]
  }
];

// Singleton audio context to prevent multiple initializations inside browser sandbox
let globalAudioCtx: AudioContext | null = null;

function getAudioCtx() {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

// Generate an organic physical tick tone using triangular oscillation synthesis
function playTickSound(frequency = 550, duration = 0.04, volume = 0.08) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Warmer physical hit quality than square or sawtooth waves
    osc.type = "triangle"; 
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Fail silently inside browser constraints
  }
}

// Play progressive high-chime C-Major sweeps for celebration stopping feedback
function playCelebrationSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major
    scale.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gainNode.gain.setValueAtTime(0, now + idx * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch (err) {
    // Fail silently
  }
}

export default function App() {
  // Config state
  const [items, setItems] = useState<string[]>(PRESETS[0].items);
  const [quickInput, setQuickInput] = useState<string>("");
  const [inputText, setInputText] = useState<string>(PRESETS[0].items.join(", "));
  const [themeChoice, setThemeChoice] = useState<PaletteKey>("rainbow");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Dynamic state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<{ item: string; time: string }[]>([]);
  const [canvasSize, setCanvasSize] = useState<number>(440);
  
  // Refs for physics engine
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastSegmentRef = useRef<number>(-1);
  
  // Pointer spring-loaded physical animation refs
  const pointerAngleRef = useRef<number>(0);
  const pointerVelocityRef = useRef<number>(0);

  // Sync canvas dimensions Reactively on window resizing for retina devices
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      if (w < 440) {
        setCanvasSize(280);
      } else if (w < 640) {
        setCanvasSize(340);
      } else if (w < 1024) {
        setCanvasSize(380);
      } else {
        setCanvasSize(440);
      }
    }
    
    // Initial resize trigger
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync input text-area when state items array gets replaced/loaded
  useEffect(() => {
    setInputText(items.join(", "));
  }, [items]);

  // Redraw statically whenever input content or sizing configs change
  useEffect(() => {
    if (!isSpinning) {
      drawWheelStatic();
    }
  }, [items, themeChoice, canvasSize, isSpinning]);

  // Master canvas drawing function (renders rotating disks & indicators)
  const drawStar = (
    ctx: CanvasRenderingContext2D, 
    cx: number, 
    cy: number, 
    spikes: number, 
    outerRadius: number, 
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy - Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy - Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawWheelStatic = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Scale canvas inside rendering buffer for Retina Crispness
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.scale(dpr, dpr);

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const radius = Math.min(cx, cy) * 0.88;
    const N = items.length;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    if (N === 0) {
      // Empty wheel prompt
      ctx.save();
      ctx.fillStyle = "rgba(107, 114, 128, 0.2)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#8B95A5";
      ctx.font = "14px 'Plus Jakarta Sans'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("請在左側輸入抽籤選項", cx, cy);
      ctx.restore();
      return;
    }

    const sliceAngle = (2 * Math.PI) / N;

    // Draw Wheel Core Context
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRef.current);
    ctx.translate(-cx, -cy);

    // Dynamic slice loops
    const palette = PALETTES[themeChoice]?.colors || PALETTES.rainbow.colors;

    for (let i = 0; i < N; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const segColor = palette[i % palette.length];

      // Draw Sector Fill
      ctx.fillStyle = segColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Golden outer stroke
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.stroke();

      // Inner dividers divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(startAngle), cy + radius * Math.sin(startAngle));
      ctx.stroke();

      // Print Segment Labels
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);

      ctx.fillStyle = "#FFFFFF";
      
      // Dynamic scaling for font size depending on sector quantity
      const fSize = Math.max(10, Math.min(22, 280 / N));
      ctx.font = `bold ${fSize}px "Plus Jakarta Sans"`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      
      // Shadow stroke for universal multi-background legibility
      ctx.shadowColor = "rgba(0, 0, 0, 0.82)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const text = items[i];
      const maxTextLength = 12;
      const textToShow = text.length > maxTextLength ? text.substring(0, maxTextLength) + "..." : text;

      // Position from outer boundary inwards
      ctx.fillText(textToShow, radius - 26, 0);
      ctx.restore();
    }

    // Outer edge thin gold decorative accent
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(245, 158, 11, 0.55)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore(); // Exit wheel rotation

    // 1. Draw outer rim bezel casing with glowing hardware shadows
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "#1b1d2d";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 14, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Glowing bulbs along the static casing (theater marquee light look!)
    const bulbCount = Math.max(16, N * 2);
    const bulbAnimator = isSpinning ? (Date.now() / 180) : 0;

    for (let i = 0; i < bulbCount; i++) {
      const bulbAngle = (i * 2 * Math.PI) / bulbCount;
      const bx = cx + (radius + 7) * Math.cos(bulbAngle);
      const by = cy + (radius + 7) * Math.sin(bulbAngle);

      // Fluctuating patterns during rotation
      const lit = isSpinning 
        ? Math.sin(i * 1.2 - bulbAnimator) > 0.05 
        : i % 2 === 0;

      ctx.save();
      ctx.fillStyle = lit ? "#FBBF24" : "#4B5563";
      ctx.shadowColor = lit ? "#FBBF24" : "transparent";
      ctx.shadowBlur = lit ? 8 : 0;
      
      ctx.beginPath();
      ctx.arc(bx, by, lit ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Central Pivot Hub Medal
    const pivotRadius = Math.max(26, radius * 0.16);
    const radialGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pivotRadius);
    radialGrad.addColorStop(0, "#FFF9C4");
    radialGrad.addColorStop(0.35, "#FBBF24");
    radialGrad.addColorStop(1, "#D97706");

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pivotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Pivot inner ring
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, pivotRadius - 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // Central core gold star icon
    ctx.fillStyle = "#FFFFFF";
    drawStar(ctx, cx, cy, 5, pivotRadius * 0.5, pivotRadius * 0.22);
    ctx.fill();

    // 4. Pointer structure (fixed on top pointing directly down)
    const pX = cx;
    const pY = cy - radius;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(pointerAngleRef.current);

    // Shadow
    ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Red Arrow Triangle Body
    ctx.fillStyle = "#EF4444";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 18); // tip pointing down
    ctx.lineTo(-12, -14); // upper left
    ctx.lineTo(12, -14); // upper right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Anchor Pin
    ctx.fillStyle = "#F59E0B";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  // Launch dual fireworks cannons towards screen center
  const triggerConfettiShow = () => {
    // Primary burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Secondary delayed left/right side flares
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 45,
        spread: 55,
        origin: { x: 0.05, y: 0.7 }
      });
      confetti({
        particleCount: 60,
        angle: 135,
        spread: 55,
        origin: { x: 0.95, y: 0.7 }
      });
    }, 280);
  };

  // Physical calculation and dynamic spin trigger
  const handleSpinStart = () => {
    if (isSpinning || items.length === 0) return;

    setWinner(null);
    setWinnerIndex(null);
    setIsSpinning(true);

    const N = items.length;
    // Align initialized tracker segment
    let startNormAngle = (1.5 * Math.PI - angleRef.current) % (2 * Math.PI);
    if (startNormAngle < 0) startNormAngle += 2 * Math.PI;
    lastSegmentRef.current = Math.floor(startNormAngle / ((2 * Math.PI) / N)) % N;

    // Initialize random speed parameters for standard angular decelerations
    // Multiplied by FPS parameters, values around 0.44 to 0.65 represent fast sweeps
    velocityRef.current = 0.44 + Math.random() * 0.18;
    // Friction rate (range: 0.985 - 0.99) creates organic unpredictable stopping points
    const baseFriction = 0.986 + Math.random() * 0.004;

    const runPhysicsSimulation = () => {
      // 1. Move wheel rotation index forward
      angleRef.current += velocityRef.current;
      // Truncate decimals to avoid buffer float growth
      angleRef.current = angleRef.current % (2 * Math.PI);

      // 2. Reduce velocity using physical friction dampening
      velocityRef.current *= baseFriction;

      // 3. Pointer friction indicator segment matching
      const segmentArc = (2 * Math.PI) / N;
      let focalAngle = (1.5 * Math.PI - angleRef.current) % (2 * Math.PI);
      if (focalAngle < 0) focalAngle += 2 * Math.PI;

      const dynamicSegmentIdx = Math.floor(focalAngle / segmentArc) % N;

      if (dynamicSegmentIdx !== lastSegmentRef.current) {
        lastSegmentRef.current = dynamicSegmentIdx;

        // Apply visual tilt-push proportional to current rotational speed
        pointerVelocityRef.current = Math.min(0.28, velocityRef.current * 0.62);

        // Boundary cross audio ticks with dynamic speed-based pitch adjustments
        if (soundEnabled) {
          const adaptivePitch = Math.min(750, 240 + velocityRef.current * 1050);
          playTickSound(adaptivePitch, 0.04, 0.07);
        }
      }

      // 4. Pointer Spring-Oscillator equations
      const kCoeff = 0.16; // elasticity constant
      const damper = 0.76; // friction damping
      const sForce = -kCoeff * pointerAngleRef.current;
      
      pointerVelocityRef.current += sForce;
      pointerVelocityRef.current *= damper;
      pointerAngleRef.current += pointerVelocityRef.current;

      // Refresh layout drawings
      drawWheelStatic();

      // 5. Complete rotation once speed hits lower threshold
      if (velocityRef.current < 0.001) {
        velocityRef.current = 0;
        setIsSpinning(false);

        // Fetch winning entry data
        const winningOutcome = items[dynamicSegmentIdx];
        setWinner(winningOutcome);
        setWinnerIndex(dynamicSegmentIdx);

        // Record on index histories
        const timestamp = new Date().toLocaleTimeString("zh-TW", { hour12: false });
        setHistory(prev => [{ item: winningOutcome, time: timestamp }, ...prev].slice(0, 50));

        // Trigger celebratory audio and overlays
        if (soundEnabled) {
          playCelebrationSound();
        }
        triggerConfettiShow();

        // Clear active timer bounds
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(runPhysicsSimulation);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(runPhysicsSimulation);
  };

  // Parse strings from text area input values
  const handleBulkInputSync = (raw: string) => {
    setInputText(raw);
    const parsed = raw
      .split(/[\n,，]+/)
      .map(v => v.trim())
      .filter(v => v.length > 0);
    setItems(parsed);
  };

  // Add individual custom records
  const handleSingleAdd = () => {
    const fresh = quickInput.trim();
    if (!fresh) return;
    
    const updated = [...items, fresh];
    setItems(updated);
    setQuickInput("");
  };

  // Keyboard shortcut listener for convenient additions
  const handleQuickAddKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSingleAdd();
    }
  };

  // Delete option from list index
  const deleteItemAtIdx = (idxToDelete: number) => {
    const updated = items.filter((_, idx) => idx !== idxToDelete);
    setItems(updated);
  };

  // Shuffle currently configured options array
  const handleListShuffle = () => {
    if (isSpinning) return;
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  };

  // Set default sequences 1 to 10
  const handleResetToDefault = () => {
    if (isSpinning) return;
    setItems(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  };

  // Clean whole configure matrix
  const handleListClearAll = () => {
    if (isSpinning) return;
    setItems([]);
  };

  // Preset loading handler
  const loadPresetList = (presetItems: string[]) => {
    if (isSpinning) return;
    setItems([...presetItems]);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0f17] text-gray-200 antialiased flex flex-col justify-between selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      
      {/* Absolute Cosmic Background Accent Glows */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main Header Rails */}
      <header className="border-b border-gray-800/60 bg-[#0d0f17]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-yellow-500 to-red-500 p-2.5 rounded-xl shadow-lg ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-[#0d0f17] stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent font-display">
                動態抽籤大轉盤
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                物理極速旋轉 • 自訂名單與預設 • Web Audio 類比音效
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                soundEnabled 
                  ? "bg-brand-950/40 border-brand-800/40 text-brand-400 hover:bg-brand-900/40" 
                  : "bg-gray-900/20 border-gray-800/60 text-gray-500 hover:bg-gray-800/30"
              }`}
              title={soundEnabled ? "靜音類比點擊" : "開啟類比音效"}
              id="sound_toggle_btn"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold mr-1">模擬音效: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="text-xs font-semibold mr-1">模擬音效: MUTE</span>
                </>
              )}
            </button>
            <a 
              href="#wheel_section" 
              className="px-4 py-2 text-xs font-bold text-[#0d0f17] bg-amber-400 hover:bg-amber-300 rounded-xl transition duration-150 shadow-md flex items-center gap-1 sm:hidden cursor-pointer"
            >
              前往轉盤 <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>

        </div>
      </header>

      {/* Main Single-Screen Grid Architecture */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 lg:py-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Grid: Customization Panel (Inputs & Presets) */}
        <section className="lg:col-span-5 space-y-6 flex flex-col h-full" id="config_setup_panel">
          
          {/* Preset Buttons Board */}
          <div className="glass rounded-2xl p-5 border border-white/5 shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-3 flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-yellow-500" /> 
              熱門抽籤主題
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p, index) => (
                <button
                  key={index}
                  onClick={() => loadPresetList(p.items)}
                  disabled={isSpinning}
                  className="px-3 py-2 text-left text-xs font-semibold rounded-xl border border-gray-800/60 bg-gray-900/30 text-gray-300 hover:bg-brand-950/40 hover:border-brand-800/40 hover:text-brand-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer flex items-center justify-between"
                  id={`preset_btn_${index}`}
                >
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Custom Lists Customizer */}
          <div className="glass rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2 font-display">
                <Palette className="w-4 h-4 text-emerald-400" />
                自訂抽籤名單
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={handleListShuffle}
                  disabled={isSpinning || items.length < 2}
                  className="p-1 px-2.5 rounded-lg text-xs font-semibold border border-gray-800/60 bg-gray-900/20 text-gray-400 hover:bg-gray-800/40 hover:text-white transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  title="攪拌 / 打亂名單"
                  id="shuffle_list_btn"
                >
                  <Shuffle className="w-3 h-3" />
                  打亂
                </button>
                <button
                  onClick={handleResetToDefault}
                  disabled={isSpinning}
                  className="p-1 px-2.5 rounded-lg text-xs font-semibold border border-gray-800/60 bg-gray-900/20 text-gray-400 hover:bg-gray-800/40 hover:text-white transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  title="恢復數字 1-10"
                  id="reset_list_btn"
                >
                  <RotateCcw className="w-3 h-3" />
                  重播
                </button>
                <button
                  onClick={handleListClearAll}
                  disabled={isSpinning || items.length === 0}
                  className="p-1 px-2.5 rounded-lg text-xs font-semibold border border-red-900/40 bg-red-950/10 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  title="清空名單"
                  id="clear_list_btn"
                >
                  <Trash2 className="w-3 h-3" />
                  清空
                </button>
              </div>
            </div>

            {/* Quick Adding Segment Tool */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="寫入新項目名稱..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={handleQuickAddKey}
                disabled={isSpinning}
                className="flex-grow bg-[#090b11]/70 border border-gray-800/80 rounded-xl px-3.5 py-2 text-xs font-medium text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/30 disabled:opacity-50"
                id="quick_add_input"
              />
              <button
                onClick={handleSingleAdd}
                disabled={isSpinning || !quickInput.trim()}
                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-lg shadow-brand-950/50 cursor-pointer transition flex items-center justify-center"
                id="quick_add_btn"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Bulk text area configuration split by comma or newline */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">
                大量輸入配置 (可用逗號或換行區隔)
              </label>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => handleBulkInputSync(e.target.value)}
                disabled={isSpinning}
                placeholder="輸入1, 輸入2, 輸入3..."
                className="w-full bg-[#090b11]/70 border border-gray-800/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-sans resize-none"
                id="bulk_text_area"
              />
            </div>

            {/* Segment Color Theme Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">
                轉盤視覺配色
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(PALETTES).map((k) => {
                  const key = k as PaletteKey;
                  const item = PALETTES[key];
                  const works = themeChoice === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setThemeChoice(key)}
                      disabled={isSpinning}
                      className={`relative flex flex-col items-center p-2 rounded-xl border text-[10px] font-bold tracking-tight transition duration-150 cursor-pointer ${
                        works 
                          ? "bg-brand-950/50 border-brand-500 text-brand-300 shadow-lg shadow-brand-500/10" 
                          : "bg-gray-900/30 border-gray-800/80 hover:border-gray-700 text-gray-400"
                      }`}
                      id={`theme_color_btn_${key}`}
                    >
                      <div 
                        className="w-full h-2 rounded-full mb-1.5 flex overflow-hidden" 
                        style={{ background: item.colors[0] }}
                      >
                        {item.colors.slice(0, 3).map((col, idx) => (
                          <div key={idx} className="flex-grow h-full" style={{ backgroundColor: col }} />
                        ))}
                      </div>
                      <span className="truncate w-full text-center">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual preview list counters */}
            <div className="border-t border-gray-800/50 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500">
                  名單數量 ({items.length})
                </span>
                {items.length > 0 && (
                  <span className="text-[10px] text-gray-600 font-mono">
                    點擊 ✕ 按鈕可快速移除
                  </span>
                )}
              </div>
              
              <div className="max-h-48 overflow-y-auto border border-gray-800/50 rounded-xl bg-gray-950/20 divide-y divide-gray-900/80">
                {items.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 italic">
                    暫無抽籤項目，請新增項目。
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex justify-between items-center px-3 py-2 text-xs font-medium hover:bg-gray-900/20 transition-all text-gray-300 group"
                      id={`preset_list_item_${idx}`}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: (PALETTES[themeChoice]?.colors || PALETTES.rainbow.colors)[idx % (PALETTES[themeChoice]?.colors || PALETTES.rainbow.colors).length] }} 
                        />
                        <span className="font-mono text-[10px] text-gray-500">#{idx + 1}</span>
                        <span className="text-gray-200">{item}</span>
                      </div>
                      <button
                        onClick={() => deleteItemAtIdx(idx)}
                        disabled={isSpinning}
                        className="p-1 text-gray-600 hover:text-red-400 rounded transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none opacity-0 group-hover:opacity-100 focus:opacity-100"
                        id={`delete_item_btn_${idx}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </section>

        {/* Right Grid: Turntable Main Stage (Buzzer & Wheel & History Log) */}
        <section className="lg:col-span-7 flex flex-col items-center space-y-6" id="wheel_section">
          
          {/* Main Drawing Arena */}
          <div className="w-full glass rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl flex flex-col items-center justify-center relative">
            
            {/* The Big Stage header */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold tracking-widest text-amber-400 uppercase bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full px-3 py-1 bg-amber-400/5 select-none animate-pulse">
                🏆 DECISION TURNTABLE
              </span>
            </div>

            {/* Huge Prominent "START DRAW" action buzzer button atop the wheel stage */}
            <div className="w-full max-w-sm mb-6 relative">
              {isSpinning ? (
                <button
                  disabled
                  className="w-full py-4 px-6 text-sm sm:text-base font-bold bg-gray-800 text-gray-400 border border-gray-700/50 rounded-2xl cursor-not-allowed select-none transition flex items-center justify-center gap-2.5 shadow-inner"
                  id="spinning_indicator_btn"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent" />
                  轉動中... 即將揭曉幸運得主
                </button>
              ) : (
                <button
                  onClick={handleSpinStart}
                  disabled={items.length === 0}
                  className="w-full py-4.5 px-6 text-base sm:text-lg font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:border-transparent text-[#0c0d15] shadow-xl shadow-amber-500/10 hover:shadow-amber-400/20 rounded-2xl border-b-4 border-amber-600 active:border-b-0 active:scale-[0.985] font-display uppercase tracking-wider cursor-pointer group flex items-center justify-center gap-2 transition"
                  id="start_spin_btn"
                >
                  <Play className="w-5 h-5 fill-current stroke-[2.5] text-[#0c0d15] group-hover:scale-110 transition duration-150" />
                  開啟幸運抽籤 !
                </button>
              )}

              {items.length === 0 && (
                <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-red-400 font-bold">
                  ⚠️ 請先在自訂名單中新增或載入項目，才能啟動大轉盤！
                </div>
              )}
            </div>

            {/* Rotatable wheel canvas layout wrapper */}
            <div className="relative mt-2">
              
              {/* Outer decorative glowing physical plate behind the canvas */}
              <div 
                className="absolute inset-0 rounded-full blur-[20px] opacity-40 pointer-events-none transform scale-[1.03] transition-all -z-10 bg-brand-500" 
                style={{ 
                  background: isSpinning 
                    ? PALETTES[themeChoice]?.bg 
                    : "rgba(239, 68, 68, 0.15)",
                  animation: isSpinning ? "pulse-ring 2.5s infinite" : "none" 
                }} 
              />
              
              {/* HTML5 Canvas */}
              <div className="relative flex items-center justify-center ring-4 ring-white/5 rounded-full overflow-hidden bg-[#0d0f17]">
                <canvas 
                  ref={canvasRef} 
                  className="block select-none"
                  id="lucky_wheel_canvas"
                />
              </div>

            </div>

            {/* Informational Hint labels below stage */}
            <div className="text-center mt-6 text-xs text-gray-500 font-medium select-none">
              物理衰減減速系統搭載 • 結果完全隨機公平
            </div>

          </div>

          {/* History ledger database */}
          <div className="w-full glass rounded-2xl p-5 border border-white/5 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2 font-display">
                <History className="w-3.5 h-3.5 text-brand-400" />
                本日抽籤紀錄 ({history.length})
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[10px] font-bold text-gray-500 hover:text-red-400 transition cursor-pointer flex items-center gap-1"
                  title="清除全部歷史紀錄"
                  id="clear_history_btn"
                >
                  <Trash2 className="w-3 h-3" />
                  清除
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="col-span-2 py-4 text-center text-xs text-gray-600 italic select-none">
                  尚無抽籤紀錄，快啟動大轉盤吧！
                </div>
              ) : (
                history.map((record, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-2 text-xs rounded-xl bg-gray-900/40 border border-gray-800/40 text-gray-300"
                    id={`history_item_${index}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-white font-bold truncate">{record.item}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-600 bg-gray-950/45 px-1.5 py-0.5 rounded-lg shrink-0">
                      {record.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>

      </main>

      {/* Exquisite Celebrate Modal Target Congratulating Popups */}
      {winner && (
        <div className="fixed inset-0 bg-[#07090f]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 transition duration-300 animate-fade-in" id="celebrate_winner_modal">
          
          <div className="relative glass rounded-3xl p-8 max-w-md w-full border border-yellow-500/20 text-center shadow-2xl scale-in space-y-6">
            
            {/* Massive Star Aura */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center">
              
              {/* Badge Laurel */}
              <div className="bg-gradient-to-tr from-yellow-400 to-amber-500 p-4 rounded-full shadow-xl shadow-amber-950/80 mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-[#0a0c14] fill-current" />
              </div>

              <span className="text-[11px] font-extrabold tracking-widest text-amber-400 uppercase select-none font-display">
                🎉 CONGRATULATIONS 🎉
              </span>
              
              <h2 className="text-sm font-bold text-gray-400 mt-1 select-none">
                幸運兒得主已經誕生！
              </h2>

            </div>

            {/* Winner Display Zone */}
            <div className="bg-gradient-to-b from-brand-950/60 to-gray-950/60 rounded-2xl px-6 py-8 border border-white/5 relative overflow-hidden group shadow-inner">
              
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
              
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 select-none">
                中獎號碼 / 選項
              </p>
              
              <p className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-amber-400 tracking-tight font-display drop-shadow">
                {winner}
              </p>

              {winnerIndex !== null && (
                <span className="inline-block mt-3 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-mono">
                  位於扇區 #{winnerIndex + 1}
                </span>
              )}

            </div>

            {/* Quick Action Close or Re-spin */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setWinner(null)}
                className="py-3 px-4 rounded-xl text-xs font-bold border border-gray-800 hover:border-gray-700 bg-gray-900/30 text-gray-300 hover:text-white transition duration-150 cursor-pointer"
                id="close_winner_modal_btn"
              >
                關閉視窗
              </button>
              <button
                onClick={() => {
                  setWinner(null);
                  // Dynamic short safety interval to trigger next spin nicely
                  setTimeout(() => {
                    handleSpinStart();
                  }, 120);
                }}
                className="py-3 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-[#0c0d15] hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-950/40 transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                id="spin_again_btn"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                再抽一次
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Footer credits */}
      <footer className="border-t border-gray-910 py-6 text-center text-xs text-gray-600 bg-gray-950/20">
        <div className="flex justify-center items-center gap-1 font-medium">
          <span>幸運大轉盤</span>
          <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" />
          <span>為您做決定的好朋友</span>
        </div>
      </footer>

    </div>
  );
}

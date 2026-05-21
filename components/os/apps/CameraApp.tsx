// Copyright (c) 2026 Hasnain (https://t2hasnain.me). All rights reserved.
// Licensed under the macOS Web by t2hasnain Open Source License.
// Made by Hasnain <t2hasnain.me>

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  Download,
  Trash2,
  Timer,
  Grid,
  Sparkles,
  Wallpaper,
  Check,
  AlertCircle,
  Play,
  RotateCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useOSStore, VFSItem } from '@/store/osStore';

// Creative filters to replicate a fun macOS Photo Booth experience
const FILTERS = [
  { id: 'normal', name: 'Normal', css: '' },
  { id: 'ar-hand', name: '👋 Hand Tracking Trail', css: '' },
  { id: 'ar-face', name: '💄 Anime Eyes & Makeup', css: '' },
  { id: 'ar-xray', name: '💀 X-Ray Bone Scanner', css: '' }
];

export default function CameraApp() {
  const { vfs, createFile, deleteItem, setWallpaper } = useOSStore();

  // Media constraints and streams
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isMuted, setIsMuted] = useState(false);

  // Timers & countdowns
  const [useCountdown, setUseCountdown] = useState(true);
  const [countdownVal, setCountdownVal] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Custom screen flashing visual effect for pictures
  const [isFlashing, setIsFlashing] = useState(false);

  // Selected media for active lightbox / modal detail
  const [selectedMedia, setSelectedMedia] = useState<VFSItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewfinderCanvasRef = useRef<HTMLCanvasElement>(null);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamTracksRef = useRef<MediaStreamTrack[]>([]);

  // AR States & MediaPipe Libraries Context
  const [blinkCount, setBlinkCount] = useState(0);
  const [showARStats, setShowARStats] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(false);
  const [mediapipeActive, setMediapipeActive] = useState(false);

  const faceMeshRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const faceLandmarksRef = useRef<any>(null);
  const handLandmarksRef = useRef<any>(null);

  // Synthesize camera beep or shutter sound using Web Audio API
  const playSound = (type: 'shutter' | 'beep' | 'start' | 'stop') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(980, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
      else if (type === 'shutter') {
        // Shutter Click noise
        const bufferSize = ctx.sampleRate * 0.12;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.Q.setValueAtTime(3, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();

        // Short high-pitch mechanical spring tone
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
      else if (type === 'start') {
        // Dual-tone ascending record start sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.setValueAtTime(520, ctx.currentTime);
        osc1.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
        osc2.frequency.setValueAtTime(784, ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.2);
        osc2.stop(ctx.currentTime + 0.2);
      }
      else if (type === 'stop') {
        // Dual-tone descending record stop sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.setValueAtTime(659, ctx.currentTime);
        osc1.frequency.setValueAtTime(520, ctx.currentTime + 0.08);
        osc2.frequency.setValueAtTime(520, ctx.currentTime);
        osc2.frequency.setValueAtTime(392, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio synthesis failed:", e);
    }
  };

  // Helper to show brief in-app success messages
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Start the camera hardware stream
  const startCamera = async () => {
    setPermissionState('checking');
    try {
      // Release any active stream first
      stopCameraStream();

      // Request camera permissions with standard responsive constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 24 }
        },
        audio: false // We do not need audio in camera to prevent complex browser echo
      });

      setStream(mediaStream);
      streamTracksRef.current = mediaStream.getTracks();
      setPermissionState('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.error("Play failed:", e));
      }
    } catch (error) {
      console.error('Failed to get camera feed:', error);
      setPermissionState('denied');
    }
  };

  // Turn off the web camera safely when app unmounts
  const stopCameraStream = () => {
    if (streamTracksRef.current.length > 0) {
      streamTracksRef.current.forEach(track => track.stop());
      streamTracksRef.current = [];
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Dynamic loader for MediaPipe scripts (FaceMesh and Hands)
  const loadMediaPipe = async () => {
    if (mediapipeActive || isModelLoading) return;
    setIsModelLoading(true);
    setModelLoadError(false);

    // Bulletproof XHR progress exception shield to bypass MediaPipe's CDN progress crash
    try {
      Object.defineProperty(XMLHttpRequest.prototype, 'onprogress', {
        set(fn) {
          const self = this as any;
          self._rawOnProgress = fn;

          self._wrappedOnProgress = function (this: XMLHttpRequest, ev: ProgressEvent) {
            try {
              if (self._rawOnProgress) {
                self._rawOnProgress.call(this, ev);
              }
            } catch (err: any) {
              // Gracefully suppress the benign MediaPipe concurrent loading collision crash
              if (err && err.message && (err.message.includes('dataFileDownloads') || err.message.includes('undefined'))) {
                return;
              }
              console.error("Shielded progress error:", err);
            }
          };
        },
        get() {
          return (this as any)._wrappedOnProgress;
        },
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      console.warn("Failed to inject XHR progress shield:", e);
    }

    try {
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.head.appendChild(script);
        });
      };

      // Load CDN scripts sequentially
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

      const FaceMeshConstructor = (window as any).FaceMesh;
      const HandsConstructor = (window as any).Hands;

      if (!FaceMeshConstructor || !HandsConstructor) {
        throw new Error("MediaPipe constructors not found on window");
      }

      // Initialize high-precision FaceMesh
      const fm = new FaceMeshConstructor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      fm.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          faceLandmarksRef.current = results.multiFaceLandmarks[0];
        } else {
          faceLandmarksRef.current = null;
        }
      });
      faceMeshRef.current = fm;

      // Initialize high-precision Hand joints tracking
      const hd = new HandsConstructor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hd.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // fastest lightweight model
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      hd.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          handLandmarksRef.current = results.multiHandLandmarks[0];
        } else {
          handLandmarksRef.current = null;
        }
      });
      handsRef.current = hd;

      setMediapipeActive(true);
      setIsModelLoading(false);
      notify("AI tracking engine initialized!");
    } catch (e) {
      console.error("Failed to load MediaPipe engines:", e);
      setIsModelLoading(false);
      setModelLoadError(true);
      notify("Failed to load tracking models.");
    }
  };

  // Monitor filter state changes to lazily load tracking libraries
  useEffect(() => {
    if (activeFilter.id.startsWith('ar-')) {
      loadMediaPipe();
    }
  }, [activeFilter]);

  // Initialize and check permission on start
  useEffect(() => {
    const initCamera = async () => {
      // First, check permission query silently if supported to see if it's explicitly blocked
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const res = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (res.state === 'denied') {
            setPermissionState('denied');
            return;
          }
        } catch (e) {
          // navigator.permissions.query for camera is not supported in Safari/Firefox, ignore
        }
      }

      // Auto-start camera on mount. If previously granted, it will stream instantly.
      // If prompt state, it triggers standard browser dialog immediately.
      // If it throws an error (e.g. denied or blocked), we show our custom denied screen.
      await startCamera();
    };

    initCamera();
    return () => {
      stopCameraStream();
    };
  }, []);

  // Update video element source whenever permission becomes granted
  useEffect(() => {
    if (permissionState === 'granted' && stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Play failed:", e));
    }
  }, [permissionState, stream]);

  // Real-time WYSIWYG Viewfinder Drawing & AR Tracking Loop (60 FPS)
  useEffect(() => {
    if (permissionState !== 'granted' || !stream || !videoRef.current || !viewfinderCanvasRef.current) return;

    let active = true;
    let animationFrameId: number;
    let lastInferenceTime = 0;

    const video = videoRef.current;
    const canvas = viewfinderCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sparkles particles trail array
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      emoji?: string;
    }> = [];

    // Hand motion history trail coordinates
    let handHistory: Array<{ x: number; y: number }> = [];

    let lastBlinkedState = false;
    let lastBlinkTime = 0;

    const processFrame = () => {
      if (!active) return;
      if (video.paused || video.ended) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const isAR = activeFilter.id.startsWith('ar-');
      setShowARStats(isAR);

      // Match display viewport aspect ratio
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const W = canvas.width;
      const H = canvas.height;

      // 1. Send frame to MediaPipe at throttled intervals to maximize UI thread FPS
      const now = Date.now();
      if (mediapipeActive && (now - lastInferenceTime > 45)) {
        lastInferenceTime = now;
        if ((activeFilter.id === 'ar-face' || activeFilter.id === 'ar-xray') && faceMeshRef.current) {
          faceMeshRef.current.send({ image: video }).catch(() => { });
        } else if (activeFilter.id === 'ar-hand' && handsRef.current) {
          handsRef.current.send({ image: video }).catch(() => { });
        }
      }

      // 2. Draw video background or black out for X-Ray
      if (activeFilter.id === 'ar-xray') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
      } else {
        if (activeFilter.id !== 'normal' && !isAR) {
          ctx.filter = activeFilter.css;
        } else {
          ctx.filter = 'none';
        }
        ctx.drawImage(video, 0, 0, W, H);
        ctx.filter = 'none'; // reset filter
      }

      // Draw standard Rule of Thirds guidelines if active
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 3, 0); ctx.lineTo(W / 3, H);
        ctx.moveTo((W / 3) * 2, 0); ctx.lineTo((W / 3) * 2, H);
        ctx.moveTo(0, H / 3); ctx.lineTo(W, H / 3);
        ctx.moveTo(0, (H / 3) * 2); ctx.lineTo(W, (H / 3) * 2);
        ctx.stroke();
      }

      // A. Face Landmarkers drawing (ar-face and ar-xray)
      if ((activeFilter.id === 'ar-face' || activeFilter.id === 'ar-xray') && faceLandmarksRef.current) {
        const faceLandmarks = faceLandmarksRef.current;

        // Helper to convert normalized coordinate to canvas space
        const getPt = (idx: number) => ({
          x: faceLandmarks[idx].x * W,
          y: faceLandmarks[idx].y * H
        });

        // 1. Compute Pupil eye centers (Left eye: 159 & 145, Right eye: 386 & 374)
        const p159 = getPt(159);
        const p145 = getPt(145);
        const eLX = (p159.x + p145.x) / 2;
        const eLY = (p159.y + p145.y) / 2;

        const p386 = getPt(386);
        const p374 = getPt(374);
        const eRX = (p386.x + p374.x) / 2;
        const eRY = (p386.y + p374.y) / 2;

        const dx = eRX - eLX;
        const dy = eRY - eLY;
        const eyeDist = Math.sqrt(dx * dx + dy * dy);

        // 2. Compute EAR (Eye Aspect Ratio) for academic blink detection
        const dist = (pA: { x: number, y: number }, pB: { x: number, y: number }) => {
          const rx = pA.x - pB.x;
          const ry = pA.y - pB.y;
          return Math.sqrt(rx * rx + ry * ry);
        };

        const leftHeight = dist(getPt(159), getPt(145));
        const leftWidth = dist(getPt(33), getPt(133));
        const rightHeight = dist(getPt(386), getPt(374));
        const rightWidth = dist(getPt(362), getPt(263));

        const leftEAR = leftWidth > 0 ? (leftHeight / leftWidth) : 0.25;
        const rightEAR = rightWidth > 0 ? (rightHeight / rightWidth) : 0.25;
        const avgEAR = (leftEAR + rightEAR) / 2;

        const isBlinkingNow = avgEAR < 0.15;

        // Trigger blink action
        if (isBlinkingNow && !lastBlinkedState) {
          const nowBlink = Date.now();
          if (nowBlink - lastBlinkTime > 400) {
            setBlinkCount(prev => prev + 1);
            playSound('beep');
            lastBlinkTime = nowBlink;

            // Spawn double eye emoji explosive splashes
            const emojis = ['✨', '⭐', '💖', '🎉'];
            for (let k = 0; k < 10; k++) {
              particles.push({
                x: eLX,
                y: eLY,
                vx: (Math.random() * 8 - 4),
                vy: (Math.random() * -6 - 2),
                size: Math.random() * 12 + 10,
                color: '#fff',
                alpha: 1,
                life: 1,
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
              });
              particles.push({
                x: eRX,
                y: eRY,
                vx: (Math.random() * 8 - 4),
                vy: (Math.random() * -6 - 2),
                size: Math.random() * 12 + 10,
                color: '#fff',
                alpha: 1,
                life: 1,
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
              });
            }
          }
        }
        lastBlinkedState = isBlinkingNow;

        // Render Filter: Anime Eyes, Blush & Lipstick Makeup
        if (activeFilter.id === 'ar-face') {
          // Cheek blush radial pink gradients
          const blushL = getPt(50);
          const blushR = getPt(280);
          const blushRadius = eyeDist * 0.45;

          ctx.save();
          // Left cheek
          let blushGrd = ctx.createRadialGradient(blushL.x, blushL.y, 0, blushL.x, blushL.y, blushRadius);
          blushGrd.addColorStop(0, 'rgba(244, 63, 94, 0.42)');
          blushGrd.addColorStop(1, 'rgba(244, 63, 94, 0)');
          ctx.fillStyle = blushGrd;
          ctx.beginPath(); ctx.arc(blushL.x, blushL.y, blushRadius, 0, Math.PI * 2); ctx.fill();

          // Right cheek
          blushGrd = ctx.createRadialGradient(blushR.x, blushR.y, 0, blushR.x, blushR.y, blushRadius);
          blushGrd.addColorStop(0, 'rgba(244, 63, 94, 0.42)');
          blushGrd.addColorStop(1, 'rgba(244, 63, 94, 0)');
          ctx.fillStyle = blushGrd;
          ctx.beginPath(); ctx.arc(blushR.x, blushR.y, blushRadius, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          // Outer lipstick path mapping
          const lipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
          ctx.save();
          ctx.fillStyle = 'rgba(219, 39, 119, 0.72)'; // shiny magenta lip gloss
          ctx.beginPath();
          const startPt = getPt(lipIndices[0]);
          ctx.moveTo(startPt.x, startPt.y);
          for (let l = 1; l < lipIndices.length; l++) {
            const pt = getPt(lipIndices[l]);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.closePath();
          ctx.fill();

          // Glossy reflection path
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const p78 = getPt(78);
          const p13 = getPt(13);
          const p308 = getPt(308);
          ctx.moveTo(p78.x, p78.y);
          ctx.quadraticCurveTo(p13.x, p13.y + 2, p308.x, p308.y);
          ctx.stroke();
          ctx.restore();

          // Giant Glossy Anime Eyes
          const drawAnimeEye = (ex: number, ey: number, r: number) => {
            ctx.save();
            // White sclera
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(ex, ey, r * 1.15, r * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();

            // Iris glowing radial gradient
            const irisGrd = ctx.createRadialGradient(ex, ey, 0, ex, ey, r);
            irisGrd.addColorStop(0, '#f472b6'); // pink
            irisGrd.addColorStop(0.5, '#db2777'); // deep pink
            irisGrd.addColorStop(1, '#5c0632'); // dark plum
            ctx.fillStyle = irisGrd;
            ctx.beginPath();
            ctx.arc(ex, ey, r, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(ex, ey, r * 0.42, 0, Math.PI * 2);
            ctx.fill();

            // White shiny gloss highlights
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - r * 0.28, ey - r * 0.28, r * 0.22, 0, Math.PI * 2);
            ctx.arc(ex + r * 0.28, ey + r * 0.22, r * 0.12, 0, Math.PI * 2);
            ctx.fill();

            // Retro styled thick upper lash
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(ex, ey - r * 0.22, r * 1.3, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();

            if (isBlinkingNow) {
              ctx.fillStyle = '#fef08a';
              ctx.font = `bold ${r * 1.1}px sans-serif`;
              ctx.fillText("⭐", ex - r / 2, ey - r * 1.1);
            }
            ctx.restore();
          };

          const animeEyeRadius = eyeDist * 0.35;
          drawAnimeEye(eLX, eLY, animeEyeRadius);
          drawAnimeEye(eRX, eRY, animeEyeRadius);

          // Golden Crown Halo floating above head
          const pH10 = getPt(10);
          ctx.save();
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.ellipse(pH10.x, pH10.y - eyeDist * 0.42, eyeDist * 0.65, eyeDist * 0.15, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Render Filter: X-Ray Bone Scanner skull
        if (activeFilter.id === 'ar-xray') {
          ctx.save();
          ctx.strokeStyle = '#00ffcc'; // neon green-cyan bones
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 2.5;

          // Face outer contour geometry
          const skullContour = [
            172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
            338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397
          ];
          ctx.beginPath();
          const startContour = getPt(skullContour[0]);
          ctx.moveTo(startContour.x, startContour.y);
          for (let k = 1; k < skullContour.length; k++) {
            const pt = getPt(skullContour[k]);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.closePath();
          ctx.stroke();

          // Left orbital socket
          const leftSocket = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          const startL = getPt(leftSocket[0]);
          ctx.moveTo(startL.x, startL.y);
          for (const s of leftSocket) {
            const pt = getPt(s);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Right orbital socket
          const rightSocket = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
          ctx.beginPath();
          const startR = getPt(rightSocket[0]);
          ctx.moveTo(startR.x, startR.y);
          for (const s of rightSocket) {
            const pt = getPt(s);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Red pupil scanning beam lasers
          ctx.fillStyle = '#ff3366';
          ctx.beginPath();
          ctx.arc(eLX, eLY, 5, 0, Math.PI * 2);
          ctx.arc(eRX, eRY, 5, 0, Math.PI * 2);
          ctx.fill();

          // Nasal bone triangle cavity
          const p168 = getPt(168);
          const p2 = getPt(2);
          const noseL = getPt(98);
          const noseR = getPt(327);
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(p168.x, p168.y);
          ctx.lineTo(noseL.x, noseL.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(noseR.x, noseR.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Teeth skeletal rows grid lines
          const lipUpper = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
          const lipLower = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];

          ctx.beginPath();
          // Draw horizontal dividing line
          const p78 = getPt(78);
          const p308 = getPt(308);
          ctx.moveTo(p78.x, p78.y);
          ctx.lineTo(p308.x, p308.y);

          // Draw vertical teeth row grids connecting upper and lower lips
          for (let t = 0; t < lipUpper.length; t++) {
            const ptU = getPt(lipUpper[t]);
            const ptL = getPt(lipLower[t]);
            ctx.moveTo(ptU.x, ptU.y);
            ctx.lineTo(ptL.x, ptL.y);
          }
          ctx.stroke();

          // Skeletal Spine column & collar bones flowing from chin (152)
          const p152 = getPt(152);
          ctx.beginPath();
          ctx.moveTo(p152.x, p152.y);
          ctx.lineTo(p152.x, p152.y + eyeDist * 1.5); // spine
          ctx.moveTo(p152.x - eyeDist * 1.2, p152.y + eyeDist * 0.6);
          ctx.quadraticCurveTo(p152.x, p152.y + eyeDist * 0.3, p152.x + eyeDist * 1.2, p152.y + eyeDist * 0.6); // collar bone
          ctx.stroke();

          ctx.restore();
        }
      }

      // B. Hand tracker drawing (ar-hand)
      if (activeFilter.id === 'ar-hand' && handLandmarksRef.current) {
        const handLandmarks = handLandmarksRef.current;

        // Get index tip (landmark 8)
        const ptTip = handLandmarks[8];
        const hX = ptTip.x * W;
        const hY = ptTip.y * H;

        handHistory.push({ x: hX, y: hY });
        if (handHistory.length > 20) {
          handHistory.shift();
        }

        // Spawn neon particles
        const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#34d399', '#a78bfa'];
        for (let s = 0; s < 4; s++) {
          particles.push({
            x: hX + (Math.random() * 24 - 12),
            y: hY + (Math.random() * 24 - 12),
            vx: Math.random() * 3.5 - 1.75,
            vy: Math.random() * -2 - 1,
            size: Math.random() * 4.5 + 2.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 1
          });
        }

        // Draw connections outline array for 21 joints
        const handConnections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // index
          [9, 10], [10, 11], [11, 12], // middle
          [13, 14], [14, 15], [15, 16], // ring
          [0, 17], [17, 18], [18, 19], [19, 20], // pinky
          [5, 9], [9, 13], [13, 17] // palm base connections
        ];

        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.62)'; // glowing cyan joints
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;

        for (const [a, b] of handConnections) {
          if (handLandmarks[a] && handLandmarks[b]) {
            ctx.beginPath();
            ctx.moveTo(handLandmarks[a].x * W, handLandmarks[a].y * H);
            ctx.lineTo(handLandmarks[b].x * W, handLandmarks[b].y * H);
            ctx.stroke();
          }
        }

        // Draw node circles
        ctx.fillStyle = '#00f0ff';
        for (let j = 0; j < 21; j++) {
          const pt = handLandmarks[j];
          ctx.beginPath();
          ctx.arc(pt.x * W, pt.y * H, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Draw glowing violet hand ribbon trail
        if (handHistory.length > 1) {
          ctx.save();
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(handHistory[0].x, handHistory[0].y);
          for (let h = 1; h < handHistory.length; h++) {
            ctx.lineTo(handHistory[h].x, handHistory[h].y);
          }
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // Slow ribbon decay if hand isn't tracked
        if (handHistory.length > 0) {
          handHistory.shift();
        }
      }

      // C. Draw particle streams
      updateAndDrawParticles(ctx, particles);

      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [permissionState, stream, activeFilter, showGrid, mediapipeActive]);

  const drawEyeTarget = (ctx: CanvasRenderingContext2D, cx: number, cy: number, blinked: boolean) => {
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, blinked ? 2 : 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy); ctx.lineTo(cx - 4, cy);
    ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy - 4);
    ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy + 10);
    ctx.stroke();
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D, particles: Array<any>) => {
    for (let k = particles.length - 1; k >= 0; k--) {
      const p = particles[k];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.024;
      p.life = p.alpha;

      if (p.alpha <= 0) {
        particles.splice(k, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.emoji) {
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillText(p.emoji, p.x - p.size / 2, p.y + p.size / 2);
      } else {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  // Read VFS items from Pictures directory to construct the filmstrip
  const cameraGalleryItems = vfs.filter(
    item => item.parentId === 'pictures' && (item.ext === 'png' || item.ext === 'jpg' || item.ext === 'webm' || item.ext === 'mp4')
  ).sort((a, b) => b.id.localeCompare(a.id)); // Newest first

  // Handle Capture Action
  const handleCapture = () => {
    if (isRecording || countdownVal !== null) return;

    if (useCountdown) {
      let count = 3;
      setCountdownVal(count);
      playSound('beep');

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdownVal(count);
          playSound('beep');
        } else {
          clearInterval(timer);
          setCountdownVal(null);
          if (captureMode === 'photo') {
            executePhotoCapture();
          } else {
            executeVideoStart();
          }
        }
      }, 1000);
    } else {
      if (captureMode === 'photo') {
        executePhotoCapture();
      } else {
        executeVideoStart();
      }
    }
  };

  // Photo Capture logic
  const executePhotoCapture = () => {
    if (!videoRef.current || !canvasRef.current || !viewfinderCanvasRef.current) return;

    // Play camera shutter sound
    playSound('shutter');

    // Trigger visual camera flash overlay
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = canvasRef.current;
    const viewfinderCanvas = viewfinderCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set capture canvas dimensions identical to viewfinder canvas
    canvas.width = viewfinderCanvas.width;
    canvas.height = viewfinderCanvas.height;

    // Apply mirror flip so the saved JPEG matches the mirrored screen preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(viewfinderCanvas, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale

    // Convert to compressed jpeg (~35KB-50KB) to ensure localStorage limit is never breached
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

    const fileName = `Booth_Photo_${new Date().toLocaleTimeString().replace(/\s/g, '').replace(/:/g, '-')}.jpg`;
    createFile(fileName, 'jpg', dataUrl, 'pictures');
    notify("Photo saved to library!");
  };

  // Video Recording Start
  const executeVideoStart = () => {
    const canvas = viewfinderCanvasRef.current;
    if (!canvas) return;

    playSound('start');
    setIsRecording(true);
    setRecordingDuration(0);
    setRecordedChunks([]);

    // Capture 24 FPS video stream from the rendering canvas
    const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(24) : (canvas as any).mozCaptureStream ? (canvas as any).mozCaptureStream(24) : null;
    const recordStream = canvasStream || stream;
    if (!recordStream) return;

    // Configure options, default to vp9 or browser default codecs
    let options = {};
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 180000 };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm', videoBitsPerSecond: 180000 };
    }

    try {
      const recorder = new MediaRecorder(recordStream, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        // Handled
      };

      recorder.start();
      setMediaRecorder(recorder);

      // Start duration counter (capped at 8 seconds to prevent QuotaExceededError in localStorage)
      recordTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 8) {
            // Force stop
            clearInterval(recordTimerRef.current!);
            executeVideoStop(recorder);
            return 8;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.error("Failed to start MediaRecorder:", e);
      setIsRecording(false);
    }
  };

  // Video Recording Stop
  const executeVideoStop = (activeRecorder?: MediaRecorder) => {
    const recorder = activeRecorder || mediaRecorder;
    if (!recorder || recorder.state === 'inactive') return;

    playSound('stop');
    setIsRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    recorder.stop();
  };

  // Save the video chunk after stops
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      saveRecordedVideo();
    }
  }, [recordedChunks, isRecording]);

  const saveRecordedVideo = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });

    // File Reader to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const fileName = `Booth_Clip_${new Date().toLocaleTimeString().replace(/\s/g, '').replace(/:/g, '-')}.webm`;
      createFile(fileName, 'webm', base64String, 'pictures');
      notify("Video clip saved to library!");
    };
    reader.readAsDataURL(blob);
    setRecordedChunks([]);
  };

  // Delete media item from booth filmstrip
  const handleDeleteMedia = (id: string) => {
    deleteItem(id);
    if (selectedMedia?.id === id) {
      setSelectedMedia(null);
    }
    notify("Item deleted.");
  };

  // Export / Download item from filmstrip
  const handleDownloadMedia = (item: VFSItem) => {
    if (!item.content) return;
    const link = document.createElement('a');
    link.href = item.content;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Export completed successfully!");
  };

  // Apply photo as user's desktop background wallpaper!
  const handleSetWallpaper = (item: VFSItem) => {
    if (!item.content) return;
    setWallpaper(item.content);
    notify("Desktop wallpaper updated!");
  };

  return (
    <div className="macos-app flex flex-col h-full overflow-hidden font-sans select-none relative">

      {/* Visual Camera Flash Overlay Effect */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-[9999] pointer-events-none transition-opacity duration-150 animate-flash" />
      )}

      {/* 1. Header menu bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#1e1e1e] backdrop-blur-xl z-30">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-white" />
          <span className="text-sm font-semibold tracking-wide text-white">
            Photo Booth
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 text-white/60">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg hover:bg-white/5 transition-all ${showGrid ? 'text-pink-500 bg-white/5' : ''}`}
            title="Toggle Grid Lines"
          >
            <Grid size={14} />
          </button>

          <button
            onClick={() => setUseCountdown(!useCountdown)}
            className={`p-1.5 rounded-lg hover:bg-white/5 transition-all ${useCountdown ? 'text-pink-500 bg-white/5' : ''}`}
            title="Toggle 3s Timer"
          >
            <Timer size={14} />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-all"
            title={isMuted ? "Unmute Shutter" : "Mute Shutter"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Main Camera Screen Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative bg-[#1c1c1e] overflow-hidden">

        {/* Live Notification Indicator */}
        {notification && (
          <div className="absolute top-4 z-40 bg-[#161a22]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-bold text-pink-400 flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <Check size={12} /> {notification}
          </div>
        )}

        {/* High-quality Glass Camera Frame */}
        <div className="relative aspect-video w-full max-w-2xl bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center justify-center">

          {/* Subtle glossy glass reflection across top of viewfinder */}
          <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/10 to-transparent z-20 pointer-events-none" />

          {/* Conditional rendering based on permission status */}
          {permissionState === 'checking' && (
            <div className="flex flex-col items-center gap-3">
              <RotateCw className="w-8 h-8 text-pink-500 animate-spin" />
              <span className="text-[10px] tracking-wider uppercase font-bold text-white/50">Waking camera hardware...</span>
            </div>
          )}

          {permissionState === 'prompt' && (
            <div className="flex flex-col items-center gap-4 text-center px-8 z-30">
              <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-md">
                <Camera size={26} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wide">Camera Access Requested</h3>
                <p className="text-[10px] text-white/50 max-w-xs mt-1 leading-relaxed">
                  Photo Booth needs access to your camera to take snapshots and record videos.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95"
              >
                Allow Camera Access
              </button>
            </div>
          )}

          {permissionState === 'denied' && (
            <div className="flex flex-col items-center gap-4 text-center px-8 z-30 text-rose-400">
              <AlertCircle size={38} className="stroke-1.5 animate-bounce" />
              <div>
                <h3 className="text-sm font-bold tracking-wide">Camera Access Blocked</h3>
                <p className="text-[10px] text-white/50 max-w-xs mt-1.5 leading-relaxed">
                  Permission was denied. Please check your browser's site settings or URL bar lock icon to grant camera permissions to this page.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold transition-all"
              >
                Try Reconnecting
              </button>
            </div>
          )}

          {permissionState === 'granted' && (
            <>
              {/* Background hidden receiver */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />

              {/* High-fidelity mirror-inverted unified Viewfinder Canvas */}
              <canvas
                ref={viewfinderCanvasRef}
                className="w-full h-full object-cover scale-x-[-1] transition-all duration-300"
              />

              {/* High-end AR Tracker HUD Overlay */}
              {showARStats && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-[#00f0ff]/20 px-3 py-1.5 rounded-xl text-[9px] font-black text-[#00f0ff] flex items-center gap-1.5 shadow-lg tracking-wider uppercase z-30 animate-fade-in animate-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                  <span>
                    {activeFilter.id === 'ar-face' && `⚡ BLINKS: ${blinkCount}`}
                    {activeFilter.id === 'ar-hand' && '👋 WAND TRAIL ON'}
                    {activeFilter.id === 'ar-xray' && '💀 X-RAY BONE SCANNED'}
                  </span>
                </div>
              )}

              {/* AI Models Loading Glassmorphic Overlay */}
              {isModelLoading && (
                <div className="absolute inset-0 bg-[#070709]/80 backdrop-blur-md z-40 flex flex-col items-center justify-center animate-fade-in animate-in">
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-pink-500 animate-spin" />
                    <Sparkles className="absolute text-pink-400 animate-pulse" size={16} />
                  </div>
                  <span className="mt-4 text-[10px] uppercase font-black tracking-widest text-pink-400 animate-pulse">
                    Loading AI Models...
                  </span>
                  <span className="text-[8px] text-white/40 mt-1 font-bold">
                    Initializing high-performance neural face & hand pipelines
                  </span>
                </div>
              )}

              {/* Glowing countdown numbers */}
              {countdownVal !== null && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 backdrop-blur-[2px]">
                  <span className="text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] animate-ping duration-1000">
                    {countdownVal}
                  </span>
                </div>
              )}

              {/* Video Recording Status Badge */}
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase border border-red-500/20 z-30 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>REC 00:0{recordingDuration} / 00:08</span>
                </div>
              )}
            </>
          )}

        </div>

        {/* Hidden capture canvas helper */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 3. Bottom Camera Controls & Shutter panel */}
      <div className="flex flex-col items-center bg-black/60 border-t border-white/5 py-5 px-6 backdrop-blur-lg gap-4.5 z-20">

        {/* Toggle Mode and Filter Bar */}
        <div className="flex items-center justify-between w-full max-w-2xl text-[10px] font-bold">

          {/* Slideway Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
            <button
              onClick={() => { if (!isRecording) setCaptureMode('photo'); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${captureMode === 'photo'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
                }`}
              disabled={isRecording}
            >
              <Camera size={12} /> Take Photo
            </button>
            <button
              onClick={() => { if (!isRecording) setCaptureMode('video'); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${captureMode === 'video'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
                }`}
              disabled={isRecording}
            >
              <Video size={12} /> Record Clip
            </button>
          </div>

          {/* Active Filter dropdown selection scroll */}
          <div className="flex items-center gap-2">
            <Sparkles size={11} className="text-pink-400" />
            <span className="text-white/40 mr-1 uppercase text-[9px] tracking-wider font-semibold">Effects</span>
            <div className="flex gap-1.5 overflow-x-auto max-w-[280px] p-0.5 scrollbar-none">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => { if (!isRecording) setActiveFilter(f); }}
                  className={`px-3 py-1 rounded-lg border text-[9px] font-bold transition-all ${activeFilter.id === f.id
                      ? 'border-pink-500 bg-pink-500/10 text-pink-300 shadow-sm'
                      : 'border-white/5 bg-white/5 text-white/50 hover:text-white'
                    }`}
                  disabled={isRecording}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shutter capture trigger button */}
        <div className="relative">
          {captureMode === 'photo' ? (
            // Photo shutter (solid white outer ring, cherry glossy center button)
            <button
              onClick={handleCapture}
              disabled={permissionState !== 'granted' || countdownVal !== null}
              className="w-14 h-14 rounded-full bg-white p-1 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-40 disabled:pointer-events-none"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 border-2 border-white flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                <div className="w-2 h-2 bg-white rounded-full opacity-40 absolute top-2 left-3" />
              </div>
            </button>
          ) : (
            // Video record shutter (pulsing white outer ring, red record block)
            <button
              onClick={isRecording ? () => executeVideoStop() : handleCapture}
              disabled={permissionState !== 'granted' || countdownVal !== null}
              className="w-14 h-14 rounded-full bg-white/10 border-2 border-white p-1 hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
            >
              {isRecording ? (
                // Stop block
                <div className="w-5.5 h-5.5 bg-red-500 rounded-md animate-pulse shadow-md" />
              ) : (
                // Record circle
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-rose-600 border border-white flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] relative">
                  <div className="w-1.5 h-1.5 bg-white rounded-full opacity-40 absolute top-1.5 left-2" />
                </div>
              )}
            </button>
          )}
        </div>

      </div>

      {/* 4. Filmstrip Drawer for captured elements */}
      <div className="h-28 bg-[#070709] border-t border-white/5 px-6 py-4 flex gap-4 overflow-x-auto items-center scrollbar-thin select-none z-20">

        {cameraGalleryItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white/20 text-[10px] tracking-widest uppercase font-semibold">
            Captured filmstrip is empty. Snap some files!
          </div>
        ) : (
          <div className="flex gap-4">
            {cameraGalleryItems.map((item) => {
              const isItemVideo = item.ext === 'webm' || item.ext === 'mp4';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="w-20 aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-pink-500/50 bg-white/5 cursor-pointer relative group flex-shrink-0 transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  {isItemVideo ? (
                    <video
                      src={item.content}
                      className="w-full h-full object-cover pointer-events-none"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.content || '/wallpaper.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Play circle indicator for videos */}
                  {isItemVideo && (
                    <div className="absolute top-1.5 left-1.5 p-1 bg-black/60 rounded-lg backdrop-blur-md border border-white/10">
                      <Play size={8} className="fill-white stroke-none" />
                    </div>
                  )}

                  {/* Hover visual quick delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item.id); }}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600/80 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                    title="Delete item"
                  >
                    <Trash2 size={10} />
                  </button>

                  {/* Subtle black overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1 text-[8px] font-bold truncate">
                    <span className="truncate w-full text-center text-white/80">{item.name.replace('Booth_', '')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 5. Lightbox Modal Preview Detail Window */}
      {selectedMedia && (
        <div className="absolute inset-0 bg-black/90 z-50 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in animate-in">

          <div className="bg-[#141519] border border-white/10 rounded-2xl max-w-xl w-full overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.8)] flex flex-col">

            {/* Modal header with name */}
            <div className="px-5 py-3.5 border-b border-white/5 bg-black/40 flex items-center justify-between">
              <span className="text-[10px] tracking-wider uppercase font-bold text-white/60">{selectedMedia.name}</span>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-xs font-semibold hover:text-white text-white/60 hover:bg-white/5 px-2.5 py-1 rounded-lg transition-colors border border-white/5"
              >
                Close Preview
              </button>
            </div>

            {/* Modal main display */}
            <div className="bg-black/80 flex items-center justify-center aspect-video p-4 select-text relative">
              {selectedMedia.ext === 'webm' || selectedMedia.ext === 'mp4' ? (
                <video src={selectedMedia.content} className="w-full h-full object-contain max-h-[300px]" controls autoPlay loop />
              ) : (
                <img src={selectedMedia.content} alt={selectedMedia.name} className="w-full h-full object-contain max-h-[300px]" />
              )}
            </div>

            {/* Modal actions */}
            <div className="px-5 py-4 border-t border-white/5 bg-[#141519] flex justify-between gap-3 text-[10px] font-bold">

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadMedia(selectedMedia)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 rounded-xl transition-all shadow-[0_0_15px_rgba(219,39,119,0.25)]"
                >
                  <Download size={13} /> Export file
                </button>

                {selectedMedia.ext !== 'webm' && selectedMedia.ext !== 'mp4' && (
                  <button
                    onClick={() => handleSetWallpaper(selectedMedia)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                  >
                    <Wallpaper size={13} /> Set Desktop Wallpaper
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDeleteMedia(selectedMedia.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl transition-all border border-red-500/20"
              >
                <Trash2 size={13} /> Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

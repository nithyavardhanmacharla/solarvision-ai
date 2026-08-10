'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, RotateCcw, Play, Pause, Box } from 'lucide-react';

interface SolarPanel3DViewerProps {
  tiltAngle?: number;
  azimuthAngle?: number;
  capacityKw?: number;
  trackingType?: 'fixed' | 'single_axis' | 'dual_axis';
  panelType?: string;
  onTiltChange?: (newTilt: number) => void;
  onAzimuthChange?: (newAzimuth: number) => void;
  className?: string;
}

export function SolarPanel3DViewer({
  tiltAngle = 22,
  azimuthAngle = 180,
  capacityKw = 10,
  trackingType = 'fixed',
  panelType = 'monocrystalline',
  onTiltChange,
  onAzimuthChange,
  className = ''
}: SolarPanel3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [timeOfDay, setTimeOfDay] = useState<number>(12.5);
  const [isAnimatingSun, setIsAnimatingSun] = useState<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const isAutoRotateRef = useRef<boolean>(isAutoRotate);
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);
  const [incidenceAngle, setIncidenceAngle] = useState<number>(0);
  const [captureEfficiency, setCaptureEfficiency] = useState<number>(98);

  const [hasObstruction, setHasObstruction] = useState<boolean>(false);
  const obstructionMeshRef = useRef<THREE.Mesh | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const panelGroupRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.FogExp2(0x09090b, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 7.5);
    camera.lookAt(0, 0.5, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x18181b, 0.4);
    scene.add(hemiLight);

    // Sun directional light
    const sunLight = new THREE.DirectionalLight(0xfef08a, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Sun Visual
    const sunGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Sun Glow Halo
    const haloGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.25
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    sunMesh.add(haloMesh);

    // 5. Ground
    const groundGeo = new THREE.PlaneGeometry(16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(16, 16, 0x3f3f46, 0x27272a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 6. Solar Panel Mounting Frame & Array Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const baseGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.4;
    base.castShadow = true;
    rootGroup.add(base);

    const panelGroup = new THREE.Group();
    panelGroup.position.y = 0.8;
    rootGroup.add(panelGroup);
    panelGroupRef.current = panelGroup;

    const rows = 3;
    const cols = 4;
    const panelW = 0.65;
    const panelH = 1.1;
    const frameThick = 0.03;

    const panelCellColor =
      panelType === 'bifacial'
        ? 0x0284c7
        : panelType === 'polycrystalline'
        ? 0x1e40af
        : panelType === 'thin_film'
        ? 0x18181b
        : 0x0f172a;

    const frameGeo = new THREE.BoxGeometry(panelW, panelH, frameThick);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.9, roughness: 0.2 });

    const cellGeo = new THREE.BoxGeometry(panelW - 0.04, panelH - 0.04, frameThick + 0.005);
    const cellMat = new THREE.MeshStandardMaterial({
      color: panelCellColor,
      roughness: 0.15,
      metalness: 0.6
    });

    const lineMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xPos = (c - (cols - 1) / 2) * (panelW + 0.04);
        const zPos = (r - (rows - 1) / 2) * (panelH + 0.04);

        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.set(xPos, 0, zPos);
        frameMesh.rotation.x = -Math.PI / 2;
        frameMesh.castShadow = true;
        frameMesh.receiveShadow = true;
        panelGroup.add(frameMesh);

        const cellMesh = new THREE.Mesh(cellGeo, cellMat);
        cellMesh.position.set(xPos, 0.005, zPos);
        cellMesh.rotation.x = -Math.PI / 2;
        cellMesh.castShadow = true;
        panelGroup.add(cellMesh);

        const gridLineGeo = new THREE.PlaneGeometry(panelW - 0.08, 0.004);
        for (let l = -2; l <= 2; l++) {
          const lineMesh = new THREE.Mesh(gridLineGeo, lineMat);
          lineMesh.position.set(xPos, 0.02, zPos + l * 0.18);
          lineMesh.rotation.x = -Math.PI / 2;
          panelGroup.add(lineMesh);
        }
      }
    }

    const railGeo = new THREE.BoxGeometry(cols * panelW + 0.2, 0.05, 0.05);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.8 });
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(0, -0.05, -0.5);
    panelGroup.add(rail1);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(0, -0.05, 0.5);
    panelGroup.add(rail2);

    // Obstruction Mesh (Chimney / Object)
    const obsGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
    const obsMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.9 });
    const obsMesh = new THREE.Mesh(obsGeo, obsMat);
    obsMesh.position.set(-1.8, 0.9, 1.2);
    obsMesh.castShadow = true;
    obsMesh.receiveShadow = true;
    obsMesh.visible = false;
    scene.add(obsMesh);
    obstructionMeshRef.current = obsMesh;

    // Mouse Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let cameraRotY = 0;
    let cameraRotX = 0.6;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraRotY -= deltaX * 0.008;
      cameraRotX = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraRotX + deltaY * 0.008));
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const canvasElem = canvasRef.current;
    canvasElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      cameraRotY -= deltaX * 0.008;
      cameraRotX = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraRotX + deltaY * 0.008));
    };
    const handleTouchEnd = () => {
      isDragging = false;
    };

    canvasElem.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isAutoRotateRef.current && !isDragging) {
        cameraRotY += delta * 0.3;
      }

      const radius = 7.0;
      camera.position.x = radius * Math.sin(cameraRotY) * Math.cos(cameraRotX);
      camera.position.y = radius * Math.sin(cameraRotX);
      camera.position.z = radius * Math.cos(cameraRotY) * Math.cos(cameraRotX);
      camera.lookAt(0, 0.6, 0);

      if (sceneRef.current) {
        renderer.render(sceneRef.current, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasElem.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
    };
  }, [panelType]);

  // Handle Obstruction Toggle Without Re-initializing WebGL Context
  useEffect(() => {
    if (obstructionMeshRef.current) {
      obstructionMeshRef.current.visible = hasObstruction;
    }
  }, [hasObstruction]);

  useEffect(() => {
    if (!panelGroupRef.current) return;

    const tiltRad = THREE.MathUtils.degToRad(tiltAngle);
    const azimuthRad = THREE.MathUtils.degToRad(azimuthAngle - 180);

    panelGroupRef.current.rotation.set(0, 0, 0);
    panelGroupRef.current.rotation.y = -azimuthRad;
    panelGroupRef.current.rotation.x = tiltRad;
  }, [tiltAngle, azimuthAngle, trackingType]);

  useEffect(() => {
    if (!sunLightRef.current || !sunMeshRef.current) return;

    const hourFraction = (timeOfDay - 6) / 12;
    const sunAngle = hourFraction * Math.PI;

    const sunDist = 8.5;
    const sunX = Math.cos(sunAngle) * sunDist;
    const sunY = Math.max(0.1, Math.sin(sunAngle) * sunDist);
    const sunZ = 2.0;

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunMeshRef.current.position.set(sunX, sunY, sunZ);

    const heightRatio = Math.sin(sunAngle);
    sunLightRef.current.intensity = Math.max(0.1, heightRatio * 2.5);

    const panelNormal = new THREE.Vector3(
      0,
      Math.cos(THREE.MathUtils.degToRad(tiltAngle)),
      Math.sin(THREE.MathUtils.degToRad(tiltAngle))
    );
    const sunVector = new THREE.Vector3(sunX, sunY, sunZ).normalize();

    const cosIncidence = Math.max(0, panelNormal.dot(sunVector));
    const degIncidence = Math.round(Math.acos(cosIncidence) * (180 / Math.PI));
    setIncidenceAngle(degIncidence);

    const eff = Math.min(100, Math.max(0, Math.round(cosIncidence * 100)));
    setCaptureEfficiency(eff);
  }, [timeOfDay, tiltAngle, azimuthAngle]);

  useEffect(() => {
    if (!isAnimatingSun) return;
    const interval = setInterval(() => {
      setTimeOfDay((prev) => {
        if (prev >= 18) return 6;
        return Math.round((prev + 0.1) * 10) / 10;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isAnimatingSun]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 ${className}`}>
      <div ref={containerRef} className="w-full h-[260px] sm:h-[320px] cursor-grab active:cursor-grabbing relative">
        <canvas ref={canvasRef} className="w-full h-full block" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700/80 pointer-events-auto shadow-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-200 font-bold">3D Photovoltaic Engine</span>
            <span className="text-zinc-500">|</span>
            <span className="text-amber-400 font-bold">{capacityKw} kWp</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-700/80 text-[11px] font-mono">
              <button
                onClick={() => {
                  if (sceneRef.current) {
                    // Set perspective to Isometric
                    const camera = sceneRef.current.children.find(c => c instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
                    if (camera) { camera.position.set(0, 4.5, 7.5); camera.lookAt(0, 0.5, 0); }
                  }
                }}
                className="px-2 py-0.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                title="Isometric 3D View"
              >
                3D
              </button>
              <button
                onClick={() => {
                  if (sceneRef.current) {
                    // Set perspective to Top-Down
                    const camera = sceneRef.current.children.find(c => c instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
                    if (camera) { camera.position.set(0, 8.5, 0.1); camera.lookAt(0, 0, 0); }
                  }
                }}
                className="px-2 py-0.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                title="Top-Down Rooftop View"
              >
                Top
              </button>
              <button
                onClick={() => {
                  if (sceneRef.current) {
                    // Set perspective to Front Elevation
                    const camera = sceneRef.current.children.find(c => c instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
                    if (camera) { camera.position.set(0, 1.2, 7.0); camera.lookAt(0, 0.8, 0); }
                  }
                }}
                className="px-2 py-0.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                title="Front Elevation View"
              >
                Front
              </button>
            </div>
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                isAutoRotate
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-zinc-900/90 text-zinc-300 border-zinc-700/80 hover:bg-zinc-800'
              }`}
              title="Toggle 3D Orbit Auto-Rotate"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsAnimatingSun(!isAnimatingSun)}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                isAnimatingSun
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-700/80'
              }`}
              title={isAnimatingSun ? 'Pause Solar Orbit' : 'Play Solar Orbit'}
            >
              {isAnimatingSun ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setHasObstruction(!hasObstruction)}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ml-1 ${
                hasObstruction
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-700/80 hover:bg-zinc-800'
              }`}
              title="Toggle Obstruction Shadow"
            >
              <Box className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
          <div className="bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300">
            Tilt: <span className="text-amber-400 font-bold">{tiltAngle}°</span>
          </div>
          <div className="bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300">
            Azimuth: <span className="text-amber-400 font-bold">{azimuthAngle}°</span>
          </div>
          <div className="bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300">
            Yield: <span className="text-emerald-400 font-bold">{captureEfficiency}%</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-semibold min-w-[90px]">
            <Sun className="w-3.5 h-3.5 animate-pulse" />
            <span>{Math.floor(timeOfDay)}:{timeOfDay % 1 >= 0.5 ? '30' : '00'} {timeOfDay >= 12 ? 'PM' : 'AM'}</span>
          </div>
          <input
            type="range"
            min={6.0}
            max={18.0}
            step={0.1}
            value={timeOfDay}
            onChange={(e) => {
              setIsAnimatingSun(false);
              setTimeOfDay(parseFloat(e.target.value));
            }}
            className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer"
          />
        </div>

        {(onTiltChange || onAzimuthChange) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80 text-xs font-mono">
            {onTiltChange && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-400">Tilt Angle:</span>
                <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={tiltAngle}
                    onChange={(e) => onTiltChange(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-zinc-800 rounded"
                  />
                  <span className="text-amber-400 font-bold min-w-[32px] text-right">{tiltAngle}°</span>
                </div>
              </div>
            )}

            {onAzimuthChange && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-400">Azimuth:</span>
                <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={azimuthAngle}
                    onChange={(e) => onAzimuthChange(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-zinc-800 rounded"
                  />
                  <span className="text-amber-400 font-bold min-w-[32px] text-right">{azimuthAngle}°</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

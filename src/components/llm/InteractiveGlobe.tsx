import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Globe2 } from 'lucide-react';
import { type CompanyNode } from '../../data/llmLandscape';

interface GlobePoint {
  node: CompanyNode;
  x: number;
  y: number;
  visible: boolean;
  scale: number;
}

interface InteractiveGlobeProps {
  companyNodes: CompanyNode[];
  hoveredNodeId: string | null;
  focusedCompany: string;
  themeMode: 'dark' | 'light';
  onHoverNode: (id: string) => void;
  onSelectNode: (node: CompanyNode) => void;
}

const GLOBE_RADIUS = 136;
const GLOBE_CENTER = 170;
const DEG_TO_RAD = Math.PI / 180;

export default function InteractiveGlobe({
  companyNodes,
  hoveredNodeId,
  focusedCompany,
  themeMode,
  onHoverNode,
  onSelectNode
}: InteractiveGlobeProps) {
  const [rotation, setRotation] = useState({ lon: -20, lat: 18 });
  const dragState = useRef<{ x: number; y: number; lon: number; lat: number } | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (dragState.current) {
        return;
      }

      setRotation((current) => ({
        ...current,
        lon: current.lon + 0.4
      }));
    }, 40);

    return () => window.clearInterval(timer);
  }, []);

  const projectedPoints = useMemo(() => {
    return companyNodes
      .map((node) => projectPoint(node, rotation.lon, rotation.lat))
      .sort((left, right) => left.scale - right.scale);
  }, [companyNodes, rotation.lat, rotation.lon]);

  return (
    <div className={`relative overflow-hidden rounded-[24px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/70'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>3D globe</p>
          <h3 className="mt-1 text-lg font-semibold">Rotating model sphere</h3>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${themeMode === 'dark' ? 'bg-cyan-300/10 text-cyan-200' : 'bg-sky-100 text-sky-700'}`}>
          <Globe2 size={14} />
          drag to rotate
        </div>
      </div>

      <div
        className="mt-4 touch-none"
        onPointerDown={(event) => {
          dragState.current = {
            x: event.clientX,
            y: event.clientY,
            lon: rotation.lon,
            lat: rotation.lat
          };
        }}
        onPointerMove={(event) => {
          if (!dragState.current) {
            return;
          }

          const deltaX = event.clientX - dragState.current.x;
          const deltaY = event.clientY - dragState.current.y;
          setRotation({
            lon: dragState.current.lon + deltaX * 0.45,
            lat: clamp(dragState.current.lat - deltaY * 0.25, -65, 65)
          });
        }}
        onPointerUp={() => {
          dragState.current = null;
        }}
        onPointerLeave={() => {
          dragState.current = null;
        }}
      >
        <svg viewBox="0 0 340 340" className="h-full w-full">
          <defs>
            <radialGradient id={`globe-fill-${themeMode}`} cx="35%" cy="30%">
              <stop offset="0%" stopColor={themeMode === 'dark' ? '#133a67' : '#dff4ff'} />
              <stop offset="60%" stopColor={themeMode === 'dark' ? '#0b2140' : '#b9dcff'} />
              <stop offset="100%" stopColor={themeMode === 'dark' ? '#081425' : '#8ec5ff'} />
            </radialGradient>
            <linearGradient id={`globe-stroke-${themeMode}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeMode === 'dark' ? '#67e8f9' : '#0ea5e9'} />
              <stop offset="100%" stopColor={themeMode === 'dark' ? '#e879f9' : '#8b5cf6'} />
            </linearGradient>
            <clipPath id="globe-clip">
              <circle cx={GLOBE_CENTER} cy={GLOBE_CENTER} r={GLOBE_RADIUS} />
            </clipPath>
          </defs>

          <circle
            cx={GLOBE_CENTER}
            cy={GLOBE_CENTER}
            r={GLOBE_RADIUS + 18}
            fill={themeMode === 'dark' ? 'rgba(34,211,238,0.08)' : 'rgba(14,165,233,0.12)'}
          />
          <circle
            cx={GLOBE_CENTER}
            cy={GLOBE_CENTER}
            r={GLOBE_RADIUS}
            fill={`url(#globe-fill-${themeMode})`}
            stroke={`url(#globe-stroke-${themeMode})`}
            strokeWidth="1.4"
          />

          <g clipPath="url(#globe-clip)" opacity={themeMode === 'dark' ? 0.8 : 0.55}>
            {[0, 1, 2, 3, 4].map((index) => (
              <ellipse
                key={`lat-${index}`}
                cx={GLOBE_CENTER}
                cy={GLOBE_CENTER}
                rx={GLOBE_RADIUS}
                ry={GLOBE_RADIUS - index * 24}
                fill="none"
                stroke={themeMode === 'dark' ? 'rgba(148,163,184,0.16)' : 'rgba(59,130,246,0.16)'}
                strokeWidth="1"
              />
            ))}
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const angle = (index / 6) * Math.PI;
              const xOffset = Math.cos(angle) * GLOBE_RADIUS;
              const width = Math.max(18, Math.abs(Math.sin(angle)) * GLOBE_RADIUS);

              return (
                <ellipse
                  key={`lon-${index}`}
                  cx={GLOBE_CENTER + xOffset * 0.02}
                  cy={GLOBE_CENTER}
                  rx={width}
                  ry={GLOBE_RADIUS}
                  fill="none"
                  stroke={themeMode === 'dark' ? 'rgba(148,163,184,0.16)' : 'rgba(59,130,246,0.16)'}
                  strokeWidth="1"
                />
              );
            })}

            {projectedPoints.map((point) => {
              if (!point.visible) {
                return null;
              }

              const isActive = point.node.id === hoveredNodeId || point.node.company === focusedCompany;
              const cx = GLOBE_CENTER + point.x;
              const cy = GLOBE_CENTER + point.y;
              const markerColor =
                point.node.tier === 'frontier' ? '#67e8f9' : point.node.tier === 'research' ? '#c084fc' : '#f9a8d4';

              return (
                <g key={point.node.id}>
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 11 * point.scale : 7 * point.scale}
                    fill={themeMode === 'dark' ? 'rgba(34,211,238,0.14)' : 'rgba(14,165,233,0.16)'}
                    animate={{ scale: isActive ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 2.3, repeat: Infinity }}
                  />
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={Math.max(2.6, (isActive ? 4.6 : 3.4) * point.scale)}
                    fill={markerColor}
                    stroke={themeMode === 'dark' ? '#081425' : '#ffffff'}
                    strokeWidth="1.4"
                    className="cursor-pointer"
                    onMouseEnter={() => onHoverNode(point.node.id)}
                    onFocus={() => onHoverNode(point.node.id)}
                    onClick={() => onSelectNode(point.node)}
                    whileHover={{ scale: 1.2 }}
                  />
                </g>
              );
            })}
          </g>

          <ellipse
            cx={GLOBE_CENTER}
            cy={GLOBE_CENTER + GLOBE_RADIUS + 18}
            rx={GLOBE_RADIUS - 24}
            ry="18"
            fill={themeMode === 'dark' ? 'rgba(8,20,37,0.65)' : 'rgba(148,163,184,0.18)'}
          />
        </svg>
      </div>

      <div className="mt-4 grid gap-3">
        {projectedPoints
          .filter((point) => point.visible)
          .sort((left, right) => right.scale - left.scale)
          .slice(0, 3)
          .map((point) => (
            <button
              key={point.node.id}
              type="button"
              onMouseEnter={() => onHoverNode(point.node.id)}
              onClick={() => onSelectNode(point.node)}
              className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left transition ${themeMode === 'dark' ? 'border-white/10 bg-white/6 hover:bg-white/10' : 'border-slate-200 bg-white/85 hover:bg-white'}`}
            >
              <div>
                <p className="text-sm font-medium">{point.node.company}</p>
                <p className={`text-xs ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{point.node.country}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] ${themeMode === 'dark' ? 'bg-cyan-300/10 text-cyan-200' : 'bg-sky-100 text-sky-700'}`}>
                z {point.scale.toFixed(2)}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}

function projectPoint(node: CompanyNode, rotationLon: number, rotationLat: number): GlobePoint {
  const lat = node.lat * DEG_TO_RAD;
  const lon = node.lon * DEG_TO_RAD;
  const lon0 = rotationLon * DEG_TO_RAD;
  const lat0 = rotationLat * DEG_TO_RAD;
  const deltaLon = lon - lon0;

  const cosC = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(deltaLon);
  const x = GLOBE_RADIUS * Math.cos(lat) * Math.sin(deltaLon);
  const y =
    GLOBE_RADIUS *
    (Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(deltaLon));

  return {
    node,
    x,
    y,
    visible: cosC > 0,
    scale: 0.72 + cosC * 0.45
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

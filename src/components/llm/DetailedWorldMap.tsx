import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Map, Orbit, Radar } from 'lucide-react';
import { type CompanyNode } from '../../data/llmLandscape';

interface DetailedWorldMapProps {
  companyNodes: CompanyNode[];
  hoveredNodeId: string | null;
  focusedCompany: string;
  themeMode: 'dark' | 'light';
  onHoverNode: (id: string) => void;
  onSelectNode: (node: CompanyNode) => void;
}

type MapMode = 'network' | 'regional' | 'company';

const mapRegions = [
  'M54 166C72 130 109 101 156 92C205 84 248 93 273 119C289 135 292 157 280 174C264 197 228 202 197 206C163 211 147 224 146 244C145 260 127 272 101 271C74 270 47 255 35 231C25 211 31 190 54 166Z',
  'M221 249C231 243 246 244 255 253C265 263 266 280 258 291C248 304 231 306 220 297C209 287 209 260 221 249Z',
  'M294 88C321 67 365 58 412 61C459 63 508 75 544 92C572 106 586 126 582 145C577 168 551 179 520 181C485 183 459 191 441 208C418 229 382 239 348 232C314 225 289 202 282 170C276 143 276 103 294 88Z',
  'M385 226C410 212 448 214 479 225C513 238 537 257 540 282C543 304 525 322 493 333C460 345 415 345 384 331C354 317 338 293 342 269C347 251 362 238 385 226Z',
  'M560 99C592 83 638 79 688 85C744 91 802 110 851 143C890 169 909 198 901 225C894 252 859 268 819 266C782 264 747 251 717 238C690 225 667 214 642 212C610 209 581 197 561 177C543 159 540 123 560 99Z',
  'M674 273C699 258 735 258 765 267C794 277 815 295 814 316C813 339 791 355 760 363C729 370 688 366 660 350C635 336 624 314 632 296C639 286 653 280 674 273Z',
  'M860 285C875 279 892 282 902 293C913 305 913 323 903 335C891 348 872 350 858 341C846 333 842 313 847 299C850 292 854 288 860 285Z'
];

const regionLabels = [
  { id: 'north-america', label: 'North America', x: 142, y: 86 },
  { id: 'south-america', label: 'South America', x: 210, y: 292 },
  { id: 'europe', label: 'Europe', x: 390, y: 84 },
  { id: 'africa', label: 'Africa', x: 444, y: 286 },
  { id: 'asia', label: 'Asia', x: 688, y: 100 },
  { id: 'oceania', label: 'Oceania', x: 835, y: 336 }
];

const tierLegend = [
  { tier: 'frontier', label: 'Frontier labs', color: '#67e8f9' },
  { tier: 'research', label: 'Research labs', color: '#c084fc' },
  { tier: 'enterprise', label: 'Enterprise AI', color: '#f9a8d4' }
] as const;

const mapModes: Array<{ id: MapMode; label: string; icon: React.ReactNode }> = [
  { id: 'network', label: 'Network', icon: <Orbit size={14} /> },
  { id: 'regional', label: 'Regional', icon: <Radar size={14} /> },
  { id: 'company', label: 'Company Focus', icon: <Bot size={14} /> }
];

export default function DetailedWorldMap({
  companyNodes,
  hoveredNodeId,
  focusedCompany,
  themeMode,
  onHoverNode,
  onSelectNode
}: DetailedWorldMapProps) {
  const [mapMode, setMapMode] = useState<MapMode>('network');
  const activeNode = companyNodes.find((node) => node.id === hoveredNodeId) ?? companyNodes.find((node) => node.company === focusedCompany) ?? companyNodes[0];
  const regionalPeers = useMemo(
    () => companyNodes.filter((node) => node.region === activeNode.region),
    [activeNode.region, companyNodes]
  );
  const activeRoutes = useMemo(() => {
    if (mapMode === 'regional') {
      return companyNodes
        .filter((node) => node.id !== activeNode.id && node.region === activeNode.region)
        .slice(0, 4);
    }

    if (mapMode === 'company') {
      return companyNodes
        .filter((node) => node.id !== activeNode.id)
        .slice(0, 2);
    }

    return companyNodes
      .filter((node) => node.id !== activeNode.id && node.region !== activeNode.region)
      .slice(0, 3);
  }, [activeNode.id, activeNode.region, companyNodes, mapMode]);
  const strongestConnectedRegion = useMemo(() => {
    const counts = activeRoutes.reduce<Record<string, number>>((accumulator, node) => {
      accumulator[node.region] = (accumulator[node.region] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Mixed';
  }, [activeRoutes]);
  const modeBadges = useMemo(() => {
    if (mapMode === 'regional') {
      return [
        { label: 'Region', value: activeNode.region },
        { label: 'Labs', value: `${regionalPeers.length}` },
        { label: 'Model hubs', value: `${regionalPeers.reduce((sum, node) => sum + node.models.length, 0)}` }
      ];
    }

    if (mapMode === 'company') {
      return [
        { label: 'Company', value: activeNode.company },
        { label: 'Models', value: `${activeNode.models.length}` },
        { label: 'Updated', value: activeNode.updatedAt }
      ];
    }

    return [
      { label: 'Hub', value: activeNode.company },
      { label: 'Cross-links', value: `${activeRoutes.length}` },
      { label: 'Top region', value: strongestConnectedRegion }
    ];
  }, [
    activeNode.company,
    activeNode.models.length,
    activeNode.region,
    activeNode.updatedAt,
    activeRoutes.length,
    mapMode,
    regionalPeers,
    strongestConnectedRegion
  ]);

  return (
    <div className={`relative overflow-hidden rounded-[24px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/70'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Flat map</p>
          <h3 className="mt-1 text-lg font-semibold">Global LLM network</h3>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${themeMode === 'dark' ? 'bg-cyan-300/10 text-cyan-200' : 'bg-sky-100 text-sky-700'}`}>
          <Map size={14} />
          click any hub
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {mapModes.map((mode) => {
          const isActive = mapMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setMapMode(mode.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? themeMode === 'dark'
                    ? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-200'
                    : 'border-sky-300 bg-sky-50 text-sky-700'
                  : themeMode === 'dark'
                    ? 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
                    : 'border-slate-200 bg-white/90 text-slate-600 hover:bg-white'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-[22px] border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(8,20,37,0.58),rgba(8,20,37,0.18))] p-2">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeNode.id}-${mapMode}`}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-none absolute right-3 top-3 z-10 w-[220px] rounded-[20px] border px-4 py-3 backdrop-blur-xl ${themeMode === 'dark' ? 'border-white/10 bg-slate-950/70 text-slate-100' : 'border-white/80 bg-white/90 text-slate-900'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{activeNode.company}</p>
                  <p className={`mt-1 text-xs ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activeNode.country} · {activeNode.region}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                    activeNode.tier === 'frontier'
                      ? 'bg-cyan-300/12 text-cyan-200'
                      : activeNode.tier === 'research'
                        ? 'bg-violet-300/12 text-violet-200'
                        : 'bg-pink-300/12 text-pink-200'
                  }`}
                >
                  {activeNode.tier}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className={`rounded-2xl px-3 py-2 ${themeMode === 'dark' ? 'bg-white/6' : 'bg-slate-100'}`}>
                  <p className={`text-[10px] uppercase tracking-[0.16em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Models</p>
                  <p className="mt-1 text-sm font-semibold">{activeNode.models.length}</p>
                </div>
                <div className={`rounded-2xl px-3 py-2 ${themeMode === 'dark' ? 'bg-white/6' : 'bg-slate-100'}`}>
                  <p className={`text-[10px] uppercase tracking-[0.16em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Updated</p>
                  <p className="mt-1 text-sm font-semibold">{activeNode.updatedAt}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <svg viewBox="0 0 940 420" className="h-full w-full">
          <defs>
            <linearGradient id={`map-surface-${themeMode}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeMode === 'dark' ? '#173156' : '#deedff'} />
              <stop offset="100%" stopColor={themeMode === 'dark' ? '#0b1930' : '#c8ddff'} />
            </linearGradient>
            <linearGradient id={`route-line-${themeMode}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={themeMode === 'dark' ? '#67e8f9' : '#0ea5e9'} />
              <stop offset="100%" stopColor={themeMode === 'dark' ? '#e879f9' : '#8b5cf6'} />
            </linearGradient>
            <radialGradient id={`map-glow-${themeMode}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={themeMode === 'dark' ? 'rgba(103,232,249,0.18)' : 'rgba(14,165,233,0.18)'} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="940" height="420" rx="24" fill="transparent" />

          {Array.from({ length: 12 }).map((_, index) => (
            <line
              key={`grid-v-${index}`}
              x1={index * 78}
              y1="0"
              x2={index * 78}
              y2="420"
              stroke={themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(14,165,233,0.08)'}
            />
          ))}
          {Array.from({ length: 7 }).map((_, index) => (
            <line
              key={`grid-h-${index}`}
              x1="0"
              y1={index * 60}
              x2="940"
              y2={index * 60}
              stroke={themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(14,165,233,0.08)'}
            />
          ))}

          {mapRegions.map((path, index) => (
            <path
              key={path}
              d={path}
              fill={`url(#map-surface-${themeMode})`}
              stroke={themeMode === 'dark' ? 'rgba(103,232,249,0.16)' : 'rgba(14,165,233,0.20)'}
              strokeWidth="1.5"
              opacity={0.92 - index * 0.04}
            />
          ))}

          {regionLabels.map((region) => (
            <g key={region.id}>
              <text
                x={region.x}
                y={region.y}
                fill={
                  mapMode === 'regional' && region.label === activeNode.region
                    ? themeMode === 'dark'
                      ? 'rgba(103,232,249,0.92)'
                      : 'rgba(2,132,199,0.92)'
                    : themeMode === 'dark'
                      ? 'rgba(226,232,240,0.56)'
                      : 'rgba(71,85,105,0.7)'
                }
                fontSize="12"
                fontWeight="600"
                letterSpacing="0.18em"
                textAnchor="middle"
              >
                {region.label.toUpperCase()}
              </text>
            </g>
          ))}

          {activeRoutes.map((target, index) => (
            <g key={`${activeNode.id}-${target.id}`}>
              <motion.path
                d={routePath(activeNode, target)}
                fill="none"
                stroke={themeMode === 'dark' ? 'rgba(103,232,249,0.12)' : 'rgba(14,165,233,0.14)'}
                strokeWidth={mapMode === 'regional' ? 5 : 4}
                strokeLinecap="round"
                initial={{ opacity: 0.15 }}
                animate={{ opacity: [0.08, 0.2, 0.08] }}
                transition={{ duration: 2.4 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.path
                d={routePath(activeNode, target)}
                fill="none"
                stroke={`url(#route-line-${themeMode})`}
                strokeOpacity={mapMode === 'company' ? 0.38 - index * 0.08 : 0.58 - index * 0.1}
                strokeWidth={mapMode === 'regional' ? 2.2 - index * 0.18 : 2 - index * 0.2}
                strokeDasharray="5 7"
                initial={{ pathLength: 0.2, opacity: 0.2 }}
                animate={{ pathLength: [0.25, 1, 0.25], opacity: [0.18, 0.5, 0.18] }}
                transition={{ duration: 6.6 + index * 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle r="4.5" fill={themeMode === 'dark' ? '#67e8f9' : '#0ea5e9'} opacity="0.9">
                <animateMotion
                  dur={`${3.2 + index * 0.4}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  path={routePath(activeNode, target)}
                />
              </circle>
            </g>
          ))}

          {companyNodes.map((node) => {
            const isActive = node.id === activeNode.id || node.company === focusedCompany;
            const isRegionalPeer = node.region === activeNode.region;
            const isDimmed =
              mapMode === 'regional'
                ? !isRegionalPeer
                : mapMode === 'company'
                  ? !isActive
                  : false;
            const cx = node.x * 9.4;
            const cy = node.y * 4.2;
            const color = node.tier === 'frontier' ? '#67e8f9' : node.tier === 'research' ? '#c084fc' : '#f9a8d4';

            return (
              <g key={node.id}>
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 18 : isRegionalPeer && mapMode === 'regional' ? 14 : 12}
                  fill={`url(#map-glow-${themeMode})`}
                  opacity={isDimmed ? 0.24 : 1}
                  animate={{ scale: isActive ? [1, 1.2, 1] : isRegionalPeer && mapMode === 'regional' ? [1, 1.12, 1] : [1, 1.08, 1] }}
                  transition={{ duration: isActive ? 2.2 : 3.1, repeat: Infinity }}
                />
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 5.5 : isRegionalPeer && mapMode === 'regional' ? 4.6 : 4}
                  fill={color}
                  stroke={themeMode === 'dark' ? '#081426' : '#ffffff'}
                  strokeWidth="2"
                  opacity={isDimmed ? 0.3 : 1}
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverNode(node.id)}
                  onFocus={() => onHoverNode(node.id)}
                  onClick={() => onSelectNode(node)}
                  whileHover={{ scale: 1.18 }}
                />
                {isActive && (
                  <>
                    <line
                      x1={cx + 8}
                      y1={cy - 8}
                      x2={cx + 38}
                      y2={cy - 28}
                      stroke={themeMode === 'dark' ? 'rgba(103,232,249,0.5)' : 'rgba(14,165,233,0.45)'}
                      strokeWidth="1.5"
                    />
                    <rect
                      x={cx + 38}
                      y={cy - 44}
                      rx="10"
                      width="118"
                      height="36"
                      fill={themeMode === 'dark' ? 'rgba(8,20,37,0.88)' : 'rgba(255,255,255,0.92)'}
                      stroke={themeMode === 'dark' ? 'rgba(103,232,249,0.22)' : 'rgba(14,165,233,0.22)'}
                    />
                    <text
                      x={cx + 48}
                      y={cy - 24}
                      fill={themeMode === 'dark' ? '#e2e8f0' : '#0f172a'}
                      fontSize="12"
                      fontWeight="700"
                    >
                      {node.company}
                    </text>
                    <text
                      x={cx + 48}
                      y={cy - 12}
                      fill={themeMode === 'dark' ? '#94a3b8' : '#475569'}
                      fontSize="10"
                    >
                      {node.country}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          </svg>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tierLegend.map((item) => (
          <div
            key={item.tier}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${themeMode === 'dark' ? 'border-white/10 bg-white/6 text-slate-200' : 'border-slate-200 bg-white/90 text-slate-700'}`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
        <div className={`relative overflow-hidden rounded-full border px-3 py-1.5 text-xs ${themeMode === 'dark' ? 'border-cyan-300/14 bg-cyan-300/8 text-cyan-200' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mapMode}-${activeNode.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="inline-flex items-center gap-2"
            >
              {mapMode === 'network' && 'Cross-region routes track the selected hub'}
              {mapMode === 'regional' && `Regional routes emphasize ${activeNode.region}`}
              {mapMode === 'company' && `Company focus isolates ${activeNode.company}`}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {modeBadges.map((badge, index) => (
            <motion.div
              key={`${mapMode}-${activeNode.id}-${badge.label}`}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.24, delay: index * 0.03 }}
              className={`rounded-2xl border px-3 py-3 ${themeMode === 'dark' ? 'border-white/10 bg-white/6' : 'border-slate-200 bg-white/88'}`}
            >
              <p className={`text-[11px] uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {badge.label}
              </p>
              <motion.p
                key={badge.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`mt-2 text-sm font-semibold ${themeMode === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
              >
                {badge.value}
              </motion.p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {companyNodes.map((node) => {
          const isActive = node.id === activeNode.id;
          return (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => onHoverNode(node.id)}
              onClick={() => onSelectNode(node)}
              className={`rounded-2xl border px-3 py-2 text-left transition ${isActive ? themeMode === 'dark' ? 'border-cyan-300/25 bg-cyan-300/10' : 'border-sky-300 bg-sky-50' : themeMode === 'dark' ? 'border-white/10 bg-white/6 hover:bg-white/10' : 'border-slate-200 bg-white/85 hover:bg-white'}`}
            >
              <p className="text-sm font-medium">{node.company}</p>
              <p className={`mt-1 text-xs ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{node.country} · {node.region}</p>
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.p
                    key={`${mapMode}-${node.id}-${activeRoutes.length}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`mt-2 text-[11px] ${themeMode === 'dark' ? 'text-cyan-200' : 'text-sky-700'}`}
                  >
                    {mapMode === 'network' && `Highlighting ${activeRoutes.length} global connections`}
                    {mapMode === 'regional' && `Highlighting ${activeRoutes.length} regional peers`}
                    {mapMode === 'company' && `Highlighting ${activeRoutes.length} company focus links`}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function routePath(from: CompanyNode, to: CompanyNode) {
  const startX = from.x * 9.4;
  const startY = from.y * 4.2;
  const endX = to.x * 9.4;
  const endY = to.y * 4.2;
  const curveX = (startX + endX) / 2;
  const curveY = Math.min(startY, endY) - 40;
  return `M${startX} ${startY} Q${curveX} ${curveY} ${endX} ${endY}`;
}

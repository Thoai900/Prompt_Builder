import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowUpRight,
  ArrowUp,
  Binary,
  Bot,
  CheckCircle2,
  CircleDot,
  Cpu,
  ExternalLink,
  Filter,
  Globe,
  Layers3,
  MapPinned,
  MoonStar,
  Search,
  Sparkles,
  SunMedium,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { companyNodes, feedItems, llmModels, regionPulse, type CompanyNode, type FeedItem, type LlmModel, type RegionPulse } from '../data/llmLandscape';
import DetailedWorldMap from './llm/DetailedWorldMap';

type ThemeMode = 'dark' | 'light';

const statusStyles = {
  new: 'text-cyan-300 bg-cyan-400/15 border-cyan-300/25',
  hot: 'text-fuchsia-300 bg-fuchsia-400/15 border-fuchsia-300/25',
  stable: 'text-emerald-300 bg-emerald-400/15 border-emerald-300/25'
} as const;

const accessStyles = {
  'open-source': 'text-emerald-300 bg-emerald-400/15 border-emerald-300/25',
  closed: 'text-orange-300 bg-orange-400/15 border-orange-300/25'
} as const;

const feedTypeStyles = {
  release: 'bg-cyan-400/15 text-cyan-200',
  research: 'bg-violet-400/15 text-violet-200',
  infra: 'bg-amber-400/15 text-amber-200',
  benchmark: 'bg-emerald-400/15 text-emerald-200'
} as const;

export default function AIFutureTab() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [countryFilter, setCountryFilter] = useState('All countries');
  const [companyFilter, setCompanyFilter] = useState('All companies');
  const [accessFilter, setAccessFilter] = useState<'all' | 'open-source' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(llmModels[0].id);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(companyNodes[0]?.id ?? null);
  const [activeFeedIndex, setActiveFeedIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveFeedIndex((current) => (current + 1) % feedItems.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  const countries = useMemo(
    () => ['All countries', ...Array.from(new Set(llmModels.map((model) => model.country)))],
    []
  );

  const companies = useMemo(
    () => ['All companies', ...Array.from(new Set(llmModels.map((model) => model.company)))],
    []
  );

  const filteredModels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return llmModels.filter((model) => {
      const matchesCountry = countryFilter === 'All countries' || model.country === countryFilter;
      const matchesCompany = companyFilter === 'All companies' || model.company === companyFilter;
      const matchesAccess = accessFilter === 'all' || model.access === accessFilter;
      const matchesQuery =
        query.length === 0 ||
        `${model.name} ${model.company} ${model.country} ${model.specialty.join(' ')}`.toLowerCase().includes(query);

      return matchesCountry && matchesCompany && matchesAccess && matchesQuery;
    });
  }, [accessFilter, companyFilter, countryFilter, searchQuery]);

  useEffect(() => {
    if (selectedModelId && !filteredModels.some((model) => model.id === selectedModelId)) {
      setSelectedModelId(filteredModels[0]?.id ?? llmModels[0]?.id ?? null);
    }
  }, [filteredModels, selectedModelId]);

  const selectedModel = selectedModelId ? llmModels.find((model) => model.id === selectedModelId) ?? null : null;
  const focusedModel = selectedModel ?? filteredModels[0] ?? llmModels[0];
  const highlightedNode = companyNodes.find((node) => node.company === focusedModel.company);
  const hoveredNode = companyNodes.find((node) => node.id === hoveredNodeId) ?? highlightedNode ?? companyNodes[0];
  const activeFeed = feedItems[activeFeedIndex];
  const strongestRegion = [...regionPulse].sort((left, right) => right.avgScore - left.avgScore)[0];
  const openModelCount = llmModels.filter((model) => model.access === 'open-source').length;
  const closedModelCount = llmModels.length - openModelCount;

  const dashboardTone =
    themeMode === 'dark'
      ? {
          shell: 'bg-[#07111f] text-slate-100',
          panel: 'bg-white/8 border-white/10 shadow-[0_25px_80px_rgba(3,8,20,0.45)]',
          muted: 'text-slate-300/80',
          card: 'bg-white/6',
          input: 'bg-white/8 border-white/10 text-slate-100 placeholder:text-slate-400',
          mapFill: 'fill-[#13243e]',
          mapStroke: 'stroke-cyan-300/10'
        }
      : {
          shell: 'bg-[#edf4ff] text-slate-900',
          panel: 'bg-white/72 border-white/70 shadow-[0_20px_60px_rgba(92,122,173,0.18)]',
          muted: 'text-slate-600',
          card: 'bg-white/70',
          input: 'bg-white/85 border-slate-200 text-slate-900 placeholder:text-slate-500',
          mapFill: 'fill-[#d8e6ff]',
          mapStroke: 'stroke-sky-500/20'
        };

  return (
    <div className={`relative h-full overflow-y-auto custom-scrollbar ${dashboardTone.shell}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -left-24 top-12 h-72 w-72 rounded-full blur-3xl ${themeMode === 'dark' ? 'bg-cyan-500/14' : 'bg-cyan-300/40'}`} />
        <div className={`absolute right-0 top-0 h-80 w-80 rounded-full blur-3xl ${themeMode === 'dark' ? 'bg-fuchsia-500/10' : 'bg-violet-300/35'}`} />
        <div className={`absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl ${themeMode === 'dark' ? 'bg-indigo-500/12' : 'bg-blue-300/30'}`} />
        <div className={`absolute inset-0 ${themeMode === 'dark' ? 'bg-[radial-gradient(circle_at_top,rgba(110,231,255,0.08),transparent_28%),linear-gradient(180deg,rgba(4,11,22,0.96),rgba(4,11,22,1))]' : 'bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,rgba(237,244,255,0.96),rgba(237,244,255,1))]'}`} />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden rounded-[28px] border p-5 backdrop-blur-2xl md:p-7 ${dashboardTone.panel}`}
        >
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  <Sparkles size={14} />
                  Global LLM Radar
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${themeMode === 'dark' ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-emerald-400/30 bg-emerald-200/70 text-emerald-800'}`}>
                  <Activity size={13} />
                  Live snapshot
                </div>
              </div>

              <div className="max-w-4xl">
                <h1 className="font-['Space_Grotesk','Segoe_UI',sans-serif] text-4xl font-semibold leading-tight md:text-6xl">
                  Global control plane for frontier
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
                    language models
                  </span>
                </h1>
                <p className={`mt-4 max-w-2xl text-sm leading-7 md:text-base ${dashboardTone.muted}`}>
                  Track model momentum, company distribution, benchmark posture, and release movement in one high-signal intelligence layer for developers, researchers, and AI teams.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <KpiCard
                  themeMode={themeMode}
                  icon={<Globe size={18} />}
                  label="Tracked regions"
                  value={`${regionPulse.length} hubs`}
                  delta={`${strongestRegion.region} leads on composite score`}
                />
                <KpiCard
                  themeMode={themeMode}
                  icon={<Bot size={18} />}
                  label="Frontier models"
                  value={`${llmModels.length}`}
                  delta={`${closedModelCount} closed · ${openModelCount} open`}
                />
                <KpiCard
                  themeMode={themeMode}
                  icon={<Zap size={18} />}
                  label="Fastest momentum"
                  value={focusedModel.name}
                  delta={`Velocity ${focusedModel.releaseVelocity}/10`}
                />
              </div>
            </div>

            <div className={`rounded-[24px] border p-4 backdrop-blur-xl ${dashboardTone.card} ${themeMode === 'dark' ? 'border-white/10' : 'border-slate-200/80'}`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-[0.24em] ${dashboardTone.muted}`}>Realtime feed</p>
                  <h2 className="mt-1 text-lg font-semibold">Pulse stream</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${themeMode === 'dark' ? 'border-white/10 bg-white/8 text-slate-50 hover:bg-white/12' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  aria-label="Toggle theme"
                >
                  {themeMode === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(8,19,40,0.72),rgba(14,28,62,0.3))] p-4 text-slate-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeed.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-4"
                  >
                    <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${feedTypeStyles[activeFeed.type]}`}>
                      {activeFeed.type}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold leading-snug">{activeFeed.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{activeFeed.summary}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{activeFeed.source}</span>
                      <span>{activeFeed.timestamp}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-5 flex gap-2">
                  {feedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveFeedIndex(feedItems.findIndex((feed) => feed.id === item.id))}
                      className={`h-1.5 flex-1 rounded-full transition-all ${item.id === activeFeed.id ? 'bg-cyan-300' : 'bg-white/15 hover:bg-white/25'}`}
                      aria-label={`View ${item.title}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {feedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border px-4 py-3 ${themeMode === 'dark' ? 'border-white/8 bg-white/[0.03]' : 'border-slate-200 bg-white/80'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className={`mt-1 text-xs ${dashboardTone.muted}`}>{item.summary}</p>
                      </div>
                      <span className={`shrink-0 text-[11px] ${dashboardTone.muted}`}>{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={`rounded-[28px] border p-4 backdrop-blur-2xl md:p-5 ${dashboardTone.panel}`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${dashboardTone.muted}`}>World map</p>
                <h2 className="mt-1 text-xl font-semibold">Developer and lab geography</h2>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${themeMode === 'dark' ? 'border-white/10 bg-white/6 text-slate-200' : 'border-slate-200 bg-white/85 text-slate-700'}`}>
                <MapPinned size={14} />
                Zoom-style motion simulated
              </div>
            </div>

            <div className={`relative overflow-hidden rounded-[24px] border ${themeMode === 'dark' ? 'border-white/10 bg-[#061224]' : 'border-slate-200 bg-[linear-gradient(180deg,#f7fbff,#e3efff)]'} p-3 md:p-4`}>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(217,70,239,0.14),transparent_24%),linear-gradient(180deg,transparent,rgba(10,18,34,0.14))]" />
              <div className={`pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_48%,rgba(255,255,255,0.04)_50%,transparent_52%,transparent_100%),linear-gradient(to_bottom,transparent_0%,transparent_48%,rgba(255,255,255,0.04)_50%,transparent_52%,transparent_100%)] bg-[size:80px_80px] ${themeMode === 'dark' ? 'opacity-70' : 'opacity-30'}`} />

              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-4">
                  <DetailedWorldMap
                    companyNodes={companyNodes}
                    hoveredNodeId={hoveredNode.id}
                    focusedCompany={focusedModel.company}
                    themeMode={themeMode}
                    onHoverNode={setHoveredNodeId}
                    onSelectNode={(node) => {
                      setHoveredNodeId(node.id);
                      const nextModel = llmModels.find((model) => model.company === node.company);
                      if (nextModel) {
                        setSelectedModelId(nextModel.id);
                      }
                    }}
                  />

                  <div className={`grid w-full gap-3 rounded-[22px] border p-3 backdrop-blur-xl md:grid-cols-[1fr_auto] ${themeMode === 'dark' ? 'border-white/10 bg-slate-950/45' : 'border-white/80 bg-white/75'}`}>
                    <div>
                      <p className={`text-[11px] uppercase tracking-[0.24em] ${dashboardTone.muted}`}>Hovered hub</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="text-lg font-semibold">{hoveredNode.company}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] ${themeMode === 'dark' ? 'bg-cyan-300/12 text-cyan-200' : 'bg-sky-100 text-sky-700'}`}>{hoveredNode.country}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] ${themeMode === 'dark' ? 'bg-white/8 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Updated {hoveredNode.updatedAt}</span>
                      </div>
                      <p className={`mt-2 text-sm ${dashboardTone.muted}`}>Models: {hoveredNode.models.join(', ')}</p>
                    </div>
                    <div className={`flex items-center rounded-2xl border px-3 py-2 text-sm ${themeMode === 'dark' ? 'border-white/10 bg-white/6 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <CircleDot size={14} className="mr-2 text-cyan-300" />
                      {companyNodes.length} tracked companies
                    </div>
                  </div>
                </div>

                <OrbitalRegionPulse themeMode={themeMode} regions={regionPulse} />
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className={`rounded-[28px] border p-4 backdrop-blur-2xl md:p-5 ${dashboardTone.panel}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${dashboardTone.muted}`}>Filters and insights</p>
                <h2 className="mt-1 text-xl font-semibold">Model dashboard</h2>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${themeMode === 'dark' ? 'border-white/10 bg-white/6 text-slate-200' : 'border-slate-200 bg-white/85 text-slate-700'}`}>
                <Filter size={14} />
                {filteredModels.length} visible
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="relative">
                <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search models, companies, specialties"
                  className={`w-full rounded-2xl border px-11 py-3 text-sm outline-none transition focus:border-cyan-300/50 ${dashboardTone.input}`}
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <SelectField value={countryFilter} onChange={setCountryFilter} options={countries} label="Country" themeMode={themeMode} />
                <SelectField value={companyFilter} onChange={setCompanyFilter} options={companies} label="Company" themeMode={themeMode} />
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'open-source', 'closed'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAccessFilter(value)}
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      accessFilter === value
                        ? themeMode === 'dark'
                          ? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-200'
                          : 'border-cyan-400/40 bg-cyan-100 text-cyan-700'
                        : themeMode === 'dark'
                          ? 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
                          : 'border-slate-200 bg-white/85 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {value === 'all' ? 'All access types' : value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModelId(model.id)}
                  className={`rounded-[22px] border p-4 text-left transition ${
                    selectedModel?.id === model.id
                      ? themeMode === 'dark'
                        ? 'border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]'
                        : 'border-cyan-400/35 bg-cyan-50'
                      : themeMode === 'dark'
                        ? 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
                        : 'border-slate-200 bg-white/75 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold">{model.name}</span>
                        <TagPill className={statusStyles[model.status]}>{model.status}</TagPill>
                        <TagPill className={accessStyles[model.access]}>{model.access}</TagPill>
                      </div>
                      <p className={`mt-1 text-sm ${dashboardTone.muted}`}>{model.company} · {model.country}</p>
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-right ${themeMode === 'dark' ? 'bg-white/6' : 'bg-slate-100'}`}>
                      <div className="text-base font-semibold">{model.benchmarkScore}</div>
                      <div className={`text-[11px] ${dashboardTone.muted}`}>score</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <MetaChip icon={<Cpu size={12} />} text={model.benchmark} themeMode={themeMode} />
                    <MetaChip icon={<Layers3 size={12} />} text={model.contextWindow} themeMode={themeMode} />
                    <MetaChip icon={<Binary size={12} />} text={model.latency} themeMode={themeMode} />
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className={`rounded-[28px] border p-4 backdrop-blur-2xl md:p-5 ${dashboardTone.panel}`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${dashboardTone.muted}`}>Signal analytics</p>
                <h2 className="mt-1 text-xl font-semibold">Benchmark momentum grid</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredModels.map((model) => (
                <TrendCard key={model.id} model={model} themeMode={themeMode} onSelect={() => setSelectedModelId(model.id)} />
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className={`rounded-[28px] border p-4 backdrop-blur-2xl md:p-5 ${dashboardTone.panel}`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${dashboardTone.muted}`}>News timeline</p>
                <h2 className="mt-1 text-xl font-semibold">Realtime ecosystem feed</h2>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {feedItems.map((item) => (
                <FeedCard key={item.id} item={item} themeMode={themeMode} />
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-[28px] border p-4 backdrop-blur-2xl md:p-5 ${dashboardTone.panel}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${dashboardTone.muted}`}>API ideas</p>
                <h2 className="mt-1 text-xl font-semibold">Production integration</h2>
              </div>
              <ArrowUpRight size={18} className={themeMode === 'dark' ? 'text-cyan-300' : 'text-sky-600'} />
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6">
              <ApiHint title="Official model feeds" themeMode={themeMode}>
                Pull model metadata from OpenAI, Anthropic, Google AI, and Mistral docs or status endpoints, then normalize into one typed backend schema.
              </ApiHint>
              <ApiHint title="Hugging Face signals" themeMode={themeMode}>
                Enrich open-source cards with trending models, download counts, and recent space activity to detect momentum shifts.
              </ApiHint>
              <ApiHint title="Benchmarks pipeline" themeMode={themeMode}>
                Run nightly jobs to ingest benchmark snapshots and store historical score movement for sparklines and change deltas.
              </ApiHint>
              <ApiHint title="Realtime architecture" themeMode={themeMode}>
                Use a server-side aggregator plus Firestore or Supabase realtime channels so the feed updates without exposing upstream tokens in the client.
              </ApiHint>
            </div>
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
        {selectedModel && (
          <DetailPanel
            key={selectedModel.id}
            model={selectedModel}
            node={highlightedNode}
            onClose={() => setSelectedModelId(null)}
            themeMode={themeMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  delta,
  themeMode
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  themeMode: ThemeMode;
}) {
  return (
    <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
      <div className="flex items-center justify-between">
        <div className={`rounded-2xl p-2 ${themeMode === 'dark' ? 'bg-white/8 text-cyan-200' : 'bg-sky-100 text-sky-700'}`}>{icon}</div>
        <CheckCircle2 size={16} className={themeMode === 'dark' ? 'text-emerald-300' : 'text-emerald-600'} />
      </div>
      <p className={`mt-4 text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className={`mt-2 text-sm ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{delta}</p>
    </div>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
  themeMode
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  themeMode: ThemeMode;
}) {
  return (
    <label className="space-y-2">
      <span className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${themeMode === 'dark' ? 'border-white/10 bg-white/8 text-slate-100' : 'border-slate-200 bg-white/85 text-slate-900'}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TagPill({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`}>{children}</span>;
}

function MetaChip({ icon, text, themeMode }: { icon: React.ReactNode; text: string; themeMode: ThemeMode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 ${themeMode === 'dark' ? 'bg-white/7 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
      {icon}
      {text}
    </span>
  );
}

function FeedCard({ item, themeMode }: { item: FeedItem; themeMode: ThemeMode }) {
  return (
    <div className={`rounded-[24px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/78'}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${feedTypeStyles[item.type]}`}>{item.type}</span>
        <span className={`text-xs ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.timestamp}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug">{item.title}</h3>
      <p className={`mt-2 text-sm leading-6 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.summary}</p>
      <div className={`mt-4 inline-flex items-center gap-2 text-xs ${themeMode === 'dark' ? 'text-cyan-200' : 'text-sky-700'}`}>
        <Activity size={13} />
        {item.source}
      </div>
    </div>
  );
}

function ApiHint({ title, children, themeMode }: { title: string; children: React.ReactNode; themeMode: ThemeMode }) {
  return (
    <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className={`mt-2 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{children}</p>
    </div>
  );
}

function OrbitalRegionPulse({ regions, themeMode }: { regions: RegionPulse[]; themeMode: ThemeMode }) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/70'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Regional pulse</p>
          <h3 className="mt-1 text-lg font-semibold">Orbit view</h3>
        </div>
        <TrendingUp size={18} className={themeMode === 'dark' ? 'text-cyan-300' : 'text-sky-600'} />
      </div>

      <div className="relative mt-4 aspect-square">
        <div className={`absolute inset-[12%] rounded-full border ${themeMode === 'dark' ? 'border-cyan-300/14' : 'border-sky-300/40'}`} />
        <div className={`absolute inset-[24%] rounded-full border ${themeMode === 'dark' ? 'border-fuchsia-300/14' : 'border-violet-300/35'}`} />
        <div className={`absolute inset-[36%] rounded-full border ${themeMode === 'dark' ? 'border-emerald-300/14' : 'border-emerald-300/35'}`} />
        <div className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border ${themeMode === 'dark' ? 'border-white/10 bg-cyan-300/10' : 'border-white bg-white/85'} flex items-center justify-center`}>
          <Globe size={24} className={themeMode === 'dark' ? 'text-cyan-200' : 'text-sky-700'} />
        </div>

        {regions.map((region, index) => {
          const angle = Math.PI * 2 * region.orbitOffset - Math.PI / 2;
          const radius = 42 + index * 34;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          return (
            <motion.div
              key={region.region}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%` }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18 + index * 4, repeat: Infinity, ease: 'linear' }}
            >
              <div className={`-translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 backdrop-blur-xl ${themeMode === 'dark' ? 'border-white/10 bg-slate-950/75' : 'border-white bg-white/92'}`}>
                <p className="text-xs font-semibold">{region.region}</p>
                <p className={`mt-1 text-[11px] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{region.releases30d} releases / 30d</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {regions.map((region) => (
          <div key={region.region} className={`rounded-2xl p-3 ${themeMode === 'dark' ? 'bg-white/6' : 'bg-slate-100'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{region.region}</span>
              <span className={themeMode === 'dark' ? 'text-cyan-200' : 'text-sky-700'}>{region.avgScore}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-black/10">
              <div
                className={`h-2 rounded-full ${themeMode === 'dark' ? 'bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400' : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-violet-400'}`}
                style={{ width: `${region.avgScore}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendCard({ model, themeMode, onSelect }: { model: LlmModel; themeMode: ThemeMode; onSelect: () => void }) {
  const trendDelta = model.benchmarkHistory[model.benchmarkHistory.length - 1] - model.benchmarkHistory[0];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-[24px] border p-4 text-left transition ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]' : 'border-white/80 bg-white/82 hover:bg-white'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{model.name}</p>
          <p className={`mt-1 text-sm ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{model.company}</p>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${themeMode === 'dark' ? 'bg-emerald-400/12 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}>
          <ArrowUp size={12} />
          +{trendDelta}
        </div>
      </div>

      <div className="mt-4 h-20">
        <Sparkline values={model.benchmarkHistory} themeMode={themeMode} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <MetricBadge label="Score" value={`${model.benchmarkScore}`} themeMode={themeMode} />
        <MetricBadge label="Adoption" value={`${model.adoptionIndex}`} themeMode={themeMode} />
        <MetricBadge label="Velocity" value={`${model.releaseVelocity}/10`} themeMode={themeMode} />
      </div>
    </button>
  );
}

function Sparkline({ values, themeMode }: { values: number[]; themeMode: ThemeMode }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={`spark-${themeMode}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={themeMode === 'dark' ? '#67e8f9' : '#0ea5e9'} />
          <stop offset="100%" stopColor={themeMode === 'dark' ? '#e879f9' : '#8b5cf6'} />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={`url(#spark-${themeMode})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function MetricBadge({ label, value, themeMode }: { label: string; value: string; themeMode: ThemeMode }) {
  return (
    <div className={`rounded-2xl p-3 ${themeMode === 'dark' ? 'bg-white/6' : 'bg-slate-100'}`}>
      <p className={`text-[11px] uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}

function DetailPanel({
  model,
  node,
  onClose,
  themeMode
}: {
  model: LlmModel;
  node?: CompanyNode;
  onClose: () => void;
  themeMode: ThemeMode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[70] flex justify-end bg-slate-950/35 backdrop-blur-sm"
    >
      <motion.div
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className={`pointer-events-auto h-full w-full max-w-[420px] border-l p-5 md:p-6 ${themeMode === 'dark' ? 'border-white/10 bg-[#081426]/94 text-slate-50' : 'border-white/80 bg-[#f8fbff]/96 text-slate-900'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusStyles[model.status]}`}>
              {model.status}
            </div>
            <h2 className="mt-3 text-2xl font-semibold">{model.name}</h2>
            <p className={`mt-1 text-sm ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{model.company} · {model.country}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${themeMode === 'dark' ? 'border-white/10 bg-white/8 text-slate-100' : 'border-slate-200 bg-white text-slate-700'}`}
            aria-label="Close detail panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Overview</p>
            <p className={`mt-3 text-sm leading-6 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{model.description}</p>
          </div>

          <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Strengths</p>
            <div className="mt-3 space-y-2">
              {model.strengths.map((strength) => (
                <div key={strength} className="flex gap-3">
                  <CheckCircle2 size={16} className={themeMode === 'dark' ? 'mt-0.5 text-cyan-300' : 'mt-0.5 text-sky-600'} />
                  <p className={`text-sm leading-6 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{strength}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Quick compare</p>
            <p className={`mt-3 text-sm leading-6 ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{model.comparison}</p>
          </div>

          <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Telemetry</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <TelemetryCell label="Benchmark" value={`${model.benchmarkScore}`} themeMode={themeMode} />
              <TelemetryCell label="Context" value={model.contextWindow} themeMode={themeMode} />
              <TelemetryCell label="Latency" value={model.latency} themeMode={themeMode} />
              <TelemetryCell label="Updated" value={model.lastUpdated} themeMode={themeMode} />
            </div>
          </div>

          <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Benchmark trend</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${themeMode === 'dark' ? 'bg-emerald-400/12 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}>
                <TrendingUp size={12} />
                +{model.benchmarkHistory[model.benchmarkHistory.length - 1] - model.benchmarkHistory[0]}
              </span>
            </div>
            <div className="mt-4 h-24">
              <Sparkline values={model.benchmarkHistory} themeMode={themeMode} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <TelemetryCell label="Adoption" value={`${model.adoptionIndex}`} themeMode={themeMode} />
              <TelemetryCell label="Velocity" value={`${model.releaseVelocity}/10`} themeMode={themeMode} />
            </div>
          </div>

          <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
            <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Closest rivals</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {model.rivals.map((rival) => (
                <span
                  key={rival}
                  className={`rounded-full border px-3 py-1.5 text-xs ${themeMode === 'dark' ? 'border-white/10 bg-white/6 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700'}`}
                >
                  {rival}
                </span>
              ))}
            </div>
          </div>

          {node && (
            <div className={`rounded-[22px] border p-4 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/80'}`}>
              <p className={`text-xs uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>HQ signal</p>
              <p className="mt-3 text-sm font-medium">{node.company}</p>
              <p className={`mt-1 text-sm ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{node.country} · {node.region}</p>
            </div>
          )}

          <a
            href={model.docsUrl}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-[20px] border px-4 py-3 text-sm font-semibold transition ${themeMode === 'dark' ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15' : 'border-cyan-400/25 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'}`}
          >
            Official documentation
            <ExternalLink size={16} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TelemetryCell({ label, value, themeMode }: { label: string; value: string; themeMode: ThemeMode }) {
  return (
    <div className={`rounded-2xl p-3 ${themeMode === 'dark' ? 'bg-white/6' : 'bg-slate-100'}`}>
      <p className={`text-[11px] uppercase tracking-[0.18em] ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}

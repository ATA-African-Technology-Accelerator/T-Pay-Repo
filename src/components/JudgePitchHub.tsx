import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Layers, Zap, Play, RotateCcw, ChevronRight, ChevronLeft, ArrowRight, ShieldCheck, Cpu, Database } from 'lucide-react';
import { HACKATHON_DECK } from '../data/mockData';

interface JudgePitchHubProps {
  onTriggerDemoScenario: (scenario: 'metro_tap' | 'carrier_topup' | 'conductor_pos' | 'route_calc') => void;
  onResetDemoData: () => void;
}

export function JudgePitchHub({ onTriggerDemoScenario, onResetDemoData }: JudgePitchHubProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'pitch' | 'architecture' | 'scenarios'>('pitch');

  const currentSlide = HACKATHON_DECK[currentSlideIndex];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                HACKATHON JUDGES DEMO
              </span>
              <span className="text-xs text-slate-400">T-Pay Global Innovation</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Pitch Deck & Interactive System Showcase
            </h2>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'pitch'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pitch Deck
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'scenarios'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Demo Scenarios
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture
          </button>
        </div>
      </div>

      {/* Tab 1: Pitch Deck Carousel */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          {/* Slide Navigation controls */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-400 font-semibold">
                Slide {currentSlideIndex + 1} of {HACKATHON_DECK.length}
              </span>
              <span>·</span>
              <span className="text-slate-300 font-medium">{currentSlide.badge}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((prev) => prev - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentSlideIndex === HACKATHON_DECK.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Slide Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-5"
            >
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {currentSlide.title}
                </h3>
                <p className="text-sm text-indigo-300 mt-1 font-medium leading-relaxed">
                  {currentSlide.headline}
                </p>
              </div>

              {/* Slide bullet points */}
              <div className="space-y-2.5">
                {currentSlide.content.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-mono text-[10px]">
                      0{idx + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>

              {/* Key Metrics Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
                {currentSlide.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                      {metric.value}
                    </div>
                    <div className="text-xs font-semibold text-slate-200">{metric.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{metric.detail}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step Pill Selectors */}
          <div className="flex gap-2">
            {HACKATHON_DECK.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-medium transition text-left truncate ${
                  currentSlideIndex === idx
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}
              >
                0{idx + 1}. {slide.badge}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Live Demo Scenarios for Judges */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Click any automated scenario button below to trigger live interactions on the mobile app and turnstile simulator in real time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  01
                </span>
                <h4 className="text-sm font-semibold text-white">Rush Hour Metro Gate Tap</h4>
              </div>
              <p className="text-xs text-slate-400">
                Tests sub-120ms contactless NFC turnstile passage, cryptogram decryption, and audio chime.
              </p>
              <button
                onClick={() => onTriggerDemoScenario('metro_tap')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition active:scale-98"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Scenario 01</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  02
                </span>
                <h4 className="text-sm font-semibold text-white">Direct Carrier Airtime Reload</h4>
              </div>
              <p className="text-xs text-slate-400">
                Simulates an unbanked commuter converting phone credit into transit tokens via MTN/Airtel DCB.
              </p>
              <button
                onClick={() => onTriggerDemoScenario('carrier_topup')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-98"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Scenario 02</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  03
                </span>
                <h4 className="text-sm font-semibold text-white">Conductor Tap-to-Phone POS</h4>
              </div>
              <p className="text-xs text-slate-400">
                Simulates a bus conductor collecting fare directly on their smartphone with zero hardware.
              </p>
              <button
                onClick={() => onTriggerDemoScenario('conductor_pos')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition active:scale-98"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Scenario 03</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  04
                </span>
                <h4 className="text-sm font-semibold text-white">AI Multimodal Fare Optimizer</h4>
              </div>
              <p className="text-xs text-slate-400">
                Evaluates Marina to Airport route, combining BRT + Metro Rail with dynamic 35% transfer discount.
              </p>
              <button
                onClick={() => onTriggerDemoScenario('route_calc')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/20 transition active:scale-98"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Scenario 04</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Offline-First End-to-End Cryptographic Flow</span>
            </h4>

            {/* Architecture Node Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-indigo-400 mb-1">1. Passenger App</div>
                <p className="text-[11px] text-slate-400">
                  Generates rotating HMAC cryptogram every 15s. Stores offline transit token locally.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-indigo-400 mb-1">2. Edge Turnstile / POS</div>
                <p className="text-[11px] text-slate-400">
                  Validates public key signature locally in &lt;120ms with 0 internet dependency.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-amber-400 mb-1">3. Carrier DCB Bridge</div>
                <p className="text-[11px] text-slate-400">
                  Converts SIM airtime balances into wallet credit via USSD/SMPP gateway protocols.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-emerald-400 mb-1">4. Settlement Ledger</div>
                <p className="text-[11px] text-slate-400">
                  Batch reconciles offline transit operator accounts at T+0 with zero revenue leakage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Demo Reset Button */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Presenter Controls</span>
        <button
          onClick={onResetDemoData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Balances & History</span>
        </button>
      </div>
    </div>
  );
}

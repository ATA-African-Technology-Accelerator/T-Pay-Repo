import { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Clock, Zap, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TRANSIT_ROUTES, TRANSIT_STATIONS } from '../data/mockData';
import { TransitRoute } from '../types';
import { soundEffects } from '../utils/audio';

interface RoutePlannerProps {
  onSelectRouteForTap: (route: TransitRoute) => void;
}

export function RoutePlanner({ onSelectRouteForTap }: RoutePlannerProps) {
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute>(TRANSIT_ROUTES[0]);
  const [bookedRouteId, setBookedRouteId] = useState<string | null>(null);

  const handleBook = (route: TransitRoute) => {
    setSelectedRoute(route);
    setBookedRouteId(route.id);
    soundEffects.playTransitTapSound();
    onSelectRouteForTap(route);

    setTimeout(() => {
      setBookedRouteId(null);
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* AI Fare Optimizer Spotlight */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-4 border border-indigo-500/30 text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            ⚡
          </div>
          <span className="text-xs font-semibold text-indigo-200">
            T-Pay Dynamic Fare Optimizer
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 ml-auto">
            Save 35%
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          T-Pay automatically applies multimodal transfer discounts and daily fare caps across Metro, BRT, and Ferry corridors.
        </p>
      </div>

      {/* Routes List */}
      <div className="space-y-3">
        {TRANSIT_ROUTES.map((route) => {
          const isSelected = selectedRoute.id === route.id;
          const isBooked = bookedRouteId === route.id;

          const modeIcon =
            route.mode === 'metro'
              ? '🚆'
              : route.mode === 'brt'
              ? '🚌'
              : route.mode === 'ferry'
              ? '⛴️'
              : '🚄';

          const modeBadge =
            route.mode === 'metro'
              ? 'Metro Rail'
              : route.mode === 'brt'
              ? 'BRT Express'
              : route.mode === 'ferry'
              ? 'Water Ferry'
              : 'Airport Link';

          return (
            <motion.div
              key={route.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedRoute(route)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{modeIcon}</span>
                  <div>
                    <span className="text-xs font-medium text-indigo-400">
                      {modeBadge} · {route.origin.line}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {route.origin.name} → {route.destination.name}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-xs line-through text-slate-500 font-mono">
                      ₦{route.baseFare}
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      ₦{route.discountedFare}
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-300 font-mono">
                    T-Pay Discount
                  </div>
                </div>
              </div>

              {/* Transit Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{route.durationMinutes} mins</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>{route.distanceKm} km</span>
                </div>
                <span>·</span>
                <span className="text-indigo-300 font-medium">{route.frequencyPeak}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBook(route);
                  }}
                  className={`ml-auto px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition ${
                    isBooked
                      ? 'bg-emerald-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isBooked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to Tap</span>
                    </>
                  ) : (
                    <>
                      <span>Tap This Route</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useMemo, useCallback } from "react";
import { Calculator, DollarSign, Bed, Bus, Calendar, MapPin, ArrowRightLeft, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { nepalRegions } from "@/data/regions";
import { motion, AnimatePresence } from "framer-motion";
import { useExchangeRate } from "@/hooks/useExchangeRate";

const FALLBACK_RATE = 133.5;
type Currency = "USD" | "NPR";

const ACCOMMODATION_TYPES = [
  { id: "budget", label: "Budget Hostel", dailyRate: 8 },
  { id: "mid", label: "Mid-Range Hotel", dailyRate: 35 },
  { id: "premium", label: "Premium Resort", dailyRate: 90 },
  { id: "luxury", label: "Luxury Lodge", dailyRate: 180 },
] as const;

const TRANSPORT_TYPES = [
  { id: "local-bus", label: "Local Bus", dailyRate: 5 },
  { id: "tourist-bus", label: "Tourist Bus", dailyRate: 15 },
  { id: "private-car", label: "Private Car", dailyRate: 45 },
  { id: "domestic-flight", label: "Domestic Flight", dailyRate: 80 },
] as const;

const PIE_COLORS = [
  "hsl(220, 10%, 20%)",
  "hsl(30, 60%, 55%)",
  "hsl(160, 50%, 42%)",
  "hsl(340, 55%, 50%)",
];

const BudgetContent = () => {
  const [destinationId, setDestinationId] = useState(nepalRegions[0].id);
  const [days, setDays] = useState(5);
  const [accommodationId, setAccommodationId] = useState<string>("mid");
  const [transportId, setTransportId] = useState<string>("tourist-bus");
  const [currency, setCurrency] = useState<Currency>("USD");

  const { rate: liveRate, loading: rateLoading, source: rateSource } = useExchangeRate();

  const destination = nepalRegions.find((r) => r.id === destinationId)!;
  const accommodation = ACCOMMODATION_TYPES.find((a) => a.id === accommodationId)!;
  const transport = TRANSPORT_TYPES.find((t) => t.id === transportId)!;

  const nprRate = rateLoading ? FALLBACK_RATE : liveRate;
  const rate = currency === "NPR" ? nprRate : 1;
  const sym = currency === "NPR" ? "Rs" : "$";

  const fmt = useCallback(
    (usdValue: number) => {
      const converted = Math.round(usdValue * rate);
      return `${sym}${converted.toLocaleString()}`;
    },
    [rate, sym]
  );

  const breakdown = useMemo(() => {
    const food = destination.avgCost * days;
    const stay = accommodation.dailyRate * days;
    const travel = transport.dailyRate * days;
    const misc = Math.round((food + stay + travel) * 0.12);
    const total = food + stay + travel + misc;
    return { food, stay, travel, misc, total };
  }, [destination, accommodation, transport, days]);

  const pieData = [
    { name: "Food & Activities", value: Math.round(breakdown.food * rate) },
    { name: "Accommodation", value: Math.round(breakdown.stay * rate) },
    { name: "Transport", value: Math.round(breakdown.travel * rate) },
    { name: "Miscellaneous", value: Math.round(breakdown.misc * rate) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold">Budget Estimator</h2>
            <p className="text-xs text-muted-foreground">Plan your trip expenses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rateLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          <button
            onClick={() => setCurrency((c) => (c === "USD" ? "NPR" : "USD"))}
            className="flex items-center gap-2 text-xs font-medium border border-border hover:border-primary/30 bg-card hover:bg-accent px-3 py-2 rounded-full transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
            {currency === "USD" ? "USD → NPR" : "NPR → USD"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-secondary/30 border border-border rounded-2xl p-4">
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-3">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Destination
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {nepalRegions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDestinationId(r.id)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    r.id === destinationId
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                  }`}
                >
                  <span className="block truncate">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{fmt(r.avgCost)}/day</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-4">
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-3">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Duration
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="flex-1 accent-[hsl(var(--primary))]"
              />
              <span className="font-display font-bold text-lg min-w-[4ch] text-right">{days}d</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-secondary/30 border border-border rounded-2xl p-4">
              <label className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                <Bed className="w-3.5 h-3.5 text-muted-foreground" /> Accommodation
              </label>
              <div className="grid gap-2">
                {ACCOMMODATION_TYPES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAccommodationId(a.id)}
                    className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                      a.id === accommodationId
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    {a.label} · <span className="text-muted-foreground">{fmt(a.dailyRate)}/night</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-secondary/30 border border-border rounded-2xl p-4">
              <label className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                <Bus className="w-3.5 h-3.5 text-muted-foreground" /> Transport
              </label>
              <div className="grid gap-2">
                {TRANSPORT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTransportId(t.id)}
                    className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                      t.id === transportId
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    {t.label} · <span className="text-muted-foreground">{fmt(t.dailyRate)}/day</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-5 text-center">
            <p className="text-sm opacity-80 mb-1">Estimated Total ({currency})</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`${breakdown.total}-${currency}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="font-display font-bold text-3xl"
              >
                {fmt(breakdown.total)}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm opacity-60 mt-1">
              ~{fmt(Math.round(breakdown.total / days))}/day · {days} days
            </p>
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-4">
            <p className="text-sm font-semibold mb-2">Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${sym}${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: "13px" }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-2.5">
            {[
              { label: "Food & Activities", value: breakdown.food, color: PIE_COLORS[0] },
              { label: "Accommodation", value: breakdown.stay, color: PIE_COLORS[1] },
              { label: "Transport", value: breakdown.travel, color: PIE_COLORS[2] },
              { label: "Misc (12%)", value: breakdown.misc, color: PIE_COLORS[3] },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-display font-bold text-sm">{fmt(item.value)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2.5 flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-display font-bold">{fmt(breakdown.total)}</span>
            </div>
            {currency === "NPR" && (
              <p className="text-[11px] text-muted-foreground text-right">
                {rateSource === "fallback" ? "Rate: ~" : "Live rate: "}1 USD = {nprRate.toFixed(1)} NPR
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetContent;

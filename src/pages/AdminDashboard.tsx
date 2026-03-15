import { useState, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { nepalRegions, getDensityLevel, getDensityColor } from "@/data/regions";
import { generate30DayForecast } from "@/data/forecastData";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ComposedChart,
} from "recharts";
import {
  AlertTriangle, TrendingUp, TrendingDown, Users, MapPin, BarChart3, Activity,
  CloudRain, Sun, Cloud, CloudLightning, Thermometer, Droplets, Calendar, Lightbulb, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Static data ──
const monthlyData = [
  { month: "Jan", tourists: 12400, predicted: 12800 },
  { month: "Feb", tourists: 15200, predicted: 14900 },
  { month: "Mar", tourists: 22100, predicted: 21500 },
  { month: "Apr", tourists: 28900, predicted: 29200 },
  { month: "May", tourists: 18700, predicted: 19100 },
  { month: "Jun", tourists: 14300, predicted: 14800 },
  { month: "Jul", tourists: 11200, predicted: 11900 },
  { month: "Aug", tourists: 10800, predicted: 11200 },
  { month: "Sep", tourists: 19500, predicted: 19000 },
  { month: "Oct", tourists: 31200, predicted: 30800 },
  { month: "Nov", tourists: 26400, predicted: 27100 },
  { month: "Dec", tourists: 18900, predicted: 19500 },
];

const seasonalData = [
  { season: "Spring", value: 69700 },
  { season: "Summer", value: 36300 },
  { season: "Autumn", value: 77100 },
  { season: "Winter", value: 46500 },
];
const SEASON_COLORS = ["hsl(142 71% 45%)", "hsl(45 93% 47%)", "hsl(25 95% 53%)", "hsl(210 60% 50%)"];

const regionComparison = nepalRegions.map((r) => ({
  name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name,
  fullName: r.name,
  tourists: r.touristCount,
  capacity: r.capacity,
  density: Math.round((r.touristCount / r.capacity) * 100),
}));

const overcrowdedRegions = nepalRegions.filter(
  (r) => getDensityLevel(r) === "overcrowded" || getDensityLevel(r) === "high"
);

const totalTourists = nepalRegions.reduce((s, r) => s + r.touristCount, 0);
const avgDensity = Math.round(
  nepalRegions.reduce((s, r) => s + (r.touristCount / r.capacity) * 100, 0) / nepalRegions.length
);

// ── Weather icon helper ──
const WeatherIcon = ({ condition, className = "w-4 h-4" }: { condition: string; className?: string }) => {
  switch (condition) {
    case "clear": return <Sun className={`${className} text-amber-500`} />;
    case "cloudy": return <Cloud className={`${className} text-muted-foreground`} />;
    case "rain": return <CloudRain className={`${className} text-blue-500`} />;
    case "storm": return <CloudLightning className={`${className} text-destructive`} />;
    default: return <Sun className={className} />;
  }
};

const FlowTrendIcon = ({ trend }: { trend: "increasing" | "stable" | "decreasing" }) => {
  switch (trend) {
    case "increasing": return <ArrowUp className="w-4 h-4 text-green-500" />;
    case "decreasing": return <ArrowDown className="w-4 h-4 text-red-500" />;
    case "stable": return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

const riskColor = (level: string) => {
  switch (level) {
    case "high": return "hsl(0 84% 60%)";
    case "moderate": return "hsl(38 92% 50%)";
    default: return "hsl(142 71% 45%)";
  }
};

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("monthly");

  const { days: forecastDays, summary } = useMemo(() => generate30DayForecast(), []);

  // Chart data for the 30-day forecast
  const forecastChartData = forecastDays.map((d) => ({
    date: d.date,
    predicted: d.predictedTourists,
    weatherImpact: Math.round(d.predictedTourists / d.weatherImpact), // base without weather
    rainfall: d.rainfallMm,
    confidence: Math.round(d.confidence * 100),
  }));

  return (
    <PageLayout
      navbarProps={{ extraLinks: [{ label: "Analytics", href: "/admin", icon: Activity }] }}
    >
      <div className="container py-6 space-y-6">
        <PageHeader
          icon={BarChart3}
          title="Agency Dashboard"
          description="Tourism analytics & management"
          actions={
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 sm:w-36 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Tourists", value: totalTourists.toLocaleString(), icon: Users, change: "+12%" },
            { label: "Avg Density", value: `${avgDensity}%`, icon: Activity, change: "+3%" },
            { label: "Active Regions", value: nepalRegions.length.toString(), icon: MapPin, change: "0" },
            { label: "Alerts", value: overcrowdedRegions.length.toString(), icon: AlertTriangle, change: overcrowdedRegions.length > 0 ? "Action needed" : "Clear" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card className="rounded-2xl">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                    <kpi.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                    <p className="text-xl font-bold font-display">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.change}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList className="rounded-xl">
            <TabsTrigger value="forecast" className="rounded-lg"><Calendar className="h-3.5 w-3.5 mr-1.5" />30-Day Forecast</TabsTrigger>
            <TabsTrigger value="trends" className="rounded-lg"><TrendingUp className="h-3.5 w-3.5 mr-1.5" />Trends</TabsTrigger>
            <TabsTrigger value="regions" className="rounded-lg"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Regions</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg"><AlertTriangle className="h-3.5 w-3.5 mr-1.5" />Alerts</TabsTrigger>
          </TabsList>

          {/* ════════ 30-Day Forecast Tab ════════ */}
          <TabsContent value="forecast" className="space-y-4">
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Predicted", value: summary.totalPredicted.toLocaleString(), icon: Users },
                { label: "Avg Daily", value: summary.avgDaily.toLocaleString(), icon: TrendingUp },
                { label: "Peak Day", value: `${summary.peakDay.date} (${summary.peakDay.predictedTourists.toLocaleString()})`, icon: ArrowUp },
                { label: "Low Day", value: `${summary.lowDay.date} (${summary.lowDay.predictedTourists.toLocaleString()})`, icon: ArrowDown },
                { label: "Rainy Days", value: `${summary.rainyDays} / 30`, icon: CloudRain },
                { label: "Clear Days", value: `${summary.clearDays} / 30`, icon: Sun },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="rounded-2xl">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <p className="text-[11px] text-muted-foreground truncate">{item.label}</p>
                      </div>
                      <p className="text-sm font-bold font-display truncate">{item.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Forecast chart: predicted flow + rainfall overlay */}
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Predicted Tourist Flow & Weather Impact</CardTitle>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <span>Climate-adjusted forecast</span>
                    <span className="flex items-center gap-1 text-xs">
                      <FlowTrendIcon trend={summary.flowTrend} />
                      <span className="capitalize">{summary.flowTrend} trend</span>
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {Math.round(summary.avgConfidence * 100)}% avg confidence
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={forecastChartData}>
                        <defs>
                          <linearGradient id="fillPredicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} className="fill-muted-foreground" />
                        <YAxis yAxisId="tourists" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="mm" />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                          formatter={(value: number, name: string) => {
                            if (name === "Rainfall") return [`${value} mm`, name];
                            return [value.toLocaleString(), name];
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area yAxisId="tourists" type="monotone" dataKey="predicted" name="Predicted Flow" stroke="hsl(142 71% 45%)" fill="url(#fillPredicted)" strokeWidth={2} />
                        <Line yAxisId="tourists" type="monotone" dataKey="weatherImpact" name="Base (no weather)" stroke="hsl(var(--foreground))" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                        <Bar yAxisId="rain" dataKey="rainfall" name="Rainfall" fill="hsl(210 80% 60%)" opacity={0.35} radius={[2, 2, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Climate & recommendations panel */}
              <div className="space-y-4">
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Thermometer className="w-4 h-4" /> Climate Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Weather trend</span>
                      <span className="text-sm font-medium">{summary.weatherTrend}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Flow direction</span>
                      <span className="flex items-center gap-1 text-sm font-medium capitalize">
                        <FlowTrendIcon trend={summary.flowTrend} />
                        {summary.flowTrend}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span className="text-sm font-medium">{Math.round(summary.avgConfidence * 100)}%</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Recommendations
                      </p>
                      <ul className="space-y-2">
                        {summary.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-foreground shrink-0">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Confidence over time */}
                <Card className="rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Prediction Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastChartData}>
                          <defs>
                            <linearGradient id="fillConf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={5} className="fill-muted-foreground" />
                          <YAxis domain={[50, 100]} tick={{ fontSize: 9 }} unit="%" className="fill-muted-foreground" />
                          <Area type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" fill="url(#fillConf)" strokeWidth={1.5} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 11 }} formatter={(v: number) => [`${v}%`, "Confidence"]} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Daily detail table */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Daily Forecast Detail</CardTitle>
                <CardDescription>Weather-adjusted predictions with risk indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="text-left py-2 pr-3 font-medium">Date</th>
                        <th className="text-left py-2 pr-3 font-medium">Weather</th>
                        <th className="text-right py-2 pr-3 font-medium">Temp</th>
                        <th className="text-right py-2 pr-3 font-medium">Rain</th>
                        <th className="text-right py-2 pr-3 font-medium">Predicted</th>
                        <th className="text-center py-2 pr-3 font-medium">Risk</th>
                        <th className="text-left py-2 font-medium hidden sm:table-cell">Insight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastDays.map((d) => (
                        <tr key={d.day} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                          <td className="py-2 pr-3">
                            <span className="font-medium">{d.date}</span>
                            <span className="text-muted-foreground ml-1 text-xs">{d.dayOfWeek}</span>
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-1.5">
                              <WeatherIcon condition={d.weatherCondition} className="w-3.5 h-3.5" />
                              <span className="capitalize text-xs">{d.weatherCondition}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums">{d.temperature}°C</td>
                          <td className="py-2 pr-3 text-right tabular-nums text-xs">
                            {d.rainfallMm > 0 ? `${d.rainfallMm}mm` : "—"}
                          </td>
                          <td className="py-2 pr-3 text-right font-display font-bold tabular-nums">
                            {d.predictedTourists.toLocaleString()}
                          </td>
                          <td className="py-2 pr-3 text-center">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: riskColor(d.riskLevel) }}
                              title={d.riskLevel}
                            />
                          </td>
                          <td className="py-2 text-xs text-muted-foreground hidden sm:table-cell max-w-[200px] truncate">
                            {d.insight}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════ Trends Tab ════════ */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tourist Trend — Actual vs Predicted</CardTitle>
                  <CardDescription>Monthly comparison with AI predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="tourists" name="Actual" stroke="hsl(142 71% 45%)" fill="url(#fillActual)" strokeWidth={2} />
                        <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(var(--foreground))" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Seasonal Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={seasonalData} dataKey="value" nameKey="season" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ season }) => season}>
                          {seasonalData.map((_, i) => (
                            <Cell key={i} fill={SEASON_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════ Regions Tab ════════ */}
          <TabsContent value="regions" className="space-y-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Region Comparison — Tourists vs Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionComparison} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="tourists" name="Current" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="capacity" name="Capacity" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Density Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {nepalRegions.map((r) => {
                    const level = getDensityLevel(r);
                    return (
                      <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                        <div>
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.touristCount.toLocaleString()} / {r.capacity.toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" style={{ borderColor: getDensityColor(level), color: getDensityColor(level) }}>
                          {level}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════ Alerts Tab ════════ */}
          <TabsContent value="alerts" className="space-y-4">
            {overcrowdedRegions.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="p-8 text-center text-muted-foreground">No active alerts.</CardContent></Card>
            ) : (
              overcrowdedRegions.map((r) => {
                const level = getDensityLevel(r);
                const ratio = Math.round((r.touristCount / r.capacity) * 100);
                return (
                  <Card key={r.id} className="border-l-4 rounded-2xl" style={{ borderLeftColor: getDensityColor(level) }}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: getDensityColor(level) }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold">{r.name}</p>
                          <Badge variant="destructive" className="text-xs">{level === "overcrowded" ? "OVERCROWDED" : "HIGH"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Currently at <strong>{ratio}%</strong> capacity ({r.touristCount.toLocaleString()} / {r.capacity.toLocaleString()}).
                          {r.riskAlert && ` ${r.riskAlert}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;

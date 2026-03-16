import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  Clock3,
  Copy,
  Download,
  Home,
  Map,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { destinations } from "@/data/destinations";
import { getSafetyProfile } from "@/lib/travelFeatureToolkit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SosTriggerReason = "manual" | "timer" | null;

const SOS_STORAGE_KEY = "smart-trails-sos-page";

const getRiskBadgeClass = (risk: "Low" | "Moderate" | "High") => {
  if (risk === "High") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (risk === "Moderate") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
};

const formatRemainingTime = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

const SafetySOS = () => {
  const [destinationId, setDestinationId] = useState(() => destinations[0]?.id ?? "");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [timerHours, setTimerHours] = useState(6);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [triggerReason, setTriggerReason] = useState<SosTriggerReason>(null);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === destinationId) ?? destinations[0],
    [destinationId],
  );

  const safetyProfile = useMemo(() => getSafetyProfile(selectedDestination), [selectedDestination]);

  const remainingMs = deadline ? Math.max(0, deadline - now) : 0;
  const isTimerRunning = Boolean(deadline && remainingMs > 0);
  const hasActiveSos = triggerReason !== null;

  const sosMessage = useMemo(() => {
    const timestamp = new Date().toLocaleString();
    const triggerSource =
      triggerReason === "manual"
        ? "Manual trigger"
        : triggerReason === "timer"
          ? "Timer expired"
          : "Safety monitoring";

    return [
      "SMART TRAILS NEPAL - SOS ALERT",
      `Time: ${timestamp}`,
      `Trigger: ${triggerSource}`,
      `Destination: ${selectedDestination.name}`,
      `Area: ${selectedDestination.area}`,
      `Coordinates: ${selectedDestination.coords[0].toFixed(5)}, ${selectedDestination.coords[1].toFixed(5)}`,
      `Altitude: ${selectedDestination.altitudeM} m`,
      `Risk Level: ${safetyProfile.risk}`,
      `Emergency Hub: ${safetyProfile.emergencyHub}`,
      `Primary Contact: ${contactName || "Not set"} (${contactPhone || "Not set"})`,
      "",
      "Please call the traveler and escalate to local emergency support if unreachable.",
    ].join("\n");
  }, [triggerReason, selectedDestination, safetyProfile, contactName, contactPhone]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = JSON.parse(window.localStorage.getItem(SOS_STORAGE_KEY) ?? "{}");

      setDestinationId(
        typeof stored.destinationId === "string" &&
          destinations.some((destination) => destination.id === stored.destinationId)
          ? stored.destinationId
          : destinations[0]?.id ?? "",
      );
      setContactName(typeof stored.contactName === "string" ? stored.contactName : "");
      setContactPhone(typeof stored.contactPhone === "string" ? stored.contactPhone : "");
      setTimerHours(typeof stored.timerHours === "number" ? stored.timerHours : 6);
      setDeadline(typeof stored.deadline === "number" ? stored.deadline : null);
      setTriggerReason(
        stored.triggerReason === "manual" || stored.triggerReason === "timer"
          ? stored.triggerReason
          : null,
      );
    } catch {
      setDestinationId(destinations[0]?.id ?? "");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      SOS_STORAGE_KEY,
      JSON.stringify({
        destinationId,
        contactName,
        contactPhone,
        timerHours,
        deadline,
        triggerReason,
      }),
    );
  }, [destinationId, contactName, contactPhone, timerHours, deadline, triggerReason]);

  useEffect(() => {
    if (!deadline) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [deadline]);

  useEffect(() => {
    if (deadline && remainingMs === 0 && triggerReason === null) {
      setTriggerReason("timer");
      toast.error("SOS triggered: safety timer expired.");
    }
  }, [deadline, remainingMs, triggerReason]);

  const validateContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Add both emergency contact name and phone first.");
      return false;
    }

    return true;
  };

  const startTimer = () => {
    if (!validateContact()) {
      return;
    }

    const safeHours = Math.min(24, Math.max(1, timerHours));
    const nextDeadline = Date.now() + safeHours * 3_600_000;
    setDeadline(nextDeadline);
    setNow(Date.now());
    setTriggerReason(null);
    toast.success(`Check-in timer started for ${safeHours} hour${safeHours > 1 ? "s" : ""}.`);
  };

  const triggerSosNow = () => {
    if (!validateContact()) {
      return;
    }

    setTriggerReason("manual");
    toast.error("SOS manually triggered.");
  };

  const markSafe = () => {
    setDeadline(null);
    setTriggerReason(null);
    setNow(Date.now());
    toast.success("Status updated: marked as safe.");
  };

  const copySosMessage = async () => {
    try {
      await navigator.clipboard.writeText(sosMessage);
      toast.success("SOS message copied.");
    } catch {
      toast.error("Could not copy message on this browser.");
    }
  };

  const downloadSosMessage = () => {
    const blob = new Blob([sosMessage], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sos-${selectedDestination.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("SOS message downloaded.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "/explore-nepal", icon: Map },
          { label: "SOS", href: "#sos", icon: ShieldAlert },
        ]}
      />

      <main className="mt-14 py-6 md:py-8">
        <section id="sos" className="container max-w-4xl space-y-4">
          <Card className="border-border/70">
            <CardContent className="space-y-4 p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Dedicated safety page</p>
                  <h1 className="mt-1 text-2xl font-display font-semibold">Smart SOS Safety</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Set emergency contact, start a check-in timer, and trigger SOS manually or on timer expiry.
                  </p>
                </div>
                <Badge variant="outline" className={hasActiveSos ? "border-rose-200 bg-rose-50 text-rose-700" : "bg-background/80"}>
                  {hasActiveSos ? "SOS Active" : "Monitoring"}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Destination</label>
                  <select
                    value={selectedDestination.id}
                    onChange={(event) => setDestinationId(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {destinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-md border border-border/70 bg-card/60 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Current risk profile</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className={getRiskBadgeClass(safetyProfile.risk)}>
                      {safetyProfile.risk}
                    </Badge>
                    <span className="text-sm font-medium">{selectedDestination.altitudeM} m</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{safetyProfile.emergencyHub}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Emergency contact name</label>
                  <Input
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    placeholder="Contact person"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Emergency phone</label>
                  <Input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Check-in timer</p>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-background/80">
                    {deadline ? formatRemainingTime(remainingMs) : "No timer"}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[2, 6, 12].map((hours) => (
                    <Button
                      key={hours}
                      type="button"
                      size="sm"
                      variant={timerHours === hours ? "default" : "outline"}
                      onClick={() => setTimerHours(hours)}
                    >
                      {hours}h
                    </Button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={startTimer}>
                    <BellRing className="h-4 w-4" />
                    Start timer
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={triggerSosNow}>
                    <AlertTriangle className="h-4 w-4" />
                    Trigger SOS now
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={markSafe}>
                    <PhoneCall className="h-4 w-4" />
                    Mark safe
                  </Button>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {isTimerRunning
                    ? `Timer running for ${selectedDestination.name}.`
                    : "Timer is not active. Start it to enable automatic SOS on missed check-in."}
                </p>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/70 p-3">
                <p className="text-sm font-semibold">Altitude and safety checklist</p>
                <p className="mt-1 text-xs text-muted-foreground">{safetyProfile.warning}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {safetyProfile.checklist.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {hasActiveSos && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="text-sm font-semibold text-rose-700">SOS alert payload</p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md border border-rose-200 bg-white/80 p-3 text-xs text-rose-900">
                    {sosMessage}
                  </pre>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={copySosMessage}>
                      <Copy className="h-4 w-4" />
                      Copy message
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={downloadSosMessage}>
                      <Download className="h-4 w-4" />
                      Download TXT
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default SafetySOS;
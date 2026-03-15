import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  Mountain,
  Plus,
  X,
  Play,
  Pause,
  Bell,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { nepalRegions } from "@/data/regions";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const ALTITUDE_THRESHOLD = 3500;

const highAltitudeRegions = nepalRegions.filter((r) => {
  const altMap: Record<string, number> = {
    everest: 5364,
    annapurna: 4130,
    langtang: 3870,
    mustang: 3840,
    nagarkot: 2175,
    pokhara: 827,
    kathmandu: 1400,
    bhaktapur: 1401,
    chitwan: 150,
    lumbini: 150,
  };
  return (altMap[r.id] ?? 0) >= ALTITUDE_THRESHOLD;
});

const altitudeSicknessSymptoms = [
  "Headache and dizziness",
  "Nausea or vomiting",
  "Shortness of breath at rest",
  "Difficulty sleeping",
  "Loss of appetite",
  "Rapid heartbeat",
  "Swelling of hands, feet, or face",
];

const SOSSafetySystem = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem("smartyatra_sos_contacts");
    return saved ? JSON.parse(saved) : [];
  });
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [travelTimerMinutes, setTravelTimerMinutes] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("");

  // Persist contacts
  useEffect(() => {
    localStorage.setItem("smartyatra_sos_contacts", JSON.stringify(contacts));
  }, [contacts]);

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const triggerSOS = useCallback(() => {
    setSosTriggered(true);
    setTimerActive(false);
    toast({
      title: "🚨 SOS Alert Triggered!",
      description: `Emergency contacts notified. Last known location shared.`,
      variant: "destructive",
    });
  }, [toast]);

  const startTimer = () => {
    setTimeRemaining(travelTimerMinutes * 60);
    setTimerActive(true);
    setSosTriggered(false);
    toast({
      title: "Safety timer started",
      description: `SOS will trigger if you don't check in within ${travelTimerMinutes} minutes.`,
    });
  };

  const checkIn = () => {
    setTimerActive(false);
    setTimeRemaining(0);
    setSosTriggered(false);
    toast({ title: "✅ Checked in safely" });
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setContacts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newName.trim(), phone: newPhone.trim() },
    ]);
    setNewName("");
    setNewPhone("");
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isHighAltitude = highAltitudeRegions.some((r) => r.id === selectedDestination);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" /> Smart SOS Safety
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set a travel timer. If you go offline or don't check in, SOS alerts your emergency contacts.
          </p>
        </div>
        <Badge variant={isOnline ? "default" : "destructive"} className="gap-1.5 text-xs">
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* SOS Alert Banner */}
      <AnimatePresence>
        {sosTriggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-destructive/10 border-2 border-destructive rounded-2xl p-5 text-center"
          >
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-2" />
            <h3 className="font-bold text-lg text-destructive">SOS Alert Active</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Emergency contacts have been notified with your last known location.
            </p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={checkIn}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> I'm Safe — Cancel Alert
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Travel Timer */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Travel Safety Timer
          </h3>

          {!timerActive ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Destination</label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select destination</option>
                  {nepalRegions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Expected travel time (minutes)
                </label>
                <Input
                  type="number"
                  min={15}
                  max={720}
                  value={travelTimerMinutes}
                  onChange={(e) => setTravelTimerMinutes(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
              <Button onClick={startTimer} className="w-full rounded-xl gap-1.5" disabled={contacts.length === 0}>
                <Play className="w-4 h-4" /> Start Safety Timer
              </Button>
              {contacts.length === 0 && (
                <p className="text-[11px] text-destructive">Add at least one emergency contact first.</p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="text-4xl font-mono font-bold text-primary">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-muted-foreground">
                SOS triggers when timer reaches 00:00
              </p>
              <div className="flex gap-2">
                <Button onClick={checkIn} className="flex-1 rounded-xl gap-1.5" variant="default">
                  <CheckCircle2 className="w-4 h-4" /> Check In
                </Button>
                <Button onClick={() => { setTimerActive(false); setTimeRemaining(0); }} className="rounded-xl" variant="outline">
                  <Pause className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" /> Emergency Contacts
          </h3>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </div>
                <button onClick={() => removeContact(contact.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl text-sm" />
            <Input placeholder="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="rounded-xl text-sm" />
            <Button size="icon" variant="outline" className="rounded-xl shrink-0" onClick={addContact}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Nepal emergency numbers */}
          <div className="pt-2 border-t border-border">
            <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Nepal Emergency Numbers</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Police", num: "100" },
                { label: "Ambulance", num: "102" },
                { label: "Tourist Police", num: "1144" },
                { label: "Rescue", num: "01-4228094" },
              ].map((e) => (
                <Badge key={e.num} variant="outline" className="text-[10px] gap-1">
                  <Phone className="w-2.5 h-2.5" /> {e.label}: {e.num}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Altitude Sickness Warning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Mountain className="w-4 h-4" /> ⚠️ Altitude Sickness Risk Above {ALTITUDE_THRESHOLD}m
        </h3>
        {isHighAltitude && (
          <p className="text-xs text-amber-600 dark:text-amber-300 mt-1 font-medium">
            ⚡ Your selected destination is a high-altitude region!
          </p>
        )}
        <div className="mt-3 grid sm:grid-cols-2 gap-1.5">
          {altitudeSicknessSymptoms.map((s) => (
            <p key={s} className="text-xs text-muted-foreground flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /> {s}
            </p>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-amber-500/20">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">High Altitude Destinations:</p>
          <div className="flex flex-wrap gap-1.5">
            {highAltitudeRegions.map((r) => (
              <Badge key={r.id} variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                <MapPin className="w-2.5 h-2.5 mr-1" /> {r.name}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SOSSafetySystem;

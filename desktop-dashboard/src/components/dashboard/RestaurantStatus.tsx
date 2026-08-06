import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RESTAURANT_ID } from '@/lib/constants';
import { useLocale } from '@/components/locale-provider';
import { RestaurantSettings } from '@/lib/types';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { isRestaurantOpen } from '@/lib/restaurant-status';
import { Label } from '@/components/ui/label';

export function RestaurantStatusModule() {
  const { t } = useLocale();
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', RESTAURANT_ID)
      .single();

    if (error) {
      console.error("Error fetching restaurant settings:", error);
      toast.error("Failed to fetch restaurant settings.");
      // If settings don't exist, try to create default ones
      if (error.code === 'PGRST116') { // No rows returned, likely first run
          console.log("No restaurant settings found, attempting to create default.");
          await createDefaultSettings();
      }
    } else {
      setSettings(data);
    }
    setLoading(false);
  };

  const createDefaultSettings = async () => {
    const defaultSettings: Omit<RestaurantSettings, 'id' | 'updated_at'> = {
      restaurant_id: RESTAURANT_ID,
      is_open: true,
      opening_time: '10:00:00',
      closing_time: '02:00:00', // Example: open until 2 AM
      manual_override: false,
      timezone: 'Africa/Algiers',
    };
    const { data, error } = await supabase
      .from('restaurant_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error("Error creating default restaurant settings:", error);
      toast.error("Failed to create default settings.");
    } else {
      setSettings(data);
      toast.success("Default restaurant settings created.");
    }
  };

  useEffect(() => {
    fetchSettings();

    // Realtime subscription
    const channel = supabase
      .channel('restaurant-settings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_settings', filter: `restaurant_id=eq.${RESTAURANT_ID}` },
        (payload) => {
          console.log('Restaurant settings change detected:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSettings(payload.new as RestaurantSettings);
            toast.info("Restaurant settings updated in realtime.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async (updatedFields: Partial<RestaurantSettings>) => {
    if (!settings) return;

    setSaving(true);
    const { data, error } = await supabase
      .from('restaurant_settings')
      .update(updatedFields)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) {
      console.error("Error saving restaurant settings:", error);
      toast.error("Failed to save settings.");
    } else {
      setSettings(data);
      toast.success("Restaurant settings saved successfully.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-white/60">Loading settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-white/60">
        <XCircle className="h-10 w-10 text-destructive mb-4" />
        <span>Error: Restaurant settings not found and could not be created.</span>
      </div>
    );
  }

  const status = isRestaurantOpen(settings);
  const statusIcon = status.isOpen ? <CheckCircle className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 text-rose-500" />;
  const statusText = status.isOpen ? (t.admin?.open || "Open") : (t.admin?.closed || "Closed");
  const statusMessage = status.message;

  return (
    <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-8">
      <div className="flex items-center gap-3">
        {statusIcon}
        <h3 className="text-2xl font-black uppercase tracking-widest">{t.admin?.restaurant_status || "Restaurant Status"}</h3>
        <span className={`px-3 py-1 rounded-full font-bold text-sm ${status.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {statusText}
        </span>
      </div>

      <div className="space-y-6">
        {/* Manager Quick Override Action Bar */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <button
            onClick={() => handleSave({ manual_override: true, is_open: true, forced_closed: false })}
            disabled={saving}
            className={`py-3 rounded-xl font-black text-xs uppercase border transition-all ${
              settings.manual_override && settings.is_open && !settings.forced_closed
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
            }`}
          >
            Force Open
          </button>
          <button
            onClick={() => handleSave({ manual_override: true, is_open: false, forced_closed: true })}
            disabled={saving}
            className={`py-3 rounded-xl font-black text-xs uppercase border transition-all ${
              settings.forced_closed
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
            }`}
          >
            Force Closed
          </button>
          <button
            onClick={() => handleSave({ manual_override: false, forced_closed: false })}
            disabled={saving}
            className={`py-3 rounded-xl font-black text-xs uppercase border transition-all ${
              !settings.manual_override && !settings.forced_closed
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
            }`}
          >
            Resume Schedule
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="manual-override" className="text-lg font-bold text-white/80">Manual Override Active</Label>
          <input
            id="manual-override"
            type="checkbox"
            checked={settings.manual_override}
            onChange={(e) => handleSave({ manual_override: e.target.checked })}
            className="h-6 w-6 rounded-lg accent-primary"
            disabled={saving}
          />
        </div>
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="opening-time" className="text-lg font-bold text-white/80">Opening Time</Label>
              <input
                id="opening-time"
                type="time"
                value={settings.opening_time.substring(0, 5)} // "HH:mm"
                onChange={(e) => handleSave({ opening_time: e.target.value + ":00" })} // Supabase TIME type expects HH:mm:ss
                className="bg-white/10 text-white p-2 rounded-lg"
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="closing-time" className="text-lg font-bold text-white/80">Closing Time</Label>
              <input
                id="closing-time"
                type="time"
                value={settings.closing_time.substring(0, 5)} // "HH:mm"
                onChange={(e) => handleSave({ closing_time: e.target.value + ":00" })} // Supabase TIME type expects HH:mm:ss
                className="bg-white/10 text-white p-2 rounded-lg"
                disabled={saving}
              />
            </div>
          </>
        )}

        <p className={`text-sm ${status.isOpen ? 'text-emerald-300' : 'text-rose-300'}`}>
          {statusMessage}
        </p>

        <p className="text-xs text-white/40 italic">
          Timezone: {settings.timezone}
        </p>
      </div>
    </div>
  );
}
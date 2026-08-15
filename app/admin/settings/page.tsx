"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RESTAURANT_ID } from '@/lib/constants';
import { useLocale } from '@/components/locale-provider';
import type { RestaurantSettings } from '@/lib/types';
import { CheckCircle, XCircle, Loader2, Settings } from 'lucide-react';
import { isRestaurantOpen } from '@/lib/restaurant-status';
import { Label } from '@/components/ui/label';
import { AdminNav } from '@/components/admin/AdminNav';
import { GlassCard } from '@/components/glass/GlassCard';
import { logAction } from '@/lib/admin/activity';

export default function AdminSettingsPage() {
  const { t } = useLocale();
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', RESTAURANT_ID)
      .single();

    if (error) {
      console.error("Error fetching restaurant settings:", error);
      if (error.code === 'PGRST116') { // No rows returned, likely first run
          console.log("No restaurant settings found, attempting to create default.");
          await createDefaultSettings(supabase);
      } else {
          setError(error.message);
      }
    } else {
      setSettings(data);
    }
    setLoading(false);
  };

  const createDefaultSettings = async (supabase: any) => {
    const defaultSettings: Omit<RestaurantSettings, 'id' | 'updated_at'> = {
      restaurant_id: RESTAURANT_ID,
      is_open: true,
      opening_time: '10:00:00',
      closing_time: '02:00:00',
      manual_override: false,
      forced_closed: false,
      custom_message: null,
      reopen_at: null,
      timezone: 'Africa/Algiers',
    };
    const { data, error } = await supabase
      .from('restaurant_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error("Error creating default restaurant settings:", error);
      setError("Failed to create default settings.");
    } else {
      setSettings(data);
    }
  };

  useEffect(() => {
    fetchSettings();

    const supabase = createClient();
    const channel = supabase
      .channel('restaurant-settings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_settings', filter: `restaurant_id=eq.${RESTAURANT_ID}` },
        (payload) => {
          console.log('Restaurant settings change detected:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSettings(payload.new as RestaurantSettings);
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
    const supabase = createClient();
    const { data, error } = await supabase
      .from('restaurant_settings')
      .update(updatedFields)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) {
      console.error("Error saving restaurant settings:", error);
      setError("Failed to save settings.");
    } else {
      setSettings(data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let actionDesc = "Updated restaurant settings.";
        if (updatedFields.manual_override !== undefined) {
          if (updatedFields.manual_override === false) {
             actionDesc = "Resumed automatic restaurant schedule.";
          } else if (updatedFields.forced_closed) {
             actionDesc = "Manually FORCED CLOSED the restaurant.";
          } else {
             actionDesc = "Manually FORCED OPEN the restaurant.";
          }
        } else if (updatedFields.opening_time || updatedFields.closing_time) {
          actionDesc = `Changed operating hours (Open: ${updatedFields.opening_time || settings.opening_time}, Close: ${updatedFields.closing_time || settings.closing_time}).`;
        }
        await logAction('update', 'settings', settings.id, actionDesc);
      }
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      <AdminNav />
      
      <div className="px-4 md:px-8">
        <h1 className="text-4xl font-black tracking-tight text-gradient mb-8 flex items-center gap-4">
          <Settings className="h-10 w-10 text-primary" />
          Restaurant Operations
        </h1>

        {loading ? (
          <div className="flex items-center justify-center p-20 glass rounded-[3rem]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : !settings ? (
          <div className="flex flex-col items-center justify-center p-20 glass rounded-[3rem] text-white/60">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <span>Error: Restaurant settings not found and could not be created. {error}</span>
          </div>
        ) : (
          <GlassCard className="p-8 md:p-12 border-primary/20 space-y-10">
            {/* Status Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {(() => {
                const status = isRestaurantOpen(settings);
                return (
                  <>
                    <div className="flex items-center gap-4">
                      {status.isOpen ? <CheckCircle className="h-10 w-10 text-emerald-500" /> : <XCircle className="h-10 w-10 text-rose-500" />}
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-widest">Restaurant Status</h3>
                        <p className={`text-sm ${status.isOpen ? 'text-emerald-400' : 'text-rose-400'} font-bold mt-1`}>
                          {status.message}
                        </p>
                      </div>
                    </div>
                    <div className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest md:ml-auto ${status.isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                      {status.isOpen ? "Open" : "Closed"}
                    </div>
                  </>
                );
              })()}
            </div>

            <hr className="border-white/5" />

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-muted uppercase tracking-widest">Manual Overrides</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleSave({ manual_override: true, is_open: true, forced_closed: false })}
                  disabled={saving}
                  className={`py-4 px-6 rounded-2xl font-black text-xs uppercase border transition-all ${
                    settings.manual_override && settings.is_open && !settings.forced_closed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Force Open
                </button>
                <button
                  onClick={() => handleSave({ manual_override: true, is_open: false, forced_closed: true })}
                  disabled={saving}
                  className={`py-4 px-6 rounded-2xl font-black text-xs uppercase border transition-all ${
                    settings.forced_closed
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Force Closed
                </button>
                <button
                  onClick={() => handleSave({ manual_override: false, forced_closed: false })}
                  disabled={saving}
                  className={`py-4 px-6 rounded-2xl font-black text-xs uppercase border transition-all ${
                    !settings.manual_override && !settings.forced_closed
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Resume Schedule
                </button>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Schedule */}
            {!settings.manual_override && (
              <div className="space-y-6">
                <h4 className="text-sm font-black text-muted uppercase tracking-widest">Operating Hours</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-white/80 uppercase tracking-wider">Opening Time</Label>
                    <input
                      type="time"
                      value={settings.opening_time.substring(0, 5)}
                      onChange={(e) => handleSave({ opening_time: e.target.value + ":00" })}
                      className="w-full h-14 bg-white/5 text-white px-4 rounded-xl border border-white/10 font-bold focus:border-primary/50 outline-none transition-all"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-white/80 uppercase tracking-wider">Closing Time</Label>
                    <input
                      type="time"
                      value={settings.closing_time.substring(0, 5)}
                      onChange={(e) => handleSave({ closing_time: e.target.value + ":00" })}
                      className="w-full h-14 bg-white/5 text-white px-4 rounded-xl border border-white/10 font-bold focus:border-primary/50 outline-none transition-all"
                      disabled={saving}
                    />
                  </div>
                </div>
                <p className="text-xs text-white/40 italic font-bold">
                  All times are in {settings.timezone} timezone.
                </p>
              </div>
            )}
            
            {settings.manual_override && (
              <div className="p-6 bg-warning/10 border border-warning/20 rounded-2xl text-warning">
                <p className="font-bold text-sm">
                  Schedule is currently paused due to active manual override. Resume schedule to use automatic opening/closing hours.
                </p>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}

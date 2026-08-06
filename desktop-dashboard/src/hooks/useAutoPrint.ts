import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSettingsStore } from '../store/settingsStore';
import { PrintEngine } from '../lib/printing/PrintEngine';

export function useAutoPrint() {
  const { selectedPrinter, printerType, paperWidth, autoPrintEnabled, retryQueueEnabled } = useSettingsStore();

  useEffect(() => {
    const restaurantId = import.meta.env.VITE_RESTAURANT_ID;
    const printEngine = PrintEngine.getInstance();
    
    // Initial flush of pending or failed jobs if queue is enabled
    if (retryQueueEnabled) {
      printEngine.processRetryQueue();
    }

    const channel = supabase
      .channel('auto-print-queue')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        async (payload) => {
          const state = useSettingsStore.getState();
          if (!state.autoPrintEnabled) {
            console.log('[REALTIME_SYNC]: Auto print disabled by settings toggle. Skipping instant print.');
            return;
          }

          console.log('[REALTIME_SYNC]: New order inserted for auto-print:', payload.new.order_number);
          
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            await printEngine.submitPrintJob(data as any);
          }
        }
      )
      .subscribe();

    // Auto retry interval every 20 seconds for queued failed jobs
    const retryInterval = setInterval(() => {
      const state = useSettingsStore.getState();
      if (state.retryQueueEnabled) {
        printEngine.processRetryQueue();
      }
    }, 20000);

    return () => {
      clearInterval(retryInterval);
      supabase.removeChannel(channel);
    };
  }, [selectedPrinter, printerType, paperWidth, autoPrintEnabled, retryQueueEnabled]);
}

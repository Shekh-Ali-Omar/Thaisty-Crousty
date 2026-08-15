import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAutoPrint } from './hooks/useAutoPrint';
import { useSettingsStore } from './store/settingsStore';
import { 
  LayoutDashboard, Printer, LogOut, Bell, 
  Package, RefreshCw, Search, Settings
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useLocale } from '@/components/locale-provider';
import { supabase } from './lib/supabase';
import { Login } from './components/Login';
import { OrderRow } from './components/dashboard/OrderRow';
import { OrderModal } from './components/dashboard/OrderModal';
import { ProductManager } from './components/dashboard/products/ProductManager';
import { RestaurantStatusModule } from './components/dashboard/RestaurantStatus'; // New import
import { Order, OrderItem, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function App() {
  const { t, locale, setLocale, dir } = useLocale();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [printers, setPrinters] = useState<any[]>([]);
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const { 
    selectedPrinter, setSelectedPrinter, 
    printerType, setPrinterType, 
    networkTargetIP, setNetworkTargetIP,
    paperWidth, setPaperWidth,
    autoPrintEnabled, setAutoPrintEnabled,
    retryQueueEnabled, setRetryQueueEnabled
  } = useSettingsStore();

  // Initialize auto-printing hook
  useAutoPrint();

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
        const restaurantId = import.meta.env.VITE_RESTAURANT_ID;
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setOrders(data as any);
        }
    } finally {
        setOrdersLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
        
        if (!error && data) {
          setProducts(data as any);
        }
    } finally {
        setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        loadOrders();
        loadProducts();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadOrders();
        loadProducts();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadOrders, loadProducts]);

  const processedEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;

    const restaurantId = import.meta.env.VITE_RESTAURANT_ID;
    const channel = supabase
      .channel('desktop-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        async (payload) => {
          console.log('[REALTIME_SYNC]: Desktop event received:', payload.eventType, payload.new?.id || payload.old?.id);
          
          const eventKey = `${payload.eventType}-${payload.new?.id || payload.old?.id}-${payload.new?.updated_at || Date.now()}`;
          if (processedEventsRef.current.has(eventKey)) {
            console.log('[REALTIME_DEDUP]: Ignoring duplicate realtime payload:', eventKey);
            return;
          }
          processedEventsRef.current.add(eventKey);
          if (processedEventsRef.current.size > 100) {
            const firstItem = processedEventsRef.current.values().next().value;
            if (firstItem) processedEventsRef.current.delete(firstItem);
          }

          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('orders')
              .select('*, order_items(*)')
              .eq('id', payload.new.id)
              .single();
            if (data) {
                setOrders(prev => {
                  const filtered = prev.filter(o => o.id !== data.id);
                  return [data as any, ...filtered].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                });
                toast.info(`New Order Received: #${data.order_number}`);
                try {
                  const audio = new Audio('/sounds/order-ping.mp3');
                  audio.play().catch(() => {
                    // Fallback to Web Audio API synthesized ping chime
                    try {
                      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.type = 'sine';
                      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
                      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
                      gain.gain.setValueAtTime(0.5, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.3);
                    } catch (synthErr) {
                      console.warn('[AUDIO_SYNTH_ERR]:', synthErr);
                    }
                  });
                } catch (e) {
                  console.warn('[AUDIO_INIT_ERR]:', e);
                }
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } as any : o).sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ));
            setSelectedOrder(s => s?.id === payload.new.id ? { ...s, ...payload.new } as any : s);
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
            if (selectedOrder?.id === payload.old.id) setSelectedOrder(null);
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME_CHANNEL_STATUS]:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, selectedOrder?.id]);

  useEffect(() => {
    async function loadPrinters() {
      if ((window as any).electron) {
        const list = await (window as any).electron.getPrinters();
        setPrinters(list);
      }
    }
    loadPrinters();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const filteredOrders = orders.filter(o => 
    o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.phone.includes(searchQuery)
  );

  const menuItems = [
    { id: 'dashboard', label: t.admin.overview, icon: LayoutDashboard },
    { id: 'orders', label: t.admin.order_stream, icon: Bell },
    { id: 'products', label: t.admin.menu_catalog, icon: Package },
    { id: 'printer', label: 'Printer Settings', icon: Printer },
    { id: 'settings', label: t.admin.restaurant_status || 'Restaurant Status', icon: Settings },
  ];

  return (
    <div className={`flex h-screen bg-black text-white overflow-hidden ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`} dir={dir}>
      <Toaster position={dir === 'rtl' ? "top-left" : "top-right"} theme="dark" richColors />
      
      {/* Sidebar */}
      <div className={`w-64 glass border-white/10 flex flex-col p-4 shrink-0 ${dir === 'rtl' ? 'border-l' : 'border-r'}`}>
        <div className="mb-8 px-4 py-2 text-center">
            <h1 className="text-xl font-black tracking-tighter text-primary">THAI STY</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Desktop Admin</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex justify-around items-center px-2">
                {['ar', 'fr', 'en'].map((l) => (
                    <button 
                        key={l}
                        onClick={() => setLocale(l as any)}
                        className={`text-[10px] font-black uppercase transition-colors ${locale === l ? 'text-primary' : 'text-white/20 hover:text-white/50'}`}
                    >
                        {l}
                    </button>
                ))}
            </div>
            <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-destructive hover:bg-destructive/10 transition-colors"
            >
                <LogOut className="h-5 w-5" />
                <span className="font-bold text-sm">{t.admin.signOut}</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#050505]">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 p-8 flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">
                    {menuItems.find(i => i.id === activeTab)?.label}
                </h2>
                <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                    <span>Operational Control</span>
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    <span>{session.user.email}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={activeTab === 'orders' ? loadOrders : loadProducts} 
                    className="h-12 w-12 rounded-2xl glass hover:bg-white/5 flex items-center justify-center transition-all"
                >
                    <RefreshCw className={`h-5 w-5 text-primary ${ordersLoading || productsLoading ? 'animate-spin' : ''}`} />
                </button>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-primary font-black text-sm">AD</span>
                </div>
            </div>
        </header>

        <div className="p-8">
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="glass p-10 rounded-[3rem] border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">{t.admin.revenue}</p>
                        <h3 className="text-4xl font-black text-primary">
                            {formatPrice(orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + Number(o.total), 0))}
                        </h3>
                    </div>
                    <div className="glass p-10 rounded-[3rem] border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">{t.admin.orders}</p>
                        <h3 className="text-4xl font-black">{orders.length}</h3>
                    </div>
                    <div className="glass p-10 rounded-[3rem] border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Total Printed</p>
                        <h3 className="text-4xl font-black text-success">
                            {orders.filter(o => o.print_status === 'printed').length}
                        </h3>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-8">
                    {/* Search & Filter */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by number, name or phone..."
                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] h-16 pl-16 pr-8 text-white font-bold outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="glass rounded-[3rem] border-white/5 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Order #</th>
                                    <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Customer</th>
                                    <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Address</th>
                                    <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                                    <th className="py-6 px-4 text-right text-[10px] font-black uppercase tracking-widest text-white/20">Print</th>
                                    <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Total</th>
                                    <th className="py-6 px-4 text-right text-[10px] font-black uppercase tracking-widest text-white/20">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center opacity-20 uppercase font-black tracking-widest text-xs">
                                            No active orders found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <OrderRow 
                                            key={order.id} 
                                            order={order} 
                                            onClick={() => setSelectedOrder(order)} 
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <ProductManager />
            )}

            {activeTab === 'printer' && (
                <div className="max-w-2xl glass p-10 rounded-[3rem] border-white/5 mx-auto">
                    <div className="space-y-10">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 block">Printing Backend Strategy</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                  { id: 'Windows', label: 'Windows Spooler' },
                                  { id: 'EscPosUSB', label: 'ESC/POS USB (RAW)' },
                                  { id: 'EscPosNetwork', label: 'ESC/POS Network (TCP)' },
                                  { id: 'PDF', label: 'PDF Test Preview' }
                                ].map((b) => (
                                    <button
                                        key={b.id}
                                        onClick={() => setPrinterType(b.id as any)}
                                        className={`px-4 py-4 rounded-2xl font-black text-xs border transition-all ${
                                            printerType === b.id 
                                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(255,140,0,0.1)]' 
                                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                        }`}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {printerType === 'EscPosNetwork' && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 block">Network Printer IP (Port 9100)</label>
                                <input 
                                    type="text"
                                    value={networkTargetIP || '192.168.1.100'}
                                    onChange={(e) => setNetworkTargetIP(e.target.value)}
                                    placeholder="e.g. 192.168.1.100"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white font-bold outline-none focus:border-primary/50 transition-all text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 block">Paper Roll Width</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['80mm', '58mm'].map((width) => (
                                    <button
                                        key={width}
                                        onClick={() => setPaperWidth(width as any)}
                                        className={`px-4 py-5 rounded-2xl font-black text-xs border transition-all ${
                                            paperWidth === width 
                                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(255,140,0,0.1)]' 
                                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                        }`}
                                    >
                                        {width} Thermal Paper
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 block">Automated Operational Engine</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setAutoPrintEnabled(!autoPrintEnabled)}
                                    className={`px-4 py-5 rounded-2xl font-black text-xs border transition-all flex flex-col items-center gap-1 ${
                                        autoPrintEnabled 
                                        ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                    }`}
                                >
                                    <span>Auto Print</span>
                                    <span className="text-[9px] uppercase font-bold opacity-70">{autoPrintEnabled ? 'ENABLED' : 'DISABLED'}</span>
                                </button>

                                <button
                                    onClick={() => setRetryQueueEnabled(!retryQueueEnabled)}
                                    className={`px-4 py-5 rounded-2xl font-black text-xs border transition-all flex flex-col items-center gap-1 ${
                                        retryQueueEnabled 
                                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(255,140,0,0.1)]' 
                                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                    }`}
                                >
                                    <span>Retry Queue</span>
                                    <span className="text-[9px] uppercase font-bold opacity-70">{retryQueueEnabled ? 'ENABLED (20s)' : 'DISABLED'}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 block">Select Active Hardware</label>
                            <div className="relative">
                                <select 
                                    value={selectedPrinter || ''} 
                                    onChange={(e) => setSelectedPrinter(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-8 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-black">System Default Printer</option>
                                    {printers.map((p) => (
                                        <option key={p.name} value={p.name} className="bg-black">{p.name} {p.isDefault ? '(Default)' : ''}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                    <Settings className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <button 
                                onClick={async () => {
                                    toast.info('Sending hardware test signal via active driver...');
                                    const testOrder = {
                                        id: 'test-print-id-' + Date.now(),
                                        order_number: 'TC-TEST',
                                        name: 'Test Customer',
                                        phone: '0555 123 456',
                                        address: 'Dely Ibrahim, Algiers',
                                        total: 1500,
                                        created_at: new Date().toISOString(),
                                        order_items: [
                                            { id: '1', product_name: 'Crousty Classic', quantity: 1, price: 1500 }
                                        ]
                                    };
                                    
                                    try {
                                        const { PrintEngine } = await import('./lib/printing/PrintEngine');
                                        const driver = PrintEngine.getInstance().getActiveDriver();
                                        const res = await driver.print({
                                          order: testOrder as any,
                                          printerName: selectedPrinter,
                                          networkTargetIP,
                                          paperWidth,
                                          openCashDrawer: false,
                                        });

                                        if (res.success) toast.success(`Test print successful via ${res.printerUsed}`);
                                        else toast.error(`Test print failed: ${res.reason || 'Hardware error'}`);
                                    } catch (e) {
                                        toast.error('Test print error: ' + (e as Error).message);
                                    }
                                }}
                                className="w-full bg-primary text-black font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(255,140,0,0.25)]"
                            >
                                Trigger Test Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'settings' && ( // Conditional render for settings
                <RestaurantStatusModule />
            )}
        </div>

        {/* Global Modals */}
        <OrderModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onUpdate={loadOrders}
        />
      </main>
    </div>
  );
}

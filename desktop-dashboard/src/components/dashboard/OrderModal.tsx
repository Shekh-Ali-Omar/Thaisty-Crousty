import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, ClipboardList, Clock, CreditCard, ShoppingBag, Printer, CheckCircle2 } from 'lucide-react';
import { Order, OrderItem, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useLocale } from '@/components/locale-provider';
import { supabase } from '@/desktop-dashboard/src/lib/supabase';
import { useSettingsStore } from '../../store/settingsStore';
import { toast } from 'sonner';
import { logAction } from '@/lib/admin/activity';

interface OrderModalProps {
  order: (Order & { order_items: OrderItem[] }) | null;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
];

export function OrderModal({ order, onClose, onUpdate }: OrderModalProps) {
  const { t, dir } = useLocale();
  const { selectedPrinter } = useSettingsStore();

  if (!order) return null;

  const updateStatus = async (status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (!error) {
      await logAction('status_change', 'order', order.id, `Order ${order.order_number} status updated to ${status}`);
      toast.success(`Order status updated to ${status}`);
      onUpdate();
    } else {
      toast.error('Failed to update status');
    }
  };

  const manualPrint = async () => {
    try {
        const { PrintEngine } = await import('../../lib/printing/PrintEngine');
        const result = await PrintEngine.getInstance().submitPrintJob(order);
        
        if (result && result.success) {
            toast.success('Receipt printed successfully');
            onUpdate();
        } else {
            toast.error(`Print failed: ${result?.reason || 'Hardware / Spooler error'}`);
            onUpdate();
        }
    } catch (e) {
        toast.error('Printing failed: ' + (e as Error).message);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] glass-strong rounded-[3rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">{order.order_number}</h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Operational Detail</p>
                </div>
            </div>
            <button onClick={onClose} className="h-12 w-12 rounded-2xl hover:bg-white/5 flex items-center justify-center transition-colors">
                <X className="h-6 w-6 text-white/40" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Info */}
                <div className="space-y-10">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Customer Information</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-white/20 mb-1">Full Name</p>
                                    <p className="font-bold text-white">{order.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <Phone className="h-4 w-4 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-white/20 mb-1">Phone Number</p>
                                    <p className="font-bold text-white">{order.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-white/20 mb-1">Delivery Address</p>
                                    <p className="font-bold text-white leading-relaxed">{order.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="p-6 rounded-2xl bg-warning/5 border border-warning/10">
                            <div className="flex items-center gap-3 mb-3 text-warning">
                                <ClipboardList className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Customer Notes</span>
                            </div>
                            <p className="text-sm font-medium text-warning/80 italic">"{order.notes}"</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Items & Totals */}
                <div className="space-y-10">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Order Items</h3>
                        <div className="space-y-4">
                            {order.order_items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-primary">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{item.product_name}</p>
                                            {item.note && <p className="text-[10px] text-white/40">{item.note}</p>}
                                        </div>
                                    </div>
                                    <span className="font-black text-sm">{formatPrice(Number(item.price) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-white/20">Subtotal</span>
                            <span className="font-bold text-sm">{formatPrice(Number(order.total))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-black uppercase tracking-tighter">Total Amount</span>
                            <span className="text-3xl font-black text-primary">{formatPrice(Number(order.total))}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Footer: Actions */}
          <div className="p-8 border-t border-white/5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-6 shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Workflow Status:</span>
                <div className="flex items-center gap-2 flex-wrap">
                    {statusOptions.map((s) => (
                        <button 
                            key={s}
                            onClick={() => updateStatus(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                order.status === s 
                                ? 'bg-primary text-black' 
                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {t.order.statuses[s] || s}
                        </button>
                    ))}
                </div>
             </div>

             <div className="flex items-center gap-4">
                <button 
                    onClick={manualPrint}
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
                >
                    <Printer className="h-5 w-5 text-primary" />
                    <span className="font-black uppercase text-[10px] tracking-widest">Reprint Receipt</span>
                </button>
                <div className="flex items-center gap-3 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Payment {order.payment_status}</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

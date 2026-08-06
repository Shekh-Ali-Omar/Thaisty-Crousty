import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Order, OrderItem, OrderStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useLocale } from '@/components/locale-provider';
import { Hash, User, MapPin, Clock } from 'lucide-react';

interface OrderRowProps {
  order: Order & { order_items: OrderItem[] };
  onClick: () => void;
}

const statusVariant: Record<OrderStatus, string> = {
  pending: "bg-warning/20 text-warning border-warning/30",
  confirmed: "bg-primary/20 text-primary border-primary/30",
  preparing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ready: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-success/20 text-success border-success/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const printStatusVariant: Record<string, string> = {
  pending: "bg-white/5 text-white/40",
  printing: "bg-warning/20 text-warning border border-warning/30 animate-pulse",
  queued: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  printed: "bg-success/20 text-success",
  failed: "bg-destructive/20 text-destructive",
};

export function OrderRow({ order, onClick }: OrderRowProps) {
  const { t, dir } = useLocale();

  return (
    <tr 
      onClick={onClick}
      className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
    >
      <td className="py-6 px-4">
        <div className="flex items-center gap-3">
          <Hash className="h-4 w-4 text-primary" />
          <span className="font-black text-white tracking-tighter">{order.order_number}</span>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="flex flex-col">
          <span className="font-bold text-white/90">{order.name}</span>
          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{order.phone}</span>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-white/20" />
            <span className="text-xs text-white/60 line-clamp-1 max-w-[200px]">{order.address}</span>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusVariant[order.status as OrderStatus]}`}>
          {t.order.statuses[order.status as OrderStatus] || order.status}
        </div>
      </td>
      <td className="py-6 px-4 text-right">
        <div className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${printStatusVariant[order.print_status || 'pending']}`}>
          {order.print_status || 'pending'}
        </div>
      </td>
      <td className="py-6 px-4">
        <span className="font-black text-white text-lg">{formatPrice(Number(order.total))}</span>
      </td>
      <td className="py-6 px-4 text-right">
        <div className="flex items-center justify-end gap-2 text-white/20">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </td>
    </tr>
  );
}

"use client";

import type { Order, OrderItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/constants";

interface Props {
  order: Order & { order_items: OrderItem[] };
  paperWidth?: "58mm" | "80mm";
}

/**
 * THERMAL RECEIPT TEMPLATE (58mm / 80mm)
 * Optimized for B&W thermal printers.
 */
export function ReceiptTemplate({ order, paperWidth = "80mm" }: Props) {
  const is58mm = paperWidth === "58mm";
  
  return (
    <div id="thermal-receipt-content" className="thermal-receipt-print" style={{
      width: is58mm ? '58mm' : '80mm',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'Inter, system-ui, Arial, sans-serif',
      fontSize: is58mm ? '10px' : '12px',
      lineHeight: '1.2',
      padding: is58mm ? '2mm' : '4mm',
      margin: '0',
      boxSizing: 'border-box',
      direction: 'ltr',
      textAlign: 'left'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>{BRAND_NAME}</h1>
        <p style={{ margin: '2px 0' }}>Dely Ibrahim, Algiers</p>
        <p style={{ margin: '2px 0' }}>+213 555 123 456</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Order #:</span>
          <span style={{ fontWeight: 'bold' }}>{order.order_number}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginBottom: '8px' }}>
        <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Customer Details:</p>
        <p style={{ margin: '2px 0', direction: 'rtl', textAlign: 'right' }}>{order.name}</p>
        <p style={{ margin: '2px 0' }}>{order.phone}</p>
        <p style={{ margin: '2px 0', fontSize: '11px', direction: 'rtl', textAlign: 'right' }}>{order.address}</p>
        {order.notes && (
          <div style={{ marginTop: '5px', padding: '5px', border: '1px solid #000', fontSize: '11px' }}>
            <span style={{ fontWeight: 'bold' }}>Note:</span> 
            <span style={{ direction: 'rtl', textAlign: 'right', display: 'block' }}>{order.notes}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', marginBottom: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', paddingBottom: '4px' }}>ITEM</th>
              <th style={{ textAlign: 'center', paddingBottom: '4px' }}>QTY</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px' }}>PRICE</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td style={{ paddingTop: '6px', verticalAlign: 'top' }}>
                  <span style={{ direction: 'rtl', textAlign: 'right', display: 'block' }}>{item.product_name}</span>
                  {item.note && <div style={{ fontSize: '10px', fontStyle: 'italic', direction: 'rtl', textAlign: 'right' }}>* {item.note}</div>}
                </td>
                <td style={{ textAlign: 'center', paddingTop: '6px', verticalAlign: 'top' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', paddingTop: '6px', verticalAlign: 'top' }}>{formatPrice(Number(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: '1px double #000', paddingTop: '10px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
          <span>TOTAL:</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', marginTop: '15px', paddingTop: '10px', textAlign: 'center', fontSize: '10px' }}>
        <p style={{ margin: '2px 0' }}>Thank you for your visit!</p>
        <p style={{ margin: '2px 0' }}>Order via www.thaistycrousty.com</p>
        <p style={{ margin: '5px 0', fontWeight: 'bold' }}>*** PREMIUM STREET FOOD ***</p>
      </div>
    </div>
  );
}

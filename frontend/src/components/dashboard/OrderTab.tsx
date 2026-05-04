import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart, Package, Loader2, CheckCircle, ClipboardList,
  Truck, AlertTriangle, X, Info
} from "lucide-react";
import { toast } from "sonner";

type Product = { id: string; name: string; category: string; currentStock: number; warehouse: string; status: string };
type Order = {
  id: string; productId: string; productName: string; quantity: number;
  warehouse: string; supplier: string; status: string; timestamp: string;
  receivedAt?: string; receivedQty?: number;
};

const fieldClass = "w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

const statusColors: Record<string, string> = {
  confirmed: "bg-primary/20 text-primary",
  received: "bg-success/20 text-success",
  pending: "bg-warning/20 text-warning",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusIcon: Record<string, React.ReactNode> = {
  confirmed: <Truck className="w-3 h-3" />,
  received: <CheckCircle className="w-3 h-3" />,
  pending: <AlertTriangle className="w-3 h-3" />,
};

// Receive Modal
const ReceiveModal = ({
  order, onClose, onConfirm, isPending
}: {
  order: Order; onClose: () => void;
  onConfirm: (qty: number, notes: string) => void;
  isPending: boolean;
}) => {
  const [qty, setQty] = useState(order.quantity);
  const [notes, setNotes] = useState("");
  const shortage = order.quantity - qty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border/50 space-y-5"
        style={{ animation: "slide-up 0.3s ease-out" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Receive Shipment</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
          <p className="text-foreground font-medium">{order.productName}</p>
          <p className="text-muted-foreground">Order: <span className="font-mono">{order.id}</span> · Expected: <strong>{order.quantity} units</strong> from {order.supplier}</p>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Actual Quantity Received</label>
          <input
            type="number"
            min={0}
            max={order.quantity}
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className={fieldClass}
          />
          {shortage > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span><strong>{shortage} unit shortage</strong> — this will be automatically flagged as a loss in Loss Detection.</span>
            </div>
          )}
          {qty > order.quantity && (
            <div className="mt-2 flex items-center gap-2 text-xs text-warning bg-warning/10 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Quantity exceeds order. This will be recorded as a surplus.</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Delivery Notes (optional)</label>
          <textarea
            rows={2}
            placeholder="e.g. Packaging damaged, partial delivery..."
            className={`${fieldClass} resize-none`}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(qty, notes)}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-lg gradient-bg text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Confirm Receipt</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderTab = () => {
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['inventory'],
    queryFn: async () => { const res = await fetch('/api/inventory'); return res.json(); }
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => { const res = await fetch('/api/orders'); return res.json(); }
  });

  const [form, setForm] = useState({ productId: "", quantity: "", warehouse: "WH-A", supplier: "", notes: "" });
  const [receiveOrder, setReceiveOrder] = useState<Order | null>(null);

  const orderMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to place order'); }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Order placed! ${data.order.quantity} units of ${data.order.productName} (${data.order.id})`);
      setForm({ productId: "", quantity: "", warehouse: "WH-A", supplier: "", notes: "" });
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const receiveMutation = useMutation({
    mutationFn: async ({ orderId, receivedQty, notes }: { orderId: string; receivedQty: number; notes: string }) => {
      const res = await fetch(`/api/orders/${orderId}/receive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedQty, notes })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to receive order'); }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['lossDetection'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success(`Shipment received for ${data.order.productName}!`);
      setReceiveOrder(null);
    },
    onError: (err: Error) => { toast.error(err.message); setReceiveOrder(null); }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.quantity) return;
    orderMutation.mutate(form);
  };

  const selectedProduct = products.find(p => p.id === form.productId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {receiveOrder && (
        <ReceiveModal
          order={receiveOrder}
          onClose={() => setReceiveOrder(null)}
          onConfirm={(qty, notes) => receiveMutation.mutate({ orderId: receiveOrder.id, receivedQty: qty, notes })}
          isPending={receiveMutation.isPending}
        />
      )}

      {/* Order Form */}
      <div className="glass rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Place New Order</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Select Product *</label>
            <select required value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className={fieldClass}>
              <option value="">Choose a product to order...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) — Stock: {p.currentStock} [{p.status}]
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className={`p-4 rounded-lg flex items-center gap-4 ${
              selectedProduct.status === "Critical" ? "bg-destructive/10 border border-destructive/30" :
              selectedProduct.status === "Warning" ? "bg-warning/10 border border-warning/30" :
              "bg-success/10 border border-success/30"
            }`}>
              <Package className={`w-8 h-8 ${
                selectedProduct.status === "Critical" ? "text-destructive" :
                selectedProduct.status === "Warning" ? "text-warning" : "text-success"
              }`} />
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedProduct.category} · {selectedProduct.warehouse} · Current stock: <strong>{selectedProduct.currentStock}</strong>
                </p>
              </div>
              <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${
                selectedProduct.status === "Critical" ? "bg-destructive/20 text-destructive" :
                selectedProduct.status === "Warning" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
              }`}>{selectedProduct.status}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Order Quantity *</label>
              <input type="number" required min={1} placeholder="e.g. 100" className={fieldClass}
                value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Destination Warehouse</label>
              <select className={fieldClass} value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })}>
                <option>WH-A</option><option>WH-B</option><option>WH-C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Supplier Name</label>
            <input type="text" placeholder="e.g. TechSupplies Inc." className={fieldClass}
              value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Notes</label>
            <textarea placeholder="Any special instructions..." rows={2} className={`${fieldClass} resize-none`}
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button
            type="submit"
            disabled={orderMutation.isPending || !form.productId || !form.quantity}
            className="w-full py-3 rounded-lg gradient-bg text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {orderMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingCart className="w-5 h-5" /> Place Order</>}
          </button>
        </form>
      </div>

      {/* Order History */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <ClipboardList className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-semibold text-foreground">Order History</h3>
          {orders.length > 0 && (
            <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">{orders.length} orders</span>
          )}
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No orders placed yet. Place your first order above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Order ID", "Product", "Qty", "Warehouse", "Supplier", "Status", "Time", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...orders].reverse().map((order, i) => (
                  <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    style={{ animation: `slide-up 0.3s ease-out ${i * 0.04}s forwards`, opacity: 0 }}>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{order.id}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{order.productName}</td>
                    <td className="px-4 py-3 text-foreground font-semibold">
                      {order.receivedQty !== undefined ? `${order.receivedQty}/${order.quantity}` : order.quantity}
                    </td>
                    <td className="px-4 py-3 text-foreground">{order.warehouse}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.supplier || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || statusColors.pending}`}>
                        {statusIcon[order.status] || <AlertTriangle className="w-3 h-3" />} {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{order.timestamp}</td>
                    <td className="px-4 py-3">
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => setReceiveOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30 text-xs font-medium transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" /> Receive
                        </button>
                      )}
                      {order.status === 'received' && (
                        <span className="text-xs text-muted-foreground">
                          {order.receivedAt?.split(' ')[0] || 'Delivered'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTab;

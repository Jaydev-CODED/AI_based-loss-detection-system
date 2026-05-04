import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, PackagePlus, ArrowRightLeft, Truck, AlertTriangle, Loader2 } from "lucide-react";

const eventIcons: Record<string, typeof PackagePlus> = {
  added: PackagePlus,
  movement: ArrowRightLeft,
  shipment: Truck,
  loss: AlertTriangle,
};

const eventColors: Record<string, string> = {
  added: "bg-success text-success-foreground",
  movement: "bg-primary text-primary-foreground",
  shipment: "bg-secondary text-secondary-foreground",
  loss: "bg-destructive text-destructive-foreground",
};

const lineColors: Record<string, string> = {
  added: "bg-success",
  movement: "bg-primary",
  shipment: "bg-secondary",
  loss: "bg-destructive",
};

type TimelineEvent = { date: string, event: string, type: string, details: string };
type ProductTracking = { productId: string, name: string, warehouse: string, zone: string, timeline: TimelineEvent[] };

const ProductTrackingTab = () => {
  const { data: productTrackingData = [], isLoading } = useQuery<ProductTracking[]>({
    queryKey: ['tracking'],
    queryFn: async () => {
      const res = await fetch('/api/tracking');
      return res.json();
    }
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentSelected = selectedProduct || (productTrackingData[0]?.productId) || "";
  const product = productTrackingData.find((p) => p.productId === currentSelected);
  const filteredProducts = productTrackingData.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.productId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Product Tracking</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {filteredProducts.map((p) => (
            <button
              key={p.productId}
              onClick={() => setSelectedProduct(p.productId)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                currentSelected === p.productId
                  ? "gradient-bg text-primary-foreground glow-shadow"
                  : "bg-muted/30 text-foreground hover:bg-muted/50"
              }`}
            >
              <p className="font-medium text-sm">{p.name}</p>
              <p className={`text-xs mt-0.5 ${currentSelected === p.productId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {p.productId} • {p.warehouse}
              </p>
            </button>
          ))}
        </div>

        {/* Product Details & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {product && (
            <>
              {/* Product Info */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.productId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">{product.warehouse} — {product.zone}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass rounded-xl p-5">
                <h4 className="text-sm font-semibold text-foreground mb-6">Movement Timeline</h4>
                <div className="space-y-0">
                  {product.timeline.map((event, i) => {
                    const Icon = eventIcons[event.type] || PackagePlus;
                    return (
                      <div
                        key={i}
                        className="flex gap-4"
                        style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
                      >
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${eventColors[event.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {i < product.timeline.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[40px] ${lineColors[event.type]} opacity-30`} />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-6 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-foreground">{event.event}</h5>
                            <span className="text-xs text-muted-foreground">{event.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTrackingTab;

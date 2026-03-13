import { useState } from "react";
import { inventoryData } from "@/data/mockData";
import { Search, Pencil, Trash2 } from "lucide-react";

const statusStyles: Record<string, string> = {
  Normal: "bg-success/20 text-success",
  Warning: "bg-warning/20 text-warning",
  Critical: "bg-destructive/20 text-destructive",
};

const InventoryTab = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = inventoryData.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || item.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option>All</option>
          <option>Normal</option>
          <option>Warning</option>
          <option>Critical</option>
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Product ID", "Product Name", "Stock In", "Stock Out", "Current Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  style={{ animation: `slide-up 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-foreground">{item.stockIn}</td>
                  <td className="px-4 py-3 text-foreground">{item.stockOut}</td>
                  <td className="px-4 py-3 text-foreground font-semibold">{item.currentStock}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;

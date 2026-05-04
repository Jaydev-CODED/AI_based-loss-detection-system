import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Pencil, Trash2, Plus, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Product = { id: string, name: string, category: string, stockIn: number, stockOut: number, currentStock: number, status: string, warehouse: string };

const statusStyles: Record<string, string> = {
  Normal: "bg-success/20 text-success",
  Warning: "bg-warning/20 text-warning",
  Critical: "bg-destructive/20 text-destructive",
};

const InventoryTab = () => {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      return res.json();
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newProduct: any) => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Product added successfully");
      setShowAdd(false);
      setNewProduct({ name: "", category: "Electronics", stockIn: 0, stockOut: 0, warehouse: "WH-A" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (product: Product) => {
      const res = await fetch(`/api/inventory/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Product updated successfully");
      setEditingId(null);
      setEditData(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Product deleted successfully");
    }
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Electronics", stockIn: 0, stockOut: 0, warehouse: "WH-A" });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || item.status === filter;
    const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchSearch && matchFilter && matchCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData({ ...product });
  };

  const handleSaveEdit = () => {
    if (!editData) return;
    updateMutation.mutate(editData);
  };

  const handleAddProduct = () => {
    addMutation.mutate(newProduct);
  };

  const fieldClass = "w-full px-3 py-1.5 rounded-md bg-muted border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {!isLoading && (
        <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option>All</option><option>Normal</option><option>Warning</option><option>Critical</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 rounded-lg gradient-bg text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Inline Add Product */}
      {showAdd && (
        <div className="glass rounded-xl p-4 space-y-3" style={{ animation: "slide-up 0.3s ease-out" }}>
          <h4 className="text-sm font-semibold text-foreground">Quick Add Product</h4>
          <div className="grid sm:grid-cols-5 gap-3">
            <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className={fieldClass} />
            <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className={fieldClass}>
              <option>Electronics</option><option>Displays</option><option>Accessories</option><option>Audio</option>
            </select>
            <input type="number" placeholder="Stock In" value={newProduct.stockIn || ""} onChange={(e) => setNewProduct({ ...newProduct, stockIn: +e.target.value })} className={fieldClass} />
            <input type="number" placeholder="Stock Out" value={newProduct.stockOut || ""} onChange={(e) => setNewProduct({ ...newProduct, stockOut: +e.target.value })} className={fieldClass} />
            <select value={newProduct.warehouse} onChange={(e) => setNewProduct({ ...newProduct, warehouse: e.target.value })} className={fieldClass}>
              <option>WH-A</option><option>WH-B</option><option>WH-C</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md bg-muted text-foreground text-sm hover:bg-muted/80">Cancel</button>
            <button onClick={handleAddProduct} disabled={!newProduct.name || addMutation.isPending} className="px-3 py-1.5 rounded-md gradient-bg text-primary-foreground text-sm font-medium disabled:opacity-50">Add</button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Product ID", "Product Name", "Category", "Stock In", "Stock Out", "Current Stock", "Warehouse", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  style={{ animation: `slide-up 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {editingId === item.id ? (
                      <input value={editData!.name} onChange={(e) => setEditData({ ...editData!, name: e.target.value })} className={fieldClass} />
                    ) : item.name}
                  </td>
                  <td className="px-4 py-3 text-foreground">{item.category}</td>
                  <td className="px-4 py-3 text-foreground">
                    {editingId === item.id ? (
                      <input type="number" value={editData!.stockIn} onChange={(e) => setEditData({ ...editData!, stockIn: +e.target.value, currentStock: +e.target.value - editData!.stockOut })} className={fieldClass} />
                    ) : item.stockIn}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {editingId === item.id ? (
                      <input type="number" value={editData!.stockOut} onChange={(e) => setEditData({ ...editData!, stockOut: +e.target.value, currentStock: editData!.stockIn - +e.target.value })} className={fieldClass} />
                    ) : item.stockOut}
                  </td>
                  <td className="px-4 py-3 text-foreground font-semibold">{editingId === item.id ? editData!.currentStock : item.currentStock}</td>
                  <td className="px-4 py-3 text-foreground text-xs">{item.warehouse}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[editingId === item.id ? (editData!.currentStock <= 20 ? "Critical" : editData!.currentStock <= 100 ? "Warning" : "Normal") : item.status]}`}>
                      {editingId === item.id ? (editData!.currentStock <= 20 ? "Critical" : editData!.currentStock <= 100 ? "Warning" : "Normal") : item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {editingId === item.id ? (
                        <>
                          <button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="p-1.5 rounded-md hover:bg-success/20 transition-colors text-success"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setEditingId(null); setEditData(null); }} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default InventoryTab;

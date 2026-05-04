import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AddProductTab = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    warehouse: "",
    stockIn: "",
    stockOut: "0"
  });

  const mutation = useMutation({
    mutationFn: async (newProduct: typeof formData) => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        throw new Error('Failed to add product');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Product added successfully!");
      setFormData({ name: "", category: "", warehouse: "", stockIn: "", stockOut: "0" });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => {
      toast.error("Failed to add product.");
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const fieldClass = "w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass rounded-xl p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Product Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g., Wireless Keyboard" 
              className={fieldClass}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Category</label>
              <select 
                required 
                className={fieldClass}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Displays</option>
                <option>Accessories</option>
                <option>Audio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Warehouse Location</label>
              <select 
                required 
                className={fieldClass}
                value={formData.warehouse}
                onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
              >
                <option value="">Select warehouse</option>
                <option>WH-A</option>
                <option>WH-B</option>
                <option>WH-C</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Stock In</label>
              <input 
                type="number" 
                required 
                min={0} 
                placeholder="0" 
                className={fieldClass}
                value={formData.stockIn}
                onChange={(e) => setFormData({...formData, stockIn: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Stock Out</label>
              <input 
                type="number" 
                required 
                min={0} 
                placeholder="0" 
                className={fieldClass}
                value={formData.stockOut}
                onChange={(e) => setFormData({...formData, stockOut: e.target.value})}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 rounded-lg gradient-bg text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {mutation.isPending ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductTab;

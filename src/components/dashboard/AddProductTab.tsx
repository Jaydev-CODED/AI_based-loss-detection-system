import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const AddProductTab = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Product added successfully!");
      (e.target as HTMLFormElement).reset();
    }, 1200);
  };

  const fieldClass = "w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass rounded-xl p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Product Name</label>
            <input type="text" required placeholder="e.g., Wireless Keyboard" className={fieldClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Category</label>
              <select required className={fieldClass}>
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Displays</option>
                <option>Accessories</option>
                <option>Audio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Warehouse Location</label>
              <select required className={fieldClass}>
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
              <input type="number" required min={0} placeholder="0" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Stock Out</label>
              <input type="number" required min={0} placeholder="0" className={fieldClass} />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg gradient-bg text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {loading ? (
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

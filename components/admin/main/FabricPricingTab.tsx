"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface FabricPrice {
  id: string;
  fabric_name: string;
  short_sleeve_price: number;
  long_sleeve_price: number;
  is_active: boolean;
  sort_order: number;
}

export function FabricPricingTab() {
  const [prices, setPrices] = useState<FabricPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("global_fabric_pricing")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to fetch fabric prices");
    } else {
      setPrices(data || []);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    const newPrice: FabricPrice = {
      id: "new_" + Date.now(),
      fabric_name: "",
      short_sleeve_price: 0,
      long_sleeve_price: 0,
      is_active: true,
      sort_order: prices.length + 1,
    };
    setPrices([...prices, newPrice]);
  };

  const handleChange = (id: string, field: keyof FabricPrice, value: any) => {
    setPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("new_")) {
      setPrices((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    if (!confirm("Are you sure you want to delete this pricing rule?")) return;

    try {
      const { error } = await supabase
        .from("global_fabric_pricing")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setPrices((prev) => prev.filter((p) => p.id !== id));
      toast.success("Deleted successfully");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate
      const invalid = prices.find((p) => !p.fabric_name.trim());
      if (invalid) {
        toast.error("Fabric name is required for all rows");
        setSaving(false);
        return;
      }

      const updates = prices.map((p, index) => {
        const row = { ...p, sort_order: index + 1 };
        if (row.id.startsWith("new_")) {
          // @ts-ignore - remove temp id
          delete row.id;
        }
        return row;
      });

      const { error } = await supabase
        .from("global_fabric_pricing")
        .upsert(updates);

      if (error) throw error;

      toast.success("Fabric pricing saved successfully");
      await fetchPrices(); // Refresh to get actual UUIDs for new items
    } catch (e) {
      toast.error("Failed to save fabric pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Fabric Pricing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage base prices for custom jersey fabrics globally.
          </p>
        </div>
        <Button
          className="btn-accent"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Fabric
        </Button>
      </div>

      <div className="bg-card rounded-xl p-2">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-2">
            <div className="col-span-1">Active</div>
            <div className="col-span-5">Fabric Name</div>
            <div className="col-span-2">Short Sleeve (৳)</div>
            <div className="col-span-2">Long Sleeve (৳)</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {prices.map((price, index) => (
            <div
              key={price.id}
              className="grid grid-cols-12 gap-4 items-center bg-secondary/20 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
            >
              <div className="col-span-1 flex justify-center">
                <Switch
                  checked={price.is_active}
                  onCheckedChange={(checked) =>
                    handleChange(price.id, "is_active", checked)
                  }
                />
              </div>
              <div className="col-span-5">
                <Input
                  value={price.fabric_name}
                  onChange={(e) =>
                    handleChange(price.id, "fabric_name", e.target.value)
                  }
                  placeholder="e.g. PP 160 GSM Jersey"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={price.short_sleeve_price}
                  onChange={(e) =>
                    handleChange(
                      price.id,
                      "short_sleeve_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={price.long_sleeve_price}
                  onChange={(e) =>
                    handleChange(
                      price.id,
                      "long_sleeve_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(price.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {prices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-lg border border-dashed border-border">
              No fabric prices configured yet. Click "Add Fabric" to get started.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-start">
        <Button onClick={handleSave} className="btn-accent gap-2" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Pricing"}
        </Button>
      </div>
    </div>
  );
}

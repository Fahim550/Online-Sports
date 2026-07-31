import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ProductVariant,
  useCreateVariant,
  useDeleteVariant,
  useProductVariants,
  useUpdateVariant,
} from "@/hooks/useVariants";
import { createClient } from "@/utils/supabase/client";
import { Edit, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductVariantManagerProps {
  productId: string;
  productName: string;
}

export function ProductVariantManager({
  productId,
  productName,
}: ProductVariantManagerProps) {
  const { data: variants = [] } = useProductVariants(productId);
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    size: "",
    color: "",
    fabric: "",
    sku: "",
    variant_price: "",
    variant_sale_price: "",
    stock: "0",
  });

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      size: variant.size || "",
      color: variant.color || "",
      fabric: variant.fabric || "",
      sku: variant.sku,
      variant_price: variant.variant_price?.toString() || "",
      variant_sale_price: (variant as any).variant_sale_price?.toString() || "",
      stock: variant.stock.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.variant_price.trim()) {
      alert("Price is required");
      return;
    }

    const variantData = {
      size: formData.size || null,
      color: formData.color || null,
      fabric: formData.fabric || null,
      sku: formData.sku || `VAR-${Date.now()}`,
      variant_price: parseFloat(formData.variant_price) || 0,
      variant_sale_price: formData.variant_sale_price
        ? parseFloat(formData.variant_sale_price)
        : null,
      price_adjustment: 0,
      stock: parseInt(formData.stock) || 0,
      is_active: true,
    };

    try {
      if (editingVariant) {
        await updateVariant.mutateAsync({
          id: editingVariant.id,
          ...variantData,
        });
      } else {
        const sizes = formData.size ? formData.size.split(",").map(s => s.trim()).filter(Boolean) : [null];
        const baseSku = formData.sku || `VAR-${Date.now()}`;
        
        for (let i = 0; i < sizes.length; i++) {
          const s = sizes[i];
          await createVariant.mutateAsync({
            product_id: productId,
            ...variantData,
            size: s,
            sku: sizes.length > 1 && s ? `${baseSku}-${s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}` : baseSku,
          } as any);
          
          if (sizes.length > 1) await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      setIsDialogOpen(false);
      setEditingVariant(null);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetForm = () => {
    setFormData({
      size: "",
      color: "",
      fabric: "",
      sku: "",
      variant_price: "",
      variant_sale_price: "",
      stock: "0",
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteVariant.mutateAsync({ id: deleteId, productId });
    setDeleteId(null);
  };

  return (
    <>
      <DialogHeader className="p-6 pb-4 shrink-0 flex flex-row items-center justify-between border-b">
        <DialogTitle className="text-xl">
          Manage Variants - {productName}
        </DialogTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              if (
                !confirm(
                  "This will automatically generate variants for all active global fabrics (Short Sleeve and Long Sleeve). Continue?"
                )
              )
                return;
              
              setIsGenerating(true);
              try {
                const { data: fabrics, error } = await supabase
                  .from("global_fabric_pricing")
                  .select("*")
                  .eq("is_active", true);
                
                if (error) throw error;

                if (fabrics && fabrics.length > 0) {
                  for (const fabric of fabrics) {
                    // Short Sleeve
                    await createVariant.mutateAsync({
                      product_id: productId,
                      size: null,
                      color: null,
                      fabric: `${fabric.fabric_name} (Short Sleeve)`,
                      sku: `VAR-${Date.now()}-${fabric.id.substring(0,4)}-SS`,
                      variant_price: Number(fabric.short_sleeve_price),
                      variant_sale_price: null,
                      price_adjustment: 0,
                      stock: 999,
                      is_active: true,
                    } as any);
                    await new Promise((r) => setTimeout(r, 50));

                    // Long Sleeve
                    await createVariant.mutateAsync({
                      product_id: productId,
                      size: null,
                      color: null,
                      fabric: `${fabric.fabric_name} (Long Sleeve)`,
                      sku: `VAR-${Date.now()}-${fabric.id.substring(0,4)}-LS`,
                      variant_price: Number(fabric.long_sleeve_price),
                      variant_sale_price: null,
                      price_adjustment: 0,
                      stock: 999,
                      is_active: true,
                    } as any);
                    await new Promise((r) => setTimeout(r, 50));
                  }
                  toast.success("Global fabric variants generated successfully");
                }
              } catch (e) {
                toast.error("Failed to generate variants");
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Tag className="h-4 w-4 mr-2" />
            )}
            Auto-Generate Fabrics
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingVariant(null);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVariant ? "Edit Variant" : "Add New Variant"} -{" "}
                  {productName}
                </DialogTitle>
              </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Size (Optional) — {editingVariant ? "select a size" : "tap multiple to create separate variants for each size"}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["S", "M", "L", "XL", "XXL"].map((sizeOpt) => {
                    const selectedSizes = formData.size
                      ? formData.size
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : [];
                    const isSelected = selectedSizes.includes(sizeOpt);
                    return (
                      <button
                        key={sizeOpt}
                        type="button"
                        onClick={() => {
                          if (editingVariant) {
                            setFormData({
                              ...formData,
                              size: sizeOpt,
                            });
                          } else {
                            let updated: string[];
                            if (isSelected) {
                              updated = selectedSizes.filter((s) => s !== sizeOpt);
                            } else {
                              updated = [...selectedSizes, sizeOpt];
                            }
                            setFormData({
                              ...formData,
                              size: updated.join(", "),
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {sizeOpt}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  placeholder="e.g., M, L, XL"
                  className="input-shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fabric (Optional)
                </label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) =>
                    setFormData({ ...formData, fabric: e.target.value })
                  }
                  placeholder="e.g., Dri-Fit, Honeycomb"
                  className="input-shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Color (Optional) — tap multiple to combine
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    "Red",
                    "Blue",
                    "Green",
                    "Black",
                    "White",
                    "Yellow",
                    "Pink",
                    "Orange",
                    "Purple",
                    "Brown",
                    "Grey",
                    "Navy",
                  ].map((color) => {
                    const selectedColors = formData.color
                      ? formData.color
                          .split(", ")
                          .map((c) => c.trim())
                          .filter(Boolean)
                      : [];
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          let updated: string[];
                          if (isSelected) {
                            updated = selectedColors.filter((c) => c !== color);
                          } else {
                            updated = [...selectedColors, color];
                          }
                          setFormData({
                            ...formData,
                            color: updated.join(", "),
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="Or type custom colors (comma-separated)"
                  className="input-shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="Auto-generated if empty"
                  className="input-shop"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Regular Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.variant_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        variant_price: e.target.value,
                      })
                    }
                    placeholder="e.g., 399.00"
                    className="input-shop"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.variant_sale_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        variant_sale_price: e.target.value,
                      })
                    }
                    placeholder="e.g., 299.00"
                    className="input-shop"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="input-shop"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="btn-accent flex-1">
                  {editingVariant ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-w-0">
        <div className="space-y-4">
      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No variants yet. Add one to allow customers to choose options.
        </p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Size</th>
                  <th className="px-4 py-3 text-left font-medium">Color</th>
                  <th className="px-4 py-3 text-left font-medium">Fabric</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Regular Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Sale Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Stock</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{variant.size || "-"}</td>
                    <td className="px-4 py-3">{variant.color || "-"}</td>
                    <td className="px-4 py-3">{variant.fabric || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {variant.sku}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {variant.variant_price != null
                        ? variant.variant_price.toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-accent">
                      {(variant as any).variant_sale_price != null
                        ? (variant as any).variant_sale_price.toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          variant.stock > 0
                            ? "text-success"
                            : "text-destructive"
                        }
                      >
                        {variant.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(variant)}
                          className="text-accent hover:text-accent/80 transition"
                          title="Edit variant"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(variant.id)}
                          className="text-destructive hover:text-destructive/80 transition"
                          title="Delete variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </>
  );
}

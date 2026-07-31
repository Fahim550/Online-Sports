"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSetHideStock,
  useSetProductRating,
} from "@/hooks/useProductReviews";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useShopData";
import { createClient } from "@/utils/supabase/client";
import { Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MultiImageUpload } from "../ImageUpload";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: any;
  categories: any[];
  ratingsMap: Record<string, any>;
  hideStockMap: Record<string, any>;
}

export function ProductFormDialog({
  isOpen,
  onOpenChange,
  editingProduct,
  categories,
  ratingsMap,
  hideStockMap,
}: ProductFormDialogProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const setProductRating = useSetProductRating();
  const setHideStock = useSetHideStock();
  const supabase = createClient();

  const [globalFabrics, setGlobalFabrics] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    sale_price: "",
    category_id: "",
    stock: "0",
    sku: "",
    short_description: "",
    description: "",
    images: [] as string[],
    is_new: false,
    is_best_seller: false,
    is_featured: false,
    is_offer: false,
    is_active: true,
    is_variable: false,
    hide_stock: false,
    rating: 5,
    specifications: [] as { label: string; value: string }[],
    fabrics: [] as string[],
  });

  useEffect(() => {
    async function fetchFabrics() {
      const { data } = await supabase
        .from("global_fabric_pricing")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setGlobalFabrics(data);
    }
    fetchFabrics();
  }, [supabase]);

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: "",
      sale_price: "",
      category_id: "",
      stock: "0",
      sku: "",
      short_description: "",
      description: "",
      images: [],
      is_new: false,
      is_best_seller: false,
      is_featured: false,
      is_offer: false,
      is_active: true,
      is_variable: false,
      hide_stock: false,
      rating: 5,
      specifications: [],
      fabrics: [],
    });
  };

  useEffect(() => {
    if (editingProduct && isOpen) {
      const existingRating =
        ratingsMap[editingProduct.id] != null
          ? Number(ratingsMap[editingProduct.id])
          : 5;
      const existingHideStock =
        hideStockMap[editingProduct.id] ??
        (editingProduct as any).hide_stock ??
        false;

      setFormData({
        name: editingProduct.name,
        slug: editingProduct.slug,
        price: editingProduct.price.toString(),
        sale_price: editingProduct.sale_price?.toString() || "",
        category_id: editingProduct.category_id || "",
        stock: editingProduct.stock.toString(),
        sku: editingProduct.sku,
        short_description: editingProduct.short_description || "",
        description: editingProduct.description || "",
        images: editingProduct.images || [],
        is_new: editingProduct.is_new || false,
        is_best_seller: editingProduct.is_best_seller || false,
        is_featured: editingProduct.is_featured || false,
        is_offer: (editingProduct as any).is_offer || false,
        is_active: (editingProduct as any).is_active ?? true,
        is_variable: (editingProduct as any).is_variable ?? false,
        hide_stock: existingHideStock,
        rating: existingRating,
        specifications: (editingProduct as any).specifications || [],
        fabrics: editingProduct.fabrics
          ? editingProduct.fabrics
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
      });
    } else if (!editingProduct && isOpen) {
      resetForm();
    }
  }, [editingProduct, isOpen, ratingsMap, hideStockMap]);

  useEffect(() => {
    if (!editingProduct && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    const productData = {
      name: formData.name,
      slug: formData.slug,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      category_id: formData.category_id || null,
      stock: parseInt(formData.stock),
      sku: formData.sku || `SKU-${Date.now()}`,
      short_description: formData.short_description || null,
      description: formData.description || null,
      images: formData.images,
      is_new: formData.is_new,
      is_best_seller: formData.is_best_seller,
      is_featured: formData.is_featured,
      is_offer: formData.is_offer,
      is_variable: formData.is_variable,
      hide_stock: formData.hide_stock,
      specifications:
        formData.specifications.filter((s) => s.label.trim()).length > 0
          ? formData.specifications.filter((s) => s.label.trim())
          : null,
      fabrics: formData.fabrics.length > 0 ? formData.fabrics.join(",") : null,
    };

    try {
      let targetProductId = editingProduct?.id;

      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          ...productData,
        });
      } else {
        const newProd = await createProduct.mutateAsync(productData as any);
        if (newProd?.id) targetProductId = newProd.id;
      }

      if (targetProductId) {
        await setProductRating.mutateAsync({
          productId: targetProductId,
          rating: formData.rating,
        });

        await setHideStock.mutateAsync({
          productId: targetProductId,
          hideStock: formData.hide_stock,
        });

        if (formData.fabrics.length > 0) {
          const { data: existingVariants } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", targetProductId);

          for (const fabricName of formData.fabrics) {
            const fabricData = globalFabrics.find(
              (f) => f.fabric_name === fabricName
            );
            if (!fabricData) continue;

            const sleeveSizes = ["Short Sleeve", "Long Sleeve"];
            const physicalSizes = ["M", "L", "XL", "XXL"];

            for (const sleeveSize of sleeveSizes) {
              const variantName = `${fabricName} (${sleeveSize})`;
              const price =
                sleeveSize === "Short Sleeve"
                  ? fabricData.short_sleeve_price
                  : fabricData.long_sleeve_price;

              for (const pSize of physicalSizes) {
                const exists = existingVariants?.find(
                  (v) => v.fabric === variantName && v.size === pSize
                );

                if (exists) {
                  await supabase
                    .from("product_variants")
                    .update({ variant_price: price })
                    .eq("id", exists.id);
                } else {
                  await supabase.from("product_variants").insert({
                    product_id: targetProductId,
                    fabric: variantName,
                    size: pSize,
                    sku: `VAR-${Date.now()}-${Math.floor(
                      Math.random() * 1000
                    )}-${
                      sleeveSize === "Short Sleeve" ? "SS" : "LS"
                    }-${pSize}`,
                    variant_price: price,
                    stock: 999,
                    is_active: true,
                  });
                  await new Promise((r) => setTimeout(r, 50));
                }
              }
            }
          }
        }
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-shop"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="input-shop"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
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
                value={formData.sale_price}
                onChange={(e) =>
                  setFormData({ ...formData, sale_price: e.target.value })
                }
                className="input-shop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock *</label>
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="input-shop"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Available Fabrics (Custom Jerseys)
              </label>
              <div className="flex flex-wrap gap-2">
                {globalFabrics.map((fabric) => {
                  const isSelected = formData.fabrics.includes(
                    fabric.fabric_name
                  );
                  return (
                    <button
                      type="button"
                      key={fabric.id}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          fabrics: isSelected
                            ? prev.fabrics.filter(
                                (f) => f !== fabric.fabric_name
                              )
                            : [...prev.fabrics, fabric.fabric_name],
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent/50 text-muted-foreground"
                      }`}
                    >
                      {fabric.fabric_name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Short Description
            </label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  short_description: e.target.value,
                })
              }
              className="input-shop"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-shop min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Specifications (optional)
            </label>
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Material)"
                  value={spec.label}
                  onChange={(e) => {
                    const updated = [...formData.specifications];
                    updated[index] = {
                      ...updated[index],
                      label: e.target.value,
                    };
                    setFormData({ ...formData, specifications: updated });
                  }}
                  className="input-shop flex-1"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Cotton)"
                  value={spec.value}
                  onChange={(e) => {
                    const updated = [...formData.specifications];
                    updated[index] = {
                      ...updated[index],
                      value: e.target.value,
                    };
                    setFormData({ ...formData, specifications: updated });
                  }}
                  className="input-shop flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updated = formData.specifications.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, specifications: updated });
                  }}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFormData({
                  ...formData,
                  specifications: [
                    ...formData.specifications,
                    { label: "", value: "" },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Add Spec
            </Button>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Product Card Rating</span>
              </label>
              <span className="text-xs text-muted-foreground">
                Select rating for product card
              </span>
            </div>
            <select
              value={formData.rating}
              onChange={(e) =>
                setFormData({ ...formData, rating: Number(e.target.value) })
              }
              className="input-shop font-bold text-xs bg-card py-2.5 cursor-pointer"
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5.0 Stars (Default)</option>
              <option value={4.5}>⭐⭐⭐⭐⭐ 4.5 Stars</option>
              <option value={4}>⭐⭐⭐⭐ 4.0 Stars</option>
              <option value={3.5}>⭐⭐⭐ 3.5 Stars</option>
              <option value={3}>⭐⭐⭐ 3.0 Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Images *
            </label>
            <MultiImageUpload
              values={formData.images}
              onChange={(urls) => setFormData({ ...formData, images: urls })}
              folder="products"
              maxImages={5}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_variable}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_variable: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Variable Product</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) =>
                  setFormData({ ...formData, is_new: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">New Arrival</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_best_seller}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_best_seller: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Best Seller</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_featured: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={formData.is_offer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_offer: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-accent">Offer Product</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hide_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hide_stock: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Hide Stock</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="btn-accent flex-1"
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

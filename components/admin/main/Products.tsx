"use client";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminCreateReview,
  useHideStockMap,
  useProductRatingsMap,
  useSetHideStock,
  useSetProductRating,
} from "@/hooks/useProductReviews";
import {
  Product,
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/useShopData";
import { createClient } from "@/utils/supabase/client";
import { Edit, Layers, MoreHorizontal, Plus, Search, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CsvProductUpload } from "../CsvProductUpload";
import { MultiImageUpload } from "../ImageUpload";
import { ProductVariantManager } from "./ProductVariantManager";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export default function AdminProducts() {
  const { data: products = [], isLoading, error } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const adminCreateReview = useAdminCreateReview();
  const { data: ratingsMap = {} } = useProductRatingsMap();
  const { data: hideStockMap = {} } = useHideStockMap();
  const setProductRating = useSetProductRating();
  const setHideStock = useSetHideStock();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [variantManagerProduct, setVariantManagerProduct] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

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

  const [globalFabrics, setGlobalFabrics] = useState<any[]>([]);
  const supabase = createClient();

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
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const existingRating = ratingsMap[product.id] != null ? Number(ratingsMap[product.id]) : 5;
    const existingHideStock = hideStockMap[product.id] ?? (product as any).hide_stock ?? false;

    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price.toString(),
      sale_price: product.sale_price?.toString() || "",
      category_id: product.category_id || "",
      stock: product.stock.toString(),
      sku: product.sku,
      short_description: product.short_description || "",
      description: product.description || "",
      images: product.images || [],
      is_new: product.is_new || false,
      is_best_seller: product.is_best_seller || false,
      is_featured: product.is_featured || false,
      is_offer: (product as any).is_offer || false,
      is_active: (product as any).is_active ?? true,
      is_variable: (product as any).is_variable ?? false,
      hide_stock: existingHideStock,
      rating: existingRating,
      specifications: (product as any).specifications || [],
      fabrics: product.fabrics ? product.fabrics.split(",").map((s) => s.trim()).filter(Boolean) : [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProduct.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteProduct.mutateAsync(id);
    }
    setSelectedIds(new Set());
    setShowBulkDelete(false);
    toast.success(`${selectedIds.size} product(s) deleted`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

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
              const price = sleeveSize === "Short Sleeve" ? fabricData.short_sleeve_price : fabricData.long_sleeve_price;
              
              for (const pSize of physicalSizes) {
                const exists = existingVariants?.find((v) => v.fabric === variantName && v.size === pSize);

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
                    sku: `VAR-${Date.now()}-${Math.floor(Math.random() * 1000)}-${sleeveSize === "Short Sleeve" ? "SS" : "LS"}-${pSize}`,
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

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
    }
  };

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
    if (!editingProduct && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, editingProduct]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          Failed to load products. Check RLS policies.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <CsvProductUpload />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="btn-accent"
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name *
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Slug *
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Price *
                    </label>
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
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      SKU
                    </label>
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
                            (_, i) => i !== index,
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
                    <span className="text-xs text-muted-foreground">Select rating for product card</span>
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
                    onChange={(urls) =>
                      setFormData({ ...formData, images: urls })
                    }
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
                    <span className="text-sm font-medium">
                      Variable Product
                    </span>
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
                    disabled={
                      createProduct.isPending || updateProduct.isPending
                    }
                  >
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-shop pl-10 w-full"
          />
        </div>
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {selectedIds.size} Selected
          </Button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.size === filteredProducts.length
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Category
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-secondary/30 transition-colors ${selectedIds.has(product.id) ? "bg-accent/10" : ""}`}
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          height={48}
                          width={48}
                          className="w-12 h-12 rounded-lg object-cover bg-secondary"
                        />
                        <span className="font-medium line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">
                      {product.sale_price ? (
                        <div>
                          <span className="font-medium">
                            ${product.sale_price}
                          </span>
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ${product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">${product.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          product.stock > 10
                            ? "text-green-600"
                            : product.stock > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.category?.name || "-"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {product.is_variable && (
                            <DropdownMenuItem onClick={() => setVariantManagerProduct(product)}>
                              <Layers className="h-4 w-4 mr-2" />
                              Manage Variants
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setDeleteId(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} Product(s)
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected
              product(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Variant Manager Modal */}
      <Dialog open={!!variantManagerProduct} onOpenChange={(open) => !open && setVariantManagerProduct(null)}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden sm:max-w-5xl">
          {variantManagerProduct && (
            <ProductVariantManager 
              productId={variantManagerProduct.id} 
              productName={variantManagerProduct.name} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

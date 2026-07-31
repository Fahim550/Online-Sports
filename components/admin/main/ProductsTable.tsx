"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Layers, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";

interface ProductsTableProps {
  products: any[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (product: any) => void;
  onManageVariants: (product: any) => void;
  onDelete: (id: string) => void;
}

export function ProductsTable({
  products,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onManageVariants,
  onDelete,
}: ProductsTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="px-3 py-3 w-10">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                checked={
                  products.length > 0 && selectedIds.size === products.length
                }
                onChange={onToggleSelectAll}
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
          {products.map((product) => (
            <tr
              key={product.id}
              className={`hover:bg-secondary/30 transition-colors ${
                selectedIds.has(product.id) ? "bg-accent/10" : ""
              }`}
            >
              <td className="px-3 py-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  checked={selectedIds.has(product.id)}
                  onChange={() => onToggleSelect(product.id)}
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
              <td className="px-6 py-4 text-muted-foreground">{product.sku}</td>
              <td className="px-6 py-4">
                {product.sale_price ? (
                  <div>
                    <span className="font-medium">${product.sale_price}</span>
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
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {product.is_variable && (
                      <DropdownMenuItem onClick={() => onManageVariants(product)}>
                        <Layers className="h-4 w-4 mr-2" />
                        Manage Variants
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(product.id)}
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
  );
}

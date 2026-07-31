"use client";

import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface FabricPrice {
  id: string;
  fabric_name: string;
  short_sleeve_price: number;
  long_sleeve_price: number;
}

export function FabricPricingGuide({ onClose }: { onClose: () => void }) {
  const [prices, setPrices] = useState<FabricPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPrices() {
      const { data, error } = await supabase
        .from("global_fabric_pricing")
        .select("id, fabric_name, short_sleeve_price, long_sleeve_price")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setPrices(data);
      }
      setLoading(false);
    }
    fetchPrices();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-accent" />
            <h3 className="font-extrabold text-lg text-foreground">
              Custom Jersey Pricing Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer px-3 py-1.5 rounded-lg bg-secondary transition-colors"
          >
            ✕ Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-border/60">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-secondary/90 backdrop-blur border-b border-border/60 z-10">
              <tr className="text-muted-foreground">
                <th className="py-3 px-4 font-bold">Fabric Type</th>
                <th className="py-3 px-4 font-bold text-right">
                  Short Sleeve (৳)
                </th>
                <th className="py-3 px-4 font-bold text-right">
                  Long Sleeve (৳)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">
                    Loading pricing data...
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">
                    No pricing guide available.
                  </td>
                </tr>
              ) : (
                prices.map((price) => (
                  <tr
                    key={price.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">
                      {price.fabric_name}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-accent">
                      ৳{price.short_sleeve_price}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-accent">
                      ৳{price.long_sleeve_price}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-muted-foreground text-center italic mt-4">
          Note: These base prices apply to custom jerseys based on fabric quality.
        </p>
      </div>
    </div>
  );
}

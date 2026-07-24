"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/hooks/useAuth";
import {
  useCheckoutLeadCapture,
  useConvertLead,
} from "@/hooks/useCheckoutLeads";
import { Coupon, useIncrementCouponUsage } from "@/hooks/useCoupons";
import { useCreateOrder } from "@/hooks/useOrders";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useShippingMethods } from "@/hooks/useShippingMethods";
import { trackInitiateCheckout } from "@/lib/facebook-pixel";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Home,
  Lock,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CouponInput } from "./CouponInput";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t, formatCurrency, settings } = useSiteSettings();
  const createOrder = useCreateOrder();
  const incrementCouponUsage = useIncrementCouponUsage();
  const { data: shippingMethods = [], isLoading: isLoadingMethods } =
    useShippingMethods(true);
  const { data: paymentMethods = [], isLoading: isLoadingPayments } =
    usePaymentMethods(true);
  const { debouncedSave, saveImmediately, clearLeadStorage } =
    useCheckoutLeadCapture();
  const convertLead = useConvertLead();

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [transactionId, setTransactionId] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    shippingMethodId: "",
    paymentMethodId: "",
  });

  // Set defaults when methods load
  useEffect(() => {
    if (shippingMethods.length > 0 && !formData.shippingMethodId) {
      setFormData((prev) => ({
        ...prev,
        shippingMethodId: shippingMethods[0].id,
      }));
    }
  }, [shippingMethods]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !formData.paymentMethodId) {
      setFormData((prev) => ({
        ...prev,
        paymentMethodId: paymentMethods[0].id,
      }));
    }
  }, [paymentMethods]);

  const selectedShipping = shippingMethods.find(
    (m) => m.id === formData.shippingMethodId,
  );
  const shippingCost = selectedShipping?.base_rate || 0;
  const total = subtotal - discountAmount + shippingCost;

  const selectedPayment = paymentMethods.find(
    (m) => m.id === formData.paymentMethodId,
  );

  // Calculate partial payment
  const hasPartial = selectedPayment?.allow_partial_delivery_payment || false;
  let advanceAmount = 0;
  let dueOnDelivery = total;

  if (hasPartial && selectedPayment) {
    if (selectedPayment.partial_type === "delivery_charge") {
      advanceAmount = shippingCost;
    } else if (selectedPayment.partial_type === "fixed_amount") {
      advanceAmount = Math.min(
        selectedPayment.fixed_partial_amount || 0,
        total,
      );
    }
    dueOnDelivery = total - advanceAmount;
  }

  const requiresTrxId = selectedPayment?.require_transaction_id || false;

  // Build lead data for capture
  const buildLeadData = useCallback(
    () => ({
      customer_name: formData.fullName,
      phone: formData.phone,
      email: "",
      address: formData.address,
      city: "",
      country: settings.default_country_name,
      notes: "",
      items: items.map((item) => ({
        product_id: item.productId || item.id,
        product_name: item.name,
        unit_price: item.salePrice ?? item.price,
        quantity: item.quantity,
        line_total: (item.salePrice ?? item.price) * item.quantity,
      })),
      subtotal,
      shipping_fee: shippingCost,
      total,
      currency_code: settings.currency_code,
    }),
    [formData, items, subtotal, shippingCost, total, settings.currency_code],
  );

  useEffect(() => {
    if (
      formData.phone &&
      formData.phone.trim().length >= 5 &&
      items.length > 0
    ) {
      debouncedSave(buildLeadData());
    }
  }, [formData, items, shippingCost, debouncedSave, buildLeadData]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        formData.phone &&
        formData.phone.trim().length >= 5 &&
        items.length > 0
      ) {
        saveImmediately();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData.phone, items.length, saveImmediately]);

  const handleApplyCoupon = (coupon: Coupon, discount: number) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        numItems: items.reduce((sum, item) => sum + item.quantity, 0),
        value: subtotal,
        currency: settings.currency_code,
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error(t("validation.fillRequired"));
      return;
    }

    if (items.length === 0) {
      toast.error(t("validation.cartEmpty"));
      return;
    }

    if (requiresTrxId && !transactionId.trim()) {
      toast.error("Transaction ID is required for this payment method");
      return;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

    const partialSnapshot =
      hasPartial && selectedPayment
        ? {
            partial_type: selectedPayment.partial_type,
            fixed_partial_amount: selectedPayment.fixed_partial_amount,
            advance_amount: advanceAmount,
            due_on_delivery: dueOnDelivery,
          }
        : null;

    try {
      const orderResult = await createOrder.mutateAsync({
        order: {
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          customer_email: null,
          shipping_address: formData.address,
          shipping_city: "-",
          shipping_method: selectedShipping?.name || "Standard",
          shipping_cost: shippingCost,
          payment_method: selectedPayment?.code || "cod",
          subtotal,
          total,
          status: "pending",
          notes: null,
          payment_method_id: selectedPayment?.id || null,
          payment_method_name: selectedPayment?.name || "Cash on Delivery",
          payment_status: hasPartial ? "partial_paid" : "unpaid",
          paid_amount: advanceAmount,
          due_amount: dueOnDelivery,
          transaction_id: transactionId.trim() || null,
          partial_rule_snapshot: partialSnapshot,
        },
        items: items.map((item) => {
          const productId =
            item.productId ||
            (item.id.includes("-") && item.variantId
              ? item.id.replace(`-${item.variantId}`, "")
              : item.id);
          return {
            product_id: productId,
            product_name: item.name,
            product_image: item.image,
            quantity: item.quantity,
            price: item.salePrice ?? item.price,
            variant_id: item.variantId || null,
            variant_info: item.variantInfo
              ? JSON.parse(JSON.stringify(item.variantInfo))
              : null,
          };
        }),
      });

      if (orderResult?.id) {
        convertLead.mutate(orderResult.id);
      }
      clearLeadStorage();

      if (appliedCoupon) {
        incrementCouponUsage.mutate(appliedCoupon.id);
      }

      clearCart();
      router.push(`/order-success?orderId=${orderNumber}`);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-background min-h-[75vh] flex items-center justify-center py-16">
        <div className="container-shop max-w-lg text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-secondary/80 border border-border/80 shadow-xs">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Button
            onClick={() => router.push("/shop")}
            className="bg-accent text-accent-foreground hover:opacity-90 font-bold px-8 h-11 rounded-xl text-sm"
          >
            Explore Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header Banner Section (Matching Shop & Cart Page Aesthetic) */}
      <div className="border-b border-border/60 bg-muted/20 py-6 mb-8">
        <div className="container-shop">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/cart" className="hover:text-foreground transition-colors">
              Cart
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Checkout</span>
          </nav>

          {/* Title and features badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  Checkout & Payment
                </h1>
                <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Fast Checkout
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Enter your shipping address and select payment method to complete order.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border/80 shadow-xs">
                <Lock className="h-3.5 w-3.5 text-accent" />
                <span>256-Bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border/80 shadow-xs">
                <Truck className="h-3.5 w-3.5 text-accent" />
                <span>Fast Shipping BD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shop">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Contact & Delivery Address */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-extrabold flex items-center justify-center text-sm border border-accent/20">
                    1
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-foreground flex items-center gap-2">
                      <User className="h-4 w-4 text-accent" />
                      <span>Delivery Information</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">Provide your shipping address details</p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-accent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-accent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Full Address (House, Road, Area) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter full delivery address (e.g. House #12, Road #4, Dhanmondi, Dhaka)"
                        className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-accent transition-colors resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Method Selection */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-extrabold flex items-center justify-center text-sm border border-accent/20">
                    2
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4 text-accent" />
                      <span>Shipping Method</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">Select your preferred delivery region</p>
                  </div>
                </div>

                {isLoadingMethods ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : shippingMethods.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No shipping methods available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {shippingMethods.map((method) => {
                      const isSelected = formData.shippingMethodId === method.id;
                      return (
                        <label
                          key={method.id}
                          className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-accent bg-accent/5 shadow-2xs"
                              : "border-border/80 hover:border-accent/40 bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="radio"
                              name="shippingMethodId"
                              value={method.id}
                              checked={isSelected}
                              onChange={handleChange}
                              className="w-4 h-4 text-accent accent-accent"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{method.name}</p>
                              {method.estimated_days && (
                                <p className="text-[11px] text-muted-foreground font-medium">
                                  Est: {method.estimated_days}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-black text-sm text-accent shrink-0 pl-2">
                            {formatCurrency(method.base_rate)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3: Payment Method Selection */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent font-extrabold flex items-center justify-center text-sm border border-accent/20">
                    3
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-accent" />
                      <span>Payment Method</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">Choose how you want to pay</p>
                  </div>
                </div>

                {isLoadingPayments ? (
                  <Skeleton className="h-20 w-full rounded-xl" />
                ) : paymentMethods.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No payment methods available</p>
                ) : (
                  <div className="space-y-3 pt-1">
                    {paymentMethods.map((pm) => {
                      const isSelected = formData.paymentMethodId === pm.id;
                      return (
                        <div key={pm.id} className="space-y-2">
                          <label
                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-accent bg-accent/5 shadow-2xs"
                                : "border-border/80 hover:border-accent/40 bg-background"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethodId"
                              value={pm.id}
                              checked={isSelected}
                              onChange={handleChange}
                              className="w-4 h-4 text-accent accent-accent mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-sm text-foreground">{pm.name}</p>
                                {isSelected && (
                                  <Badge className="bg-accent text-accent-foreground text-[10px] px-2 py-0">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                              {pm.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{pm.description}</p>
                              )}
                              {pm.instructions && isSelected && (
                                <div className="mt-3 p-3 bg-background border border-border/80 rounded-lg text-xs text-foreground/90 font-medium leading-relaxed">
                                  {pm.instructions}
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Required Transaction ID Input */}
                {requiresTrxId && formData.paymentMethodId && (
                  <div className="pt-2 border-t border-border/60">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Transaction / Reference ID <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter TrxID (e.g. 9J28XKL1)"
                      className="bg-background border-border/80 rounded-xl"
                      required
                    />
                  </div>
                )}

                {/* Partial Payment Rule Summary */}
                {hasPartial && formData.paymentMethodId && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl space-y-2">
                    <h3 className="font-bold text-xs text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Partial Payment Option</span>
                    </h3>
                    <div className="flex justify-between text-xs font-medium text-foreground">
                      <span>Advance Pay Now:</span>
                      <span className="font-bold text-accent">{formatCurrency(advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Due on Delivery:</span>
                      <span className="font-bold text-foreground">{formatCurrency(dueOnDelivery)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs sticky top-24 space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <h2 className="font-extrabold text-base text-foreground flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-accent" />
                    <span>Order Summary</span>
                  </h2>
                  <Badge className="bg-secondary text-foreground text-xs font-bold">
                    {items.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </Badge>
                </div>

                {/* Mini Item List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {items.map((item) => {
                    const price = item.salePrice ?? item.price;
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0 relative border border-border/60">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium">
                            Qty: {item.quantity} × {formatCurrency(price)}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-foreground shrink-0">
                          {formatCurrency(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <hr className="border-border/60" />

                {/* Coupon Input Component */}
                <CouponInput
                  subtotal={subtotal}
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  appliedCoupon={appliedCoupon}
                  discountAmount={discountAmount}
                />

                <hr className="border-border/60" />

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-accent font-bold">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Fee ({selectedShipping?.name || "Standard"})</span>
                    <span className="font-bold text-foreground">{formatCurrency(shippingCost)}</span>
                  </div>
                </div>

                <hr className="border-border/60" />

                {/* Total */}
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="block font-extrabold text-sm text-foreground">Total Payable</span>
                    <span className="text-[11px] text-muted-foreground font-medium">Includes shipping & taxes</span>
                  </div>
                  <span className="text-2xl font-black tracking-tight text-accent">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Partial breakdown if active */}
                {hasPartial && (
                  <div className="p-3 bg-secondary/50 rounded-xl space-y-1 text-[11px] font-medium border border-border/60">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Advance Pay Now:</span>
                      <span className="font-bold text-accent">{formatCurrency(advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Due on Delivery:</span>
                      <span className="font-bold text-foreground">{formatCurrency(dueOnDelivery)}</span>
                    </div>
                  </div>
                )}

                {/* Place Order CTA Button */}
                <Button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="w-full bg-accent text-accent-foreground hover:opacity-90 font-extrabold h-12 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {createOrder.isPending ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Complete Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Guarantees */}
                <div className="pt-2 border-t border-border/60 space-y-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>Safe & secure order placement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>Order confirmation sent instantly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

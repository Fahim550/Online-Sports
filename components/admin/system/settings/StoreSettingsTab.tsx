import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Mail,
    MapPin,
    Megaphone,
    Phone,
    Save,
    Share2,
    Store,
} from "lucide-react";

interface StoreData {
  store_name: string;
  store_logo: string;
  store_favicon: string;
  store_tagline: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_postal_code: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  whatsapp_number: string;
  whatsapp_order_enabled: string;
  footer_text: string;
  topbar_text: string;
  topbar_enabled: string;
  // WhatsApp Banner
  whatsapp_banner_enabled: string;
  whatsapp_banner_title: string;
}

interface Props {
  storeData: StoreData;
  setStoreData: (data: StoreData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function StoreSettingsTab({
  storeData,
  setStoreData,
  onSubmit,
  isPending,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Store Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Store Information</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Store Logo</label>
            <ImageUpload
              value={storeData.store_logo}
              onChange={(url) => setStoreData({ ...storeData, store_logo: url })}
              folder="branding"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Favicon</label>
            <ImageUpload
              value={storeData.store_favicon}
              onChange={(url) =>
                setStoreData({ ...storeData, store_favicon: url })
              }
              folder="branding"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 32×32 or 64×64 PNG/ICO. This icon appears in browser
              tabs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={storeData.store_name}
                onChange={(e) =>
                  setStoreData({ ...storeData, store_name: e.target.value })
                }
                className="input-shop"
                placeholder="My Store"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={storeData.store_tagline}
                onChange={(e) =>
                  setStoreData({ ...storeData, store_tagline: e.target.value })
                }
                className="input-shop"
                placeholder="Your one-stop shop"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Footer Text
            </label>
            <input
              type="text"
              value={storeData.footer_text}
              onChange={(e) =>
                setStoreData({ ...storeData, footer_text: e.target.value })
              }
              className="input-shop"
              placeholder="© 2024 My Store. All rights reserved."
            />
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Top Bar / Announcement</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="text-sm font-medium">Enable Top Bar</label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show an announcement bar above the header
              </p>
            </div>
            <Switch
              checked={storeData.topbar_enabled === "true"}
              onCheckedChange={(checked) =>
                setStoreData({
                  ...storeData,
                  topbar_enabled: checked ? "true" : "false",
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Top Bar Text
            </label>
            <input
              type="text"
              value={storeData.topbar_text}
              onChange={(e) =>
                setStoreData({ ...storeData, topbar_text: e.target.value })
              }
              className="input-shop"
              placeholder="Free Shipping on Orders Over ৳500!"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Background color uses your Primary brand color from Theme settings
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Contact Information</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={storeData.store_email}
                onChange={(e) =>
                  setStoreData({ ...storeData, store_email: e.target.value })
                }
                className="input-shop"
                placeholder="contact@mystore.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={storeData.store_phone}
                onChange={(e) =>
                  setStoreData({ ...storeData, store_phone: e.target.value })
                }
                className="input-shop"
                placeholder="+880 1234 567890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Street Address
            </label>
            <input
              type="text"
              value={storeData.store_address}
              onChange={(e) =>
                setStoreData({ ...storeData, store_address: e.target.value })
              }
              className="input-shop"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={storeData.store_city}
                onChange={(e) =>
                  setStoreData({ ...storeData, store_city: e.target.value })
                }
                className="input-shop"
                placeholder="Dhaka"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={storeData.store_postal_code}
                onChange={(e) =>
                  setStoreData({
                    ...storeData,
                    store_postal_code: e.target.value,
                  })
                }
                className="input-shop"
                placeholder="1205"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Social Media & Messaging</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Facebook URL
            </label>
            <input
              type="url"
              value={storeData.facebook_url}
              onChange={(e) =>
                setStoreData({ ...storeData, facebook_url: e.target.value })
              }
              className="input-shop"
              placeholder="https://facebook.com/yourstore"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Instagram URL
            </label>
            <input
              type="url"
              value={storeData.instagram_url}
              onChange={(e) =>
                setStoreData({ ...storeData, instagram_url: e.target.value })
              }
              className="input-shop"
              placeholder="https://instagram.com/yourstore"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Twitter / X URL
            </label>
            <input
              type="url"
              value={storeData.twitter_url}
              onChange={(e) =>
                setStoreData({ ...storeData, twitter_url: e.target.value })
              }
              className="input-shop"
              placeholder="https://twitter.com/yourstore"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={storeData.youtube_url}
              onChange={(e) =>
                setStoreData({ ...storeData, youtube_url: e.target.value })
              }
              className="input-shop"
              placeholder="https://youtube.com/@yourstore"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={storeData.whatsapp_number}
              onChange={(e) =>
                setStoreData({ ...storeData, whatsapp_number: e.target.value })
              }
              className="input-shop"
              placeholder="+880 1234 567890"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include country code for WhatsApp click-to-chat
            </p>
          </div>
          <div className="md:col-span-2 flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="text-sm font-medium">
                Order on WhatsApp Button
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show "Order on WhatsApp" button on product pages
              </p>
            </div>
            <Switch
              checked={storeData.whatsapp_order_enabled === "true"}
              onCheckedChange={(checked) =>
                setStoreData({
                  ...storeData,
                  whatsapp_order_enabled: checked ? "true" : "false",
                })
              }
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Banner Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">WhatsApp Banner</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Home page, Shop page এবং Product details page এ footer এর উপরে একটি WhatsApp banner দেখাবে।
        </p>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="text-sm font-medium">WhatsApp Banner সক্রিয় করুন</label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Banner চালু/বন্ধ করুন
              </p>
            </div>
            <Switch
              checked={storeData.whatsapp_banner_enabled === "true"}
              onCheckedChange={(checked) =>
                setStoreData({
                  ...storeData,
                  whatsapp_banner_enabled: checked ? "true" : "false",
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Banner Title
            </label>
            <input
              type="text"
              value={storeData.whatsapp_banner_title}
              onChange={(e) =>
                setStoreData({ ...storeData, whatsapp_banner_title: e.target.value })
              }
              className="input-shop"
              placeholder="Have questions? Chat with us on WhatsApp!"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Banner এ দেখানো title লিখুন
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/60">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> Banner এ WhatsApp number হিসেবে উপরের Social Links এ দেওয়া WhatsApp Number ব্যবহার হবে।
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="btn-accent" disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Saving..." : "Save Store Settings"}
        </Button>
      </div>
    </form>
  );
}

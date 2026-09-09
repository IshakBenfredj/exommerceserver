import mongoose from "mongoose";

const { Schema } = mongoose;

const WilayaShippingSchema = new Schema(
  {
    code: { type: Number, required: true },
    name_ar: { type: String, default: "" },
    name_fr: { type: String, default: "" },
    tarif_domicile: { type: Number, default: 700 },
    tarif_bureau: { type: Number, default: 400 },
    name: { type: String, default: "" },
    home: { type: Number, default: 700 },
    desk: { type: Number, default: 400 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const BannerSchema = new Schema(
  {
    id: { type: String, default: () => `banner-${Date.now()}` },
    image_url: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    badge: { type: String, default: "" },
    link: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    cta_text: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const StoreSettingsSchema = new Schema(
  {
    store_name: { type: String, default: "المتجر الجزائري الحديث" },
    phone: { type: String, default: "0541790205" },
    whatsapp: { type: String, default: "213541790205" },
    email: { type: String, default: "contact@algerianstore.dz" },
    address: { type: String, default: "الجزائر العاصمة، الجزائر" },
    currency: { type: String, default: "DZD" },

    // Branding & Theme Customization
    logo_url: { type: String, default: "" },
    theme_name: { type: String, default: "midnight" },
    custom_colors: {
      primary: { type: String, default: "#1C1B1F" },
      secondary: { type: String, default: "#5C6AC4" },
      accent: { type: String, default: "#5C6AC4" },
    },

    // Hero & Banners Customization
    hero_variant: { type: String, default: "editorial-bento" },
    hero_title: {
      type: String,
      default: "تسوق أفضل المنتجات مع توصيل سريع لـ 69 ولاية",
    },
    hero_subtitle: {
      type: String,
      default: "دفع آمن عند الاستلام، ضمان الجودة، وخدمة عملاء على مدار الساعة",
    },
    hero_badge: { type: String, default: "🔥 عروض وتخفيضات كبرى" },
    hero_cta_text: { type: String, default: "تسوق الآن" },
    hero_image_url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
    },

    free_shipping_threshold: { type: Number, default: 10000 },
    default_desk_shipping_cost: { type: Number, default: 400 },
    default_home_shipping_cost: { type: Number, default: 700 },
    maintenance_mode: { type: Boolean, default: false },
    maintenance_message: {
      type: String,
      default:
        "المتجر في وضع صيانة وتحديث مؤقت. سنعود للعمل قريباً جداً لاستقبال طلباتكم!",
    },
    maintenance_expected_return: { type: String, default: "قريباً" },
    social_facebook: { type: String, default: "https://facebook.com" },
    social_instagram: { type: String, default: "https://instagram.com" },
    social_tiktok: { type: String, default: "https://tiktok.com" },
    wilayas_shipping: [WilayaShippingSchema],
    banners: [BannerSchema],
    default_language: { type: String, default: "ar" },
  },
  { timestamps: true },
);

export const StoreSettings = mongoose.model(
  "StoreSettings",
  StoreSettingsSchema,
);

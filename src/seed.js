import mongoose from "mongoose";
import dotenv from "dotenv";
import { StoreSettings } from "./models/StoreSettings.js";
import { Category } from "./models/Category.js";
import { Product } from "./models/Product.js";
import { Coupon } from "./models/Coupon.js";
import { Review } from "./models/Review.js";
import { Order } from "./models/Order.js";
import { Banner } from "./models/Banner.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecommerce";

const WILAYAS_DATA = [
  {
    id: 1,
    name: "أدرار - Adrar",
    code: "01",
    home: 900,
    desk: 500,
    active: true,
  },
  {
    id: 2,
    name: "الشلف - Chlef",
    code: "02",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 3,
    name: "الأغواط - Laghouat",
    code: "03",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 4,
    name: "أم البواقي - Oum El Bouaghi",
    code: "04",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 5,
    name: "باتنة - Batna",
    code: "05",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 6,
    name: "بجاية - Béjaïa",
    code: "06",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 7,
    name: "بسكرة - Biskra",
    code: "07",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 8,
    name: "بشار - Béchar",
    code: "08",
    home: 900,
    desk: 500,
    active: true,
  },
  {
    id: 9,
    name: "البليدة - Blida",
    code: "09",
    home: 550,
    desk: 300,
    active: true,
  },
  {
    id: 10,
    name: "البويرة - Bouira",
    code: "10",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 11,
    name: "تمنراست - Tamanrasset",
    code: "11",
    home: 1200,
    desk: 700,
    active: true,
  },
  {
    id: 12,
    name: "تبسة - Tébessa",
    code: "12",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 13,
    name: "تلمسان - Tlemcen",
    code: "13",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 14,
    name: "تيارت - Tiaret",
    code: "14",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 15,
    name: "تيزي وزو - Tizi Ouzou",
    code: "15",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 16,
    name: "الجزائر العاصمة - Alger",
    code: "16",
    home: 450,
    desk: 250,
    active: true,
  },
  {
    id: 17,
    name: "الجلفة - Djelfa",
    code: "17",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 18,
    name: "جيجل - Jijel",
    code: "18",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 19,
    name: "سطيف - Sétif",
    code: "19",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 20,
    name: "سعيدة - Saïda",
    code: "20",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 21,
    name: "سكيكدة - Skikda",
    code: "21",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 22,
    name: "سيدي بلعباس - Sidi Bel Abbès",
    code: "22",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 23,
    name: "عنابة - Annaba",
    code: "23",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 24,
    name: "قالمة - Guelma",
    code: "24",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 25,
    name: "قسنطينة - Constantine",
    code: "25",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 26,
    name: "المدية - Médéa",
    code: "26",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 27,
    name: "مستغانم - Mostaganem",
    code: "27",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 28,
    name: "المسيلة - M'Sila",
    code: "28",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 29,
    name: "معسكر - Mascara",
    code: "29",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 30,
    name: "ورقلة - Ouargla",
    code: "30",
    home: 850,
    desk: 450,
    active: true,
  },
  {
    id: 31,
    name: "وهران - Oran",
    code: "31",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 32,
    name: "البيض - El Bayadh",
    code: "32",
    home: 850,
    desk: 450,
    active: true,
  },
  {
    id: 33,
    name: "إليزي - Illizi",
    code: "33",
    home: 1200,
    desk: 700,
    active: true,
  },
  {
    id: 34,
    name: "برج بوعريريج - Bordj Bou Arreridj",
    code: "34",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 35,
    name: "بومرداس - Boumerdès",
    code: "35",
    home: 550,
    desk: 300,
    active: true,
  },
  {
    id: 36,
    name: "الطارف - El Tarf",
    code: "36",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 37,
    name: "تندوف - Tindouf",
    code: "37",
    home: 1200,
    desk: 700,
    active: true,
  },
  {
    id: 38,
    name: "تسمسيلت - Tissemsilt",
    code: "38",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 39,
    name: "الوادي - El Oued",
    code: "39",
    home: 800,
    desk: 450,
    active: true,
  },
  {
    id: 40,
    name: "خنشلة - Khenchela",
    code: "40",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 41,
    name: "سوق أهراس - Souk Ahras",
    code: "41",
    home: 750,
    desk: 400,
    active: true,
  },
  {
    id: 42,
    name: "تيبازة - Tipaza",
    code: "42",
    home: 550,
    desk: 300,
    active: true,
  },
  {
    id: 43,
    name: "ميلة - Mila",
    code: "43",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 44,
    name: "عين الدفلى - Aïn Defla",
    code: "44",
    home: 650,
    desk: 350,
    active: true,
  },
  {
    id: 45,
    name: "النعامة - Naâma",
    code: "45",
    home: 850,
    desk: 450,
    active: true,
  },
  {
    id: 46,
    name: "عين تموشنت - Aïn Témouchent",
    code: "46",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 47,
    name: "غرداية - Ghardaïa",
    code: "47",
    home: 800,
    desk: 450,
    active: true,
  },
  {
    id: 48,
    name: "غليزان - Relizane",
    code: "48",
    home: 700,
    desk: 400,
    active: true,
  },
  {
    id: 49,
    name: "تيميمون - Timimoun",
    code: "49",
    home: 1000,
    desk: 600,
    active: true,
  },
  {
    id: 50,
    name: "برج باجي مختار - Bordj Badji Mokhtar",
    code: "50",
    home: 1300,
    desk: 800,
    active: true,
  },
  {
    id: 51,
    name: "أولاد جلال - Ouled Djellal",
    code: "51",
    home: 800,
    desk: 450,
    active: true,
  },
  {
    id: 52,
    name: "بني عباس - Béni Abbès",
    code: "52",
    home: 1000,
    desk: 600,
    active: true,
  },
  {
    id: 53,
    name: "عين صالح - In Salah",
    code: "53",
    home: 1100,
    desk: 650,
    active: true,
  },
  {
    id: 54,
    name: "عين قزام - In Guezzam",
    code: "54",
    home: 1300,
    desk: 800,
    active: true,
  },
  {
    id: 55,
    name: "تقرت - Touggourt",
    code: "55",
    home: 850,
    desk: 450,
    active: true,
  },
  {
    id: 56,
    name: "جانت - Djanet",
    code: "56",
    home: 1300,
    desk: 800,
    active: true,
  },
  {
    id: 57,
    name: "المغير - El M'Ghair",
    code: "57",
    home: 850,
    desk: 450,
    active: true,
  },
  {
    id: 58,
    name: "المنيعة - El Meniaa",
    code: "58",
    home: 900,
    desk: 500,
    active: true,
  },
];

async function seed() {
  try {
    console.log(`⏳ Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Seed Store Settings
    console.log("⚙️ Seeding Store Settings...");
    await StoreSettings.deleteMany({});
    await StoreSettings.create({
      store_name: "المتجر الجزائري الحديث",
      phone: "0541790205",
      whatsapp: "213541790205",
      email: "contact@algerianstore.dz",
      address: "الجزائر العاصمة، الجزائر",
      currency: "DZD",
      hero_title: "تسوق أفضل المنتجات مع توصيل سريع لـ 69 ولاية",
      hero_subtitle:
        "دفع آمن عند الاستلام، ضمان الجودة، وخدمة عملاء على مدار الساعة",
      free_shipping_threshold: 10000,
      default_desk_shipping_cost: 400,
      default_home_shipping_cost: 700,
      maintenance_mode: false,
      maintenance_message:
        "المتجر في وضع صيانة وتحديث مؤقت. سنعود للعمل قريباً جداً لاستقبال طلباتكم!",
      maintenance_expected_return: "قريباً",
      social_facebook: "https://facebook.com",
      social_instagram: "https://instagram.com",
      social_tiktok: "https://tiktok.com",
      wilayas_shipping: WILAYAS_DATA,
      banners: [
        {
          id: "banner-1",
          image_url:
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80",
          title: "تخفيضات كبرى وعروض حصرية 2026",
          subtitle: "توصيل سريع لكافة الـ 69 ولاية مع الدفع الآمن عند الاستلام",
          badge: "🔥 أقوى العروض",
          link: "/products",
          active: true,
        },
        {
          id: "banner-2",
          image_url:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80",
          title: "تشكيلة الساعات الذكية Ultra المقاومة للماء",
          subtitle: "شاشة AMOLED عالية الدقة وبطارية تدوم 7 أيام مع ضمان أصلي",
          badge: "⚡ الأكثر مبيعاً",
          link: "/category/electronics",
          active: true,
        },
        {
          id: "banner-3",
          image_url:
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=80",
          title: "عطور شرقية وفرنسية أصلية فاخرة",
          subtitle: "ثبات عالي يدوم طويلاً مع تركيز أو دو بارفان مميز",
          badge: "✨ تشكيلة ملكية",
          link: "/category/perfumes-cosmetics",
          active: true,
        },
        {
          id: "banner-4",
          image_url:
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1400&q=80",
          title: "سماعات بلوتوث لاسلكية Pro بعزل الضوضاء ANC",
          subtitle: "صوت نقي ثلاثي الأبعاد ومكالمات فائقة الوضوح طوال اليوم",
          badge: "🎧 تكنولوجيا متطورة",
          link: "/category/electronics",
          active: true,
        },
        {
          id: "banner-5",
          image_url:
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80",
          title: "أحدث تجهيزات وأجهزة المطبخ الذكي",
          subtitle: "مفرمة وخلاطات فولاذية إينوكس تجعل الطهي أسهل وأسرع",
          badge: "🍳 جودة مضمونة",
          link: "/category/home-kitchen",
          active: true,
        },
      ],
    });

    // 1.1 Seed Standalone Banners Collection
    console.log("🎨 Seeding Banners Collection...");
    await Banner.deleteMany({});
    await Banner.insertMany([
      {
        title: "تخفيضات كبرى وعروض حصرية 2026",
        subtitle: "توصيل سريع لكافة الـ 69 ولاية مع الدفع الآمن عند الاستلام",
        badge: "🔥 أقوى العروض",
        link: "/products",
        image_url:
          "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80",
        cta_text: "تسوق الآن",
        active: true,
        order: 1,
      },
      {
        title: "تشكيلة الساعات الذكية Ultra المقاومة للماء",
        subtitle: "شاشة AMOLED عالية الدقة وبطارية تدوم 7 أيام مع ضمان أصلي",
        badge: "⚡ الأكثر مبيعاً",
        link: "/category/electronics",
        image_url:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80",
        cta_text: "اكتشف المجموعة",
        active: true,
        order: 2,
      },
      {
        title: "عطور شرقية وفرنسية أصلية فاخرة",
        subtitle: "ثبات عالي يدوم طويلاً مع تركيز أو دو بارفان مميز",
        badge: "✨ تشكيلة ملكية",
        link: "/category/perfumes-cosmetics",
        image_url:
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=80",
        cta_text: "اختر عطرك",
        active: true,
        order: 3,
      },
      {
        title: "سماعات بلوتوث لاسلكية Pro بعزل الضوضاء ANC",
        subtitle: "صوت نقي ثلاثي الأبعاد ومكالمات فائقة الوضوح طوال اليوم",
        badge: "🎧 تكنولوجيا متطورة",
        link: "/category/electronics",
        image_url:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1400&q=80",
        cta_text: "اطلب الآن",
        active: true,
        order: 4,
      },
      {
        title: "أحدث تجهيزات وأجهزة المطبخ الذكي",
        subtitle: "مفرمة وخلاطات فولاذية إينوكس تجعل الطهي أسهل وأسرع",
        badge: "🍳 جودة مضمونة",
        link: "/category/home-kitchen",
        image_url:
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80",
        cta_text: "تسوق للمطبخ",
        active: true,
        order: 5,
      },
    ]);

    // 2. Seed Categories
    console.log("📦 Seeding Categories...");
    await Category.deleteMany({});
    const categoriesData = [
      {
        name_ar: "إلكترونيات وأجهزة ذكية",
        name_fr: "Électronique & High-Tech",
        slug: "electronics",
        description:
          "أحدث الهواتف، الساعات الذكية، السماعات وملحقاتها بأسعار مميزة",
        image_url:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        icon: "laptop",
        display_order: 1,
        is_active: true,
      },
      {
        name_ar: "ساعات وإكسسوارات فاخرة",
        name_fr: "Montres & Accessoires de Luxe",
        slug: "watches-accessories",
        description: "ساعات رجالية ونسائية أنيقة، نظارات، ومحافظ جلدية أصلية",
        image_url:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        icon: "watch",
        display_order: 2,
        is_active: true,
      },
      {
        name_ar: "عطور ومستحضرات تجميل",
        name_fr: "Parfums & Cosmétiques",
        slug: "perfumes-cosmetics",
        description: "عطور شرقية وفرنسية أصلية 100% بثبات يدوم طويلاً",
        image_url:
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
        icon: "sparkles",
        display_order: 3,
        is_active: true,
      },
      {
        name_ar: "الصحة والجمال والعناية",
        name_fr: "Santé & Soins Personnels",
        slug: "beauty",
        description: "منتجات العناية بالبشرة، ماكينات الحلاقة وأجهزة التصفيف",
        image_url:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        icon: "heart",
        display_order: 4,
        is_active: true,
      },
      {
        name_ar: "المنزل والمطبخ العصري",
        name_fr: "Maison & Cuisine Moderne",
        slug: "home-kitchen",
        description: "أدوات منزلية ومطابخ ذكية لتسهيل حياتك اليومية بأعلى جودة",
        image_url:
          "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
        icon: "home",
        display_order: 5,
        is_active: true,
      },
      {
        name_ar: "حقائب وأزياء راقية",
        name_fr: "Mode & Maroquinerie",
        slug: "fashion-bags",
        description: "حقائب جلد طبيعي وإكسسوارات أنيقة وعصرية",
        image_url:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
        icon: "briefcase",
        display_order: 6,
        is_active: true,
      },
    ];

    const insertedCategories = await Category.insertMany(categoriesData);
    const catMap = new Map(insertedCategories.map((c) => [c.slug, c._id]));

    // 3. Seed Products
    console.log("🛍️ Seeding Products...");
    await Product.deleteMany({});
    const productsData = [
      {
        name_ar: "ساعة ذكية Ultra Smart Watch مقاومة للماء مع شاحن لاسلكي",
        name_fr: "Montre Connectée Ultra Pro Étanche",
        slug: "ultra-smart-watch-series-8",
        description_ar:
          "ساعة ذكية متطورة مزودة بشاشة AMOLED عالية الدقة، قياس نبضات القلب ونسبة الأكسجين، دعم المكالمات عبر البلوتوث وبطارية تدوم حتى 7 أيام.",
        price: 4900,
        compare_at_price: 6800,
        cost_price: 2800,
        sku: "WAT-ULTRA-01",
        stock_quantity: 45,
        category_id: catMap.get("electronics"),
        category_slug: "electronics",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: true,
        is_active: true,
        rating: 4.9,
        reviews_count: 28,
        colors: ["أسود بريميوم", "فضي تيتانيوم", "برتقالي رياضي"],
        sizes: ["49mm"],
        features: [
          "شاشة AMOLED لمس",
          "مقاومة الماء IP68",
          "إجراء واستقبال المكالمات",
          "تتبع اللياقة والنوم",
        ],
      },
      {
        name_ar: "سماعات بلوتوث لاسلكية Pro عازلة للضوضاء النشطة ANC",
        name_fr: "Écouteurs Sans Fil Pro ANC",
        slug: "wireless-earbuds-pro-anc",
        description_ar:
          "سماعات لاسلكية توفر صوتاً نقياً ثلاثي الأبعاد مع خاصية عزل الضوضاء النشط ANC، وميكروفون فائق الوضوح للمكالمات.",
        price: 3500,
        compare_at_price: 4900,
        cost_price: 1900,
        sku: "AUD-EAR-02",
        stock_quantity: 60,
        category_id: catMap.get("electronics"),
        category_slug: "electronics",
        images: [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: true,
        is_active: true,
        rating: 4.8,
        reviews_count: 42,
        colors: ["أبيض لؤلؤي", "أسود مطفي"],
        features: [
          "عزل الضوضاء ANC",
          "بطارية 30 ساعة مع العلبة",
          "صوت نقي Hi-Fi",
        ],
      },
      {
        name_ar: "قاعدة شحن لاسلكي سريع 3 في 1 للهاتف والساعة والسماعات",
        name_fr: "Station de Charge Sans Fil Rapide 3-en-1",
        slug: "fast-wireless-charger-3in1",
        description_ar:
          "محطة شحن مغناطيسية لاسلكية سريعة بقوة 15 واط تشحن هاتفك الذكي وساعتك وسماعاتك في وقت واحد بتصميم أنيق وموفر للمساحة.",
        price: 2900,
        compare_at_price: 4200,
        cost_price: 1400,
        sku: "ELC-CHG-03",
        stock_quantity: 40,
        category_id: catMap.get("electronics"),
        category_slug: "electronics",
        images: [
          "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: false,
        is_active: true,
        rating: 4.7,
        reviews_count: 14,
        colors: ["أسود أنيق", "أبيض عصري"],
        features: [
          "شحن سريع 15W",
          "شحن 3 أجهزة في وقت واحد",
          "حماية ضد الحرارة والجهد الزائد",
        ],
      },
      {
        name_ar: "ساعة يد رجالية كوارتز فاخرة ستانلس ستيل مع علبة هدايا",
        name_fr: "Montre Homme Luxe Quartz Acier Inoxydable",
        slug: "luxury-mens-quartz-watch",
        description_ar:
          "ساعة يد كلاسيكية فاخرة بهيكل من الفولاذ المقاوم للصدأ وميناء مقاوم للخدش مع عرض التاريخ، مثالية للمناسبات والإهداء.",
        price: 5500,
        compare_at_price: 7500,
        cost_price: 2900,
        sku: "WAT-LUX-04",
        stock_quantity: 30,
        category_id: catMap.get("watches-accessories"),
        category_slug: "watches-accessories",
        images: [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: true,
        is_active: true,
        rating: 4.9,
        reviews_count: 31,
        colors: ["فضي مع أزرق", "ذهبي ملكي", "أسود كربوني"],
        features: [
          "فولاذ مقاوم للصدأ 316L",
          "زجاج ياقوتي مضاد للخدش",
          "مقاومة للماء حتى عمق 30 متر",
          "علبة هدايا فخمة مرفقة",
        ],
      },
      {
        name_ar: "محفظة جلدية أصلية فاخرة مضادة لسرقة البطاقات RFID",
        name_fr: "Portefeuille Homme Cuir Véritable Anti-RFID",
        slug: "luxury-leather-wallet-rfid",
        description_ar:
          "محفظة نقود وبطاقات رجالية مصنوعة من الجلد الطبيعي 100% بتصميم نحيف وأنيق مع تقنية حماية البيانات RFID.",
        price: 2400,
        compare_at_price: 3500,
        cost_price: 1100,
        sku: "ACC-WAL-05",
        stock_quantity: 50,
        category_id: catMap.get("watches-accessories"),
        category_slug: "watches-accessories",
        images: [
          "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: false,
        is_active: true,
        rating: 4.8,
        reviews_count: 22,
        colors: ["بني كلاسيكي", "أسود فاخر", "بني كحلي"],
        features: [
          "جلد طبيعي 100%",
          "حماية RFID لمنع سرقة البطاقات",
          "تتسع لـ 10 بطاقات ونقود ورقية",
        ],
      },
      {
        name_ar: "عطر العود الملكي الفاخر للجنسين ثبات فائق 100 مل",
        name_fr: "Parfum de Luxe Royal Oud 100ml",
        slug: "royal-french-perfume-100ml",
        description_ar:
          "مزيج ساحر من دهن العود الفاخر والزعفران والورود الدمشقية مع لمسات العنبر والمسك، ثبات استثنائي يدوم لأكثر من 48 ساعة.",
        price: 4200,
        compare_at_price: 6000,
        cost_price: 2100,
        sku: "PRF-OUD-06",
        stock_quantity: 35,
        category_id: catMap.get("perfumes-cosmetics"),
        category_slug: "perfumes-cosmetics",
        images: [
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: true,
        is_active: true,
        rating: 5.0,
        reviews_count: 48,
        sizes: ["100ml"],
        features: [
          "تركيز أو دو بارفان Eau de Parfum",
          "ثبات يدوم 48 ساعة",
          "مناسب للرجال والنساء",
        ],
      },
      {
        name_ar: "ماكينة حلاقة وتشذيب احترافية قابلة لإعادة الشحن 3 في 1",
        name_fr: "Tondeuse à Barbe Professionnelle 3 en 1",
        slug: "professional-beard-trimmer-3in1",
        description_ar:
          "ماكينة حلاقة كهربائية احترافية بشفرات تيتانيوم حادة ومحرك قوي سريع، مناسبة للرجال وتعمل بدون سلك لمدة ساعتين.",
        price: 3200,
        compare_at_price: 4500,
        cost_price: 1700,
        sku: "BEA-TRIM-07",
        stock_quantity: 35,
        category_id: catMap.get("beauty"),
        category_slug: "beauty",
        images: [
          "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: true,
        is_active: true,
        rating: 4.7,
        reviews_count: 19,
        colors: ["ذهبي ملكي", "برونزي"],
        features: [
          "شفرات فولاذية مضادة للصدأ",
          "بطارية ليثيوم شحن سريع",
          "4 رؤوس تدريج",
        ],
      },
      {
        name_ar: "فرشاة ومصفف الشعر الحراري الاحترافي بتقنية الأيونات",
        name_fr: "Brosse Soufflante Lissante Professionnelle",
        slug: "hair-curler-brush-negative-ions",
        description_ar:
          "مصفف شعر حراري متطور 2 في 1 يجفف ويفرد الشعر في دقائق بتقنية السيراميك والتورمالين التي تحافظ على لمعان الشعر وتمنع تطايره.",
        price: 3800,
        compare_at_price: 5200,
        cost_price: 2000,
        sku: "BEA-BRS-08",
        stock_quantity: 40,
        category_id: catMap.get("beauty"),
        category_slug: "beauty",
        images: [
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: false,
        is_active: true,
        rating: 4.8,
        reviews_count: 26,
        colors: ["أسود مع وردي ذهبي"],
        features: [
          "تقنية الأيونات لحماية الشعر",
          "3 درجات حرارة قابلة للتعديل",
          "سلك دوار 360 درجة",
        ],
      },
      {
        name_ar: "خلاط ومفرمة كهربائية متعددة الاستخدامات 2 لتر إينوكس",
        name_fr: "Robot Hachoir Multifonction Inox 2L",
        slug: "kitchen-chopper-food-processor-2l",
        description_ar:
          "مفرمة لحم وخضار قوية بسعة 2 لتر ووعاء من الإينوكس المقاوم للصدأ مع 4 شفرات فولاذية لمزج وفرم سريع ومثالي.",
        price: 4200,
        compare_at_price: 5800,
        cost_price: 2400,
        sku: "HOM-CHOP-09",
        stock_quantity: 25,
        category_id: catMap.get("home-kitchen"),
        category_slug: "home-kitchen",
        images: [
          "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: false,
        is_active: true,
        rating: 4.9,
        reviews_count: 15,
        features: [
          "وعاء إينوكس 2 لتر",
          "قوة 500 واط",
          "سرعتين مختلفتين",
          "سهل التنظيف",
        ],
      },
      {
        name_ar: "حقيبة يد وكتف رجالية كلاسيكية من الجلد الطبيعي",
        name_fr: "Sacoche Bandoulière Homme en Cuir",
        slug: "leather-crossbody-bag-men",
        description_ar:
          "حقيبة رجالية مريحة وعملية مصنوعة من أجود أنواع الجلد الطبيعي، مزودة بعدة جيوب لحمل الهاتف والمحفظة والمستندات اليومية.",
        price: 3600,
        compare_at_price: 4900,
        cost_price: 1800,
        sku: "BAG-CRB-10",
        stock_quantity: 30,
        category_id: catMap.get("fashion-bags"),
        category_slug: "fashion-bags",
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
        ],
        is_featured: false,
        is_active: true,
        rating: 4.8,
        reviews_count: 18,
        colors: ["بني عسلي", "أسود فاخر"],
        features: [
          "جلد طبيعي متين",
          "حزام كتف قابل للتعديل",
          "جيوب متعددة بسحاب آمن",
        ],
      },
    ];

    await Product.insertMany(productsData);

    // 4. Seed Coupons
    console.log("🎟️ Seeding Coupons...");
    await Coupon.deleteMany({});
    await Coupon.insertMany([
      {
        code: "WELCOME10",
        discount_type: "percentage",
        discount_value: 10,
        min_order_amount: 3000,
        max_discount_amount: 1500,
        is_active: true,
      },
      {
        code: "DZ2026",
        discount_type: "fixed",
        discount_value: 500,
        min_order_amount: 5000,
        is_active: true,
      },
    ]);

    // 5. Seed Reviews
    console.log("⭐ Seeding Reviews...");
    await Review.deleteMany({});
    await Review.insertMany([
      {
        product_slug: "ultra-smart-watch-series-8",
        customer_name: "كريم بن علي",
        rating: 5,
        comment:
          "منتج ممتاز جداً وجودة التصنيع رائعة.. التوصيل كان سريعاً في يومين إلى وهران. شكراً لكم!",
        wilaya_name: "وهران",
        is_approved: true,
        is_verified_purchase: true,
      },
      {
        product_slug: "ultra-smart-watch-series-8",
        customer_name: "سمير قسنطيني",
        rating: 5,
        comment: "الساعة خفيفة وبطاريتها تشد أكثر من 4 أيام. أنصح بها بشدة.",
        wilaya_name: "قسنطينة",
        is_approved: true,
        is_verified_purchase: true,
      },
      {
        product_slug: "wireless-earbuds-pro-anc",
        customer_name: "محمد الأمين",
        rating: 5,
        comment: "صوت نقي والباس قوي جداً.. العزل شغال 10/10.",
        wilaya_name: "الجزائر العاصمة",
        is_approved: true,
        is_verified_purchase: true,
      },
    ]);

    // 6. Seed Sample Orders
    console.log("📦 Seeding Sample Orders...");
    await Order.deleteMany({});
    await Order.insertMany([
      {
        order_number: "DZ-8821",
        customer_name: "أحمد بلقاسم",
        customer_phone: "0555123456",
        wilaya_id: 16,
        wilaya_name: "الجزائر العاصمة - Alger",
        commune: "باب الزوار",
        address: "حي 8 ماي 1945 عمارة ب",
        shipping_type: "home",
        shipping_cost: 450,
        subtotal: 4900,
        discount: 0,
        total_amount: 5350,
        status: "pending",
        notes: "يرجى الاتصال قبل الوصول",
        items: [
          {
            product_name: "ساعة ذكية Ultra Smart Watch",
            price: 4900,
            quantity: 1,
            image_url:
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            selected_color: "فضي تيتانيوم",
            selected_size: "49mm",
          },
        ],
        tracking_code: "TRK-981240",
        timeline: [
          {
            status: "pending",
            timestamp: new Date(),
            note: "تم تسجيل الطلبية بنجاح وفي انتظار التأكيد الهاتفي",
          },
        ],
      },
      {
        order_number: "DZ-4310",
        customer_name: "ياسين مرابط",
        customer_phone: "0661987654",
        wilaya_id: 31,
        wilaya_name: "وهران - Oran",
        commune: "السانية",
        shipping_type: "desk",
        shipping_cost: 350,
        subtotal: 3500,
        discount: 0,
        total_amount: 3850,
        status: "confirmed",
        items: [
          {
            product_name: "سماعات بلوتوث لاسلكية Pro",
            price: 3500,
            quantity: 1,
            image_url:
              "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
            selected_color: "أبيض لؤلؤي",
          },
        ],
        tracking_code: "TRK-552190",
        timeline: [
          {
            status: "pending",
            timestamp: new Date(Date.now() - 3600000 * 5),
            note: "تم تسجيل الطلبية",
          },
          {
            status: "confirmed",
            timestamp: new Date(Date.now() - 3600000 * 2),
            note: "تم تأكيد الطلبية هاتفياً وجاري التجهيز",
          },
        ],
      },
    ]);

    console.log(
      "✅ Database seeded successfully with test products, categories, coupons, and orders!",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();

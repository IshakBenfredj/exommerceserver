import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreSettings } from './src/models/StoreSettings.js';
import { Category } from './src/models/Category.js';
import { Product } from './src/models/Product.js';
import { Banner } from './src/models/Banner.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://codifybrandingcoding_db_user:m1P3oZJiaF8U4ixs@cluster0.qx5a8az.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

// 1. قائمة الفئات (Categories)
const CATEGORIES = [
  {
    name_ar: "إلكترونيات وأجهزة ذكية",
    name_fr: "Électronique & High-Tech",
    slug: "electronics",
    description: "أحدث الهواتف، الساعات الذكية، السماعات وملحقاتها بأسعار مميزة",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    icon: "laptop",
    display_order: 1,
    is_active: true,
  },
  {
    name_ar: "ساعات وإكسسوارات فاخرة",
    name_fr: "Montres & Accessoires de Luxe",
    slug: "watches-accessories",
    description: "ساعات رجالية ونسائية أنيقة، نظارات، ومحافظ جلدية أصلية",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    icon: "watch",
    display_order: 2,
    is_active: true,
  },
  {
    name_ar: "عطور ومستحضرات تجميل",
    name_fr: "Parfums & Cosmétiques",
    slug: "perfumes-cosmetics",
    description: "عطور شرقية وفرنسية أصلية 100% بثبات يدوم طويلاً",
    image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
    icon: "sparkles",
    display_order: 3,
    is_active: true,
  },
  {
    name_ar: "الصحة والجمال والعناية",
    name_fr: "Santé & Soins Personnels",
    slug: "beauty",
    description: "منتجات العناية بالبشرة، ماكينات الحلاقة وأجهزة التصفيف",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    icon: "heart",
    display_order: 4,
    is_active: true,
  },
  {
    name_ar: "المنزل والمطبخ العصري",
    name_fr: "Maison & Cuisine Moderne",
    slug: "home-kitchen",
    description: "أدوات منزلية ومطابخ ذكية لتسهيل حياتك اليومية بأعلى جودة",
    image_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
    icon: "home",
    display_order: 5,
    is_active: true,
  },
  {
    name_ar: "حقائب وأزياء راقية",
    name_fr: "Mode & Maroquinerie",
    slug: "fashion-bags",
    description: "حقائب جلد طبيعي وإكسسوارات أنيقة وعصرية",
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
    icon: "briefcase",
    display_order: 6,
    is_active: true,
  },
];

// 2. قائمة البنرات (Banners)
const BANNERS = [
  {
    id: "banner-1",
    title: "تخفيضات كبرى وعروض حصرية 2026",
    subtitle: "توصيل سريع لكافة الـ 69 ولاية مع الدفع الآمن عند الاستلام",
    badge: "🔥 أقوى العروض",
    link: "/products",
    image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80",
    cta_text: "تسوق الآن",
    active: true,
    order: 1,
  },
  {
    id: "banner-2",
    title: "تشكيلة الساعات الذكية Ultra المقاومة للماء",
    subtitle: "شاشة AMOLED عالية الدقة وبطارية تدوم 7 أيام مع ضمان أصلي",
    badge: "⚡ الأكثر مبيعاً",
    link: "/category/electronics",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80",
    cta_text: "اكتشف المجموعة",
    active: true,
    order: 2,
  },
  {
    id: "banner-3",
    title: "عطور شرقية وفرنسية أصلية فاخرة",
    subtitle: "ثبات عالي يدوم طويلاً مع تركيز أو دو بارفان مميز",
    badge: "✨ تشكيلة ملكية",
    link: "/category/perfumes-cosmetics",
    image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=80",
    cta_text: "اختر عطرك",
    active: true,
    order: 3,
  },
  {
    id: "banner-4",
    title: "سماعات بلوتوث لاسلكية Pro بعزل الضوضاء ANC",
    subtitle: "صوت نقي ثلاثي الأبعاد ومكالمات فائقة الوضوح طوال اليوم",
    badge: "🎧 تكنولوجيا متطورة",
    link: "/category/electronics",
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1400&q=80",
    cta_text: "اطلب الآن",
    active: true,
    order: 4,
  },
  {
    id: "banner-5",
    title: "أحدث تجهيزات وأجهزة المطبخ الذكي",
    subtitle: "مفرمة وخلاطات فولاذية إينوكس تجعل الطهي أسهل وأسرع",
    badge: "🍳 جودة مضمونة",
    link: "/category/home-kitchen",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80",
    cta_text: "تسوق للمطبخ",
    active: true,
    order: 5,
  },
];

// 3. قائمة المنتجات (Products)
const getProducts = (catMap) => [
  {
    name_ar: "ساعة ذكية Ultra Smart Watch مقاومة للماء مع شاحن لاسلكي",
    name_fr: "Montre Connectée Ultra Pro Étanche",
    slug: "ultra-smart-watch-series-8",
    description_ar: "ساعة ذكية متطورة مزودة بشاشة AMOLED عالية الدقة، قياس نبضات القلب ونسبة الأكسجين، دعم المكالمات عبر البلوتوث وبطارية تدوم حتى 7 أيام.",
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
    features: ["شاشة AMOLED لمس", "مقاومة الماء IP68", "إجراء واستقبال المكالمات", "تتبع اللياقة والنوم"],
  },
  {
    name_ar: "سماعات بلوتوث لاسلكية Pro عازلة للضوضاء النشطة ANC",
    name_fr: "Écouteurs Sans Fil Pro ANC",
    slug: "wireless-earbuds-pro-anc",
    description_ar: "سماعات لاسلكية توفر صوتاً نقياً ثلاثي الأبعاد مع خاصية عزل الضوضاء النشط ANC، وميكروفون فائق الوضوح للمكالمات.",
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
    features: ["عزل الضوضاء ANC", "بطارية 30 ساعة مع العلبة", "صوت نقي Hi-Fi"],
  },
  {
    name_ar: "قاعدة شحن لاسلكي سريع 3 في 1 للهاتف والساعة والسماعات",
    name_fr: "Station de Charge Sans Fil Rapide 3-en-1",
    slug: "fast-wireless-charger-3in1",
    description_ar: "محطة شحن مغناطيسية لاسلكية سريعة بقوة 15 واط تشحن هاتفك الذكي وساعتك وسماعاتك في وقت واحد بتصميم أنيق وموفر للمساحة.",
    price: 2900,
    compare_at_price: 4200,
    cost_price: 1400,
    sku: "ELC-CHG-03",
    stock_quantity: 40,
    category_id: catMap.get("electronics"),
    category_slug: "electronics",
    images: ["https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
    is_active: true,
    rating: 4.7,
    reviews_count: 14,
    colors: ["أسود أنيق", "أبيض عصري"],
    features: ["شحن سريع 15W", "شحن 3 أجهزة في وقت واحد", "حماية ضد الحرارة"],
  },
  {
    name_ar: "ساعة يد رجالية كوارتز فاخرة ستانلس ستيل مع علبة هدايا",
    name_fr: "Montre Homme Luxe Quartz Acier Inoxydable",
    slug: "luxury-mens-quartz-watch",
    description_ar: "ساعة يد كلاسيكية فاخرة بهيكل من الفولاذ المقاوم للصدأ وميناء مقاوم للخدش مع عرض التاريخ، مثالية للمناسبات والإهداء.",
    price: 5500,
    compare_at_price: 7500,
    cost_price: 2900,
    sku: "WAT-LUX-04",
    stock_quantity: 30,
    category_id: catMap.get("watches-accessories"),
    category_slug: "watches-accessories",
    images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"],
    is_featured: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 31,
    colors: ["فضي مع أزرق", "ذهبي ملكي", "أسود كربوني"],
    features: ["فولاذ مقاوم للصدأ 316L", "زجاج ياقوتي مضاد للخدش", "مقاومة للماء", "علبة هدايا فخمة"],
  },
  {
    name_ar: "محفظة جلدية أصلية فاخرة مضادة لسرقة البطاقات RFID",
    name_fr: "Portefeuille Homme Cuir Véritable Anti-RFID",
    slug: "luxury-leather-wallet-rfid",
    description_ar: "محفظة نقود وبطاقات رجالية مصنوعة من الجلد الطبيعي 100% بتصميم نحيف وأنيق مع تقنية حماية البيانات RFID.",
    price: 2400,
    compare_at_price: 3500,
    cost_price: 1100,
    sku: "ACC-WAL-05",
    stock_quantity: 50,
    category_id: catMap.get("watches-accessories"),
    category_slug: "watches-accessories",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
    is_active: true,
    rating: 4.8,
    reviews_count: 22,
    colors: ["بني كلاسيكي", "أسود فاخر", "بني كحلي"],
    features: ["جلد طبيعي 100%", "حماية RFID", "تتسع لـ 10 بطاقات"],
  },
  {
    name_ar: "عطر العود الملكي الفاخر للجنسين ثبات فائق 100 مل",
    name_fr: "Parfum de Luxe Royal Oud 100ml",
    slug: "royal-french-perfume-100ml",
    description_ar: "مزيج ساحر من دهن العود الفاخر والزعفران والورود الدمشقية مع لمسات العنبر والمسك، ثبات استثنائي يدوم لأكثر من 48 ساعة.",
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
    features: ["تركيز أو دو بارفان", "ثبات 48 ساعة", "للجنسين"],
  },
  {
    name_ar: "ماكينة حلاقة وتشذيب احترافية قابلة لإعادة الشحن 3 في 1",
    name_fr: "Tondeuse à Barbe Professionnelle 3 en 1",
    slug: "professional-beard-trimmer-3in1",
    description_ar: "ماكينة حلاقة كهربائية احترافية بشفرات تيتانيوم حادة ومحرك قوي سريع، مناسبة للرجال وتعمل بدون سلك لمدة ساعتين.",
    price: 3200,
    compare_at_price: 4500,
    cost_price: 1700,
    sku: "BEA-TRIM-07",
    stock_quantity: 35,
    category_id: catMap.get("beauty"),
    category_slug: "beauty",
    images: ["https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80"],
    is_featured: true,
    is_active: true,
    rating: 4.7,
    reviews_count: 19,
    colors: ["ذهبي ملكي", "برونزي"],
    features: ["شفرات فولاذية مضادة للصدأ", "بطارية ليثيوم شحن سريع", "4 رؤوس تدريج"],
  },
  {
    name_ar: "فرشاة ومصفف الشعر الحراري الاحترافي بتقنية الأيونات",
    name_fr: "Brosse Soufflante Lissante Professionnelle",
    slug: "hair-curler-brush-negative-ions",
    description_ar: "مصفف شعر حراري متطور 2 في 1 يجفف ويفرد الشعر في دقائق بتقنية السيراميك والتورمالين التي تحافظ على لمعان الشعر.",
    price: 3800,
    compare_at_price: 5200,
    cost_price: 2000,
    sku: "BEA-BRS-08",
    stock_quantity: 40,
    category_id: catMap.get("beauty"),
    category_slug: "beauty",
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
    is_active: true,
    rating: 4.8,
    reviews_count: 26,
    colors: ["أسود مع وردي ذهبي"],
    features: ["تقنية الأيونات", "3 درجات حرارة", "سلك دوار 360 درجة"],
  },
  {
    name_ar: "خلاط ومفرمة كهربائية متعددة الاستخدامات 2 لتر إينوكس",
    name_fr: "Robot Hachoir Multifonction Inox 2L",
    slug: "kitchen-chopper-food-processor-2l",
    description_ar: "مفرمة لحم وخضار قوية بسعة 2 لتر ووعاء من الإينوكس المقاوم للصدأ مع 4 شفرات فولاذية لمزج وفرم سريع ومثالي.",
    price: 4200,
    compare_at_price: 5800,
    cost_price: 2400,
    sku: "HOM-CHOP-09",
    stock_quantity: 25,
    category_id: catMap.get("home-kitchen"),
    category_slug: "home-kitchen",
    images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 15,
    features: ["وعاء إينوكس 2 لتر", "قوة 500 واط", "سرعتين", "سهل التنظيف"],
  },
  {
    name_ar: "حقيبة يد وكتف رجالية كلاسيكية من الجلد الطبيعي",
    name_fr: "Sacoche Bandoulière Homme en Cuir",
    slug: "leather-crossbody-bag-men",
    description_ar: "حقيبة رجالية مريحة وعملية مصنوعة من أجود أنواع الجلد الطبيعي، مزودة بعدة جيوب لحمل الهاتف والمحفظة.",
    price: 3600,
    compare_at_price: 4900,
    cost_price: 1800,
    sku: "BAG-CRB-10",
    stock_quantity: 30,
    category_id: catMap.get("fashion-bags"),
    category_slug: "fashion-bags",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"],
    is_featured: false,
    is_active: true,
    rating: 4.8,
    reviews_count: 18,
    colors: ["بني عسلي", "أسود فاخر"],
    features: ["جلد طبيعي متين", "حزام كتف قابل للتعديل", "جيوب متعددة"],
  },
];

async function run() {
  try {
    console.log('⏳ جاري الاتصال بقاعدة بيانات MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ تم الاتصال بنجاح بـ MongoDB Atlas!');

    // 1. إضافة أو تحديث الفئات
    console.log('\n📦 [1/3] جاري إضافة الفئات (Categories)...');
    for (const cat of CATEGORIES) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
      console.log(`  ✓ فئة: ${cat.name_ar}`);
    }

    // تجهيز خريطة المعرفات
    const allCategories = await Category.find();
    const catMap = new Map(allCategories.map(c => [c.slug, c._id]));

    // 2. إضافة أو تحديث البنرات
    console.log('\n🎨 [2/3] جاري إضافة البنرات (Banners)...');
    for (const b of BANNERS) {
      await Banner.findOneAndUpdate({ title: b.title }, b, { upsert: true, new: true });
      console.log(`  ✓ بانر: ${b.title}`);
    }

    // تحديث البنرات في إعدادات المتجر (StoreSettings)
    await StoreSettings.findOneAndUpdate(
      {},
      {
        $set: {
          banners: BANNERS,
          hero_title: "تسوق أفضل المنتجات مع توصيل سريع لـ 69 ولاية",
          hero_subtitle: "دفع آمن عند الاستلام، ضمان الجودة، وخدمة عملاء على مدار الساعة",
        }
      },
      { upsert: true, new: true }
    );
    console.log('  ✓ تم ربط البنرات بإعدادات المتجر الرئيسي');

    // 3. إضافة أو تحديث المنتجات
    console.log('\n🛍️ [3/3] جاري إضافة المنتجات (Products)...');
    const products = getProducts(catMap);
    for (const prod of products) {
      await Product.findOneAndUpdate({ slug: prod.slug }, prod, { upsert: true, new: true });
      console.log(`  ✓ منتج: ${prod.name_ar} (${prod.price} دج)`);
    }

    console.log('\n🎉 اكتملت العملية بنجاح تام!');
    console.log(`- الفئات: ${CATEGORIES.length}`);
    console.log(`- البنرات: ${BANNERS.length}`);
    console.log(`- المنتجات: ${products.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ أثناء إضافة البيانات:', error.message);
    process.exit(1);
  }
}

run();

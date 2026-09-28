import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { StoreSettings } from "./src/models/StoreSettings.js";
import { Category } from "./src/models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const CONFIG_PATH = path.join(rootDir, "NEW_CLIENT_CONFIG.txt");
const SERVER_ENV_PATH = path.join(rootDir, "server", ".env");
const CLIENT_ENV_PATH = path.join(rootDir, "client", ".env.local");
const FLUTTER_API_PATH = path.join(rootDir, "app-dashf", "lib", "constants", "api_endpoints.dart");
const ANDROID_MANIFEST_PATH = path.join(rootDir, "app-dashf", "android", "app", "src", "main", "AndroidManifest.xml");

function parseConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found at: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const config = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("=") || trimmed.startsWith("-") || trimmed.startsWith("📌")) {
      continue;
    }
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) {
      config[match[1]] = match[2].trim();
    }
  }
  return config;
}

const WILAYAS_DATA = [
  { id: 1, name: "أدرار - Adrar", code: "01", home: 900, desk: 500, active: true },
  { id: 2, name: "الشلف - Chlef", code: "02", home: 650, desk: 350, active: true },
  { id: 3, name: "الأغواط - Laghouat", code: "03", home: 750, desk: 400, active: true },
  { id: 4, name: "أم البواقي - Oum El Bouaghi", code: "04", home: 700, desk: 400, active: true },
  { id: 5, name: "باتنة - Batna", code: "05", home: 700, desk: 400, active: true },
  { id: 6, name: "بجاية - Béjaïa", code: "06", home: 700, desk: 400, active: true },
  { id: 7, name: "بسكرة - Biskra", code: "07", home: 750, desk: 400, active: true },
  { id: 8, name: "بشار - Béchar", code: "08", home: 900, desk: 500, active: true },
  { id: 9, name: "البليدة - Blida", code: "09", home: 550, desk: 300, active: true },
  { id: 10, name: "البويرة - Bouira", code: "10", home: 650, desk: 350, active: true },
  { id: 11, name: "تمنراست - Tamanrasset", code: "11", home: 1200, desk: 700, active: true },
  { id: 12, name: "تبسة - Tébessa", code: "12", home: 750, desk: 400, active: true },
  { id: 13, name: "تلمسان - Tlemcen", code: "13", home: 700, desk: 400, active: true },
  { id: 14, name: "تيارت - Tiaret", code: "14", home: 700, desk: 400, active: true },
  { id: 15, name: "تيزي وزو - Tizi Ouzou", code: "15", home: 650, desk: 350, active: true },
  { id: 16, name: "الجزائر العاصمة - Alger", code: "16", home: 450, desk: 250, active: true },
  { id: 17, name: "الجلفة - Djelfa", code: "17", home: 750, desk: 400, active: true },
  { id: 18, name: "جيجل - Jijel", code: "18", home: 700, desk: 400, active: true },
  { id: 19, name: "سطيف - Sétif", code: "19", home: 650, desk: 350, active: true },
  { id: 20, name: "سعيدة - Saïda", code: "20", home: 750, desk: 400, active: true },
  { id: 21, name: "سكيكدة - Skikda", code: "21", home: 700, desk: 400, active: true },
  { id: 22, name: "سيدي بلعباس - Sidi Bel Abbès", code: "22", home: 700, desk: 400, active: true },
  { id: 23, name: "عنابة - Annaba", code: "23", home: 700, desk: 400, active: true },
  { id: 24, name: "قالمة - Guelma", code: "24", home: 700, desk: 400, active: true },
  { id: 25, name: "قسنطينة - Constantine", code: "25", home: 650, desk: 350, active: true },
  { id: 26, name: "المدية - Médéa", code: "26", home: 650, desk: 350, active: true },
  { id: 27, name: "مستغانم - Mostaganem", code: "27", home: 700, desk: 400, active: true },
  { id: 28, name: "المسيلة - M'Sila", code: "28", home: 750, desk: 400, active: true },
  { id: 29, name: "معسكر - Mascara", code: "29", home: 700, desk: 400, active: true },
  { id: 30, name: "ورقلة - Ouargla", code: "30", home: 850, desk: 450, active: true },
  { id: 31, name: "وهران - Oran", code: "31", home: 650, desk: 350, active: true },
  { id: 32, name: "البيض - El Bayadh", code: "32", home: 850, desk: 450, active: true },
  { id: 33, name: "إليزي - Illizi", code: "33", home: 1200, desk: 700, active: true },
  { id: 34, name: "برج بوعريريج - Bordj Bou Arreridj", code: "34", home: 650, desk: 350, active: true },
  { id: 35, name: "بومرداس - Boumerdès", code: "35", home: 550, desk: 300, active: true },
  { id: 36, name: "الطارف - El Tarf", code: "36", home: 750, desk: 400, active: true },
  { id: 37, name: "تندوف - Tindouf", code: "37", home: 1200, desk: 700, active: true },
  { id: 38, name: "تسمسيلت - Tissemsilt", code: "38", home: 750, desk: 400, active: true },
  { id: 39, name: "الوادي - El Oued", code: "39", home: 800, desk: 450, active: true },
  { id: 40, name: "خنشلة - Khenchela", code: "40", home: 750, desk: 400, active: true },
  { id: 41, name: "سوق أهراس - Souk Ahras", code: "41", home: 750, desk: 400, active: true },
  { id: 42, name: "تيبازة - Tipaza", code: "42", home: 550, desk: 300, active: true },
  { id: 43, name: "ميلة - Mila", code: "43", home: 700, desk: 400, active: true },
  { id: 44, name: "عين الدفلى - Aïn Defla", code: "44", home: 650, desk: 350, active: true },
  { id: 45, name: "النعامة - Naâma", code: "45", home: 850, desk: 450, active: true },
  { id: 46, name: "عين تموشنت - Aïn Témouchent", code: "46", home: 700, desk: 400, active: true },
  { id: 47, name: "غرداية - Ghardaïa", code: "47", home: 800, desk: 450, active: true },
  { id: 48, name: "غليزان - Relizane", code: "48", home: 700, desk: 400, active: true },
  { id: 49, name: "تيميمون - Timimoun", code: "49", home: 1000, desk: 600, active: true },
  { id: 50, name: "برج باجي مختار - Bordj Badji Mokhtar", code: "50", home: 1300, desk: 800, active: true },
  { id: 51, name: "أولاد جلال - Ouled Djellal", code: "51", home: 800, desk: 450, active: true },
  { id: 52, name: "بني عباس - Béni Abbès", code: "52", home: 1000, desk: 600, active: true },
  { id: 53, name: "عين صالح - In Salah", code: "53", home: 1100, desk: 650, active: true },
  { id: 54, name: "عين قزام - In Guezzam", code: "54", home: 1300, desk: 800, active: true },
  { id: 55, name: "تقرت - Touggourt", code: "55", home: 850, desk: 450, active: true },
  { id: 56, name: "جانت - Djanet", code: "56", home: 1300, desk: 800, active: true },
  { id: 57, name: "المغير - El M'Ghair", code: "57", home: 850, desk: 450, active: true },
  { id: 58, name: "المنيعة - El Meniaa", code: "58", home: 900, desk: 500, active: true },
];

async function applyConfig() {
  console.log("🚀 Starting configuration synchronization from NEW_CLIENT_CONFIG.txt...");
  const config = parseConfig(CONFIG_PATH);

  console.log(`📋 Loaded configuration for: ${config.STORE_NAME_AR || config.APP_DISPLAY_NAME || "New Client"}`);

  // 1. Update server/.env
  console.log("📝 Updating server/.env...");
  const serverEnvContent = `PORT=${config.PORT || "5000"}
MONGO_URI=${config.MONGO_URI}
ADMIN_API_KEY=${config.ADMIN_API_KEY}
NODE_ENV=development
STORE_PHONE=${config.STORE_PHONE || config.STORE_CONTACT_PHONE || ""}

CLOUDINARY_CLOUD_NAME=${config.CLOUDINARY_CLOUD_NAME || ""}
CLOUDINARY_API_KEY=${config.CLOUDINARY_API_KEY || ""}
CLOUDINARY_API_SECRET=${config.CLOUDINARY_API_SECRET || ""}
CLOUDINARY_UPLOAD_PRESET=

API_URL=${config.APP_SOCKET_URL || "http://localhost:5000"}
`;
  fs.writeFileSync(SERVER_ENV_PATH, serverEnvContent, "utf-8");
  console.log("✅ server/.env updated");

  // 2. Update client/.env.local
  if (fs.existsSync(CLIENT_ENV_PATH)) {
    console.log("📝 Updating client/.env.local...");
    let clientEnv = fs.readFileSync(CLIENT_ENV_PATH, "utf-8");
    
    // Replace or insert key values
    const replaceOrAdd = (content, key, val) => {
      const reg = new RegExp(`^${key}=.*$`, "m");
      if (reg.test(content)) {
        return content.replace(reg, `${key}=${val}`);
      } else {
        return content + `\n${key}=${val}`;
      }
    };

    clientEnv = replaceOrAdd(clientEnv, "NEXT_PUBLIC_SITE_URL", config.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    clientEnv = replaceOrAdd(clientEnv, "NEXT_PUBLIC_API_URL", config.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");
    clientEnv = replaceOrAdd(clientEnv, "NEXT_PUBLIC_DEFAULT_LOCALE", config.NEXT_PUBLIC_DEFAULT_LOCALE || "ar");
    clientEnv = replaceOrAdd(clientEnv, "NEXT_PUBLIC_DEFAULT_THEME", config.NEXT_PUBLIC_DEFAULT_THEME || "luxury");

    fs.writeFileSync(CLIENT_ENV_PATH, clientEnv, "utf-8");
    console.log("✅ client/.env.local updated");
  }

  // 3. Update app-dashf/lib/constants/api_endpoints.dart
  if (fs.existsSync(FLUTTER_API_PATH)) {
    console.log("📱 Updating Flutter app endpoints in api_endpoints.dart...");
    let flutterContent = fs.readFileSync(FLUTTER_API_PATH, "utf-8");

    flutterContent = flutterContent.replace(
      /static String baseUrl = ".*?";/,
      `static String baseUrl = "${config.APP_API_BASE_URL || config.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}";`
    );
    flutterContent = flutterContent.replace(
      /static String socketUrl = ".*?";/,
      `static String socketUrl = "${config.APP_SOCKET_URL || "http://localhost:5000"}";`
    );
    flutterContent = flutterContent.replace(
      /static const String adminApiKey = ".*?";/,
      `static const String adminApiKey = "${config.ADMIN_API_KEY}";`
    );

    fs.writeFileSync(FLUTTER_API_PATH, flutterContent, "utf-8");
    console.log("✅ Flutter api_endpoints.dart updated");
  }

  // 4. Update Android Manifest Label
  if (fs.existsSync(ANDROID_MANIFEST_PATH) && config.APP_DISPLAY_NAME) {
    console.log("📱 Updating Android App Display Name...");
    let manifestContent = fs.readFileSync(ANDROID_MANIFEST_PATH, "utf-8");
    manifestContent = manifestContent.replace(
      /android:label=".*?"/,
      `android:label="${config.APP_DISPLAY_NAME}"`
    );
    fs.writeFileSync(ANDROID_MANIFEST_PATH, manifestContent, "utf-8");
    console.log(`✅ Android App Name set to: ${config.APP_DISPLAY_NAME}`);
  }

  // 5. Connect to MongoDB and update StoreSettings
  if (config.MONGO_URI) {
    console.log(`⏳ Connecting to MongoDB Atlas: ${config.MONGO_DATABASE_NAME || "target db"}...`);
    try {
      await mongoose.connect(config.MONGO_URI);
      console.log("✅ Connected to MongoDB");

      let existingSettings = await StoreSettings.findOne();
      const settingsData = {
        store_name: config.STORE_NAME_AR || "متجر جديد",
        phone: config.STORE_CONTACT_PHONE || config.STORE_PHONE || "0676866411",
        whatsapp: config.STORE_WHATSAPP || "213676866411",
        email: config.STORE_EMAIL || "contact@store.dz",
        address: config.STORE_ADDRESS || "الجزائر العاصمة، الجزائر",
        currency: config.STORE_CURRENCY || "DZD",
        logo_url: config.STORE_LOGO_URL || "",
        theme_name: config.NEXT_PUBLIC_DEFAULT_THEME || "luxury",
        hero_variant: config.HERO_DEFAULT_VARIANT || "cinematic-slider",
        hero_title: `تسوق أفضل المنتجات مع متجر ${config.STORE_NAME_AR || ""}`,
        hero_subtitle: "دفع آمن عند الاستلام، ضمان الجودة وتوصيل سريع لكافة الـ 58 ولاية",
        hero_badge: "🔥 عروض حصرية ومميزة",
        hero_cta_text: "تسوق الآن",
        hero_image_url: config.STORE_LOGO_URL || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80",
        free_shipping_threshold: Number(config.FREE_SHIPPING_THRESHOLD) || 10000,
        default_home_shipping_cost: Number(config.DEFAULT_HOME_SHIPPING_COST) || 700,
        default_desk_shipping_cost: Number(config.DEFAULT_DESK_SHIPPING_COST) || 400,
        social_facebook: config.SOCIAL_FACEBOOK || "https://facebook.com",
        social_instagram: config.SOCIAL_INSTAGRAM || "https://instagram.com",
        social_tiktok: config.SOCIAL_TIKTOK || "https://tiktok.com",
        default_language: config.NEXT_PUBLIC_DEFAULT_LOCALE || "ar",
      };

      if (!existingSettings) {
        settingsData.wilayas_shipping = WILAYAS_DATA;
        settingsData.banners = [
          {
            id: "banner-1",
            image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80",
            title: `أفضل العروض مع متجر ${config.STORE_NAME_AR || ""}`,
            subtitle: "توصيل سريع لكافة الولايات والدفع عند الاستلام",
            badge: "🔥 أقوى العروض",
            link_url: "/shop",
            cta_text: "تصفح العروض",
            order: 1,
            active: true,
          }
        ];
        await StoreSettings.create(settingsData);
        console.log("✅ Initialized new StoreSettings in MongoDB Atlas!");
      } else {
        Object.assign(existingSettings, settingsData);
        if (!existingSettings.wilayas_shipping || existingSettings.wilayas_shipping.length === 0) {
          existingSettings.wilayas_shipping = WILAYAS_DATA;
        }
        await existingSettings.save();
        console.log("✅ Updated existing StoreSettings in MongoDB Atlas!");
      }

      // Check if categories exist, if not create default category
      const categoriesCount = await Category.countDocuments();
      if (categoriesCount === 0) {
        console.log("📦 Creating default categories...");
        await Category.create([
          { name_ar: "أقسام عامة", name_fr: "Général", slug: "general", icon: "cube", is_active: true },
          { name_ar: "العروض المميزة", name_fr: "Offres Spéciales", slug: "featured", icon: "cube", is_active: true },
        ]);
        console.log("✅ Created initial categories");
      }

      await mongoose.disconnect();
      console.log("🔒 MongoDB connection closed gracefully");
    } catch (err) {
      console.warn("⚠️ MongoDB connection notice:", err.message);
    }
  }

  console.log("\n🎉 ALL CONFIGURATIONS HAVE BEEN APPLIED SUCCESSFULLY! 🎉\n");
}

applyConfig().catch((e) => {
  console.error("❌ Configuration error:", e);
  process.exit(1);
});

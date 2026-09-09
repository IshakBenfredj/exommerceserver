import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreSettings } from './src/models/StoreSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root path to NEW_CLIENT_CONFIG.txt
const configPath = path.resolve(__dirname, '../NEW_CLIENT_CONFIG.txt');
const serverEnvPath = path.resolve(__dirname, '.env');
const clientEnvPath = path.resolve(__dirname, '../client/.env.local');
const flutterEndpointsPath = path.resolve(__dirname, '../app-dashf/lib/constants/api_endpoints.dart');

function parseConfigFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`ملف الإعدادات غير موجود: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const config = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('=')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      config[key] = val;
    }
  }

  return config;
}

function updateEnvFile(filePath, updates) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ الملف غير موجود لإنشائه: ${filePath}`);
    fs.writeFileSync(filePath, '');
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  for (const [key, val] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${val}`);
    } else {
      content += `\n${key}=${val}`;
    }
  }

  fs.writeFileSync(filePath, content.trim() + '\n', 'utf-8');
  console.log(`✅ تم تحديث: ${path.basename(filePath)}`);
}

function updateFlutterEndpoints(filePath, config) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  if (config.APP_API_BASE_URL) {
    content = content.replace(/static String baseUrl = ".*";/, `static String baseUrl = "${config.APP_API_BASE_URL}";`);
  }
  if (config.APP_SOCKET_URL) {
    content = content.replace(/static String socketUrl = ".*";/, `static String socketUrl = "${config.APP_SOCKET_URL}";`);
  }
  if (config.ADMIN_API_KEY) {
    content = content.replace(/static const String adminApiKey = ".*";/, `static const String adminApiKey = "${config.ADMIN_API_KEY}";`);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ تم تحديث إعدادات تطبيق فلاتر (api_endpoints.dart)`);
}

async function run() {
  console.log('⏳ جاري قراءة ملف NEW_CLIENT_CONFIG.txt وتطبيق الإعدادات...');
  const cfg = parseConfigFile(configPath);

  // 1. تحديث server/.env
  updateEnvFile(serverEnvPath, {
    MONGO_URI: cfg.MONGO_URI,
    ADMIN_API_KEY: cfg.ADMIN_API_KEY,
    STORE_PHONE: cfg.STORE_PHONE || cfg.STORE_CONTACT_PHONE,
    PORT: cfg.PORT || '5000',
    CLOUDINARY_CLOUD_NAME: cfg.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: cfg.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: cfg.CLOUDINARY_API_SECRET || '',
  });

  // 2. تحديث client/.env.local
  updateEnvFile(clientEnvPath, {
    NEXT_PUBLIC_API_URL: cfg.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_SITE_URL: cfg.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DEFAULT_THEME: cfg.NEXT_PUBLIC_DEFAULT_THEME || 'luxury',
    NEXT_PUBLIC_DEFAULT_LOCALE: cfg.NEXT_PUBLIC_DEFAULT_LOCALE || 'ar',
  });

  // 3. تحديث تطبيق الهاتف Flutter
  updateFlutterEndpoints(flutterEndpointsPath, cfg);

  // 4. تحديث إعدادات المتجر في قاعدة بيانات الزبون على MongoDB Atlas
  try {
    console.log(`⏳ جاري الاتصال بقاعدة بيانات العميل: ${cfg.MONGO_URI}...`);
    await mongoose.connect(cfg.MONGO_URI);
    console.log('✅ تم الاتصال بقاعدة بيانات العميل!');

    await StoreSettings.findOneAndUpdate(
      {},
      {
        $set: {
          store_name: cfg.STORE_NAME_AR || 'متجر الكتروني حديث',
          phone: cfg.STORE_CONTACT_PHONE || '0541790205',
          whatsapp: cfg.STORE_WHATSAPP || '213541790205',
          email: cfg.STORE_EMAIL || 'contact@store.dz',
          address: cfg.STORE_ADDRESS || 'الجزائر العاصمة',
          currency: cfg.STORE_CURRENCY || 'DZD',
          theme_name: cfg.NEXT_PUBLIC_DEFAULT_THEME || 'luxury',
          hero_variant: cfg.HERO_DEFAULT_VARIANT || 'cinematic-slider',
          free_shipping_threshold: Number(cfg.FREE_SHIPPING_THRESHOLD) || 10000,
          default_home_shipping_cost: Number(cfg.DEFAULT_HOME_SHIPPING_COST) || 700,
          default_desk_shipping_cost: Number(cfg.DEFAULT_DESK_SHIPPING_COST) || 400,
          logo_url: cfg.STORE_LOGO_URL || '',
          social_facebook: cfg.SOCIAL_FACEBOOK || 'https://facebook.com',
          social_instagram: cfg.SOCIAL_INSTAGRAM || 'https://instagram.com',
          social_tiktok: cfg.SOCIAL_TIKTOK || 'https://tiktok.com',
        },
      },
      { upsert: true, new: true }
    );
    console.log('✅ تم تحديث بيانات وهوية المتجر (StoreSettings) في قاعدة البيانات!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('⚠️ تعذر تحديث قاعدة البيانات مباشرة (تأكد من صحة الرابط):', err.message);
  }

  console.log('\n🎉 تم تطبيق إعدادات الزبون الجديد بنجاح تام!');
}

run();

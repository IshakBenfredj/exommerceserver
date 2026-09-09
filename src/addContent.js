import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { Banner } from './models/Banner.js';
import { StoreSettings } from './models/StoreSettings.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';

/**
 * Add a new Category
 */
export async function addCategory(categoryData) {
  const category = new Category(categoryData);
  const saved = await category.save();
  console.log(`✅ [Category Added] ${saved.name_ar} (slug: ${saved.slug})`);
  return saved;
}

/**
 * Add a new Product
 */
export async function addProduct(productData) {
  // If category_slug is provided, resolve category_id
  if (productData.category_slug && !productData.category_id) {
    const cat = await Category.findOne({ slug: productData.category_slug });
    if (cat) {
      productData.category_id = cat._id;
    }
  }

  const product = new Product(productData);
  const saved = await product.save();
  console.log(`✅ [Product Added] ${saved.name_ar} - ${saved.price} DZD (slug: ${saved.slug})`);
  return saved;
}

/**
 * Add a new Banner
 */
export async function addBanner(bannerData) {
  const banner = new Banner(bannerData);
  const saved = await banner.save();

  // Also sync to StoreSettings.banners
  await StoreSettings.updateOne({}, {
    $push: {
      banners: {
        id: saved._id.toString(),
        image_url: saved.image_url,
        title: saved.title,
        subtitle: saved.subtitle,
        badge: saved.badge,
        link: saved.link,
        active: saved.active,
      }
    }
  });

  console.log(`✅ [Banner Added] ${saved.title} (image: ${saved.image_url})`);
  return saved;
}

// Command Line Interface runner
async function runCLI() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`
📌 [E-Commerce Content Tool]
Usage:
  node src/addContent.js --action=seed
  node src/addContent.js --action=add-category --name="اسم الفئة" --slug="category-slug" --icon="tag"
  node src/addContent.js --action=add-banner --title="عنوان البانر" --image="https://..." --link="/products"
  node src/addContent.js --action=add-product --name="اسم المنتج" --slug="product-slug" --price=4500 --category="electronics" --image="https://..."
    `);
    process.exit(0);
  }

  try {
    console.log(`⏳ Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to MongoDB Atlas`);

    const parsedArgs = {};
    for (const arg of args) {
      if (arg.startsWith('--')) {
        const [key, ...valParts] = arg.slice(2).split('=');
        parsedArgs[key] = valParts.join('=');
      }
    }

    const action = parsedArgs.action;

    if (action === 'seed') {
      console.log('Running main seed script...');
      const { default: runSeed } = await import('./seed.js');
      // seed.js runs automatically on import or exits
    } else if (action === 'add-category') {
      await addCategory({
        name_ar: parsedArgs.name || 'فئة جديدة',
        name_fr: parsedArgs.name_fr || '',
        slug: parsedArgs.slug || `category-${Date.now()}`,
        description: parsedArgs.desc || '',
        image_url: parsedArgs.image || '',
        icon: parsedArgs.icon || 'tag',
        display_order: parseInt(parsedArgs.order || '1', 10),
      });
    } else if (action === 'add-banner') {
      await addBanner({
        title: parsedArgs.title || 'بانر جديد',
        subtitle: parsedArgs.subtitle || '',
        badge: parsedArgs.badge || '',
        image_url: parsedArgs.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
        link: parsedArgs.link || '/products',
        cta_text: parsedArgs.cta || 'تسوق الآن',
        active: parsedArgs.active !== 'false',
        order: parseInt(parsedArgs.order || '1', 10),
      });
    } else if (action === 'add-product') {
      await addProduct({
        name_ar: parsedArgs.name || 'منتج جديد',
        slug: parsedArgs.slug || `product-${Date.now()}`,
        price: Number(parsedArgs.price) || 2500,
        compare_at_price: Number(parsedArgs.compare_at) || undefined,
        category_slug: parsedArgs.category || 'electronics',
        images: parsedArgs.image ? [parsedArgs.image] : [],
        description_ar: parsedArgs.desc || '',
        stock_quantity: Number(parsedArgs.stock) || 50,
        is_featured: parsedArgs.featured === 'true',
        is_active: true,
      });
    } else {
      console.log(`Unknown action: ${action}`);
    }

    await mongoose.disconnect();
    console.log('✨ Operation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing content command:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1]?.endsWith('addContent.js')) {
  runCLI();
}

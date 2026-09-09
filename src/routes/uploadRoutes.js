import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ── 1. Cloudinary Setup (No Credit Card Required) ───────────────────────────
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || '';
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || '';
const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || '';

if (cloudName && cloudinaryApiKey && cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
  });
}

// ── 2. Cloudflare R2 Setup (Alternative S3 Provider) ────────────────────────
const r2Endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'commerce';
const publicUrlBase = (
  process.env.R2_PUBLIC_URL || 'https://pub-2b82d3c3bbe54069adef6a4c547f54bb.r2.dev'
).replace(/\/$/, '');

let s3Client = null;
if (r2Endpoint && accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: r2Endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

// ── GET /api/upload/status ──────────────────────────────────────────────────
router.get('/status', (req, res) => {
  const isCloudinaryConfigured = Boolean(cloudName && (cloudinaryUploadPreset || cloudinaryApiSecret));
  const isR2Configured = Boolean(s3Client);

  res.json({
    success: true,
    defaultProvider: isCloudinaryConfigured ? 'cloudinary' : (isR2Configured ? 'r2' : 'none'),
    zeroServerBandwidth: true,
    cloudinary: {
      configured: isCloudinaryConfigured,
      cloudName: cloudName || null,
      uploadPreset: cloudinaryUploadPreset || null,
      hasSecret: Boolean(cloudinaryApiSecret),
      requiresCreditCard: false,
    },
    r2: {
      configured: isR2Configured,
      bucket: bucketName,
      publicUrl: publicUrlBase,
      requiresCreditCard: true,
    },
  });
});

// ── POST /api/upload/cloudinary-sign ────────────────────────────────────────
// Zero-Server-Bandwidth Endpoint:
// Server generates signed parameters (~120 bytes JSON).
// The client (mobile app/web browser) uploads directly to Cloudinary edge API.
router.post('/cloudinary-sign', (req, res) => {
  try {
    const { folder = 'ecommerce/products' } = req.body || {};
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Eager transformations applied automatically upon upload:
    // f_auto (AVIF/WebP) + q_auto:good + max width 1200px -> Cuts bandwidth by 85-95%!
    const eager = 'f_auto,q_auto:good,w_1200,c_limit';

    // 1. If API secret is present, create a cryptographic signature for signed direct upload
    if (cloudName && cloudinaryApiKey && cloudinaryApiSecret) {
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
          eager,
        },
        cloudinaryApiSecret
      );

      return res.json({
        success: true,
        mode: 'signed',
        provider: 'cloudinary',
        cloudName,
        apiKey: cloudinaryApiKey,
        timestamp,
        signature,
        folder,
        eager,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        zeroServerBandwidth: true,
      });
    }

    // 2. If upload preset is configured (Unsigned direct upload)
    if (cloudName && cloudinaryUploadPreset) {
      return res.json({
        success: true,
        mode: 'unsigned',
        provider: 'cloudinary',
        cloudName,
        uploadPreset: cloudinaryUploadPreset,
        folder,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        zeroServerBandwidth: true,
      });
    }

    // 3. If Cloudinary credentials are not yet set
    return res.status(400).json({
      success: false,
      error: 'يرجى ضبط CLOUDINARY_CLOUD_NAME في ملف .env (مجاني 100% بدون بطاقة فيزا)',
      guide: 'أنشئ حساباً مجانياً في cloudinary.com ببريد جيميل، وضع Cloud Name و API Key في .env للسيرفر',
    });
  } catch (err) {
    console.error('Cloudinary Sign Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/upload/presign (Cloudflare R2 Direct Upload) ───────────────────
router.post('/presign', async (req, res) => {
  try {
    if (!s3Client) {
      return res.status(500).json({
        success: false,
        error: 'Cloudflare R2 is not configured on the server.',
      });
    }

    const { contentType = 'image/jpeg', folder = 'products', fileName } = req.body || {};

    if (!contentType.startsWith('image/') && !contentType.startsWith('application/pdf')) {
      return res.status(400).json({
        success: false,
        error: 'نوع الملف غير مدعوم، يرجى رفع صورة (JPEG, PNG, WebP)',
      });
    }

    let ext = 'jpg';
    if (fileName && fileName.includes('.')) {
      ext = fileName.split('.').pop().toLowerCase();
    } else if (contentType.includes('/')) {
      ext = contentType.split('/')[1].split('+')[0].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
    }

    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'products';
    const key = `${cleanFolder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const publicUrl = `${publicUrlBase}/${key}`;

    res.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
      provider: 'Cloudflare R2',
      zeroServerBandwidth: true,
    });
  } catch (err) {
    console.error('❌ Cloudflare R2 Presign Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'فشل إنشاء رابط الرفع المباشر لـ Cloudflare R2',
    });
  }
});

// ── POST /api/upload/base64 (Direct Base64 Upload to Cloudinary from Mobile App) ──
router.post('/base64', async (req, res) => {
  try {
    const { image, folder = 'ecommerce/products' } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, error: 'لم يتم إرسال بيانات الصورة' });
    }

    if (!cloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
      return res.status(400).json({
        success: false,
        error: 'بيانات Cloudinary غير مهيأة في السيرفر (.env)',
      });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder,
      transformation: [
        { width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    });

    res.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (err) {
    console.error('❌ Base64 Upload Error:', err);
    res.status(500).json({ success: false, error: err.message || 'فشل رفع الصورة' });
  }
});

export default router;

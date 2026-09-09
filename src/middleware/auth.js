export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_API_KEY || 'admin_secret_key_0541790205';

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'رمز التفويض مطلوب (Authorization header missing)',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({
      success: false,
      error: 'صيغة رمز التفويض غير صالحة. يرجى استخدام Bearer <token>',
    });
  }

  const token = parts[1];
  if (token !== adminKey) {
    return res.status(403).json({
      success: false,
      error: 'رمز التفويض غير صحيح أو غير مصرح له',
    });
  }

  next();
};

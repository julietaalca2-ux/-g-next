/* ========================================================================= */
/* ÖG STORAGE SERVICE - Subida a Supabase Storage y Compresión de Imágenes   */
/* ========================================================================= */

import { db } from './supabase.js';

export function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          if (!blob) reject(new Error('No se pudo procesar la imagen'));
          else resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadMediaFile(userId, fileBlob, pathPrefix, mimeType = 'image/jpeg') {
  const ext = mimeType.includes('video') ? 'mp4' : 'jpg';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const path = `${userId}/${pathPrefix}-${uniqueSuffix}.${ext}`;

  const { error: uploadError } = await db.storage.from('og-media')
    .upload(path, fileBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: mimeType
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = db.storage.from('og-media').getPublicUrl(path);
  return urlData.publicUrl;
}

export async function deleteMediaFileByUrl(fileUrl) {
  if (!fileUrl || !fileUrl.includes('/og-media/')) return;
  const filePath = fileUrl.split('/og-media/')[1];
  if (filePath) {
    await db.storage.from('og-media').remove([filePath]).catch(() => {});
  }
}


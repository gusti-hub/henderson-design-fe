// utils/uploadToS3.js
import { backendServer } from './info';

/**
 * Upload file langsung ke DO Spaces via presigned URL
 * Browser → DO Spaces SF langsung, tidak lewat server
 */
export const uploadFileToS3 = async (file, folder = 'uploads') => {
  const token = localStorage.getItem('token');

  // Step 1: minta presigned URL dari server (request kecil ~100ms)
  const presignRes = await fetch(`${backendServer}/api/orders/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.json();
    throw new Error(err.message || 'Failed to get upload URL');
  }

  const { uploadUrl, key, publicUrl } = await presignRes.json();

  // Step 2: upload langsung dari browser ke DO Spaces (tidak lewat server)
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed: HTTP ${uploadRes.status}`);
  }

  return {
    url: publicUrl,
    key,
    filename: file.name,
    contentType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
};
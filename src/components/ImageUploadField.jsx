import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Eye, CheckCircle } from 'lucide-react';
import { backendServer } from '../utils/info';

const ImageUploadField = ({ orderId, images = [], onImagesChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} exceeds 5MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(validFiles.map(f => ({ name: f.name, status: 'uploading' })));

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${backendServer}/api/orders/${orderId}/custom-product-images`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const newImages = result.data.map(img => ({
          filename: img.filename,
          contentType: img.contentType,
          url: img.url,
          key: img.key,
          size: img.size,
          uploadedAt: img.uploadedAt
        }));

        onImagesChange([...images, ...newImages]);
        setUploadProgress(validFiles.map(f => ({ name: f.name, status: 'success' })));
        
        console.log(`✅ Uploaded ${newImages.length} images to S3`);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      setError(err.message || 'Failed to upload images');
      setUploadProgress(validFiles.map(f => ({ name: f.name, status: 'error' })));
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setUploadProgress([]);
      }, 2000);
    }
  };

  const removeImage = (index) => {
    if (window.confirm('Remove this image?')) {
      const updated = images.filter((_, i) => i !== index);
      onImagesChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Upload Product Images
        </label>
        <span className="text-xs text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#005670] hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#005670]" />
              <span className="text-sm text-gray-600">Uploading to S3...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload images
              </span>
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, WEBP up to 5MB each • Stored in Digital Ocean Spaces
        </p>
      </div>

      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs">
              {progress.status === 'uploading' && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              )}
              {progress.status === 'success' && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {progress.status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-gray-700">{progress.name}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', image.filename);
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="10"%3EError%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(image.url)}
                    className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-600 mt-1 truncate" title={image.filename}>
                  {image.filename}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Stored in S3
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
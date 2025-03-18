import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import Furniture360Viewer from './Furniture360Viewer';

// This component will replace the current product card in your Available Products section
const ProductCard = ({ product, onCustomize }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if product has video
  const hasVideo = product.variants && product.variants.some(v => v.video && v.video.url);
  const videoUrl = hasVideo ? product.variants.find(v => v.video && v.video.url)?.video?.url : null;
  const imageUrl = product.variants && product.variants[0]?.image?.url ? product.variants[0].image.url : null;
  
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-48">
        {/* Show 360 viewer when hovered, otherwise show still image */}
        {hasVideo && isHovered ? (
          <Furniture360Viewer
            videoUrl={videoUrl}
            imageUrl={imageUrl}
            alt={product.name}
            className="w-full h-full"
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader className="w-8 h-8 text-[#005670] animate-spin" />
              </div>
            )}
            <img
              src={imageUrl || '/placeholder-image.png'}
              alt={product.name}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.onerror = null;
                e.target.src = '/placeholder-image.png';
              }}
            />
          </>
        )}
        
        {/* If video is available, show indicator */}
        {hasVideo && !isHovered && (
          <div className="absolute top-2 right-2 bg-[#005670] text-white px-2 py-1 rounded-md text-xs">
            360° View
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.product_id}</p>
        <button
          onClick={() => onCustomize(product)}
          className="w-full mt-4 py-2 text-white rounded-lg bg-[#005670] hover:bg-opacity-90"
        >
          Customize
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
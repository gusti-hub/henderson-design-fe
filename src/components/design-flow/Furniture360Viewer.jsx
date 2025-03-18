import React, { useState, useRef, useEffect } from 'react';
import { Loader, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// This component will replace the static image display in your CustomizationModal and product listings
const Furniture360Viewer = ({ 
  videoUrl, 
  imageUrl, 
  alt, 
  className = "",
  onLoad = () => {},
  onError = () => {}
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoSupported, setIsVideoSupported] = useState(true);
  const [isManualRotate, setIsManualRotate] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [zoom, setZoom] = useState(1);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const startXRef = useRef(null);
  const lastRotationRef = useRef(0);

  // Load video and handle fallback to image
  useEffect(() => {
    if (!videoUrl) {
      setIsVideoSupported(false);
      return;
    }

    setIsVideoLoading(true);
    
    // Reset states when video source changes
    setIsVideoPlaying(false);
    setRotationDegree(0);
    setZoom(1);
    
    // Handle video loading errors
    const handleVideoError = () => {
      console.error("Error loading video");
      setIsVideoSupported(false);
      setIsVideoLoading(false);
      onError();
    };

    // Set up video element
    if (videoRef.current) {
      videoRef.current.addEventListener('error', handleVideoError);
      
      videoRef.current.addEventListener('loadeddata', () => {
        setIsVideoLoading(false);
        onLoad();
      });

      // Clean up
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('error', handleVideoError);
        }
      };
    }
  }, [videoUrl, onLoad, onError]);

  // Handle manual rotation
  useEffect(() => {
    if (!isManualRotate || !containerRef.current) return;

    const handleMouseDown = (e) => {
      startXRef.current = e.clientX;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (startXRef.current === null) return;
      
      const deltaX = e.clientX - startXRef.current;
      const newRotation = lastRotationRef.current + deltaX / 3;
      
      setRotationDegree(newRotation);
    };

    const handleMouseUp = () => {
      lastRotationRef.current = rotationDegree;
      startXRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Touch events for mobile
    const handleTouchStart = (e) => {
      startXRef.current = e.touches[0].clientX;
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    };

    const handleTouchMove = (e) => {
      if (startXRef.current === null) return;
      
      const deltaX = e.touches[0].clientX - startXRef.current;
      const newRotation = lastRotationRef.current + deltaX / 3;
      
      setRotationDegree(newRotation);
    };

    const handleTouchEnd = () => {
      lastRotationRef.current = rotationDegree;
      startXRef.current = null;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    // Add event listeners
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    containerRef.current.addEventListener('touchstart', handleTouchStart);

    // Clean up
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', handleMouseDown);
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isManualRotate, rotationDegree]);

  // Handle zoom with mouse wheel
  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e) => {
      e.preventDefault();
      
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prevZoom => {
        const newZoom = prevZoom * zoomFactor;
        return Math.min(Math.max(newZoom, 0.5), 3);
      });
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel);
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.5));
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isManualRotate) {
      // Exit manual rotation mode and resume video
      setIsManualRotate(false);
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    } else {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };
  
  const toggleManualRotate = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
    setIsManualRotate(prev => !prev);
  };

  // Render loading state
  if (isVideoLoading && videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader className="w-12 h-12 text-[#005670] animate-spin" />
      </div>
    );
  }

  // Render fallback image if video not supported or no video URL
  if (!isVideoSupported || !videoUrl) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={imageUrl || '/placeholder-image.png'}
          alt={alt}
          className="w-full h-full object-contain rounded-lg"
          onLoad={onLoad}
          onError={e => {
            e.target.onerror = null;
            e.target.src = '/placeholder-image.png';
            onError();
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ 
          perspective: '1000px',
          touchAction: 'none' // Prevents default touch behaviors like scrolling
        }}
      >
        <div 
          className="w-full h-full transition-transform"
          style={{ 
            transform: `scale(${zoom}) rotateY(${rotationDegree}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            alt={alt}
            className="w-full h-full object-contain rounded-lg"
            loop
            playsInline
            muted
            onClick={togglePlayPause}
          />
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button 
          onClick={togglePlayPause}
          className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
          aria-label={isVideoPlaying ? "Pause" : "Play"}
        >
          {isVideoPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        
        <button 
          onClick={toggleManualRotate}
          className={`p-2 rounded-full shadow-md transition-colors ${
            isManualRotate ? 'bg-[#005670] text-white' : 'bg-white/80 hover:bg-white'
          }`}
          aria-label="Manual Rotate"
        >
          <RotateCcw size={24} />
        </button>
        
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="Zoom In"
        >
          <ZoomIn size={24} />
        </button>
        
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
          aria-label="Zoom Out"
        >
          <ZoomOut size={24} />
        </button>
      </div>
    </div>
  );
};

export default Furniture360Viewer;
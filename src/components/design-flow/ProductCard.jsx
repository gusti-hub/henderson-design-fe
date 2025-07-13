import React, { useState, useRef, useEffect } from 'react';
import { Loader, Box } from 'lucide-react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ProductCard = ({ product, onCustomize }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  const modelContainerRef = useRef(null);
  const sceneRef = useRef(null);
  
  // Check if product has 3D model (OBJ file)
  const imageUrl = product.variants && product.variants[0]?.image?.url ? product.variants[0].image.url : null;
  const is3DModel = imageUrl && imageUrl.toLowerCase().endsWith('.obj');
  
  // Set up the 3D model viewer as soon as the component mounts
  useEffect(() => {
    if (!is3DModel || !modelContainerRef.current) return;
    
    const container = modelContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Basic Three.js setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    
    // Add multiple directional lights from different angles
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 0, 10);
    scene.add(frontLight);
    
    const sideLight = new THREE.DirectionalLight(0xffffff, 0.6);
    sideLight.position.set(10, 5, 0);
    scene.add(sideLight);
    
    const topLight = new THREE.DirectionalLight(0xffffff, 0.7);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);
    
    // Add controls for auto-rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    
    // Set a loading timeout
    const timeoutId = setTimeout(() => {
      if (!modelLoaded) {
        console.log("Model loading timed out");
        setModelError(true);
        setImageLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    // Load MTL and OBJ
    const objUrl = imageUrl;
    const mtlUrl = imageUrl.replace('.obj', '.mtl');
    
    // Create and configure MTL loader first
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
      mtlUrl,
      (materials) => {
        // MTL loaded successfully
        console.log("MTL loaded successfully");
        materials.preload();
        
        // Now load the OBJ with these materials
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        objLoader.load(
          objUrl,
          (object) => {
            // Clear timeout since model loaded successfully
            clearTimeout(timeoutId);
            
            // Object loaded successfully
            // Center and position the object
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            
            object.position.x = -center.x;
            object.position.y = -center.y;
            object.position.z = -center.z;
            
            // Scale object to fit view
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = maxDim * 2.5;
            camera.far = maxDim * 10;
            camera.updateProjectionMatrix();
            
            // Add to scene
            scene.add(object);
            setModelLoaded(true);
            setImageLoading(false);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (error) => {
            clearTimeout(timeoutId);
            console.error('Error loading OBJ:', error);
            setModelError(true);
            setImageLoading(false);
          }
        );
      },
      undefined, // onProgress callback
      (error) => {
        // MTL failed to load, try loading OBJ without materials
        console.error('Error loading MTL:', error);
        
        // If MTL fails, load OBJ with default material
        const objLoader = new OBJLoader();
        objLoader.load(
          objUrl,
          (object) => {
            clearTimeout(timeoutId);
            
            // Apply default material
            object.traverse((child) => {
              if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xA0522D,
                  roughness: 0.5,
                  metalness: 0.1
                });
              }
            });
            
            // Position and add to scene
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            
            object.position.x = -center.x;
            object.position.y = -center.y;
            object.position.z = -center.z;
            
            // Scale object to fit view
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = maxDim * 2.5;
            camera.far = maxDim * 10;
            camera.updateProjectionMatrix();
            
            scene.add(object);
            setModelLoaded(true);
            setImageLoading(false);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (error) => {
            clearTimeout(timeoutId);
            console.error('Error loading OBJ:', error);
            setModelError(true);
            setImageLoading(false);
          }
        );
      }
    );
    
    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      return animationId;
    };
    
    const animationId = animate();
    
    // Store scene reference for cleanup
    sceneRef.current = { scene, renderer, controls, animationId };
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        controls.dispose();
        sceneRef.current = null;
      }
    };
  }, [is3DModel, imageUrl, modelLoaded]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
      <div className="relative w-full h-48">
        {is3DModel ? (
          <>
            <div ref={modelContainerRef} className="w-full h-full"></div>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader className="w-8 h-8 text-[#005670] animate-spin" />
              </div>
            )}
            {modelError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/placeholder-image.png" 
                  alt={product.name} 
                  className="w-full h-full object-contain" 
                />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-[#005670] text-white px-2 py-1 rounded-md text-xs flex items-center">
              <Box className="w-3 h-3 mr-1" />
              3D Model
            </div>
          </>
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
              className="w-full h-full object-contain"
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.onerror = null;
                e.target.src = '/placeholder-image.png';
              }}
            />
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        {/* <p className="text-sm text-gray-500">{product.product_id}</p> */}
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
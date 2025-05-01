import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Loader } from 'lucide-react';

const Furniture360Viewer = ({ 
  objUrl, 
  mtlUrl, // Add this new prop for the MTL file path
  onLoad,
  initialRotation = { x: 0, y: 0, z: 0 },
  autoRotate = false
}) => {
  const [loading, setLoading] = useState(true);
  const [renderComplete, setRenderComplete] = useState(false);
  const containerRef = useRef(null);
  
  console.log("Component rendering with loading:", loading, "renderComplete:", renderComplete);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log("Setting up THREE.js scene");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    // Add directional light for better material rendering
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add a reference object to verify rendering
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Force an initial render
    renderer.render(scene, camera);
    
    // Set up controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = autoRotate;
    
    // Load the OBJ with MTL
    console.log("Starting to load OBJ from:", objUrl);
    
    const loadModel = () => {
      const objLoader = new OBJLoader();
      
      if (mtlUrl) {
        console.log("Loading MTL from:", mtlUrl);
        const mtlLoader = new MTLLoader();
        
        mtlLoader.load(
          mtlUrl,
          (materials) => {
            console.log("MTL loaded successfully");
            materials.preload();
            objLoader.setMaterials(materials);
            
            // Now load OBJ with the materials
            loadOBJ(objLoader);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% of MTL loaded');
          },
          (error) => {
            console.error("Error loading MTL:", error);
            // If MTL fails, still try to load OBJ without materials
            loadOBJ(objLoader);
          }
        );
      } else {
        // No MTL file provided, just load the OBJ
        loadOBJ(objLoader);
      }
    };
    
    const loadOBJ = (objLoader) => {
      objLoader.load(
        objUrl,
        // onLoad callback
        function(object) {
          console.log("OBJ loaded successfully");
          
          // Remove reference cube
          scene.remove(cube);
          
          // If no materials were loaded, add a default material
          if (!mtlUrl) {
            object.traverse((child) => {
              if (child.isMesh) {
                // Apply a default material with a wooden texture
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x8B4513, // Brown color for wood
                  roughness: 0.7,
                  metalness: 0.2
                });
              }
            });
          }
          
          // Apply initial rotation
          object.rotation.x = THREE.MathUtils.degToRad(initialRotation.x);
          object.rotation.y = THREE.MathUtils.degToRad(initialRotation.y);
          object.rotation.z = THREE.MathUtils.degToRad(initialRotation.z);
          
          // Add the loaded model to the scene
          scene.add(object);
          
          // Update the camera position
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          
          // Center the object
          object.position.x = -center.x;
          object.position.y = -center.y;
          object.position.z = -center.z;
          
          const maxDim = Math.max(size.x, size.y, size.z);
          camera.position.z = maxDim * 2;
          
          // Update loading state
          setLoading(false);
          setRenderComplete(true);
          console.log("States updated: loading=false, renderComplete=true");
          
          // Call onLoad callback if provided
          if (onLoad) {
            onLoad();
          }
          
          // Force a render
          renderer.render(scene, camera);
        },
        // onProgress callback
        function(xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function(err) {
          console.error("Error loading OBJ:", err);
          setLoading(false);
          if (onLoad) {
            onLoad(); // Still call onLoad to remove parent loading spinner
          }
        }
      );
    };
    
    // Start loading process
    loadModel();
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Render the scene
      renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    function handleResize() {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      console.log("Cleaning up");
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [objUrl, mtlUrl, initialRotation, autoRotate, onLoad]);
  
  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80"
          style={{ zIndex: 10 }}
        >
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <span className="ml-2 text-blue-600 font-medium">Loading 3D Model...</span>
        </div>
      )}
      
      {/* {!loading && renderComplete && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-70 px-3 py-1 rounded-lg text-sm">
          3D Model Loaded Successfully
        </div>
      )} */}
    </div>
  );
};

export default Furniture360Viewer;
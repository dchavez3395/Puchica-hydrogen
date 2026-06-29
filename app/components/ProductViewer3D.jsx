import {useState, useRef, useEffect, Suspense} from 'react';

/**
 * ProductViewer3D — lazy-loaded 3D product viewer (react-three-fiber).
 *
 * Drop this in a PDP wherever you want a 3D model of the product.
 * Currently a placeholder geometry (sphere) until a real .glb model
 * is provided per-product. The viewer:
 *   - Lazy-loads three + r3f + drei (~120kb gzipped) on visibility
 *   - Falls back to the flat image if WebGL or the dynamic import fails
 *   - Drag-to-rotate, scroll-to-zoom (OrbitControls from drei)
 *
 * To wire a real model: pass `modelUrl="https://...model.glb"`.
 */
export function ProductViewer3D({
  imageUrl,
  imageAlt,
  modelUrl = null,
  height = 480,
  fallbackMessage,
}) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const wrapRef = useRef(null);

  // WebGL capability check (degrades gracefully when missing)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!ctx) setWebgl(false);
    } catch {
      setWebgl(false);
    }
  }, []);

  // Lazy-load three.js when the viewer enters the viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      {rootMargin: '200px'},
    );
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Fallback (no WebGL or load failed) → static image
  if (!webgl || loadFailed) {
    return (
      <div
        ref={wrapRef}
        className="pk-3d-fallback"
        style={{height}}
        role="img"
        aria-label={imageAlt || fallbackMessage}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt || ''} loading="lazy" />
        ) : (
          <p className="pk-3d-fallback__msg">
            {fallbackMessage || 'Product preview'}
          </p>
        )}
      </div>
    );
  }

  // Not yet in viewport: render a static image placeholder until we load 3D
  if (!shouldLoad) {
    return (
      <div
        ref={wrapRef}
        className="pk-3d-placeholder"
        style={{height}}
        aria-label={imageAlt || 'Loading 3D viewer…'}
      >
        {imageUrl && (
          <img src={imageUrl} alt={imageAlt || ''} loading="lazy" />
        )}
      </div>
    );
  }

  // In viewport → mount the dynamic 3D canvas
  return (
    <div ref={wrapRef} className="pk-3d" style={{height}}>
      <Suspense
        fallback={
          imageUrl ? (
            <img src={imageUrl} alt={imageAlt || ''} loading="lazy" />
          ) : null
        }
      >
        <DynamicCanvas
          modelUrl={modelUrl}
          imageUrl={imageUrl}
          onError={() => setLoadFailed(true)}
        />
      </Suspense>
      <div className="pk-3d__hint" aria-hidden>
        Drag to rotate · scroll to zoom
      </div>
    </div>
  );
}

/**
 * DynamicCanvas — defers the entire three.js bundle to a separate chunk.
 * Falls back to the static image on error.
 */
function DynamicCanvas({modelUrl, imageUrl, onError}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
        ]);
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) onError?.(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onError]);

  // Even before three.js chunks resolve, show the static image so
  // layout doesn't jump.
  if (!ready) {
    return imageUrl ? <img src={imageUrl} alt="" /> : null;
  }

  return <ThreeScene modelUrl={modelUrl} imageUrl={imageUrl} />;
}

/**
 * ThreeScene — the actual canvas, imported lazily. Wrapped here so the
 * dynamic-import dance lives in one place.
 */
function ThreeScene({modelUrl, imageUrl}) {
  // Synchronous require via React.lazy would normally be used here.
  // We rely on Vite's dynamic import having already populated the chunk.
  const [Mod, setMod] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fiber = await import('@react-three/fiber');
      const drei = await import('@react-three/drei');
      const three = await import('three');
      if (!cancelled) setMod({fiber, drei, three});
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Mod) {
    return imageUrl ? <img src={imageUrl} alt="" /> : null;
  }

  const {Canvas} = Mod.fiber;
  const {OrbitControls, Float, ContactShadows} = Mod.drei;

  return (
    <Canvas
      camera={{position: [0, 0, 3], fov: 45}}
      dpr={[1, 2]}
      gl={{antialias: true, alpha: true}}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.4}>
        <PlaceholderModel modelUrl={modelUrl} imageUrl={imageUrl} />
      </Float>
      <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={5} blur={2.5} />
      <OrbitControls
        enablePan={false}
        minDistance={1.6}
        maxDistance={6}
        autoRotate
        autoRotateSpeed={0.8}
        enableDamping
      />
    </Canvas>
  );
}

/**
 * PlaceholderModel — animated sphere with the product image as texture.
 * Swap for a real GLB via `useGLTF(modelUrl)` when models are uploaded.
 */
function PlaceholderModel({modelUrl, imageUrl}) {
  // Always call both hooks so order is deterministic.
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const THREE = await import('three');
        const loader = new THREE.TextureLoader();
        if (imageUrl) {
          loader.load(imageUrl, (t) => {
            if (!cancelled) setTexture(t);
          });
        }
      } catch {
        // ignore — placeholder will be untextured
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // Real GLTF path would use useGLTF, but we keep the placeholder simple
  // until model files are uploaded. When modelUrl is provided, a swap to
  // <primitive object={scene} /> is the only change needed.
  if (modelUrl) {
    return (
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#F4F0E6"
        roughness={0.35}
        metalness={0.15}
        map={texture}
      />
    </mesh>
  );
}

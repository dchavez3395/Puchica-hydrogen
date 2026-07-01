import {useState, useRef, useEffect, Suspense, Component} from 'react';
import {useT} from '~/lib/t';

/**
 * ProductHero3D — hero-position 3D viewer for the PDP. Replaces (or
 * accompanies) the static product image with a textured product
 * floating in space.
 *
 * What you get when you click "View in 3D":
 *   - Drag to rotate, scroll to zoom (OrbitControls from drei)
 *   - Auto-rotate
 *   - 3-light studio rig (warm key + accent fill + ember rim) + a
 *     Float animation + soft contact shadow so it looks like the
 *     product is sitting on a lightbox.
 *   - "Drag to rotate · scroll to zoom" hint at the bottom
 *
 * Three representations of the product, picked automatically:
 *   1. `modelUrl` is a .glb URL → render the real model via drei's
 *      <Gltf> component. The Gltf component auto-centers the model
 *      on its bounding box origin, so we don't need to do it.
 *   2. `modelUrl` is null/unset AND `imageUrl` is present → render
 *      a textured slab as a fallback. Keeps the 3D viewer meaningful
 *      for products that haven't configured a GLB yet.
 *   3. No image and no model → don't render the canvas; the gallery
 *      won't show the toggle in the first place.
 *
 * The 3D bundle (three.js + drei + fiber) is fetched via dynamic
 * import on the FIRST click of the 3D toggle. Once cached, subsequent
 * opens are instant. Users who never opt into 3D never download
 * three.js.
 *
 * SSR-safe: the server always renders the placeholder photo, and the
 * canvas mounts only after a user clicks the 3D toggle.
 *
 * @param {{
 *   imageUrl: string;
 *   imageAlt: string;
 *   modelUrl?: string | null;
 *   accentColor?: string | null;
 * }}
 */
export function ProductHero3D({imageUrl, imageAlt, modelUrl = null, accentColor = null}) {
  const t = useT();
  // `shouldLoad` flips to true on first opt-in. Once true we run the
  // dynamic import; the placeholder photo (image mode) is shown until
  // then. Since the current ProductImage remounts this component
  // each time the user clicks the 3D toggle, we start in
  // "load-immediately" mode — the gallery only mounts us when 3D mode
  // is active.
  const [shouldLoad] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const wrapRef = useRef(null);

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

  // Fallback (no WebGL or load failed) — show the active hero photo.
  if (!webgl || loadFailed) {
    return (
      <div ref={wrapRef} className="pk-3d-fallback" role="img" aria-label={imageAlt}>
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt || ''} loading="lazy" />
        ) : null}
      </div>
    );
  }

  // Brand-new mount: render the static photo until the user opts in.
  if (!shouldLoad) {
    return (
      <div ref={wrapRef} className="pk-3d-placeholder" aria-hidden>
        {imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : null}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="pk-3d" aria-label={`${imageAlt || t('pdp_3d_fallback_product')} ${t('pdp_3d_viewer')}`}>
      <Suspense fallback={imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : null}>
        <DynamicCanvas
          imageUrl={imageUrl}
          modelUrl={modelUrl}
          accentColor={accentColor}
          onError={() => setLoadFailed(true)}
        />
      </Suspense>
      <div className="pk-3d__hint">{t('pdp_3d_hint')}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dynamic import gate — keeps three.js out of the initial bundle.    */
/* ------------------------------------------------------------------ */

function DynamicCanvas({imageUrl, modelUrl, accentColor, onError}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('three'),
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

  if (!ready) return imageUrl ? <img src={imageUrl} alt="" /> : null;
  return <ThreeScene imageUrl={imageUrl} modelUrl={modelUrl} accentColor={accentColor} />;
}

/* ------------------------------------------------------------------ */
/* The actual canvas.                                                */
/* ------------------------------------------------------------------ */

function ThreeScene({imageUrl, modelUrl, accentColor}) {
  const [Mod, setMod] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [fiber, drei, three] = await Promise.all([
        import('@react-three/fiber'),
        import('@react-three/drei'),
        import('three'),
      ]);
      if (!cancelled) setMod({fiber, drei, three});
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  if (!Mod) return imageUrl ? <img src={imageUrl} alt="" /> : null;

  const {Canvas} = Mod.fiber;
  const {OrbitControls, Float, ContactShadows, Environment, Gltf} = Mod.drei;

  // Studio rig tints — ember as the rim, the configured accent (or
  // brand lime) as the fill. At least one warm tone so the scene
  // feels curated, not neutral.
  const rim = '#CC4300';
  const fill = accentColor || '#C6FF4E';

  // Textured-card fallback in case the GLB fails to load.
  const fallback = <TexturedCard imageUrl={imageUrl} three={Mod.three} />;

  return (
    <Canvas
      camera={{position: [0, 0.2, 3.4], fov: 32}}
      dpr={[1, 2]}
      gl={{antialias: true, alpha: true}}
      shadows
    >
      {/* 3-light studio setup */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 6, 5]} intensity={1.4} castShadow color="#FFF4E0" />
      <directionalLight position={[-5, 1, -4]} intensity={0.55} color={fill} />
      <directionalLight position={[0, 4, -6]} intensity={0.35} color={rim} />
      {/* HDR environment for reflective materials */}
      <Environment preset="studio" />

      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.5}>
        <SceneContent
          imageUrl={imageUrl}
          modelUrl={modelUrl}
          Gltf={Gltf}
          three={Mod.three}
          fallback={fallback}
        />
      </Float>

      <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={6} blur={2.4} far={2} />

      <OrbitControls
        enablePan={false}
        minDistance={2.4}
        maxDistance={5}
        autoRotate
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* SceneContent — picks the right representation.                    */
/* ------------------------------------------------------------------ */

function SceneContent({imageUrl, modelUrl, Gltf, three, fallback}) {
  const isGlb = typeof modelUrl === 'string' && /\.glb($|\?)/i.test(modelUrl);

  if (isGlb) {
    return (
      <GltfErrorBoundary fallback={fallback}>
        <Gltf src={modelUrl} scale={1.4} />
      </GltfErrorBoundary>
    );
  }
  return <TexturedCard imageUrl={imageUrl} three={three} />;
}

/**
 * GltfErrorBoundary — catches any error from drei's <Gltf> loader
 * (bad URL, parse error, CORS) and falls back to the textured card
 * so the 3D viewer never crashes the page.
 */
class GltfErrorBoundary extends Component {
  state = {err: null};
  static getDerivedStateFromError(err) { return {err}; }
  componentDidCatch() { /* swallow */ }
  render() {
    if (this.state.err) return this.props.fallback;
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/* TexturedCard — fallback slab using the current hero image.        */
/* ------------------------------------------------------------------ */

function TexturedCard({imageUrl, three}) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!imageUrl) return;
      try {
        const THREE = three || (await import('three'));
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        loader.load(imageUrl, (t) => {
          if (!cancelled) {
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = 8;
            setTexture(t);
          }
        });
      } catch {
        // ignore — render untextured card
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUrl, three]);

  return (
    <mesh castShadow receiveShadow>
      <planeGeometry args={[1.6, 2.0]} />
      <meshStandardMaterial
        color="#F4F0E6"
        roughness={0.3}
        metalness={0.08}
        map={texture}
        side={2 /* THREE.DoubleSide */}
      />
    </mesh>
  );
}

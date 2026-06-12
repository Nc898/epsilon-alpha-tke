import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * The signature 3D moment: the actual TKE crest as a spinning 3D badge —
 * the crest artwork (red triangle, white ΤΚΕ, black border) texture-mapped
 * onto a bevel-extruded triangle with a black rim, tilting toward the
 * pointer. Lazy-loaded by CreedSection, which only mounts this on
 * fine-pointer devices without reduced motion.
 */
export default function Triangle3D({ className }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL — CreedSection's Suspense fallback already showed the crest
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 8;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Downward-pointing equilateral triangle — matches the crest artwork,
    // whose 1220×1055 bounds are almost exactly the 2:√3 triangle ratio.
    const s = 2.3;
    const h = s * 0.866;
    const shape = new THREE.Shape();
    shape.moveTo(-s, h);
    shape.lineTo(s, h);
    shape.lineTo(0, -h);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.45,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 4,
    });
    geometry.center();

    // ExtrudeGeometry UVs are the shape's own x/y coordinates; remap the
    // crest image across the shape's bounding box so the artwork lands
    // exactly on the face. Clamped edge pixels (the artwork's black border)
    // cover the bevel margin.
    const texture = new THREE.TextureLoader().load('/assets/tke-crest.png', () => {
      faceMat.color.set('#ffffff'); // pre-load red placeholder → pure texture
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.repeat.set(1 / (2 * s), 1 / (2 * h));
    texture.offset.set(0.5, 0.5);

    const faceMat = new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color('hsl(1, 66%, 41%)'), // shown until the texture loads
      metalness: 0.2,
      roughness: 0.45,
    });
    // Black rim — extrusion walls + bevel ring, like the logo's border edge
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x121212,
      metalness: 0.6,
      roughness: 0.35,
    });

    const mesh = new THREE.Mesh(geometry, [faceMat, sideMat]);
    const group = new THREE.Group(); // group tilts toward pointer, mesh spins
    group.add(mesh);
    scene.add(group);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(4, 5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(-4, 2, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xff7a75, 1.0);
    rim.position.set(-5, -2, -4);
    scene.add(rim);

    let targetTiltX = 0;
    let targetTiltY = 0;
    const onPointer = (e) => {
      const r = mount.getBoundingClientRect();
      targetTiltY = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      targetTiltX = ((e.clientY - r.top) / r.height - 0.5) * 0.45;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const resize = () => {
      const w = mount.clientWidth;
      const ht = mount.clientHeight;
      if (!w || !ht) return;
      renderer.setSize(w, ht);
      camera.aspect = w / ht;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf;
    const tick = () => {
      const t = clock.getElapsedTime();
      mesh.rotation.y = t * 0.45;
      group.position.y = Math.sin(t * 0.8) * 0.15;
      group.rotation.x += (targetTiltX - group.rotation.x) * 0.05;
      group.rotation.y += (targetTiltY - group.rotation.y) * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      geometry.dispose();
      texture.dispose();
      faceMat.dispose();
      sideMat.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

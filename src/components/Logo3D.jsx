import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Spinning 3D logo badge in raw three.js. Two shapes:
 * - 'triangle': the TKE crest texture-mapped onto a bevel-extruded triangle
 *   with a black rim (the chapter's signature 3D moment)
 * - 'disc': a coin — logo artwork composited onto white faces with a red rim
 *   (used for the St. Jude badge on Philanthropy)
 *
 * Slow spin + float bob + pointer tilt. Callers gate mounting to fine-pointer
 * devices without reduced motion and provide a static-image fallback.
 */
export default function Logo3D({ shape = 'triangle', textureUrl = '/assets/tke-crest.webp', className }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL — caller's fallback image already rendered
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 8;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(1, 1); // real size comes from ResizeObserver; avoids the 300×150 default flashing oversized
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    const disposables = [];
    const spinner = new THREE.Group(); // spins on Y
    const group = new THREE.Group(); // tilts toward pointer
    group.add(spinner);
    scene.add(group);

    if (shape === 'triangle') {
      // Downward-pointing equilateral triangle — matches the crest artwork
      const s = 2.3;
      const h = s * 0.866;
      const tri = new THREE.Shape();
      tri.moveTo(-s, h);
      tri.lineTo(s, h);
      tri.lineTo(0, -h);
      tri.closePath();

      const geometry = new THREE.ExtrudeGeometry(tri, {
        depth: 0.45,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 4,
      });
      geometry.center();

      // ExtrudeGeometry UVs are shape-space coords; remap the crest across
      // the bounding box. Clamped edge pixels cover the bevel margin.
      const texture = new THREE.TextureLoader().load(textureUrl, () => {
        faceMat.color.set('#ffffff');
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
      const sideMat = new THREE.MeshStandardMaterial({ color: 0x121212, metalness: 0.6, roughness: 0.35 });

      spinner.add(new THREE.Mesh(geometry, [faceMat, sideMat]));
      disposables.push(geometry, texture, faceMat, sideMat);
    } else {
      // Coin: circle faces + open-ended cylinder rim. The logo is drawn onto
      // a white canvas so transparent artwork gets a clean badge face.
      const r = 2.4;
      const depth = 0.32;

      const faceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.15, roughness: 0.5 });
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xc8102e, metalness: 0.45, roughness: 0.35 });

      const img = new Image();
      img.onload = () => {
        const size = 1024;
        const cv = document.createElement('canvas');
        cv.width = cv.height = size;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        const scale = (size * 0.78) / Math.max(img.width, img.height);
        const w = img.width * scale;
        const hh = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - hh) / 2, w, hh);
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        faceMat.map = tex;
        faceMat.needsUpdate = true;
        disposables.push(tex);
      };
      img.src = textureUrl;

      const front = new THREE.CircleGeometry(r, 64);
      const back = new THREE.CircleGeometry(r, 64);
      const rim = new THREE.CylinderGeometry(r, r, depth, 64, 1, true);
      rim.rotateX(Math.PI / 2);

      const frontMesh = new THREE.Mesh(front, faceMat);
      frontMesh.position.z = depth / 2;
      const backMesh = new THREE.Mesh(back, faceMat);
      backMesh.position.z = -depth / 2;
      backMesh.rotation.y = Math.PI;
      const rimMesh = new THREE.Mesh(rim, rimMat);

      spinner.add(frontMesh, backMesh, rimMesh);
      disposables.push(front, back, rim, faceMat, rimMat);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(4, 5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(-4, 2, 5);
    scene.add(fill);
    const rimLight = new THREE.DirectionalLight(0xff7a75, 1.0);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    let targetTiltX = 0;
    let targetTiltY = 0;
    const onPointer = (e) => {
      const rect = mount.getBoundingClientRect();
      targetTiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
      targetTiltX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.45;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Spin control: hovering brakes the auto-spin; moving the cursor across
    // the logo scrubs it directly (either direction) and imparts momentum,
    // so after leaving it cruises at base speed in whichever direction the
    // user last flicked it.
    const BASE_SPEED = 0.45; // rad/s
    let spinVelocity = BASE_SPEED;
    let spinDirection = 1;
    const MAX_FLICK = 4; // rad/s
    let hovering = false;
    let lastDragX = null;
    let lastDragTime = 0;

    const onEnter = () => {
      hovering = true;
      lastDragX = null;
    };
    const onLeave = () => {
      hovering = false;
      lastDragX = null;
      if (spinVelocity !== 0) spinDirection = Math.sign(spinVelocity);
    };
    const onDrag = (e) => {
      if (!hovering) return;
      if (lastDragX !== null) {
        const dx = e.clientX - lastDragX;
        const dtSec = (e.timeStamp - lastDragTime) / 1000;
        spinner.rotation.y += dx * 0.012; // scrub with the cursor
        if (dtSec > 0) {
          // flick momentum from real cursor speed, capped so it can't whirl
          spinVelocity = THREE.MathUtils.clamp((dx * 0.012) / dtSec, -MAX_FLICK, MAX_FLICK);
        }
      }
      lastDragX = e.clientX;
      lastDragTime = e.timeStamp;
    };
    mount.addEventListener('pointerenter', onEnter);
    mount.addEventListener('pointerleave', onLeave);
    mount.addEventListener('pointermove', onDrag, { passive: true });

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
      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.getElapsedTime();
      if (hovering) {
        // Brake toward a stop; onDrag re-injects velocity while moving
        spinVelocity += (0 - spinVelocity) * Math.min(1, dt * 6);
      } else {
        // Cruise back to base speed in the user's last spin direction
        spinVelocity += (BASE_SPEED * spinDirection - spinVelocity) * Math.min(1, dt * 1.5);
      }
      spinner.rotation.y += spinVelocity * dt;
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
      mount.removeEventListener('pointerenter', onEnter);
      mount.removeEventListener('pointerleave', onLeave);
      mount.removeEventListener('pointermove', onDrag);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [shape, textureUrl]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

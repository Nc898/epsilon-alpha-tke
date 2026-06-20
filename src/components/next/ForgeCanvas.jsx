import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Full-screen WebGL "forge" — domain-warped fbm noise rendered as crimson
 * embers rising out of black, brightening and bending toward the cursor.
 * Raw three.js (a clip-space quad + fragment shader), pixel-ratio capped for
 * perf, frozen to a single static frame for reduced-motion users. If WebGL is
 * unavailable it renders nothing and the parent's CSS gradient shows through.
 */
const VERT = `
  varying vec2 v_uv;
  void main() { v_uv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec2  u_mouse;
  varying vec2  v_uv;

  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.0 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = v_uv;
    float aspect = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = u_time * 0.035;

    // domain-warped noise, scrolling upward (embers rise)
    vec2 fp = p * 3.2; fp.y -= t * 2.0;
    vec2 q = vec2(fbm(fp), fbm(fp + vec2(3.1, 1.7)));
    float f = fbm(fp + 1.7 * q);

    // SPARSE embers — only the upper noise peaks ignite, sharpened
    float ember = pow(smoothstep(0.55, 0.86, f), 1.7);

    // warmth only near the very bottom edge (forge glow)
    float grad = smoothstep(0.32, -0.12, uv.y);

    // subtle, small cursor light (off-screen until the pointer moves)
    vec2 mm = vec2(u_mouse.x * aspect, u_mouse.y);
    float mlight = smoothstep(0.32, 0.0, distance(p, mm)) * 0.40;

    float heat = ember * 0.85 + grad * 0.42 + mlight;

    // deep black base; add crimson then bright ember only at peaks
    vec3 col = vec3(0.016, 0.011, 0.013);
    col += vec3(0.44, 0.075, 0.055) * smoothstep(0.12, 0.6, heat);   // crimson glow
    col += vec3(0.98, 0.36, 0.13)  * smoothstep(0.62, 1.0, heat);    // bright ember

    // keep the headline zone (center) dark so type stays crisp
    float centerDark = smoothstep(0.16, 0.62, length((uv - vec2(0.5, 0.46)) * vec2(1.0, 1.25)));
    col *= mix(0.42, 1.0, centerDark);

    // outer vignette
    col *= smoothstep(1.28, 0.42, length(uv - 0.5));

    // fine film grain
    col += (hash(uv * (u_time + 1.0)) - 0.5) * 0.018;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function ForgeCanvas({ className }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {
      return; // no WebGL — parent gradient shows through
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0.5, -0.4) },
    };
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.u_res.value.set(w, h);
      if (reduce) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const target = new THREE.Vector2(0.5, -0.4);
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf;
    const clock = new THREE.Clock();
    if (reduce) {
      uniforms.u_time.value = 3.0;
      renderer.render(scene, camera);
    } else {
      const loop = () => {
        uniforms.u_time.value += clock.getDelta();
        uniforms.u_mouse.value.lerp(target, 0.045);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}

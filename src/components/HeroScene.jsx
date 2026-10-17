import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer, heroScroll } from '../lib/motion'

const { damp, lerp, smoothstep } = THREE.MathUtils

// Smoothed copy of the hero scroll progress, shared by every object in the scene.
const scroll = { p: 0 }

/* ────────── Radar terrain: a rolling field of points with a sweep passing over it ────────── */

const terrainVertex = /* glsl */ `
  uniform float uTime;
  attribute float aRand;
  varying float vHot;
  varying float vFade;
  varying float vRand;

  void main() {
    vec3 p = position;
    float d = length(p.xy);
    float ang = atan(p.y, p.x);
    float sweep = mod(ang - uTime * 0.6, 6.2831853);
    float trail = exp(-sweep * 1.6) * smoothstep(34.0, 2.0, d);
    float h = sin(p.x * 0.2 + uTime * 0.45) * 0.55
            + cos(p.y * 0.17 - uTime * 0.3) * 0.55
            + sin((p.x + p.y) * 0.07 + uTime * 0.2) * 0.8;
    p.z += h + trail * 0.9;

    vHot = trail;
    vFade = smoothstep(34.0, 8.0, d);
    vRand = aRand;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.2 + aRand * 1.4 + trail * 4.5) * (24.0 / -mv.z);
  }
`

const terrainFragment = /* glsl */ `
  uniform vec3 uHot;
  uniform vec3 uBase;
  varying float vHot;
  varying float vFade;
  varying float vRand;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.05, r);
    vec3 col = mix(uBase, uHot, clamp(vHot * 1.5, 0.0, 1.0));
    gl_FragColor = vec4(col, a * vFade * (0.22 + vHot * 0.95 + vRand * 0.15));
  }
`

function Terrain() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(72, 72, 160, 160)
    const n = g.attributes.position.count
    const r = new Float32Array(n)
    for (let i = 0; i < n; i++) r[i] = Math.random()
    g.setAttribute('aRand', new THREE.BufferAttribute(r, 1))
    return g
  }, [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHot: { value: new THREE.Color('#B6F36A') },
      uBase: { value: new THREE.Color('#2A6B5C') },
    }),
    [],
  )
  const ref = useRef()
  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05) * (1 + scroll.p * 2.5)
    ref.current.rotation.x = -Math.PI / 2.2 + scroll.p * 0.35
    ref.current.position.y = -4.2 - scroll.p * 1.5
  })
  return (
    <points ref={ref} geometry={geometry} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -4.2, -9]}>
      <shaderMaterial
        vertexShader={terrainVertex}
        fragmentShader={terrainFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Rig() {
  useFrame(({ camera }, dt) => {
    scroll.p = damp(scroll.p, heroScroll.p, 6, dt)
    const p = scroll.p
    camera.position.x = damp(camera.position.x, pointer.x * 0.6 * (1 - p), 2, dt)
    camera.position.y = damp(camera.position.y, 0.4 + pointer.y * 0.3 * (1 - p), 2, dt)
    camera.position.z = lerp(8, 4.6, smoothstep(p, 0.1, 1))
    camera.lookAt(0, -0.2 * p, -2)
  })
  return null
}

export default function HeroScene() {
  const wrap = useRef(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="hero-canvas">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0.4, 8], fov: 42, near: 0.1, far: 90 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Rig />
        <Terrain />
      </Canvas>
    </div>
  )
}

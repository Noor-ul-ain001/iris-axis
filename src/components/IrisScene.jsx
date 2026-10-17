import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '../lib/motion'
import { BLADE_POINTS } from './Logo'

// The IRIS AXIS mark as a 3D aperture. Scroll progress (0..1) drives four acts:
//   Consultation – the closed mark assembles from scattered blades
//   Secure Setup – camera nodes fly in and link to the ring
//   Monitoring   – the blades open and the lens lights up
//   Reporting    – event pulses ripple outward

const { damp, lerp, smoothstep, clamp } = THREE.MathUtils
const ss = (a, b, x) => smoothstep(x, a, b)

const BLADES = 8
const NODES = 6
const TICKS = 72
const SCALE = 1 / 100

// Blade geometry from the traced brand mark, centred on its own centroid so it
// can spin in place while the group places it around the ring.
const CENTROID = BLADE_POINTS.reduce((a, [x, y]) => [a[0] + x / 4, a[1] + y / 4], [0, 0])

function makeBladeGeometry() {
  const s = new THREE.Shape()
  BLADE_POINTS.forEach(([x, y], i) => {
    const px = (x - CENTROID[0]) * SCALE
    const py = -(y - CENTROID[1]) * SCALE
    if (i === 0) s.moveTo(px, py)
    else s.lineTo(px, py)
  })
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.02,
    bevelSegments: 3,
  })
  g.translate(0, 0, -0.08)
  return g
}

const BASE = new THREE.Vector2(CENTROID[0] * SCALE, -CENTROID[1] * SCALE)

function Aperture({ progress }) {
  const tilt = useRef()
  const spin = useRef()
  const blades = useRef([])
  const lens = useRef()
  const irisMat = useRef()
  const nodes = useRef([])
  const pulses = useRef([])
  const ticks = useRef()
  const links = useRef()
  const p = useRef(0)

  const bladeGeo = useMemo(makeBladeGeometry, [])
  const scatter = useMemo(
    () =>
      Array.from({ length: BLADES }, () => ({
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 6,
        z: -2 - Math.random() * 3,
        r: (Math.random() - 0.5) * 6,
      })),
    [],
  )

  const linkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NODES * 6), 3))
    return g
  }, [])

  useEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    for (let i = 0; i < TICKS; i++) {
      const a = (i / TICKS) * Math.PI * 2
      const long = i % 6 === 0
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a)
      m.compose(new THREE.Vector3(Math.cos(a) * 3.1, Math.sin(a) * 3.1, 0), q, new THREE.Vector3(long ? 0.24 : 0.1, 0.018, 0.018))
      ticks.current.setMatrixAt(i, m)
    }
    ticks.current.instanceMatrix.needsUpdate = true
  }, [])

  const v = useMemo(() => new THREE.Vector2(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    p.current = damp(p.current, progress.current, 3.5, dt)
    const k = p.current

    const assemble = ss(0.0, 0.2, k)
    const connect = ss(0.22, 0.45, k)
    const open = ss(0.48, 0.7, k)
    const respond = ss(0.74, 0.92, k)

    tilt.current.rotation.x = damp(tilt.current.rotation.x, -pointer.y * 0.3 - 0.1 + open * 0.1, 3, dt)
    tilt.current.rotation.y = damp(tilt.current.rotation.y, pointer.x * 0.45, 3, dt)
    spin.current.rotation.z = -t * 0.08 - k * Math.PI * 1.5

    // Blades: scattered -> brand mark -> opened aperture.
    blades.current.forEach((b, i) => {
      const a = (-i * Math.PI) / 4
      v.copy(BASE).rotateAround(new THREE.Vector2(0, 0), a)
      const push = 1 + open * 0.75
      const s = scatter[i]
      b.position.set(lerp(s.x, v.x * push, assemble), lerp(s.y, v.y * push, assemble), lerp(s.z, Math.sin(t + i) * 0.03, assemble))
      b.rotation.set(0, lerp(s.r, 0, assemble), a + lerp(s.r, 0, assemble) + open * 0.9)
    })

    lens.current.scale.setScalar(Math.max(0.001, lerp(0.05, 1, open)))
    irisMat.current.emissiveIntensity = 0.5 + open * 2.4 + respond * Math.abs(Math.sin(t * 4)) * 2

    const pos = links.current.geometry.attributes.position
    nodes.current.forEach((n, i) => {
      const a = (i / NODES) * Math.PI * 2 + t * 0.15
      const r = lerp(8, 3.8, connect)
      const z = lerp(-4, 0, connect)
      n.position.set(Math.cos(a) * r, Math.sin(a) * r, z)
      n.lookAt(0, 0, 0)
      n.scale.setScalar(clamp(connect * 1.4, 0.001, 1))
      pos.setXYZ(i * 2, Math.cos(a) * r, Math.sin(a) * r, z)
      pos.setXYZ(i * 2 + 1, Math.cos(a) * 3.1, Math.sin(a) * 3.1, 0)
    })
    pos.needsUpdate = true
    links.current.material.opacity = connect * 0.6

    ticks.current.rotation.z = t * 0.05 + k * 0.8
    ticks.current.scale.setScalar(lerp(0.6, 1, assemble))

    pulses.current.forEach((m, i) => {
      const phase = (t * 0.45 + i / 3) % 1
      m.scale.setScalar(1 + phase * 3)
      m.material.opacity = (1 - phase) * respond * 0.8
    })
  })

  return (
    <group ref={tilt}>
      <group ref={spin}>
        {Array.from({ length: BLADES }, (_, i) => (
          <mesh key={i} ref={(el) => (blades.current[i] = el)} geometry={bladeGeo}>
            <meshStandardMaterial color="#FBF5DC" metalness={0.55} roughness={0.25} emissive="#0B3A30" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>

      <group ref={lens}>
        <mesh>
          <sphereGeometry args={[1.05, 48, 48]} />
          <meshPhysicalMaterial color="#022620" metalness={0.9} roughness={0.12} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0, 0.92]}>
          <torusGeometry args={[0.48, 0.06, 20, 72]} />
          <meshStandardMaterial ref={irisMat} color="#B6F36A" emissive="#B6F36A" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, 0, 1.0]}>
          <circleGeometry args={[0.28, 40]} />
          <meshBasicMaterial color="#00110D" />
        </mesh>
      </group>

      <mesh>
        <torusGeometry args={[2.85, 0.01, 8, 180]} />
        <meshBasicMaterial color="#1E5A51" />
      </mesh>
      <instancedMesh ref={ticks} args={[null, null, TICKS]}>
        <boxGeometry />
        <meshBasicMaterial color="#B7C9C0" />
      </instancedMesh>

      <lineSegments ref={links} geometry={linkGeo}>
        <lineBasicMaterial color="#B6F36A" transparent opacity={0} />
      </lineSegments>

      {Array.from({ length: NODES }, (_, i) => (
        <group key={i} ref={(el) => (nodes.current[i] = el)}>
          <mesh>
            <boxGeometry args={[0.24, 0.24, 0.44]} />
            <meshStandardMaterial color="#FBF5DC" metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.06, 20]} />
            <meshStandardMaterial color="#B6F36A" emissive="#B6F36A" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} ref={(el) => (pulses.current[i] = el)}>
          <ringGeometry args={[1.1, 1.13, 120]} />
          <meshBasicMaterial color="#B6F36A" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

export default function IrisScene({ progress }) {
  const wrap = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="iris-canvas">
      <Canvas dpr={[1, 1.75]} frameloop={visible ? 'always' : 'never'} camera={{ position: [0, 0, 10.5], fov: 40 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 6]} intensity={2.4} />
        <pointLight position={[-4, -3, 3]} intensity={50} color="#B6F36A" />
        <pointLight position={[4, 3, -2]} intensity={40} color="#FBF5DC" />
        <Aperture progress={progress} />
      </Canvas>
    </div>
  )
}

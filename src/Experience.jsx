import { OrbitControls, useGLTF } from "@react-three/drei"
import {
  Physics,
  RigidBody,
  CuboidCollider,
  CylinderCollider,
  BallCollider,
  InstancedRigidBodies,
} from "@react-three/rapier"
import { Perf } from "r3f-perf"
import { useRef, useState, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function Experience() {
  const cube = useRef()
  const twister = useRef()

  // prevent the hit sound from being rerendered
  const [hitSound] = useState(() => new Audio("/hit.mp3"))

  const cubeJump = () => {
    // get mass so we can move the cube up the same amount regardless of mass
    const mass = cube.current.mass()
    cube.current.applyImpulse({ x: 0, y: 5 * mass, z: 0 })
    cube.current.applyTorqueImpulse({
      x: Math.random() - 0.5,
      y: 1,
      z: Math.random() - 0.5,
    })
  }

  // cubes
  const cubesCount = 100
  const instances = useMemo(() => {
    const instances = []

    for (let i = 0; i < cubesCount; i++) {
      instances.push({
        key: "instance_" + i,
        position: [
          (Math.random() - 0.5) * 8,
          6 + i * 0.2,
          (Math.random() - 0.5) * 8,
        ],
        rotation: [Math.random(), Math.random(), Math.random()],
      })
    }

    return instances
  }, [])
  //   const cubes = useRef()

  // add cubes to the instanced mesh
  //   useEffect(() => {
  //     for (let i = 0; i < cubesCount; i++) {
  //       const matrix = new THREE.Matrix4()
  //       matrix.compose(
  //         new THREE.Vector3(i * Math.random() - 0.5), // position
  //         new THREE.Quaternion(), // rotation
  //         new THREE.Vector3(1, 1, 1) // scale
  //       )
  //       cubes.current.setMatrixAt(i, matrix)
  //     }
  //   }, [])

  useFrame((state) => {
    // Rotate the twister
    const time = state.clock.getElapsedTime()
    const eulerRotation = new THREE.Euler(0, time * 3, 0)
    const quaternionRotation = new THREE.Quaternion()
    quaternionRotation.setFromEuler(eulerRotation)
    twister.current.setNextKinematicRotation(quaternionRotation)

    // Move the twister around a circle
    const angle = time * 0.5
    const x = Math.sin(angle) * 2
    const z = Math.cos(angle) * 2
    twister.current.setNextKinematicTranslation({ x: x, y: -0.8, z: z })
  })

  // Play sound when collision happens
  const collisionEnter = (event) => {
    hitSound.currentTime = 0
    hitSound.volume = Math.random()
    hitSound.play()
  }

  const hamburger = useGLTF("/hamburger.glb")

  return (
    <>
      <Perf position="top-left" />
      <OrbitControls makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />

      <Physics debug gravity={[0, -9.08, 0]} gravityScale={0.2}>
        <RigidBody colliders="ball">
          <mesh castShadow position={[-1.5, 2, 0]}>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>

        {/* Cube */}
        <RigidBody
          position={[1.5, 2, 0]}
          ref={cube}
          gravityScale={1}
          restitution={0.5}
          friction={0.7}
          colliders={false}
          onCollisionEnter={collisionEnter}
        >
          <CuboidCollider mass={500} args={[0.5, 0.5, 0.5]}></CuboidCollider>
          <mesh castShadow onClick={cubeJump}>
            <boxGeometry />
            <meshStandardMaterial color="skyblue" />
          </mesh>
        </RigidBody>

        {/* Torus */}
        {/* <RigidBody
          colliders={false}
          position={[0, 1, 0]}
          rotation={[Math.PI * 0.5, 0, 0]}
        >
           <CuboidCollider args={[1.5, 1.5, 0.5]} />
          <CuboidCollider
            args={[0.25, 1, 0.25]}
            position={[0, 0, 1]}
            rotation={[-Math.PI * 0.5, 0, 0]}
          /> 
          <BallCollider args={[1.5]} />
          <mesh castShadow>
            <torusGeometry args={[1, 0.5, 16, 32]} />
            <meshStandardMaterial color="mediumpurple" />
          </mesh>
        </RigidBody> */}

        {/* Long box */}
        <RigidBody
          position={[0, -0.8, 0]}
          friction={0}
          type="kinematicPosition"
          ref={twister}
        >
          <mesh castShadow scale={[0.4, 0.4, 3]}>
            <boxGeometry />
            <meshStandardMaterial color="red" />
          </mesh>
        </RigidBody>

        {/* Cubes */}
        <InstancedRigidBodies instances={instances}>
          <instancedMesh args={[null, null, cubesCount]}>
            <boxGeometry />
            <meshStandardMaterial color="skyblue" />
          </instancedMesh>
        </InstancedRigidBodies>

        {/* Floor */}
        <RigidBody type="fixed" friction={0.7}>
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="greenyellow" />
          </mesh>
        </RigidBody>

        {/* Walls */}
        <RigidBody type="fixed">
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, 5.5]} />
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, -5.5]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[5.5, 1, 0]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[-5.5, 1, 0]} />
        </RigidBody>

        {/* Hamburger */}
        <RigidBody position={[0, 4, 0]} colliders={false}>
          <CylinderCollider args={[0.5, 1.25]} />
          <primitive object={hamburger.scene} scale={0.25} />
        </RigidBody>
      </Physics>
    </>
  )
}

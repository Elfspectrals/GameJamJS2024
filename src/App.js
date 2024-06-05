import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4001'); 

const App = () => {
  const mountRef = useRef(null);
  const keyboard = {};
  const player = { height: 1.8, speed: 0.2, turnSpeed: Math.PI * 0.02 };
  const USE_WIREFRAME = false;
  const isMouseDownRef = useRef(false);
  const [playerColor, setPlayerColor] = useState('white');

  useEffect(() => {
    let scene, camera, renderer, mesh1, mesh2, mesh3, meshFloor, raycaster;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

      const commonHeight = 2;

      mesh1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: "red", wireframe: USE_WIREFRAME })
      );
      mesh1.position.y = commonHeight;
      scene.add(mesh1);

      mesh2 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: "blue", wireframe: USE_WIREFRAME })
      );
      mesh2.position.set(camera.position.x - 4, commonHeight, camera.position.y - 2);
      scene.add(mesh2);

      mesh3 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: "green", wireframe: USE_WIREFRAME })
      );
      mesh3.position.set(camera.position.x + 4, commonHeight, camera.position.y - 2);
      scene.add(mesh3);

      meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
      );
      meshFloor.rotation.x -= Math.PI / 2; 
      scene.add(meshFloor);

      camera.position.set(0, player.height, -5);
      camera.lookAt(new THREE.Vector3(0, player.height, 0));

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Initialize Raycaster
      raycaster = new THREE.Raycaster();

      animate();
    };

    const animate = () => {
      requestAnimationFrame(animate);

      // Keyboard movement inputs
      if (keyboard[90]) { // Z key
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
      }
      if (keyboard[83]) { // S key
        camera.position.x += Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
      }
      if (keyboard[81]) { // Q key
        camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
      }
      if (keyboard[68]) { // D key
        camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
      }

      // Keyboard turn inputs
      if (keyboard[37]) { // left arrow key
        camera.rotation.y -= player.turnSpeed;
      }
      if (keyboard[39]) { // right arrow key
        camera.rotation.y += player.turnSpeed;
      }

      // Update Raycaster
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects([mesh1, mesh2, mesh3]);

      if (intersects.length > 0 && isMouseDownRef.current) {
        console.log('La caméra regarde un mesh:', intersects[0].object);
        intersects[0].object.material.color.set(playerColor);
        socket.emit('objectIntersected', { objectId: intersects[0].object.id, color: playerColor });
      }

      renderer.render(scene, camera);
    };

    const keyDown = (event) => {
      keyboard[event.keyCode] = true;
    };

    const keyUp = (event) => {
      keyboard[event.keyCode] = false;
    };

    const mouseDown = (event) => {
      if (event.button === 0) { // Left mouse button
        isMouseDownRef.current = true;
      }
    };

    const mouseUp = (event) => {
      if (event.button === 0) { // Left mouse button
        isMouseDownRef.current = false;
      }
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    socket.on('objectIntersected', ({ objectId, color }) => {
      [mesh1, mesh2, mesh3].forEach(mesh => {
        if (mesh.id === objectId) {
          mesh.material.color.set(color);
        }
      });
    });

    socket.on('assignColor', (color) => {
      setPlayerColor(color);
    });

    init();

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
      socket.off('objectIntersected');
      socket.off('assignColor');
      if (renderer && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [playerColor]);

  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
  );
};

export default App;

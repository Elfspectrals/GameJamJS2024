import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, mesh, meshTwo, character, level;

function createFloor() {
    let floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: false })
    );

    // Position the floor half a unit below the player
    floor.position.y = -.5;
    floor.rotation.x = -Math.PI / 2;

    scene.add(floor);
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000);

    

    const gridHelper = new THREE.GridHelper(100, 10);
    scene.add(gridHelper);

    mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    );
    scene.add(mesh);

    meshTwo = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 'red' })
    );
    scene.add(meshTwo);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    createFloor();

    camera.position.set(0, 0, 3);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.addEventListener('keydown', characterMovement);
    animate();

    let characterLoader = new GLTFLoader();
    characterLoader.load('../assets/Character/scene.gltf', function (gltfLoaded) {
        character = gltfLoaded.scene;
        character.scale.set(0.1, 0.1, 0.1);

        scene.add(character);

        const boundingBox = new THREE.Box3().setFromObject(character);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        camera.position.copy(center);
        camera.position.x -= size.x * 2;
        camera.position.y += size.y / 2;
        camera.position.z += size.z * 2;
        camera.lookAt(center);
    });

    let levelLoader = new GLTFLoader();
    levelLoader.load('../assets/levelTest/scene.gltf', function (gltfLoaded) {
        level = gltfLoaded.scene;
        level.scale.set(10, 10, 10);
        scene.add(level);
    });
}

function characterMovement(event) {
    let speed = 5;
    switch (event.key) {
        case 'z':
            character.position.z += speed;
            camera.position.z += speed;
            break;
        case 's':
            character.position.z -= speed;
            camera.position.z -= speed;
            break;
        case 'd':
            character.position.x -= speed;
            camera.position.x -= speed;
            break;
        case 'q':
            character.position.x += speed;
            camera.position.x += speed;
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}

window.onload = init;

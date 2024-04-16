import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, mesh, meshTwo, gltf;

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Couleur blanche, intensité 0.5
    scene.add(ambientLight);

    createFloor();

    camera.position.set(0, 0, 3);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.update();

    document.addEventListener('keydown', characterMovement);
    animate();

    // Load the GLTF model
    let loader = new GLTFLoader();
    loader.load('../assets/scene.gltf', function (gltfLoaded) {
        gltf = gltfLoaded;
        gltf.scene.scale.set(0.1, 0.1, 0.1); // Scale the entire scene

        scene.add(gltf.scene);

        // Set camera position relative to the loaded model
        const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        // Set camera position and lookAt based on the loaded model
        camera.position.copy(center);
        // TODO : add camera from behind
        camera.position.x -= size.x * 2; // Move camera to the right of the model
        camera.position.y += size.y / 2; // Adjust camera height
        camera.position.z += size.z * 2; // Move camera back along Z-axis to get a good view
        camera.lookAt(center); // Look at the center of the loaded model
    });
}


function characterMovement(event) {
    let speed = 0.5;
    switch (event.key) {
        case 'z':
            gltf.scene.position.z += speed;
            camera.position.z += speed;
            break;
        case 's':
            gltf.scene.position.z -= speed;
            camera.position.z -= speed;
            break;
        case 'd':
            gltf.scene.position.x -= speed;

            camera.position.x -= speed;
            break;
        case 'q':
            gltf.scene.position.x += speed;
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

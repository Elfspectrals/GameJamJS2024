import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
let scene, camera, renderer, character, level;


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



    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    createFloor();

    scene.add(camera);

    camera.position.x -= 0;
    camera.position.y += 10;
    camera.position.z += 1995;
    camera.rotation.y += Math.PI;


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
        character.position.z = 2010;
    });



    let levelLoader = new GLTFLoader();
    levelLoader.load('../assets/levelTest/scene.gltf', function (gltfLoaded) {
        level = gltfLoaded.scene;
        level.scale.set(10, 10, 10);
        level.position.set(5, 0, 5); // Définir la position du niveau
        scene.add(level);
    });
}

function characterMovement(event) {
    let speed = 5; // You can adjust the speed as needed

    switch (event.key) {
        case 'z':
            moveCharacterAndCamera(0, 0, speed);
            break;
        case 's':
            moveCharacterAndCamera(0, 0, -speed);
            break;
        case 'd':
            moveCharacterAndCamera(-speed, 0, 0);
            break;
        case 'q':
            moveCharacterAndCamera(speed, 0, 0);
            break;
    }
}

function moveCharacterAndCamera(deltaX, deltaY, deltaZ) {
    const duration = 500; // Duration of the animation in milliseconds

    // Define the target positions
    const characterTargetPosition = character.position.clone().add(new THREE.Vector3(deltaX, deltaY, deltaZ));
    const cameraTargetPosition = camera.position.clone().add(new THREE.Vector3(deltaX, deltaY, deltaZ));

    // Create tweens for character and camera positions
    new TWEEN.Tween(character.position)
        .to(characterTargetPosition, duration)
        .easing(TWEEN.Easing.Quadratic.Out) // You can adjust the easing function as needed
        .start();

    new TWEEN.Tween(camera.position)
        .to(cameraTargetPosition, duration)
        .easing(TWEEN.Easing.Quadratic.Out) // You can adjust the easing function as needed
        .start();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    TWEEN.update();
}

window.onload = init;

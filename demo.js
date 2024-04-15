import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, mesh,meshTwo;

function createFloor(){
    let floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100,100,10,10),
        new THREE.MeshBasicMaterial({color:0x444444, wireframe:false})
    );

    // Position the floor half a unit below the player
    floor.position.y = -.5;
    floor.rotation.x = -Math.PI / 2;

    scene.add(floor);
}
function init(){
   scene = new THREE.Scene();
   camera = new THREE.PerspectiveCamera(90,1280/720,0.1,1000);

   const gridHelper = new THREE.GridHelper(100, 10);
   scene.add(gridHelper);

   mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({color:0xffcc00})
     );
    scene.add(mesh);
     meshTwo = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({color:'red'})
     );
    scene.add(meshTwo);

     createFloor();

    camera.position.set(0,0,3);
    camera.lookAt(new THREE.Vector3(0,0,0));
    scene.add(camera);


    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
 
    document.addEventListener('keydown', moveCube);
    animate();
    
}


function moveCube(event) {
    let speed = 0.1;
    switch (event.key) {
        case 's':
            mesh.position.z += speed;
            camera.position.z += speed;
            break;
        case 'z':
            mesh.position.z -= speed;
            camera.position.z -= speed;

            break;
        case 'q':
            mesh.position.x -= speed;
            camera.position.x -= speed;
            break;
        case 'd':
            mesh.position.x += speed;
            camera.position.x += speed;
            break;
    }
    camera.position.set(mesh.position.x, mesh.position.y+5, camera.position.z);
    camera.lookAt(mesh.position);
}


function animate(){
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}

window.onload = init;

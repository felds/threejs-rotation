import * as THREE from "three";
import { Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

declare const c: HTMLCanvasElement;

//
// create a scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, c.clientHeight / c.clientWidth, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas: c,
  antialias: true,
});

//
// illuminate
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.z = 10;
scene.add(directionalLight);

//
// create a mockup phone
const geometry = new THREE.BoxGeometry(2, 0.33, 4);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.rotateX(Math.PI / 2);
scene.add(cube);

//
// run
function tick() {
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

//
// gather rotation from device
let lastAngle = new THREE.Vector3(0, 0, -1);
let lastAngle2 = new THREE.Vector3(0, 0, -1);
const planeUp = new THREE.Vector3(0, 1, 0);
window.addEventListener("deviceorientation", (e) => {
  const euler = new THREE.Euler(degToRad(e.beta!), degToRad(e.alpha!), degToRad(-e.gamma!), "YXZ");

  // rotate the mock phone
  cube.rotation.copy(euler);

  // rotate last angle
  // let newAngle = lastAngle.clone().applyEuler(euler).normalize(); // .projectOnPlane(planeUp).normalize();
  const newAngle = new Vector3(0, -1, 0).applyEuler(euler).projectOnPlane(planeUp).normalize();
  const sa = getSignedAngle(lastAngle, newAngle) * Math.PI;
  console.log(Math.sign(sa), sa.toFixed(5));
  lastAngle2 = lastAngle;
  lastAngle = newAngle;
});

/**
 * @see https://wumbo.net/formulas/angle-between-two-vectors-2d/
 */
function getSignedAngle(v: THREE.Vector3, w: THREE.Vector3): number {
  return Math.atan2(w.z * v.x - w.x * v.z, w.x * v.x + w.z * v.z);
}

//
//
// Debug the angle vectors
//
//

declare const d: HTMLCanvasElement;
{
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, c.clientHeight / c.clientWidth, 0.1, 1000);
  camera.position.z = 1;
  camera.position.y = 1;
  camera.lookAt(new Vector3(0, 0, 0));

  const renderer = new THREE.WebGLRenderer({
    canvas: d,
    antialias: true,
  });

  const gridHelper = new THREE.GridHelper(3, 7);
  const controls = new OrbitControls(camera, renderer.domElement);

  function tick() {
    drawLineToV3(lastAngle, 0x00ffff);
    drawLineToV3(lastAngle2, 0xffff00);

    scene.add(gridHelper);

    controls.update();
    renderer.render(scene, camera);

    for (const obj of scene.children) {
      scene.remove(obj);
    }

    requestAnimationFrame(tick);
  }
  tick();

  function drawLineToV3(v: Vector3, color: number) {
    const material = new THREE.LineBasicMaterial({ color, linewidth: 10 });

    const points = [new Vector3(0, 0, 0), v];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    scene.add(line);
  }
}

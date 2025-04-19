import * as BABYLON from "https://cdn.babylonjs.com/babylon.js";

window.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 3, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const hdrTexture = await BABYLON.CubeTexture.CreateFromPrefilteredDataAsync("./env/environment.env", scene);
  scene.environmentTexture = hdrTexture;
  scene.createDefaultSkybox(hdrTexture, true, 1000);

  BABYLON.SceneLoader.Append("./models/", "sedia01.glb", scene, async function () {
    const nodeMaterial = await BABYLON.NodeMaterial.ParseFromFileAsync("tessutoAdvanced", "./shaders/tessutoAdvanced.json", scene);
    nodeMaterial.build(true);
    scene.meshes.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.dispose();
        mesh.material = nodeMaterial;
      }
    });
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 3, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("./env/environment.env", scene);
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

    // Auto-zoom della telecamera sull'oggetto
    scene.createDefaultCameraOrLight(true, true, true);
    if (scene.activeCamera) {
      scene.activeCamera.alpha = Math.PI / 2;
      scene.activeCamera.beta = Math.PI / 2.5;
      scene.activeCamera.radius = scene.getMeshByName("sedia01")?.getBoundingInfo().boundingSphere.radius * 2 || 3;
      scene.activeCamera.target = scene.getMeshByName("sedia01")?.getBoundingInfo().boundingSphere.center || BABYLON.Vector3.Zero();
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
});

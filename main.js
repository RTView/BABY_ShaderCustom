let nodeMaterial;

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
    nodeMaterial = await BABYLON.NodeMaterial.ParseFromFileAsync("tessutoAdvanced", "./shaders/tessutoAdvanced.json", scene);
    nodeMaterial.build(true);

    scene.meshes.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.dispose();
        mesh.material = nodeMaterial;
      }
    });

    // Focus camera
    const mesh = scene.getMeshByName("sedia01") || scene.meshes.find(m => m.name !== "__root__");
    if (mesh) {
      camera.target = mesh.getBoundingInfo().boundingSphere.center;
      camera.radius = mesh.getBoundingInfo().boundingSphere.radius * 2.5;
    }

    document.getElementById("fabricSelector").addEventListener("change", (e) => {
      const selected = e.target.value;
      loadFabricTextures(selected);
    });

    loadFabricTextures("fabric01");
  });

  const loadFabricTextures = (name) => {
    const base = new BABYLON.Texture(`./textures/${name}_baseColor.jpg`, scene);
    const normal = new BABYLON.Texture(`./textures/${name}_normal.jpg`, scene);
    const rough = new BABYLON.Texture(`./textures/${name}_roughness.jpg`, scene);

    const baseNode = nodeMaterial.getBlockByName("BaseColorTexture");
    const normalNode = nodeMaterial.getBlockByName("NormalMap");
    const roughNode = nodeMaterial.getBlockByName("RoughnessMap");

    if (baseNode) baseNode.texture = base;
    if (normalNode) normalNode.texture = normal;
    if (roughNode) roughNode.texture = rough;
  };

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
});

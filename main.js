let nodeMaterial1, nodeMaterial2;

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
    const mesh = scene.meshes.find(m => m.name !== "__root__");

    // Load 2 custom materials from the same nodeMaterial
    nodeMaterial1 = await BABYLON.NodeMaterial.ParseFromFileAsync("tessutoAdvanced", "./shaders/tessutoAdvanced.json", scene);
    await nodeMaterial1.buildAsync();
    nodeMaterial2 = nodeMaterial1.clone("tessutoAdvanced2");

    // Create metallic PBR material for slot 2
    const metalMat = new BABYLON.PBRMaterial("MetalMat", scene);
    metalMat.metallic = 1.0;
    metalMat.roughness = 0.05;
    metalMat.reflectivityColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    metalMat.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.85);

    // Assign materials
    mesh.material.subMaterials = [nodeMaterial1, nodeMaterial2, metalMat];

    // Auto focus camera
    camera.target = mesh.getBoundingInfo().boundingSphere.center;
    camera.radius = mesh.getBoundingInfo().boundingSphere.radius * 2.5;

    document.getElementById("fabricSelector").addEventListener("change", (e) => {
      const selected = e.target.value;
      applyTexturesToMaterial(nodeMaterial1, selected);
      applyTexturesToMaterial(nodeMaterial2, selected);
    });

    applyTexturesToMaterial(nodeMaterial1, "fabric01");
    applyTexturesToMaterial(nodeMaterial2, "fabric01");
  });

  function applyTexturesToMaterial(material, name) {
    const base = new BABYLON.Texture(`./textures/${name}_baseColor.jpg`, scene);
    const normal = new BABYLON.Texture(`./textures/${name}_normal.jpg`, scene);
    const rough = new BABYLON.Texture(`./textures/${name}_roughness.jpg`, scene);

    const baseNode = material.getBlockByName("BaseColorTexture");
    const normalNode = material.getBlockByName("NormalMap");
    const roughNode = material.getBlockByName("RoughnessMap");

    if (baseNode) baseNode.texture = base;
    if (normalNode) normalNode.texture = normal;
    if (roughNode) roughNode.texture = rough;
  }

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
});

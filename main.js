let nodeMaterial;

window.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI / 2, Math.PI / 2.5, 4, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const env = BABYLON.CubeTexture.CreateFromPrefilteredData("./env/environment.env", scene);
  scene.environmentTexture = env;
  scene.createDefaultSkybox(env, true);

  BABYLON.SceneLoader.Append("./models/", "sedia01.glb", scene, async () => {
    const mesh = scene.meshes.find(m => m.name !== "__root__");

    nodeMaterial = await BABYLON.NodeMaterial.ParseFromFileAsync("TessutoShader", "./shaders/tessutoAdvanced.json", scene);
    await nodeMaterial.buildAsync();

    const nodeMat1 = nodeMaterial;
    const nodeMat2 = nodeMaterial.clone("TessutoShader2");

    const chromeMat = new BABYLON.PBRMaterial("Chrome", scene);
    chromeMat.metallic = 1.0;
    chromeMat.roughness = 0.05;
    chromeMat.albedoColor = new BABYLON.Color3(0.85, 0.85, 0.9);

    const basicMat = new BABYLON.StandardMaterial("Base", scene);

    const multiMat = new BABYLON.MultiMaterial("multi", scene);
    multiMat.subMaterials.push(nodeMat1, nodeMat2, chromeMat, basicMat);
    mesh.material = multiMat;

    camera.target = mesh.getBoundingInfo().boundingSphere.center;
    camera.radius = mesh.getBoundingInfo().boundingSphere.radius * 2.5;

    const select = document.getElementById("fabricSelector");
    select.addEventListener("change", (e) => {
      const fabric = e.target.value;
      applyFabricTextures(nodeMat1, fabric, scene);
      applyFabricTextures(nodeMat2, fabric, scene);
    });

    applyFabricTextures(nodeMat1, "fabric01", scene);
    applyFabricTextures(nodeMat2, "fabric01", scene);
  });

  function applyFabricTextures(mat, name, scene) {
    const base = new BABYLON.Texture(`./textures/${name}_baseColor.jpg`, scene);
    const norm = new BABYLON.Texture(`./textures/${name}_normal.jpg`, scene);
    const rough = new BABYLON.Texture(`./textures/${name}_roughness.jpg`, scene);

    const baseNode = mat.getBlockByName("BaseColorTexture");
    const normalNode = mat.getBlockByName("NormalMap");
    const roughNode = mat.getBlockByName("RoughnessMap");

    if (baseNode) { baseNode.texture = base; }
    if (normalNode) { normalNode.texture = norm; }
    if (roughNode) { roughNode.texture = rough; }
  }

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
});

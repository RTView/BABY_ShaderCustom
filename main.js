let nodeMat1, nodeMat2;

window.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI/2, Math.PI/2.5, 4, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  const env = BABYLON.CubeTexture.CreateFromPrefilteredData("./env/environment.env", scene);
  scene.environmentTexture = env;
  scene.createDefaultSkybox(env, true);

  BABYLON.SceneLoader.Append("./models/", "sedia01.glb", scene, async () => {
    const mesh = scene.meshes.find(m => m.name !== "__root__");

    // Shader custom da file
    nodeMat1 = await BABYLON.NodeMaterial.ParseFromFileAsync("tessuto", "./shaders/tessutoAdvanced.json", scene);
    await nodeMat1.buildAsync();
    nodeMat2 = nodeMat1.clone("tessuto2");

    // Materiale PBR metallico (slot 2)
    const chromeMat = new BABYLON.PBRMaterial("chrome", scene);
    chromeMat.metallic = 1.0;
    chromeMat.roughness = 0.05;
    chromeMat.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.95);

    // Originale per slot 3
    const basicMat = new BABYLON.StandardMaterial("basic", scene);

    // Applica MultiMaterial
    const multiMat = new BABYLON.MultiMaterial("multi", scene);
    multiMat.subMaterials = [nodeMat1, nodeMat2, chromeMat, basicMat];
    mesh.material = multiMat;

    camera.target = mesh.getBoundingInfo().boundingSphere.center;
    camera.radius = mesh.getBoundingInfo().boundingSphere.radius * 2.5;

    // Event handler per cambiare tessuto
    document.getElementById("fabricSelector").addEventListener("change", (e) => {
      const name = e.target.value;
      applyTextures(nodeMat1, name);
      applyTextures(nodeMat2, name);
    });

    applyTextures(nodeMat1, "fabric01");
    applyTextures(nodeMat2, "fabric01");
  });

  const applyTextures = (material, name) => {
    const base = new BABYLON.Texture(`./textures/${name}_baseColor.jpg`, scene);
    const norm = new BABYLON.Texture(`./textures/${name}_normal.jpg`, scene);
    const rough = new BABYLON.Texture(`./textures/${name}_roughness.jpg`, scene);

    material.getBlockByName("BaseColorTexture")?.texture = base;
    material.getBlockByName("NormalMap")?.texture = norm;
    material.getBlockByName("RoughnessMap")?.texture = rough;
  };

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
});

function init() {
  //Event Listener
  document.getElementById("api_btn").addEventListener("click", function () {
    //API
    const city = document.getElementById("city").value;
    console.log(city);
    const apiKey = "7330f3abac0f47b887b1e5fe1b755d36";
    const apiURL = "https://api.ipgeolocation.io/astronomy?apiKey=" + apiKey + "&location=" + city;

    let resultArray = [];
    console.log(apiURL);
    getAPIData();
    async function getAPIData() {
      try {
        const response = await fetch(apiURL);
        resultArray = await response.json();
        console.log(resultArray);
        const as_content = document.getElementById("api_content");
        //Light direction update according to API
        const rho = 40;
        const dir_x = rho*Math.cos(resultArray.sun_altitude*(Math.PI/180))*Math.cos(resultArray.sun_azimuth*(Math.PI/180));
        const dir_y = rho*Math.sin(resultArray.sun_altitude*(Math.PI/180));
        const dir_z = rho*Math.cos(resultArray.sun_altitude*(Math.PI/180))*Math.sin(resultArray.sun_azimuth*(Math.PI/180));
        dirLight.position.set(dir_x, dir_y, dir_z);
        console.log(dirLight.position);
        as_content.textContent = "The sun altitude is " + resultArray.sun_altitude;
      } catch (error) {
        console.log("Oops...Cannot fetch the date from the API!");
      }
    }
  })
  //Resize the window
  window.addEventListener('resize', onResize, false);
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  // Status Set Up
  var stats = new Stats();
  document.body.appendChild(stats.dom);
  //Render Set Up
  var renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;

  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("webgl-output").appendChild(renderer.domElement);

  //Camera Set Up
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.position.set(-30, 40, 50);

  // //Camera Perspective Control
  var orbit_controls = new THREE.OrbitControls(camera, document.getElementById("webgl-output"));
  orbit_controls.autoRotate = false;


  // create a scene, that will hold all our elements such as objects, cameras and lights.
  var scene = new THREE.Scene();

  // add a simple scene
  addHouseAndTree(scene)
  var loader_stl = new THREE.STLLoader();
  loader_stl.load("Solar Frame Actuation System.stl", function (geometry) {
    var mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.5
    });// Mesh Materials
    var group = new THREE.Mesh(geometry, mat);
    group.position.set(0, 0, 0);
    group.scale.set(5, 5, 5);
    group.castShadow = true;
    //console.log(group);
    //Render the result
    scene.add(group);
  });

  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight("#0c0c0c");
  ambientLight.intensity = 5;
  scene.add(ambientLight);

  // the point light where working with
  var pointColor = "#ccffcc";
  var dirLight = new THREE.DirectionalLight(pointColor);
  dirLight.position.set(-20, 20, 0);
  dirLight.castShadow = true;
  //Directional Light Bounding Box
  //Ray distance
  dirLight.shadow.camera.near = 0;
  dirLight.shadow.camera.far = 100;
  //Ray Area
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.top = 45;
  dirLight.shadow.camera.bottom = -30;

  dirLight.intensity = 1.0;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);
  //Directional Light Visualize Helper
  //var helper = new THREE.DirectionalLightHelper(dirLight,5);
  //scene.add(helper);
  var shadowCamera = new THREE.CameraHelper(dirLight.shadow.camera)
  scene.add(shadowCamera);

  //Create a axes Helper to visualize the coordinate
  var axes = new THREE.AxesHelper(20);
  scene.add(axes);


  setupControls();//GUI control
  render();


  function render() {

    stats.update();
    orbit_controls.update();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  //GUI control
  function setupControls() {
    var controls = new function () {
      this.ambientColor = ambientLight.color.getStyle();;
      this.SunLight_Intensity = 0.5;
    };

    var gui = new dat.GUI();
    gui.addColor(controls, 'ambientColor').onChange(function (e) {
      ambientLight.color = new THREE.Color(e);
    });

    gui.add(controls, 'SunLight_Intensity', 0, 2).onChange(function (e) {
      dirLight.intensity = e;
    });

  }
}
if (!Detector.webgl) Detector.addGetWebGLMessage();

var stats;
var conveyor_state = true; //conveyor initially OFF
var cylinder1_state = false; // initially OFF
var cylinder2_state = false; // initially OFF
var filler_cylinder_state = false; // initially OFF
var filler_action_state = false;
var statusOnline = false; //initially not connected to the PLC
var i = 0;
var camera, controls, scene, renderer;

var bottle, group, cylinder1, cylinder2, cylinder3, stopX1, stopX2;
var drink;
var drinkLine;
var drink_geometry;
var drink_material;
var fill_counter, drink_level;
var fill_OK = false;

var text2 = document.createElement("div");
var text3 = document.createElement("div");
var text4 = document.createElement("div");

var PLCinput = []; //array variable to store the PLC input variables

var gui = new dat.GUI();

var outputController;

var playbackStatus = false;
var frameCounter = 0; //counter variable to time the events in the playback mode

init();
createWalls();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x154360, 0.001); 
  
  
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(scene.fog.color);
  renderer.setClearColor(false);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  var container = document.getElementById("container");
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.rotation.x = -1.57;
  camera.position.y = 10;
  camera.position.z = 100;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  // world

  
  
  
  //Adding the  table
  var loader7 = new THREE.ObjectLoader();

  loader7.load("js/models/table.json", function (table) {
    table.position.set(-90, -73, 40);
    table.scale.set(4, 3, 2);
    scene.add(table); // Adding the conveyor belt model to the scene
  });
  var loader2 = new THREE.ObjectLoader();

  loader2.load("js/models/newConveyor.json", function (conveyor) {
    conveyor.position.set(-50, -48, 10);
    conveyor.scale.set(0.3, 0.3, 0.2);
    scene.add(conveyor); // Adding the conveyor belt model to the scene
  });

  var loader6 = new THREE.ObjectLoader();
  //adding the second conveyor
  loader6.load("js/models/newConveyor.json", function (conveyor2) {
    conveyor2.position.set(-180, -48, -9);
    conveyor2.rotation.y = -3.14;
    conveyor2.scale.set(0.3, 0.3, 0.2);
    scene.add(conveyor2); // Adding the 2nd conveyor belt model to the scene
  });
  //Adding the Turntable Unit
  var loader4 = new THREE.ObjectLoader();

  loader4.load("js/models/Turntable Static.json", function (turntable1) {
    turntable1.position.set(-150, -19, 16);
    turntable1.scale.set(4, 4, 4.5);
    scene.add(turntable1); // Adding the conveyor belt model to the scene
  });
  var loader5 = new THREE.ObjectLoader();

  loader4.load("js/models/Turntable Dynamic.json", function (turntable2) {
    turntable2.position.set(-137, 18, -22);
    turntable2.scale.set(4, 4, 4);
    scene.add(turntable2); // Adding the conveyor belt model to the scene
  });
  //Adding fixer plates for Cylinders

  var plate_geometry1 = new THREE.BoxGeometry(5, 20, 1);
  var plate_material = new THREE.MeshPhongMaterial({
    color: 0x6a6c73,
    specular: 0x000000,
    shininess: 10,
  });
  var fixer_plate1 = new THREE.Mesh(plate_geometry1, plate_material);
  fixer_plate1.position.set(0, 0, 9.5);
  scene.add(fixer_plate1);
  var fixer_plate2 = fixer_plate1.clone();
  fixer_plate2.position.set(20, 0, 9.5);
  scene.add(fixer_plate2);

  var plate_geometry2 = new THREE.BoxGeometry(5, 50, 1);
  var fixer_plate3 = new THREE.Mesh(plate_geometry2, plate_material);
  fixer_plate3.position.set(4.5, 17, -8.7);
  var plate_geometry3 = new THREE.BoxGeometry(5, 1, 20);
  var fixer_plate4 = new THREE.Mesh(plate_geometry3, plate_material);
  fixer_plate4.position.set(4.5, 42, 0.8);
  scene.add(fixer_plate3); //vertical plate
  scene.add(fixer_plate4); //horizontal plate

  //adding the drink geometry
  drink_geometry = new THREE.CylinderGeometry(3.2, 3.6, 0.1, 32);
  //Phong Material for the drink
  drink_material = new THREE.MeshPhongMaterial({
    color: 0xff4800,
    specular: 0xff4800,
    shininess: 0.2,
  });
  //drink_material = new THREE.MeshLambertMaterial( { color: 0x49F23A, specular: 0xffffff, shininess: 0 });
  //drink_material.transparent=true;
  drink_material.opacity = 0.8;

  //bottle = new THREE.Mesh( geometry, material );
  //var empty_bottle = new THREE.Mesh( geometry, material );
  drink = new THREE.Mesh(drink_geometry, drink_material);

  bottle = new THREE.Object3D(); //create an empty group
  //creating the bottle object

  var loader = new THREE.VRMLLoader();
  loader.load("js/models/cokebottle.TXT", function (object) {
    object.scale.set(0.17, 0.12, 0.17);
    object.position.set(0, -10, 0);

    bottle.add(object); // Adding the empty bottle wrl to the bottle group
  });

  //bottle.add(empty_bottle);//add a mesh with geometry to it
  //bottle.add(drink);
  //drink.position.y=-9

  scene.add(bottle);

  bottle.position.x = 70;
  bottle.position.y = 10;

  //Adding the cap delivery unit
  var loader3 = new THREE.ObjectLoader();

  loader3.load("js/models/cappingsystem.json", function (object3) {
    object3.scale.set(4, 4, 4);
    //object3.position.set( -60, 28, 10 );
    object3.position.set(-35, 28, 10);
    scene.add(object3); // Adding the empty bottle wrl to the bottle group
  });

  //Phong Material
  var material1 = new THREE.MeshPhongMaterial({
    color: 0xf0f4f7,
    specular: 0xffffff,
    shininess: 10,
  });

  var loader4 = new THREE.ObjectLoader();
  //adding the stopper housingcylinder1
  loader4.load("js/models/cylinder.json", function (housingCylinder1) {
    housingCylinder1.scale.set(3, 4, 4);
    housingCylinder1.rotation.y = -1.57;
    housingCylinder1.position.set(38, 2, 9);

    scene.add(housingCylinder1); // Adding the empty bottle wrl to the bottle group
  });

  //adding the stopper cylinder1
  var geometry3 = new THREE.CylinderGeometry(1, 1, 15, 32);
  cylinder1 = new THREE.Mesh(geometry3, material1); //using the Material
  scene.add(cylinder1);
  cylinder1.rotation.x = -1.57;
  cylinder1.position.x = 20;
  cylinder1.position.y = 5;
  cylinder1.position.z = 5;

  stopX1 = cylinder1.position.x + 1;

  //adding the stopper housingcylinder2

  loader4.load("js/models/cylinder.json", function (housingCylinder2) {
    housingCylinder2.scale.set(3, 4, 4);
    housingCylinder2.rotation.y = -1.57;
    housingCylinder2.position.set(18, 2, 9);
    scene.add(housingCylinder2);
  });

  //adding the stopper cylinder2
  cylinder2 = new THREE.Mesh(geometry3, material1); //using the Material
  scene.add(cylinder2);
  cylinder2.rotation.x = -1.57;
  cylinder2.position.x = 0;
  cylinder2.position.y = 5;
  stopX2 = cylinder2.position.x + 1;
  cylinder2.position.z = 5;

  //adding the Filling Cylinder Housing (housingcylinder3)
  loader4.load("js/models/cylinder.json", function (housingCylinder3) {
    housingCylinder3.scale.set(3, 4, 4);
    housingCylinder3.rotation.x = -3.14;
    housingCylinder3.rotation.z = -1.57;
    housingCylinder3.position.set(1.5, 42, 18);
    scene.add(housingCylinder3);
  });

  //adding the Filling Cylinder Core (cylinder3)

  cylinder3 = new THREE.Mesh(geometry3, material1); //using the same geometry and material as the other core cylinders
  var fillnozzle_material = new THREE.MeshPhongMaterial({
    color: 0x000000,
    specular: 0xffffff,
    shininess: 5,
  });

  var geometry4 = new THREE.CylinderGeometry(1, 4, 5, 32); //conical part of the filler nozzle
  var fillnozzle1 = new THREE.Mesh(geometry4, fillnozzle_material);
  var geometry5 = new THREE.CylinderGeometry(4, 4, 3, 32); //cylindrical part of the filler nozzle
  var fillnozzle2 = new THREE.Mesh(geometry5, fillnozzle_material);

  group = new THREE.Object3D(); //create an empty container
  group.add(cylinder3); //add a mesh with geometry to it
  group.add(fillnozzle1); //adding conical part of the filler nozzle
  group.add(fillnozzle2); //adding straight part of the filler nozzle
  scene.add(group);

  cylinder3.position.x = 4.5;
  cylinder3.position.y = 41;
  fillnozzle1.rotation.z = 3.14;
  fillnozzle1.position.x = 4.5;
  fillnozzle1.position.y = 31;
  fillnozzle2.position.x = 4.5;
  fillnozzle2.position.y = 35;

  // lights

  /*light = new THREE.DirectionalLight( 0xffffff);
				light.position.set( 1, 1, 1 );
				scene.add( light );

				light = new THREE.DirectionalLight( 0xffffff);
				light.position.set( -1, -1, -1 );
				scene.add( light );

				light = new THREE.AmbientLight( 0x222222 );
				scene.add( light );

				*/
  var light = new THREE.PointLight(0xffffff, 1, 0);
  light.position.set(0, 100, 40);
  scene.add(light);
  var light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(-70, 100, 40);
  scene.add(light);
  light = new THREE.AmbientLight(0x222222);
  scene.add(light);

  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.top = "0px";
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);

  //

  window.addEventListener("resize", onWindowResize, false);

  text2.style.position = "absolute";
  //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  text2.style.width = 200;
  text2.style.height = 200;
  text2.style.backgroundColor = "white";
  text2.innerHTML = "Fill Status: " + i;

  text2.style.top = 5 + "px";
  text2.style.left = 200 + "px";
  document.body.appendChild(text2);

  text3.style.position = "absolute";
  text3.style.width = 200;
  text3.style.height = 200;
  text3.style.backgroundColor = "white";
  //text3.innerHTML = "OFFLINE";

  text3.style.top = 35 + "px";
  text3.style.left = 200 + "px";
  document.body.appendChild(text3);

  text4.style.position = "absolute";
  text4.style.width = 200;
  text4.style.height = 200;
  text4.style.backgroundColor = "white";

  text4.style.top = 20 + "px";
  text4.style.left = 200 + "px";
  document.body.appendChild(text4);

  //GUI
  setupGui();
}

function setupGui() {
  outputController = {
    conveyor: false,
    cylinder1: false,
    cylinder2: false,
    cylinder3: false,
    Flavor: "Cola",
    Fill: function(){
      perform_fill();
    },
    Start: function(){
      startProgram();
    },
    Reset: function() {
      replaceBottle();
     
    },
   
  };
  var h;

  h = gui.addFolder("Manual Controls");
  h.add(outputController, "conveyor")
    .name("Conveyor ON")
    .onChange(function () {
      conveyor_state = !conveyor_state;
    });
  h.add(outputController, "cylinder1")
    .name("Cylinder1 ON")
    .onChange(function () {
      cylinder1_state = !cylinder1_state;
    });
  h.add(outputController, "cylinder2")
    .name("Cylinder2 ON")
    .onChange(function () {
      cylinder2_state = !cylinder2_state;
    });
  h.add(outputController, "cylinder3")
    .name("Cylinder3 ON")
    .onChange(function () {
      filler_cylinder_state = !filler_cylinder_state;
    });
  h.add(outputController, "Flavor", ["Cola", "Red", "Dew"])
    .name("Select Flavor")
    .onChange(function () {
      filler_action_state = !filler_action_state;
    });
  h.add(outputController, "Fill");
  h.add(outputController, "Start");
  
  h.add(outputController, "Reset");
  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

  stats.update();

  move_bottle();
  move_cylinder1();
  move_cylinder2();
  move_fillerCylinder();
  perform_fill();

  if (playbackStatus == true) {
    playbackSequence();
    text4.innerHTML = "PROGRAM RUNNING...";
  } else {
    text3.innerHTML = "";
    text4.innerHTML = "";
  }

  render();
}

function perform_fill() {
  if (filler_action_state) {
    if (fill_OK) {
      if (i == 0) {
        drink_level = 1; //level of drink at the beginning
        fill_counter = 0;

        //group.add(drinkLine);
        //drinkLine.position.y=15;
        //drinkLine.position.x=4.5;

        bottle.add(drink);
        drink.position.y = -9;
      }

      text2.innerHTML =
        "Fill Status: " + Math.round((drink_level / 18) * 100) + "%";
      i = i + 100; //total fill counter/time

      fill_counter = fill_counter + 1;

      if (drink_level <= 18) {
        drink_level = drink_level + 0.02;
        for (
          var j = 0, l = drink_geometry.vertices.length / 2 - 1;
          j < l;
          j++
        ) {
          drink_geometry.vertices[j].y = drink_level;
        }

        drink_geometry.verticesNeedUpdate = true;
        drink_geometry.dynamic = true;
        fill_counter = 0;
      }
    } //end if for fill_OK
    else {
      //i.e. if fill_OK = false
      //window.alert("WARNING: SPILL WILL OCCUR! FILLING CANNOT TAKE PLACE AT THIS MOMENT! Please ensure that the bottle is in correct position and the fill cylinder is turned on! ");
      filler_action_state = false;
    }
  } //end if for filler_action_state
  //else {
  //i = 0;
  //group.remove(drinkLine);
  //bottle.remove(new_drink);
  //text2.innerHTML = " ";
  //}
}

function move_bottle() {
  var xdecrement;
  //controlling the bottle movement
  xdecrement = 0.2; //conveyor speed
  fill_OK = false;
  if (conveyor_state != true) {
    //check whether the bottle is in detect range of Cylinder 1
    if (bottle.position.x < stopX1 + 4 && bottle.position.x > stopX1) {
      //check the state of the cylinder 1
      if (cylinder1.position.z < 12) {
        //the cylinder 1 is closed
        xdecrement = 0; //stop the bottle
      }
    }
    //check whether the bottle is in detect range of Cylinder 2
    if (bottle.position.x < stopX2 + 4 && bottle.position.x > stopX2) {
      //check the state of the cylinder 1
      if (cylinder2.position.z < 12) {
        //the cylinder2 is closed
        xdecrement = 0; //stop the bottle
      }
    }

    //check whether the bottle is in the range of Filler Cylinder
    if (bottle.position.x < stopX2 + 4 && bottle.position.x > stopX2) {
      //check the state of the Filler Cylinder
      if (group.position.y < 0) {
        //if the filler cylinder is down
        xdecrement = 0; //bottle cannot move
        fill_OK = true;
      }
    }

    //bottle reaches at the end of conveyor
    if (bottle.position.x < -65) {
      xdecrement = 0; //bottle must stop
    }

    //Move the bottle on the conveyor
    bottle.position.x = bottle.position.x - xdecrement;
  }
}
function move_cylinder1() {
  if (cylinder1_state) {
    if (cylinder1.position.z < 13) {
      cylinder1.position.z = cylinder1.position.z + 1;
    }
  } else {
    if (cylinder1.position.z > 3) {
      cylinder1.position.z = cylinder1.position.z - 1;
    }
  }
}
function move_cylinder2() {
  if (cylinder2_state) {
    if (cylinder2.position.z < 13) {
      cylinder2.position.z = cylinder2.position.z + 1;
    }
  } else {
    if (cylinder2.position.z > 3) {
      cylinder2.position.z = cylinder2.position.z - 1;
    }
  }
}

function move_fillerCylinder() {
  if (filler_cylinder_state) {
    if (group.position.y > -5) {
      group.position.y = group.position.y - 0.5;
    }
  } else {
    if (group.position.y < 0) {
      //Filler Cylinder Down
      group.position.y = group.position.y + 0.5;
    }
  }
}

function replaceBottle() {
  //conveyor_state=true;
  bottle.position.x = 70;
  bottle.remove(drink);
  //refreshing the drink geometry
  drink_geometry = new THREE.CylinderGeometry(3.2, 3.6, 1, 32);
  //refreshing the drink
  drink = new THREE.Mesh(drink_geometry, drink_material);
  i = 0;
  text2.innerHTML = "Fill Status: 0%";
  //refreshing the GUI
  
  }

//reading a text file contents from web
function loadXMLDoc() {
  var xmlhttp;
  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET", "IOState.dat", false);
  xmlhttp.send();

  var str = xmlhttp.responseText;

  //scanning the PLC input channels (pin 1=0 to pin4=3)
  for (var j = 0; j < 4; j++) {
    PLCinput[j] = str.charAt(j);
  }

  //document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
  window.alert(PLCinput[0]);
  window.alert(PLCinput[1]);
  window.alert(PLCinput[2]);
  window.alert(PLCinput[3]);
}

function readXMLfile() {
  //Reading the PLC Input outputs from Web Server in XML format
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      myFunction(xhttp);
    }
  };
  //xhttp.open("GET", "IOState.xml", true);
  xhttp.open("GET", "PLCState.xml", true); //XML file updated by VB and a real time PLC
  xhttp.send();

  function myFunction(xml) {
    var xmlDoc = xml.responseXML;
    var cylinder1_pin = xmlDoc.getElementsByTagName("pin2")[0].childNodes[0]
      .nodeValue;
    var cylinder2_pin = xmlDoc.getElementsByTagName("pin3")[0].childNodes[0]
      .nodeValue;
    var fillerCylinder_pin = xmlDoc.getElementsByTagName("pin4")[0]
      .childNodes[0].nodeValue;
    var fill_pin = xmlDoc.getElementsByTagName("pin5")[0].childNodes[0]
      .nodeValue;

    if (cylinder1_pin == 1) {
      cylinder1_state = true;
    } else {
      cylinder1_state = false;
    }
    if (cylinder2_pin == 1) {
      cylinder2_state = true;
    } else {
      cylinder2_state = false;
    }
    if (fillerCylinder_pin == 1) {
      filler_cylinder_state = true;
    } else {
      filler_cylinder_state = false;
    }
    if (fill_pin == 1) {
      filler_action_state = true;
    } else {
      filler_action_state = false;
    }
  }
}

function render() {
  renderer.render(scene, camera);
  if (statusOnline == true) {
    //read XML file for PLC outputs
    readXMLfile();
    //text3.innerHTML = "PLC STATUS: ONLINE";
  }
  //else {text3.innerHTML = "PLC STATUS: OFFLINE";}
}

function startProgram() {
  if (playbackStatus == false) {
    //start program
    frameCounter = 0;
    playbackStatus = true;
  } else {
    //stop program
    playbackStatus = false;
  }
}

function playbackSequence() {
  if (frameCounter <= 10) {
    //Cylinder1 ON
    cylinder1_state = true;
    //Cylinder2 OFF
    cylinder2_state = false;
  }
  //wait for x seconds
  if (frameCounter == 2000) {
    //Cylinder1 OFF
    cylinder1_state = false;
    //filler Cylinder ON
    filler_cylinder_state = true;
  }
  //wait x2 seconds
  if (frameCounter == 4000) {
    //start filling
    filler_action_state = true;
  }
  //wait x3 seconds until full
  if (frameCounter == 13000) {
    //end filling
    filler_action_state = false;
    //filler Cylinder OFF
    filler_cylinder_state = false;
  }
  //wait x4 seconds
  if (frameCounter == 15000) {
    //Cylinder 2 ON
    cylinder2_state = true;
  }
  //wait x5 seconds
  if (frameCounter == 17000) {
    //Cylinder 2 OFF
    cylinder2_state = false;
    frameCounter = 0;

    playbackStatus = false;
  }
  frameCounter = frameCounter + 10;
  text3.innerHTML =
    "Program Time:" + Math.round(frameCounter / 800) + " Seconds";
}

function createWalls() {

  //adding a floor
  //Load the texture
  var txtloader = new THREE.TextureLoader();
  txtloader.setCrossOrigin("anonymous");
  const floorTexture = txtloader.load(
  'js/assets/labFloor.jpeg');

  var Fmaterial = new THREE.MeshPhongMaterial({ color:0xFFFFFF, map: floorTexture });
  //floorTexture.wrapS = THREE.RepeatWrapping;
  //floorTexture.wrapT = THREE.RepeatWrapping;
  //floorTexture.repeat.set( 32, 32 );
  
  //Create a plane with texture as floor
  var Fgeometry = new THREE.PlaneBufferGeometry(1000, 500);

  var plane = new THREE.Mesh(Fgeometry, Fmaterial);
  plane.rotation.x=-Math.PI/2;
  plane.position.y=-150;
  plane.position.x=-100;
  scene.add(plane);
  
  //Load the Wall texture
  var txtloader = new THREE.TextureLoader();
  txtloader.setCrossOrigin("anonymous");
  const wallTexture = txtloader.load(
  'js/assets/concreteWall.jpeg');

   //Load the ceiling texture
  var txtloader2 = new THREE.TextureLoader();
  txtloader2.setCrossOrigin("anonymous");
  const ceilingTexture = txtloader2.load(
  'js/assets/ceiling.jpeg');
  
  var wallMaterial = new THREE.MeshPhongMaterial({ color:0xFFFFFF, map: wallTexture });
    var ceilingMaterial = new THREE.MeshPhongMaterial({ color:0xFFFFFF, map: ceilingTexture });
  //texture.wrapS = THREE.RepeatWrapping;
  //texture.wrapT = THREE.RepeatWrapping;
  //texture.repeat.set( 32, 32 );
  
  //Create planes with texture as wall and ceiling
  var wallGeometry = new THREE.PlaneBufferGeometry(1000, 500);
  
  var wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall1.rotation.x=0;
  wall1.position.z=-250;
  wall1.position.x=-100;
  scene.add(wall1);
  
  var wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall2.rotation.x=0;
  wall2.rotation.y=Math.PI/2;
  wall2.position.z=-250;
  wall2.position.x=-600;
  scene.add(wall2);
  
  var wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall3.rotation.x=-Math.PI;
  wall3.position.z=+250;
  wall3.position.x=-100;
  scene.add(wall3);
  
  var wall4 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall4.rotation.x=0;
  wall4.rotation.y=-Math.PI/2;
  wall4.position.z=-250;
  wall4.position.x=300;
  scene.add(wall4);
  
  //var material = new THREE.MeshBasicMaterial({ map: texture });
  var ceiling = new THREE.Mesh(wallGeometry, ceilingMaterial);
  ceiling.rotation.x=Math.PI/2;
  ceiling.position.y=250;
  ceiling.position.x=-100;
  scene.add(ceiling);
}

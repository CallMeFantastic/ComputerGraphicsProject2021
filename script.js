var programs = new Array();
var canvas;
var gl;
var baseDir;
var shaderDir;
var diffType = 1;
var specType = 1;

var modelTexture = Array(); //array contenente i path alle textures
modelTexture[0] = 'assetshowcase/pedestal.png';
modelTexture[1] = 'assetshowcase/Boat/textures/boat_ao.bmp';
modelTexture[2] = 'assetshowcase/Boat/textures/boat_diffuse.bmp';
modelTexture[3] = 'assetshowcase/Boat/textures/boat_gloss.bmp';
modelTexture[4] = 'assetshowcase/Boat/textures/boat_normal.bmp';
modelTexture[5] = 'assetshowcase/Boat/textures/boat_specular.bmp'; //verifica sui suoi esempi
modelTexture[6] = 'assetshowcase/crate.png'

var modelStr = new Array(); //array contenente i path agli obj
modelStr[0] = 'assetshowcase/Boat/Boat.obj';
modelStr[1] = 'assetshowcase/pedestal.obj';
var models3DCount = 2;


//CAMERA COORDS
var cx = 0.0;
var cy = 0.0;
var cz = 20.0;
var elevation = 0.0;
var angle = 0.0;
var w, h;
var cameraPos = [cx, cy, cz];
var aspect;
var zNear = 0.1;
var zFar = 2000;
var fovDeg = 30;

var canw, canh;
var extView = 1;

var roll = 0.01;
var modRot = 0.0;
var EVelevation = -15;
var EVangle = 30;

var lookRadius = 10.0;

var keys = [];
var rvx = 0.0;
var rvy = 0.0;
var rvz = 0.0;

//########### LIGHTS
var lightType = 1;
var lightPos = [0.0, 5.0, -10.0];
var c_out = 60;
var c_in = 45;
var l_decay = 1;
var l_target = 30;
var alpha = 0;
var beta = 90;
var dirLightAlpha = -utils.degToRad(alpha);
var dirLightBeta  = -utils.degToRad(beta);
var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
var directionalLightColor = [1.0, 1.0, 1.0];
var specularShine = 100.0;
var specularColor = [0.5, 0.3, 0.2, 1.0];
var ambientLight = [0.1, 0.1, 0.1, 1.0];     


//################## BOAT TRANSFORM
var boatModel;

var boatTx = 0.0
var boatTy = -1.5
var boatTz = -10.0
var boatRx = 0.0;
var boatRy = 0.0;
var boatRz = 0.0;
var boatS  = 0.008;
var boatDiffuse = [0.69, 0.0, 1.0];
var objWorldMatrix = new Array();
objWorldMatrix[0] = utils.MakeWorld(boatTx, boatTy, boatTz, boatRx, boatRy, boatRz, boatS);

//################## PEDESTAL TRANSFORM
var pedestalModel;

var pedestalTx = 0.0
var pedestalTy = -3.0
var pedestalTz = -10.0
var pedestalRx = 0.0;
var pedestalRy = 0.0;
var pedestalRz = 0.0;
var pedestalS  = 0.2;
var pedestalDiffuse = [0.69, 0.0, 1.0];
objWorldMatrix[1] = utils.MakeWorld(pedestalTx, pedestalTy, pedestalTz, pedestalRx, pedestalRy, pedestalRz, pedestalS);



//################## ANIMATION VARS
var lastUpdateTime = (new Date).getTime();
var flag = 0;

var camera = [cx, cy, cz];
//var target = [Rx, Ry, Rz];
var upVector = [0.0, 1.0, 0.0];

var texture = new Array();


function main(){

  //set globalstates-> VBO & VAO -> function animate -> function drawScene();
  canw=canvas.clientWidth;
  canh=canvas.clientHeight;
  aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  
  //SET Global states (viewport size, viewport background color, Depth test)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  //check what it does viewport --
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  
  var objectVertices = Array();
  var objectNormals = Array();
  var objectIndices = Array();
  var objectTexCoords = Array();
  var vaos = Array();
  
  
  var positionAttributeLocation = new Array();
  var normalAttributeLocation = new Array();
  var uvAttributeLocation = new Array();

  var matrixLocation = new Array();
  var normalMatrixLocation = new Array();
  var worldMatrixLocation = new Array();
  
  var diffuseTypeLocation = new Array();
  var materialDiffColorLocation = new Array();
  var specularTypeLocation = new Array();
  var specColorLocation = new Array();
  var specShineLocation = new Array();

  var lightDirectionLocation = new Array();
  var lightColorLocation = new Array();

  var lightTypeLocation = new Array();
  var lightPosLocation = new Array();
  var lightConeOutLocation = new Array();
  var lightConeInLocation = new Array();
  var lightDecayLocation = new Array();
  var lightTargetLocation = new Array();

  var cameraPosLocation = new Array();
  var ambientLightLocation = new Array();
  var texLocation = new Array(); 
 


  //################## ATTTIBUTES
  //####### BOAT
  objectVertices[0] = boatModel.vertices;
  objectNormals[0] = boatModel.vertexNormals;
  objectIndices[0] = boatModel.indices;
  objectTexCoords[0] = boatModel.textures;

  //####### PEDESTAL
  objectVertices[1] = pedestalModel.vertices;
  objectNormals[1] = pedestalModel.vertexNormals;
  objectIndices[1] = pedestalModel.indices;
  objectTexCoords[1] = pedestalModel.textures;


  //creare buffer, dire il tipo, feedarlo, (a_position fatta) 
  //moltiplicazione di matrici, creazione buffer uniform, inserire dati , GetUniformLocation (matrix)
  for(m = 0; m < models3DCount; m++) {
    //for each program
    positionAttributeLocation[m] = gl.getAttribLocation(programs[0], "a_position");
    normalAttributeLocation[m] = gl.getAttribLocation(programs[0],"inNormal");
    uvAttributeLocation[m] = gl.getAttribLocation(programs[0], "a_uv");

    //diffType (uniform int) e uniform vec3 cameraPos
    matrixLocation[m] = gl.getUniformLocation(programs[0],"matrix");
    normalMatrixLocation[m] = gl.getUniformLocation(programs[0],"nMatrix");
    worldMatrixLocation[m] = gl.getUniformLocation(programs[0], "worldMatrix");

    diffuseTypeLocation[m] = gl.getUniformLocation(programs[0], "diffType");
    materialDiffColorLocation[m] = gl.getUniformLocation(programs[0], 'mDiffColor');
    specularTypeLocation[m] = gl.getUniformLocation(programs[0], "specType");
    specColorLocation[m] = gl.getUniformLocation(programs[0], "specularColor");
    specShineLocation[m] = gl.getUniformLocation(programs[0], "specShine");

    lightDirectionLocation[m] = gl.getUniformLocation(programs[0], 'lightDirection');
    lightColorLocation[m] = gl.getUniformLocation(programs[0], 'lightColor');

    lightTypeLocation[m] = gl.getUniformLocation(programs[0], 'lyghtType');
    lightPosLocation[m] = gl.getUniformLocation(programs[0], 'lightPos');
    lightConeOutLocation[m] = gl.getUniformLocation(programs[0], 'lightConeOut');
    lightConeInLocation[m] = gl.getUniformLocation(programs[0], 'lightConeIn');
    lightDecayLocation[m] = gl.getUniformLocation(programs[0], 'lightDecay');
    lightTargetLocation[m] = gl.getUniformLocation(programs[0], 'lightTarget');

    cameraPosLocation[m] = gl.getUniformLocation(programs[0], "cameraPos");
    ambientLightLocation[m] = gl.getUniformLocation(programs[0], "ambientLight");
    texLocation[m] = gl.getUniformLocation(programs[0], "u_texture");

  }

  var cubePosLoc = gl.getAttribLocation(programs[1], "a_position");
  var cubeUvLoc = gl.getAttribLocation(programs[1], "a_uv");

  var cubeTexLoc = gl.getUniformLocation(programs[1], "u_texture");
  var cubeMatrixLoc = gl.getUniformLocation(programs[1], "matrix");

  for(loc = 0; loc < positionAttributeLocation.length; loc++) {

    vaos[loc] = gl.createVertexArray();
      gl.bindVertexArray(vaos[loc]);

      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices[loc]),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionAttributeLocation[loc]);
      gl.vertexAttribPointer(positionAttributeLocation[loc], 3, gl.FLOAT, false, 0, 0);
      
      //PASSING NORMALS INTO SHADERS inNormal buffer
      var normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectNormals[loc]),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(normalAttributeLocation[loc]);
      gl.vertexAttribPointer(normalAttributeLocation[loc], 3, gl.FLOAT, false, 0, 0);

      //PASSING UV COORDS INTO a_uv
      var uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectTexCoords[loc]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(uvAttributeLocation[loc]);
      gl.vertexAttribPointer(uvAttributeLocation[loc], 2, gl.FLOAT, false, 0, 0);
            
      var indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectIndices[loc]), gl.STATIC_DRAW);

    //boat params locations in first half of Location arrays - object<Param>[0]
    if(loc < positionAttributeLocation.length / 2){
      texture[0] = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture[0]);

      var image1 = new Image();
      image1.src = baseDir + modelTexture[2];
      image1.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture[0]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
   
    //pedestal params locations in second half of Location arrays - object<Param>[1]
    else { 
      texture[1] = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture[1]);

      var image2 = new Image();
      image2.src = baseDir + modelTexture[0];
      image2.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture[1]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
  }

      vaos[2] = gl.createVertexArray();
      gl.bindVertexArray(vaos[2]);

      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(cubePosLoc);
      gl.vertexAttribPointer(cubePosLoc, 3, gl.FLOAT, false, 0, 0);

      var uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(cubeUvLoc);
      gl.vertexAttribPointer(cubeUvLoc, 2, gl.FLOAT, false, 0, 0);

      var indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

      texture[2] = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture[2]);

      var image3 = new Image();
      image3.src = baseDir + modelTexture[6];
      image3.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture[2]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
      }

  
  drawScene();
  
  
  function animate() {
    var currentTime = (new Date).getTime();

    let slower = 7;
    let wibblywobbly = 3;
    if (lastUpdateTime) {
      var deltaC = (10 * (currentTime - lastUpdateTime)) / 1000.0;
      
      boatRy -= deltaC;

      if (flag == 0) {
        boatRx += deltaC / slower;
        boatRz += deltaC / slower;
      }
      else {
        boatRx -= deltaC / slower;
        boatRz -= deltaC / slower;
      }

      if (boatRz >= wibblywobbly) flag = 1;
      else if (boatRz <= -wibblywobbly) flag = 0;
      
    }
    objWorldMatrix[0] = utils.MakeWorld(boatTx, boatTy, boatTz, boatRx, boatRy, boatRz, boatS);
    lastUpdateTime = currentTime;
  }
  
  function drawScene() {
    animate();
    //N.B accorgimento del -1 nella terza componente per evitare il nero iniziale
    dirLightAlpha = utils.degToRad(alpha);
    dirLightBeta  = utils.degToRad(beta);
    directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
    Math.sin(dirLightAlpha),
    -(Math.cos(dirLightAlpha) * Math.sin(dirLightBeta))
    ];
        
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var perspectiveMatrix = utils.MakePerspective(fovDeg, gl.canvas.width/gl.canvas.height, zNear, zFar);
    var viewMatrix = utils.MakeView(cx, cy, cz, 0.0, 0.0);

    
    
    for(loc = 0; loc < positionAttributeLocation.length; loc++) {
      gl.useProgram(programs[0]);
      var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, objWorldMatrix[loc]);
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
      
      gl.uniformMatrix4fv(matrixLocation[loc], gl.FALSE, utils.transposeMatrix(projectionMatrix));
      gl.uniformMatrix4fv(normalMatrixLocation[loc], gl.FALSE, utils.invertMatrix(objWorldMatrix[loc]));
      gl.uniformMatrix4fv(worldMatrixLocation[loc], gl.FALSE, utils.transposeMatrix(objWorldMatrix[loc]));

      gl.uniform1i(diffuseTypeLocation[loc],diffType);
      gl.uniform3fv(materialDiffColorLocation[loc], boatDiffuse);
      gl.uniform1i(specularTypeLocation[loc], specType);
      gl.uniform4fv(specColorLocation[loc], specularColor);
      gl.uniform1f(specShineLocation[loc],specularShine);

      gl.uniform3fv(lightColorLocation[loc],  directionalLightColor);
      gl.uniform3fv(lightDirectionLocation[loc],  directionalLight);

      gl.uniform1i(lightTypeLocation[m], lightType);
      gl.uniform3fv(lightPosLocation[m], lightPos);
      gl.uniform1f(lightConeInLocation[m], c_in);
      gl.uniform1f(lightConeOutLocation[m], c_out);  
      gl.uniform1f(lightDecayLocation[m], l_decay);  
      gl.uniform1f(lightTargetLocation[m], l_target);


      gl.uniform3fv(cameraPosLocation[loc], cameraPos);
      gl.uniform4fv(ambientLightLocation[loc],ambientLight);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture[loc]);
      gl.uniform1i(texLocation[loc], 0);
      
      console.log("3:" + texture[loc]);

      gl.bindVertexArray(vaos[loc]);
      gl.drawElements(gl.TRIANGLES, objectIndices[loc].length, gl.UNSIGNED_SHORT, 0);
    }

    gl.useProgram(programs[1]);

    var vw = utils.multiplyMatrices(viewMatrix, utils.MakeScaleMatrix(20));
    var pm = utils.multiplyMatrices(perspectiveMatrix, vw);

    gl.uniformMatrix4fv(cubeMatrixLoc, gl.FALSE, utils.transposeMatrix(pm));

    gl.bindTexture(gl.TEXTURE_2D, texture[2]);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(cubeTexLoc, texture[2]);

    gl.bindVertexArray(vaos[2]);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    
    window.requestAnimationFrame(drawScene);
   }
  
}



/* ------------------------------------------------------------FUNCTION FOR LOADING VS AND FS FILES */ 
async function init() {

  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";


  canvas = document.getElementById("my-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }
  
  utils.resizeCanvasToDisplaySize(gl.canvas);

  
// TODO: fai una funzione per la creazione degli shader
  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);  //setting program

  });

/* repeat for each vs and fs program*/

  await utils.loadFiles([shaderDir + 'vs_cube.glsl', shaderDir + 'fs_cube.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[1] = utils.createProgram(gl, vertexShader, fragmentShader); 

  });
 
 //########################################################## LOAD OBJECT FILES (INSIDE ASYNC FUNCTION)
 var boatObjStr = await utils.get_objstr(baseDir + modelStr[0]);
 boatModel = new OBJ.Mesh(boatObjStr);

 var pedestalObjStr = await utils.get_objstr(baseDir + modelStr[1]);
 pedestalModel = new OBJ.Mesh(pedestalObjStr);
 
 main();
}

 //TODO: make it continuous
 function onSliderChange(value){
  specularShine = value;
}

function onSliderChange2(value){
  alpha = value;
}

function onSliderChange3(value){
  beta = value;
}

function onColorChange(value){
  col = value.substring(1,7);
R = parseInt(col.substring(0,2) ,16) / 255;
G = parseInt(col.substring(2,4) ,16) / 255;
B = parseInt(col.substring(4,6) ,16) / 255;
  specularColor = [R,G,B, 1.0];
  /*backgroundColorR =R;
  backgroundColorG = G;
  backgroundColorB = B;*/

}

function onCheckBoxChange(value){
  if(value == true){
    ambientLight = [0.1,0.1,0.1,1.0];
  }else{
    ambientLight = [0.0, 0.0, 0.0, 1.0];
  }
}

function onDropdownChange(value){
  diffType = value;
  console.log("Drop-down value changed to "+value);
}

function onDropdownChange1(value){
  specType = value;
  console.log("Drop-down value changed to "+value);
}
window.addEventListener('keydown', (e) => {
  if(e.key == 'w') cz -= 1.00; //w
  if(e.key == 's') cz += 1.00; //s
  if(e.key == 'a') angle -= 1.00;
  if(e.key == 'd') angle += 1.00;
  console.log(e.key);
});
 
 window.onload = init;

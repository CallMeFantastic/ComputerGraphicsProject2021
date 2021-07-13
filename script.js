var programs = new Array();
var canvas;
var gl;
var baseDir;
var shaderDir;
var diffType = 1;
var specType = 4;

var modelTexture = Array(); //array contenente i path alle textures
modelTexture[0] = 'assetshowcase/pedestal.png';
modelTexture[1] = 'assetshowcase/Boat/textures/boat_ao.bmp';
modelTexture[2] = 'assetshowcase/Boat/textures/boat_diffuse.bmp';
modelTexture[3] = 'assetshowcase/Boat/textures/boat_gloss.bmp';
modelTexture[4] = 'assetshowcase/Boat/textures/boat_normal.bmp';
modelTexture[5] = 'assetshowcase/Boat/textures/boat_specular.bmp'; //verifica sui suoi esempi

var modelStr = new Array(); //array contenente i path agli obj
modelStr[0] = 'assetshowcase/Boat/Boat.obj';
modelStr[1] = 'assetshowcase/pedestal.obj';
var models3DCount = 2;


//CAMERA COORDS
var cx = 0.0;
var cy = 0.0;
var cz = 2.0;
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
var alpha = 0;
var beta = -45;
var dirLightAlpha = -utils.degToRad(alpha);
var dirLightBeta  = -utils.degToRad(beta);
var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
var directionalLightColor = [1.0, 1.0, 1.0];
var specularShine = 100;
var specularColor = [0.5, 0.3, 0.2, 1.0];
var ambientLight = [0.1, 0.1, 0.1, 1.0];     


//################## BOAT TRANSFORM
var boatModel;

var boatTx = 0.0
var boatTy = 0.0
var boatTz = -10.0
var boatRx = 0.0;
var boatRy = 0.0;
var boatRz = 0.0;
var boatS  = 0.004;
var boatDiffuse = [0.69, 0.0, 1.0];
var boatWorldMatrix = utils.MakeWorld(boatTx, boatTy, boatTz, boatRx, boatRy, boatRz, boatS);

//################## PEDESTAL TRANSFORM
var pedestalModel;

var pedestalTx = 0.0
var pedestalTy = -10.0
var pedestalTz = -10.0
var pedestalRx = 0.0;
var pedestalRy = 0.0;
var pedestalRz = 0.0;
var pedestalS  = 0.004;
var pedestalDiffuse = [0.69, 0.0, 1.0];
var pedestalWorldMatrix = utils.MakeWorld(pedestalTx, pedestalTy, pedestalTz, pedestalRx, pedestalRy, pedestalRz, pedestalS);



//################## ANIMATION VARS
var lastUpdateTime = (new Date).getTime();
var flag = 0;

var camera = [cx, cy, cz];
//var target = [Rx, Ry, Rz];
var upVector = [0.0, 1.0, 0.0];


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
  
  var materialDiffColorLocation = new Array();
  var lightDirectionLocation = new Array();
  var lightColorLocation = new Array();
  var matrixLocation = new Array();
  var normalMatrixLocation = new Array();
  var texLocation = new Array(); 
  var cameraPosLocation = new Array();
  var diffuseTypeLocation = new Array();
  var specularTypeLocation = new Array();
  var worldMatrixLocation = new Array();
  var ambientLightLocation = new Array();
  var specShineLocation = new Array();
  var specColorLocation = new Array();

  



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
    materialDiffColorLocation[m] = gl.getUniformLocation(programs[0], 'mDiffColor');
    lightDirectionLocation[m] = gl.getUniformLocation(programs[0], 'lightDirection');
    lightColorLocation[m] = gl.getUniformLocation(programs[0], 'lightColor');
    matrixLocation[m] = gl.getUniformLocation(programs[0],"matrix");
    normalMatrixLocation[m] = gl.getUniformLocation(programs[0],"nMatrix");
    texLocation[m] = gl.getUniformLocation(programs[0], "u_texture");
    diffuseTypeLocation[m] = gl.getUniformLocation(programs[0], "diffType");
    specularTypeLocation[m] = gl.getUniformLocation(programs[0], "specType");
    cameraPosLocation[m] = gl.getUniformLocation(programs[0], "cameraPos");
    worldMatrixLocation[m] = gl.getUniformLocation(programs[0], "worldMatrix");
    ambientLightLocation[m] = gl.getUniformLocation(programs[0], "ambientLight");
    specColorLocation[m] = gl.getUniformLocation(programs[0], "specularColor");
    specShineLocation[m] = gl.getUniformLocation(programs[0], "specShine");
    

  }
  
  for(loc = 0; loc < positionAttributeLocation.length; loc++) {
    //boat params locations in first half of Location arrays - object<Param>[0]
    if(loc < positionAttributeLocation.length / 2){
      gl.bindVertexArray(vaos[loc]);
      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices[0]),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionAttributeLocation[loc]);
      gl.vertexAttribPointer(positionAttributeLocation[loc], 3, gl.FLOAT, false, 0, 0);
      
      //PASSING NORMALS INTO SHADERS inNormal buffer
      var normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectNormals[0]),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(normalAttributeLocation[loc]);
      gl.vertexAttribPointer(normalAttributeLocation[loc], 3, gl.FLOAT, false, 0, 0);

      //PASSING UV COORDS INTO a_uv
      var uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectTexCoords[0]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(uvAttributeLocation[loc]);
      gl.vertexAttribPointer(uvAttributeLocation[loc], 2, gl.FLOAT, false, 0, 0);
            
      var indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectIndices[0]), gl.STATIC_DRAW);

      var image = new Image();
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);  //<-- se non va, 2nd param = texture[loc]
      image.src = baseDir + modelTexture[2];
      console.log("baseDir"+image.src);  //LOGGGGGGGG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
   /*
    //pedestal params locations in second half of Location arrays - object<Param>[1]
    else { 
      gl.bindVertexArray(vaos[loc]);
      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices[1]),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionAttributeLocation[loc]);
      gl.vertexAttribPointer(positionAttributeLocation[loc], 3, gl.FLOAT, false, 0, 0);
      
      //PASSING NORMALS INTO SHADERS inNormal buffer
      var normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectNormals[1]),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(normalAttributeLocation[loc]);
      gl.vertexAttribPointer(normalAttributeLocation[loc], 3, gl.FLOAT, false, 0, 0);

      //PASSING UV COORDS INTO a_uv
      var uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectTexCoords[1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(uvAttributeLocation[loc]);
      gl.vertexAttribPointer(uvAttributeLocation[loc], 2, gl.FLOAT, false, 0, 0);
            
      var indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectIndices[1]), gl.STATIC_DRAW);

      var image = new Image(); 
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);  //<-- se non va, 2nd param = texture[loc]
      image.src = baseDir + modelTexture[0];
      console.log("baseDir"+image.src); //LOGGGGGGGG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
    */
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
      
      //console.log(boatRz);
    }
    boatWorldMatrix = utils.MakeWorld(boatTx, boatTy, boatTz, boatRx, boatRy, boatRz, boatS);
    lastUpdateTime = currentTime;
  }
  
  function drawScene() {
    animate();
     
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var perspectiveMatrix = utils.MakePerspective(fovDeg, gl.canvas.width/gl.canvas.height, zNear, zFar);
    var viewMatrix = utils.MakeView(cx, cy, cz, 0.0, 0.0);

    
    
    for(loc = 0; loc < positionAttributeLocation.length; loc++) {
      gl.useProgram(programs[0]);

      if(loc < positionAttributeLocation.length / 2) {
        
        
        
        var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, boatWorldMatrix);
        var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
        
        gl.uniformMatrix4fv(matrixLocation[loc], gl.FALSE, utils.transposeMatrix(projectionMatrix));
        gl.uniformMatrix4fv(normalMatrixLocation[loc], gl.FALSE, utils.invertMatrix(boatWorldMatrix));
        gl.uniformMatrix4fv(worldMatrixLocation[loc], gl.FALSE, utils.transposeMatrix(boatWorldMatrix));
        gl.uniform3fv(materialDiffColorLocation[loc], boatDiffuse);
        gl.uniform3fv(lightColorLocation[loc],  directionalLightColor);
        gl.uniform3fv(lightDirectionLocation[loc],  directionalLight);
        gl.uniform3fv(cameraPosLocation[loc], cameraPos);
        gl.uniform4fv(ambientLightLocation[loc],ambientLight);
        gl.uniform4fv(specColorLocation[loc], specularColor);
        gl.uniform1f(specShineLocation[loc],specularShine);
        gl.uniform1i(specularTypeLocation[loc], specType);
        gl.uniform1i(diffuseTypeLocation[loc],diffType);


        
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(texLocation[loc], 0);

        gl.bindVertexArray(vaos[loc]);
        gl.drawElements(gl.TRIANGLES, objectIndices[0].length, gl.UNSIGNED_SHORT, 0);
      }

    /*  else {

        
        
        var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, pedestalWorldMatrix);
        var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
        
        gl.uniformMatrix4fv(matrixLocation[loc], gl.FALSE, utils.transposeMatrix(projectionMatrix));
        gl.uniformMatrix4fv(normalMatrixLocation[loc], gl.FALSE, utils.transposeMatrix(pedestalWorldMatrix));
        
        gl.uniform3fv(materialDiffColorLocation[loc], pedestalDiffuse);
        gl.uniform3fv(lightColorLocation[loc],  directionalLightColor);
        gl.uniform3fv(lightDirectionLocation[loc],  directionalLight);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(texLocation[loc], 0);
        
        gl.bindVertexArray(vaos[loc]);
        gl.drawElements(gl.TRIANGLES, objectIndices[1].length, gl.UNSIGNED_SHORT, 0);
      }
*/
    }
    
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
    console.log("bip bop boop");
    programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);  //setting program

  });

/* repeat for each vs and fs program*/
/*
  await utils.loadFiles([shaderDir + 'vs_2.glsl', shaderDir + 'fs_2.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[1] = utils.createProgram(gl, vertexShader, fragmentShader); 

  });*/
 
 //########################################################## LOAD OBJECT FILES (INSIDE ASYNC FUNCTION)
 var boatObjStr = await utils.get_objstr(baseDir + modelStr[0]);
 boatModel = new OBJ.Mesh(boatObjStr);

 var pedestalObjStr = await utils.get_objstr(baseDir + modelStr[1]);
 pedestalModel = new OBJ.Mesh(pedestalObjStr);
 
 main();
 }
 
 window.onload = init;

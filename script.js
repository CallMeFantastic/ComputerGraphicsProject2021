var fs = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() {
outColor = vec4(1.0,0.0,0.0,1.0);
}`
var vs = `#version 300 es
in vec3 a_position;

uniform mat4 matrix;

void main(){

gl_Position = matrix * vec4(a_position,1.0);
}` 
var programs = new Array();
var canvas;
var gl;
var baseDir;
var shaderDir;


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

var perspectiveMatrix;

var boatModel;

//CAMERA COORDS
var cx = 0.0;
var cy = 0.0;
var cz = 2.0;
var elevation = 0.0;
var angle = 0.0;
var w, h;
var eyePos = [cx, cy, cz];
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

//################## BOAT TRANSFORM
var boatTx = 0.0
var boatTy = 0.0
var boatTz = -10.0
var boatRx = 0.0;
var boatRy = 0.0;
var boatRz = 0.0;
var boatS  = 0.004;
var objectWorldMatrix = utils.MakeWorld(boatTx, boatTy, boatTz, boatRx, boatRy, boatRz, boatS);


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
  var matrixLocation = new Array();
  //TODO: cambia asset 
  objectVertices[0] = boatModel.vertices;
  objectNormals[0] = boatModel.vertexNormals;
  objectIndices[0] = boatModel.indices;
  objectTexCoords[0] = boatModel.textures;
  
  //creare buffer, dire il tipo, feedarlo, (a_position fatta) 
  //moltiplicazione di matrici, creazione buffer uniform, inserire dati , GetUniformLocation (matrix) 
  positionAttributeLocation[0] = gl.getAttribLocation(programs[0], "a_position");
  matrixLocation[0] = gl.getUniformLocation(programs[0],"matrix");
  
  gl.bindVertexArray(vaos[0]);
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices[0]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectIndices[0]), gl.STATIC_DRAW);
  
  gl.useProgram(programs[0]);
 
  
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
      
      console.log(boatRz);
    }
    objectWorldMatrix = utils.MakeWorld(boatTx, boatTy, boatTz, boatRx, boatRy, boatRz, boatS);
    lastUpdateTime = currentTime;
  }
  
  function drawScene() {
    animate();
    
    gl.bindVertexArray(vaos[0]);
    
    perspectiveMatrix = utils.MakePerspective(fovDeg, gl.canvas.width/gl.canvas.height, zNear, zFar);
    viewMatrix = utils.MakeView(cx, cy, cz, 0.0, 0.0);
    
    
    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, objectWorldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
    
    gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(projectionMatrix));

    gl.drawElements(gl.TRIANGLES, objectIndices[0].length, gl.UNSIGNED_SHORT, 0);
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
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vs);
  gl.compileShader(vertexShader);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fs);
  gl.compileShader(fragmentShader);
  programs[0] = gl.createProgram();
  gl.attachShader(programs[0], vertexShader);
  gl.attachShader(programs[0], fragmentShader);
  gl.linkProgram(programs[0]);
  /*
  
// TODO: fai una funzione per la creazione degli shader
  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);  //setting program

  });*/

/* repeat for each vs and fs program*/
/*
  await utils.loadFiles([shaderDir + 'vs_2.glsl', shaderDir + 'fs_2.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[1] = utils.createProgram(gl, vertexShader, fragmentShader); 

  });*/
 
 //########################################################## LOAD OBJECT FILES (INSIDE ASYNC FUNCTION)
 var objStr = await utils.get_objstr(modelStr[0]);
 boatModel = new OBJ.Mesh(objStr);
 
 main();
 }
 
 window.onload = init;

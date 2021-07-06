var programs = new Array();
var canvas;
var gl;

var modelTexture = Array(); //array contenente i path alle textures
modelTexture[0] = 'assetshowcase/pedestal.png';
modelTexture[1] = 'assetshowcase/Boat/textures/boat_ao.bmp';
modelTexture[2] = 'assetshowcase/Boat/textures/boat_diffuse.bmp';
modelTexture[3] = 'assetshowcase/Boat/textures/boat_gloss.bmp';
modelTexture[4] = 'assetshowcase/Boat/textures/boat_normal.bmp';
modelTexture[5] = 'assetshowcase/Boat/textures/boat_specular.bmp'; //verifica sui suoi esempi

var modelStr = new Array(); //array contenente i path agli obj
modelStr[0] = 'assetshowcase/Boat/boat.obj';
modelStr[1] = 'assetshowcase/pedestal.obj';

var perspectiveMatrix;

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

//################## PEDESTAL POSITION
var Px = 0.0
var Py = 0.0
var Pz = 0.0
var Rx = 0.0;
var Ry = 0.0;
var Rz = 0.0;
var S  = 1;
var objectWorldMatrix = utils.MakeWorld(Px,Py,Pz, Rx, Ry, Rz, S); 



var camera = [cx, cy, cz];
var target = [Rx, Ry, Rz];
var upVector = [0.0, 1.0, 0.0];


function main(){
  canw=canvas.clientWidth;
  canh=canvas.clientHeight;
  aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  
  var objectVertices = Array();
  var objectNormals = Array();
  var objectIndices = Array();
  var objectTexCoords = Array();
  var vaos = Array();
  
  
  var positionAttributeLocation = new Array();
  var matrixLocation = new Array();
  
  objectVertices[0] = pedestalModel.vertices;
  objectNormals[0] = pedestalModel.vertexNormals;
  objectIndices[0] = pedestalModel.indices;
  objectTexCoords[0] = pedestalModel.textures;
  
  //SET Global states (viewport size, viewport background color, Depth test)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  //check what it does viewport --
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  
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
  
  gl.useProgram(programs[0]);
 
  perspectiveMatrix = utils.MakePerspective(fovDeg, gl.canvas.width/gl.canvas.height, zNear, zFar);
  viewMatrix = utils.MakeView(cx, cy, cz,0.0,0.0);
  
  
  var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, objectWorldMatrix);
  var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(projectionMatrix));
  
  
  gl.bindVertexArray(vaos[0]);
  gl.drawElements(gl.TRIANGLES,indexData.length,gl.UNSIGNED_SHORT,0); 
  
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
/*
  await utils.loadFiles([shaderDir + 'vs_2.glsl', shaderDir + 'fs_2.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    programs[1] = utils.createProgram(gl, vertexShader, fragmentShader); 

  });*/
 
 //########################################################## LOAD OBJECT FILES (INSIDE ASYNC FUNCTION)
 var objStr = await utils.get_objstr(modelStr[0]);
 var pedestalModel = new OBJ.Mesh(objStr);
 
 main();
 }
 
 window.onload = init;

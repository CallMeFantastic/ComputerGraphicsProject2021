//3D cube vertex coordinates and indices
var vertices = 
[ // X, Y, Z          
  //Top
  -1.0, 1.0, -1.0,   
  -1.0, 1.0, 1.0,    
  1.0, 1.0, 1.0,     
  1.0, 1.0, -1.0,    
  //
  -1.0, 1.0, 1.0,    
  -1.0, -1.0, 1.0,   
  -1.0, -1.0, -1.0,  
  -1.0, 1.0, -1.0,   
  // 
  1.0, 1.0, 1.0,    
  1.0, -1.0, 1.0,   
  1.0, -1.0, -1.0,  
  1.0, 1.0, -1.0,   //11
  // Front 13, 12, 14,  15, 14, 12,
  1.0, 1.0, 1.0,    //12
  1.0, -1.0, 1.0,   //13
  -1.0, -1.0, 1.0,  //14
  -1.0, 1.0, 1.0,  //15
  //
  1.0, 1.0, -1.0,    
  1.0, -1.0, -1.0,    
  -1.0, -1.0, -1.0,    
  -1.0, 1.0, -1.0,    
  // B
  -1.0, -1.0, -1.0,   
  -1.0, -1.0, 1.0,    
  1.0, -1.0, 1.0,     
  1.0, -1.0, -1.0  
];

var indices =
[
  // Top counterclocwise
  0, 1, 2,
  0, 2, 3,

  // Left
  6, 5, 4,
  6, 4, 7,

  // Right
  8, 9, 10,
  8, 10, 11,

  // Front

  13, 12, 14,
  15, 14, 12,
  //13,14,12,
  //14,15,12,


  // Back
  16, 17, 18,
  16, 18, 19,

  // Bottom
  21, 20, 22,
  22, 20, 23
];

var uv =
[
  //top
  0.25, 0.66,
  0.25, 1.0,
  0.5, 1.0,
  0.5, 0.66,
  //left
  0.25, 0.33,
  0.25, 0.66,
  0.0, 0.66,
  0.0, 0.33,
  //right
  0.5, 0.33,
  0.5, 0.66,
  0.75, 0.66,
  0.75, 0.33,
  //front
  0.5, 0.33,
  0.5, 0.66,
  0.25, 0.66,
  0.25, 0.33,
  //back
  0.75, 0.33,
  0.75, 0.66,
  1.0, 0.66,
  1.0, 0.33,
  //bottom
  0.25, 0.0,
  0.25, 0.33,
  0.5, 0.33,
  0.5, 0.0
]
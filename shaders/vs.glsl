#version 300 es
in vec3 a_position;
in vec3 inNormal;
in vec2 a_uv;

uniform mat4 matrix;  //WVP matrix
uniform mat4 nMatrix; //normal matrix in this case WorldMatrix (no non-uniform scale)
uniform mat4 worldMatrix;

out vec3 fsNormal;
out vec2 uvFS;
out vec3 fsPos;

void main(){
fsNormal = mat3(nMatrix) * inNormal;
uvFS = a_uv;

fsPos = (worldMatrix * vec4(a_position, 1.0)).xyz;

gl_Position = matrix * vec4(a_position,1.0);

}
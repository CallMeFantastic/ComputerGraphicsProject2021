#version 300 es
in vec3 a_position;

out vec3 fs_normal

uniform mat4 matrix;

void main(){

gl_Position = matrix * vec4(a_position,1.0);
}

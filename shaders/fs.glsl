#version 300 es
precision mediump float;

in vec3 fsNormal;

out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color
uniform vec3 lightDirection; //directional light vector
uniform vec3 lightColor; //directional light color

void main() {

  vec3 lightDirNorm = normalize(lightDirection);
  vec3 nNormal = normalize(fsNormal);
  vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirNorm,nNormal);
  outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0);
}


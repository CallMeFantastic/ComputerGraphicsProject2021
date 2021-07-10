#version 300 es
precision mediump float;

in vec3 fsNormal;
in vec2 uvFS;

out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color
uniform vec3 lightDirection; //directional light vector
uniform vec3 lightColor; //directional light color
uniform sampler2D u_texture;

void main() {
  vec3 nNormal = normalize(fsNormal);
  vec3 nLightDirection = normalize(lightDirection);
  vec4 texcol = texture(u_texture, uvFS);

  vec4 diffTerm = vec4(1.0, 1.0, 1.0, 1.0);

  diffTerm = vec4(lightColor,1.0) * texcol * clamp(dot(nLightDirection, nNormal), 0.0, 1.0);

  //outColor = vec4(clamp(lambertColor, 0.0, 1.0),1.0);
  
  vec4 finalColor =  clamp(diffTerm, 0.0, 1.0);
  outColor = vec4(finalColor.rgb, texcol.a);
}

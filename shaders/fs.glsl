#version 300 es
precision mediump float;

in vec3 fsNormal;
in vec2 uvFS;
in vec3 fsPos;

out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color
uniform vec3 lightDirection; //directional light vector
uniform vec3 lightColor; //directional light color
uniform vec3 cameraPos; // [cx, cy, cz] --- DA PASSARE 
uniform int diffType; // DA PASSARE
uniform sampler2D u_texture;

void main() {
  vec3 nNormal = normalize(fsNormal);
  vec3 nLightDirection = normalize(lightDirection);
  vec4 texcol = texture(u_texture, uvFS);
  vec3 cameraDir = normalize(cameraPos - fsPos);
  float DToonTh = 50.0;

  vec4 diffTerm = vec4(1.0, 1.0, 1.0, 1.0);
  if(diffType == 1){ //LAMBERT DIFFUSION
  diffTerm = vec4(lightColor, 1.0) * texcol * clamp(dot(nLightDirection, nNormal), 0.0, 1.0);
  }
  if(diffType == 2) { //OREN-NAYAR DIFFUSION
    float sigma2 = 0.25;
  	float theta_i = acos(dot(nLightDirection, nNormal));
    float theta_r = acos(dot(cameraDir, nNormal));
    float alpha = max(theta_i, theta_r);
    float beta = min(theta_i, theta_r);
    float A = 1.0 - 0.5 * sigma2/(sigma2 + 0.33);
    float B = 0.45 * sigma2 / (sigma2 + 0.09);
    vec3 v_i = normalize(nLightDirection - dot(nLightDirection, nNormal) * nNormal);
    vec3 v_r = normalize(cameraDir - dot(cameraDir, nNormal) * nNormal);
    float G = max(0.0, dot(v_i, v_r));
    float Lcontr = clamp(dot(nLightDirection, nNormal),0.0,1.0);
    vec4 diffuseOrenNayar = vec4(lightColor, 1.0) * texcol * Lcontr * (A + B * G * sin(alpha) * tan(beta));
    diffTerm = diffuseOrenNayar;
  }
  if(diffType == 3){
    vec4 diffuseToon = max(sign(max(0.0, dot(nNormal, nLightDirection)) - DToonTh ), 0.0) * vec4(lightColor, 1.0) * texcol;
    diffTerm = diffuseToon;   
  }
  
  vec4 finalColor =  clamp(diffTerm, 0.0, 1.0);
  outColor = vec4(finalColor.rgb, texcol.a);
}


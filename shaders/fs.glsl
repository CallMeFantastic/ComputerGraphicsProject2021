#version 300 es
precision mediump float;

in vec3 fsNormal;
in vec2 uvFS;
in vec3 fsPos;

out vec4 outColor;

uniform vec3 mDiffColor; //material diffuse color - NON VIENE USATA DA NESSUNA PARTE 
uniform vec3 lightDirection; //directional light vector
uniform vec3 lightColor; //directional light color
uniform vec3 cameraPos; // [cx, cy, cz] 
uniform vec4 ambientLight;
uniform vec4 specularColor;
uniform sampler2D u_texture;
uniform int diffType;
uniform int specType;
uniform float specShine;

void main() {
  vec3 nNormal = normalize(fsNormal);
  vec3 nLightDirection = normalize(-lightDirection);
  vec4 texcol = texture(u_texture, uvFS);
  vec3 cameraDir = normalize(cameraPos - fsPos);
  vec4 ambientContr = ambientLight;
  float DToonTh = 60.0;
  float SToonTh = 45.0;

  vec3 halfVec = normalize(cameraDir + nLightDirection);
  vec3 t = normalize(cross(nNormal, vec3(1,0,0)));
	vec3 b = normalize(cross(nNormal, t));
  float M = (201.0 - specShine) / 200.0 * 0.5;          ////  float M = (200.0 - specShine) / 200.0;
	float M2 = M * M;
  float VdotN = max(0.00001, dot(nNormal, cameraDir));
  float LdotN = max(0.00001, dot(nNormal, nLightDirection));
	float HdotT = dot(t, halfVec);
  float HdotN = max(dot(nNormal, halfVec), 0.0);
	float HdotB = dot(b, halfVec);
  float SspecKwAng = 80.0;

  vec4 LScol = vec4(lightColor, 1.0) * specularColor * max(sign(LdotN),0.0);
  vec4 diffTerm = vec4(1.0, 1.0, 1.0, 1.0);


  //---------------------------------------LAMBERT DIFFUSION
  if(diffType == 1){
  diffTerm = vec4(lightColor, 1.0) * texcol * clamp(dot(nLightDirection, nNormal), 0.0, 1.0);
  }

  //---------------------------------------OREN-NAYAR DIFFUSION
  if(diffType == 2) {
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


  //--------------------------------BETTER TOON 
  if(diffType == 3) {
    vec4 diffuseToon = max(sign(max(0.0, dot(nNormal, nLightDirection)) - cos(DToonTh * 3.14 / 180.0)), 0.5) * vec4(lightColor, 1.0) * texcol;
    diffTerm = diffuseToon;
  }

  //-----------------SPECULAR---------------------------
  //-----------------PHONG -----------------------------
  vec4 specularTerm = vec4(0.0, 0.0, 0.0, 1.0);
  if(specType == 1){
    vec3 reflectDir = normalize(-reflect(nLightDirection, nNormal));
    vec4 specularPhong = LScol * pow(clamp(dot(cameraDir, reflectDir), 0.0, 1.0), specShine);
    specularTerm = specularPhong;
  }
  //--------------------BLINN ------------------------------
  if(specType == 2) {
    specularTerm = LScol * pow(max(dot(halfVec, nNormal), 0.0), specShine);
  }

  if(specType == 3) {
  //-------------------- TOON PHONG -------------------------
    vec4 specularToon = max(sign(max(0.0, dot(cameraDir, -reflect(nLightDirection, nNormal)) - cos(SToonTh * 3.14 / 180.0))), 0.5) * vec4(lightColor, 1.0) * LScol;
    specularTerm = specularToon;
  }  

   if(specType == 4) {
  //-------------------- TOON BLINN -------------------------
    vec4 specularToon = max(sign(max(0.0, dot(nNormal, normalize(nLightDirection + cameraDir)) - cos(SToonTh * 3.14 / 180.0))), 0.5) * vec4(lightColor, 1.0) * LScol;
    specularTerm = specularToon;
  }  
  
  if (specType == 5) {
    //------------------------WARD
    float alphaX = M2;
	  float alphaY = M2 * (1.0 - 0.999 * SToonTh);
    float wsX = pow(HdotT / alphaX, 2.0);
    float wsY = pow(HdotB / alphaY, 2.0);
    
    vec4 specularWard = LScol * exp(-(wsX + wsY) / pow(HdotN, 2.0)) / (12.566 * alphaX * alphaY * sqrt(VdotN / LdotN));

    specularTerm = specularWard;
  }
  
  if (specType == 6) {
  //-------------------COOK-TORRANCE
	  HdotN = max(0.00001, HdotN);
	  float HdotV = max(0.00001, dot(halfVec, cameraDir));
	  float G = min(1.0, 2.0 * HdotN * min(VdotN, LdotN) / HdotV);
	  float F = SToonTh + (1.0 - SToonTh) * pow(1.0 - min(HdotV, 1.0), 5.0);
	  float HtoN2 = HdotN * HdotN;
	  float D = exp(- (1.0-HtoN2) / (HtoN2 * M2)) / (3.14159 * M2 * HtoN2 * HtoN2);

    specularTerm = LScol * (D * F * G) / (4.0 * min(VdotN, 1.0));
  }

  vec4 finalColor = clamp(diffTerm + specularTerm + ambientContr, 0.0, 1.0);
  outColor = vec4(finalColor.rgb, texcol.a);
}


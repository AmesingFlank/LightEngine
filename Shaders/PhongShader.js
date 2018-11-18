import {ShaderProgram} from "../Engine/ShaderProgram.js";
import * as mat4 from "../Utility/gl-matrix/mat4.js";

class MaterialPropertyHandle{
    constructor(gl,targetProgram,name){
        this.textureLocation =  gl.getUniformLocation(targetProgram, "t_"+name+"Texture");
        this.valueLocation =  gl.getUniformLocation(targetProgram, "u_"+name+"Value");
        this.hasTextureLocation =  gl.getUniformLocation(targetProgram, "u_"+name+"Texture");
    }
}


export class PhongShader extends ShaderProgram{

    constructor(gl) {
        super(gl, PhongShader.vertexShaderSource, PhongShader.fragmentShaderSource);
    }

    setSingleMaterial(gl,materialProperty){

    }
    setMaterials(gl,material){
        if(material.diffuse){
            gl.uniform3fv(this.diffuseValueLocation,material.diffuse.value);
            if(material.diffuse.texture){
                if(material.diffuse.texture.glHandle){
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D,material.diffuse.texture.glHandle);
                    gl.uniform1i(this.diffuseTextureLocation,0);
                    gl.uniform1i(this.diffuseHasTextureLocation,1);
                }
            }
        }
    }
    setPointLights(gl,pointLights){
        var maxPointLightsCount = 16;
        var pointLightsCount = Math.min(pointLights.length,maxPointLightsCount);
        for (var i = 0; i < pointLightsCount ; i++) {
            var lightVarString = "u_pointLights["+i.toString()+"]";
            var lightPositionLocation = gl.getUniformLocation(this.program,lightVarString+".position");
            var lightColorLocation = gl.getUniformLocation(this.program,lightVarString+".color");
            gl.uniform3fv(lightPositionLocation,pointLights[i].position);
            gl.uniform3fv(lightColorLocation,pointLights[i].color);
        }

    }
    setUniformLocations(gl){
        this.modelLocation = gl.getUniformLocation(this.program,"u_model");
        this.viewLocation = gl.getUniformLocation(this.program,"u_view");
        this.projectionLocation = gl.getUniformLocation(this.program,"u_projection");
        this.cameraPositionLocation = gl.getUniformLocation(this.program,"u_cameraPosition");
        this.modelAdjugateLocation = gl.getUniformLocation(this.program,"u_modelAdjugate");



        this.ambientTextureLocation =  gl.getUniformLocation(this.program, "t_ambientTexture");
        this.ambientValueLocation =  gl.getUniformLocation(this.program, "t_ambientValue");
        this.ambientHasTextureLocation =  gl.getUniformLocation(this.program, "u_ambientHasTexture");

        this.diffuseTextureLocation =  gl.getUniformLocation(this.program, "t_diffuseTexture");
        this.diffuseValueLocation =  gl.getUniformLocation(this.program, "t_diffuseValue");
        this.diffuseHasTextureLocation =  gl.getUniformLocation(this.program, "u_diffuseHasTexture");

        this.specularTextureLocation =  gl.getUniformLocation(this.program, "t_specularTexture");
        this.specularValueLocation =  gl.getUniformLocation(this.program, "t_specularValue");
        this.specularHasTextureLocation =  gl.getUniformLocation(this.program, "t_specularHasTexture");

        this.specularIntensityTextureLocation =  gl.getUniformLocation(this.program, "t_specularIntensityTexture");
        this.specularIntensityValueLocation =  gl.getUniformLocation(this.program, "t_specularIntensityValue");
        this.specularIntensityHasTextureLocation =  gl.getUniformLocation(this.program, "t_specularIntensityHasTexture");

    }
    setAttribLocations(gl){
        this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        this.texCoordsAttributeLocation = gl.getAttribLocation(this.program, "a_texCoords");
        this.normalAttributeLocation = gl.getAttribLocation(this.program, "a_normal");
    }
    drawObject(gl,object,model,view,projection,cameraPosition,pointLights){
        this.useProgram(gl);
        gl.uniformMatrix4fv(this.modelLocation,false,model);
        gl.uniformMatrix4fv(this.viewLocation,false,view);
        gl.uniformMatrix4fv(this.projectionLocation,false,projection);
        var modelAdjugate = mat4.create();
        mat4.transpose(modelAdjugate,mat4.clone(model));
        mat4.transpose(modelAdjugate,mat4.clone(modelAdjugate));
        gl.uniformMatrix4fv(this.modelAdjugateLocation,false,modelAdjugate);

        this.setPointLights(gl,pointLights);
        gl.uniform3fv(this.cameraPositionLocation,cameraPosition);
        object.meshes.forEach(mesh =>{
            this.setMaterials(gl,mesh.material);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.elementBuffer.EBO);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.parentModel.vertexBuffer.VBO);

            var sizeOfFloat = 4;
            var stride = (3+2+3)*sizeOfFloat;

            gl.enableVertexAttribArray(this.positionAttributeLocation);
            gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, stride, 0);

            gl.enableVertexAttribArray(this.texCoordsAttributeLocation);
            gl.vertexAttribPointer(this.texCoordsAttributeLocation, 2, gl.FLOAT, false, stride,2*sizeOfFloat);

            gl.enableVertexAttribArray(this.normalAttributeLocation);
            gl.vertexAttribPointer(this.normalAttributeLocation, 3, gl.FLOAT, false, stride,5*sizeOfFloat);

            gl.drawElements(gl.TRIANGLES,mesh.elementBuffer.indexData.length,gl.UNSIGNED_INT,0);
        });
    }


    static get vertexShaderSource(){
        var source =
`
attribute vec3 a_position;
attribute vec2 a_texCoords;
attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_modelAdjugate;


uniform vec3 u_cameraPosition;

varying vec3 v_fragmentPosition;
varying vec2 v_texCoords;
varying vec3 v_normal;
varying vec3 v_cameraPosition;

void main() {
  vec4 worldPosition = u_model * vec4(a_position,1);
  gl_Position = u_projection * u_view * worldPosition;
  v_texCoords = a_texCoords;
  v_normal = mat3(u_modelAdjugate) * a_normal;
  v_cameraPosition = u_cameraPosition;
  v_fragmentPosition = worldPosition.xyz;
}
`;
        return source;
    }

    static get fragmentShaderSource(){
        var source =
`
precision mediump float;

varying vec3 v_fragmentPosition;
varying vec2 v_texCoords;
varying vec3 v_normal;
varying vec3 v_cameraPosition;

uniform sampler2D t_ambientTexture;
uniform vec3 t_ambientValue;
uniform bool u_ambientHasTexture;

uniform sampler2D t_diffuseTexture;
uniform vec3 t_diffuseValue;
uniform bool u_diffuseHasTexture;

uniform sampler2D t_specularTexture;
uniform vec3 t_specularValue;
uniform bool u_specularHasTexture;

uniform sampler2D t_specularIntensityTexture;
uniform vec3 t_specularIntensityValue;
uniform bool u_specularIntensityHasTexture;

struct PointLight {
    vec3 position;
    vec3 color;
};

#define MAX_POINTLIGHTS_COUNT 16
uniform PointLight u_pointLights[MAX_POINTLIGHTS_COUNT];

void main() {
    
    vec3 objectAmbient = t_ambientValue;
    if(u_ambientHasTexture){
        objectAmbient = texture2D(t_ambientTexture, v_texCoords).rgb;
    }

    vec3 objectDiffuse = t_diffuseValue;
    if(u_diffuseHasTexture){
        objectDiffuse = texture2D(t_diffuseTexture, v_texCoords).rgb;
    }
    
    vec3 objectSpecular = t_specularValue;
    if(u_specularHasTexture){
        objectSpecular = texture2D(t_specularTexture, v_texCoords).rgb;
    }
    
    vec3 diffuse = vec3(0,0,0);
    vec3 specular = vec3(0,0,0);
    
    vec3 viewDir = normalize(v_cameraPosition - v_fragmentPosition);


    for(int i = 0;i<MAX_POINTLIGHTS_COUNT;++i){
        vec3 lightDir = normalize(u_pointLights[i].position - v_fragmentPosition);

        diffuse += objectDiffuse * u_pointLights[i].color* dot(lightDir,v_normal) ;
        
    }
    gl_FragColor = vec4( diffuse ,1);
  
}
`;
        return source;
    }
}
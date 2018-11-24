import {ShaderProgram} from "../Engine/ShaderProgram.js";
import * as mat4 from "../Utility/gl-matrix/mat4.js";
import {Scene} from "../Engine/Scene.js";

class MaterialPropertyHandle{
    constructor(gl,targetProgram,name){
        this.textureLocation =  gl.getUniformLocation(targetProgram, "t_"+name+"Texture");
        this.valueLocation =  gl.getUniformLocation(targetProgram, "u_"+name+"Value");
        this.hasTextureLocation =  gl.getUniformLocation(targetProgram, "u_"+name+"HasTexture");
    }
}


export class PhongShader extends ShaderProgram{

    constructor(gl) {
        super(gl, PhongShader.vertexShaderSource, PhongShader.fragmentShaderSource);
    }

    setSingleMaterial(gl,materialProperty,handle,index){
        if(materialProperty){
            gl.uniform3fv(handle.valueLocation,materialProperty.value);
            gl.uniform1i(handle.hasTextureLocation,0);
            if(materialProperty.texture){
                if(materialProperty.texture.glHandle){
                    gl.activeTexture(gl.TEXTURE0+index);
                    gl.bindTexture(gl.TEXTURE_2D,materialProperty.texture.glHandle);
                    gl.uniform1i(handle.textureLocation,index);
                    gl.uniform1i(handle.hasTextureLocation,1);
                }
            }
        }
    }
    setMaterials(gl,material){
        this.setSingleMaterial(gl,material.ambient,this.ambientHandle,0);
        this.setSingleMaterial(gl,material.diffuse,this.diffuseHandle,1);
        this.setSingleMaterial(gl,material.specular,this.specularHandle,2);
        this.setSingleMaterial(gl,material.specularIntensity,this.specularIntensityHandle,3);

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


        this.ambientHandle = new MaterialPropertyHandle(gl,this.program,"ambient");
        this.diffuseHandle = new MaterialPropertyHandle(gl,this.program,"diffuse");
        this.specularHandle = new MaterialPropertyHandle(gl,this.program,"specular");
        this.specularIntensityHandle = new MaterialPropertyHandle(gl,this.program,"specularIntensity");

    }
    setAttribLocations(gl){
        this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        this.texCoordsAttributeLocation = gl.getAttribLocation(this.program, "a_texCoords");
        this.normalAttributeLocation = gl.getAttribLocation(this.program, "a_normal");
    }

    drawScene(gl,scene,view,projection,cameraPosition){
        this.useProgram(gl);
        this.setPointLights(gl,scene.pointLights);
        gl.uniform3fv(this.cameraPositionLocation,cameraPosition);
        scene.getReadyObjects().forEach(object =>{
            var transform = scene.getObjectTransform(object);
            this.drawObject(gl,object,transform,view,projection,cameraPosition,scene.pointLights,scene.ambientLight);
        });
    }
    drawObject(gl,object,model,view,projection,cameraPosition,pointLights,ambientLight){
        if(!object.isVisible) return;
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
            gl.vertexAttribPointer(this.texCoordsAttributeLocation, 2, gl.FLOAT, false, stride,3*sizeOfFloat);

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
  v_normal = normalize( mat3(u_modelAdjugate) * a_normal );
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
uniform vec3 u_ambientValue;
uniform int u_ambientHasTexture;

uniform sampler2D t_diffuseTexture;
uniform vec3 u_diffuseValue;
uniform int u_diffuseHasTexture;

uniform sampler2D t_specularTexture;
uniform vec3 u_specularValue;
uniform int u_specularHasTexture;

uniform sampler2D t_specularIntensityTexture;
uniform vec3 u_specularIntensityValue;
uniform int u_specularIntensityHasTexture;

struct PointLight {
    vec3 position;
    vec3 color;
};

#define MAX_POINTLIGHTS_COUNT 16
uniform PointLight u_pointLights[MAX_POINTLIGHTS_COUNT];

void main() {
    
    vec3 objectAmbient = u_ambientValue;
    if(u_ambientHasTexture != 0){
        objectAmbient = texture2D(t_ambientTexture, v_texCoords).rgb;
    }

    vec3 objectDiffuse = u_diffuseValue;
    if(u_diffuseHasTexture != 0){
        objectDiffuse = texture2D(t_diffuseTexture, v_texCoords).rgb;
    }
    
    vec3 objectSpecular = u_specularValue;
    if(u_specularHasTexture != 0){
        objectSpecular = texture2D(t_specularTexture, v_texCoords).rgb;
    }
    
    vec3 objectSpecularIntensity = u_specularIntensityValue;
    if(u_specularIntensityHasTexture != 0){
        objectSpecularIntensity = texture2D(t_specularIntensityTexture, v_texCoords).rgb;
    }
    
    vec3 diffuse = vec3(0,0,0);
    vec3 specular = vec3(0,0,0);
    
    vec3 viewDir = normalize(v_cameraPosition - v_fragmentPosition);

    for(int i = 0;i<MAX_POINTLIGHTS_COUNT;++i){
        vec3 lightDir = normalize(u_pointLights[i].position - v_fragmentPosition);
        vec3 reflectedLightDir = reflect(-lightDir,v_normal);

        diffuse += objectDiffuse * u_pointLights[i].color* dot(lightDir,v_normal) ;
        specular += objectSpecular * u_pointLights[i].color * pow(dot(reflectedLightDir,viewDir),objectSpecularIntensity.x);
    }
    
    vec3 normal = vec3(0,0,0);
    vec3 light_direction = vec3(0,0,0);
    float geometric_attenuation = max (0.0 , length(normal));
    
    
    gl_FragColor = vec4( diffuse+specular ,1);
  
}
`;
        return source;
    }
}
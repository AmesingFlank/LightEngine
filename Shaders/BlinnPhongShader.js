import {ShaderProgram} from "../Engine/ShaderProgram.js";
import {Camera} from "../Engine/Camera.js";
import * as mat4 from "../Utility/gl-matrix/mat4.js";

export class BlinnPhongShader extends ShaderProgram{

    constructor(gl) {
        super(gl, BlinnPhongShader.vertexShaderSource, BlinnPhongShader.fragmentShaderSource);
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
    setUniformLocations(gl){
        this.modelLocation = gl.getUniformLocation(this.program,"u_model");
        this.viewLocation = gl.getUniformLocation(this.program,"u_view");
        this.projectionLocation = gl.getUniformLocation(this.program,"u_projection");

        this.ambientTextureLocation =  gl.getUniformLocation(this.program, "t_ambientTexture");
        this.ambientValueLocation =  gl.getUniformLocation(this.program, "t_ambientValue");
        this.ambientHasTextureLocation =  gl.getUniformLocation(this.program, "u_ambientHasTexture");

        this.diffuseTextureLocation =  gl.getUniformLocation(this.program, "t_diffuseTexture");
        this.diffuseValueLocation =  gl.getUniformLocation(this.program, "t_diffuseValue");
        this.diffuseHasTextureLocation =  gl.getUniformLocation(this.program, "u_diffuseHasTexture");

        this.specularTextureLocation =  gl.getUniformLocation(this.program, "t_specularTexture");
        this.specularValueLocation =  gl.getUniformLocation(this.program, "t_specularValue");
        this.specularHasTextureLocation =  gl.getUniformLocation(this.program, "t_specularHasTexture");

    }
    setAttribLocations(gl){
        this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        this.texCoordsAttributeLocation = gl.getAttribLocation(this.program, "a_texCoords");
        this.normalAttributeLocation = gl.getAttribLocation(this.program, "a_normal");
    }
    drawObject(gl,object,model,view,projection){
        this.useProgram(gl);
        gl.uniformMatrix4fv(this.modelLocation,false,model);
        gl.uniformMatrix4fv(this.viewLocation,false,view);
        gl.uniformMatrix4fv(this.projectionLocation,false,projection);
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

varying vec2 v_texCoords;
varying vec3 v_normal;

void main() {

  gl_Position = u_projection * u_view * u_model * vec4(a_position,1);
  v_texCoords = a_texCoords;
  v_normal = a_normal;
  
}
`;
        return source;
    }

    static get fragmentShaderSource(){
        var source =
`
precision mediump float;

varying vec2 v_texCoords;
varying vec3 v_normal;

uniform sampler2D t_ambientTexture;
uniform vec3 t_ambientValue;
uniform bool u_ambientHasTexture;

uniform sampler2D t_diffuseTexture;
uniform vec3 t_diffuseValue;
uniform bool u_diffuseHasTexture;

uniform sampler2D t_specularTexture;
uniform vec3 t_specularValue;
uniform bool u_specularHasTexture;

void main() {
    
    vec3 ambient = t_ambientValue;
    if(u_ambientHasTexture){
        ambient = texture2D(t_ambientTexture, v_texCoords).rgb;
    }

    vec3 diffuse = t_diffuseValue;
    if(u_diffuseHasTexture){
        diffuse = texture2D(t_diffuseTexture, v_texCoords).rgb;
    }
    
    vec3 specular = t_specularValue;
    if(u_specularHasTexture){
        specular = texture2D(t_specularTexture, v_texCoords).rgb;
    }
    
    
    
    gl_FragColor = vec4(diffuse,1);
  
}
`;
        return source;
    }
}
import {vec2,vec3} from "./../Utility/gl-matrix.js"
import {FileLoader} from "../Utility/ResourceHandlers.js";
import {Material,MaterialLib} from "./Material.js";

function DEBUG_BREAK(){
    var DEBUG_BERAK_USELESS_VARIABLE="USELESS VARIABLE";
}

export class StaticMeshVertex{
    constructor(){
        this.position = vec3.create();
        this.texCoords = vec2.create();
        this.normal = vec3.create();
    }
    static get componentCount(){
        return 8;
    }
}

export class StaticMeshTriangle{
    constructor(){
        this.indices=[];
    }
}


export class StaticModel{
    constructor(){
        this.meshes = [];
        this.vertices = [];
        this.vertexBuffer = null;

        this.materialLib = null;
        this.materialLibFileName = "";
        this.needMaterialLib = false;
    }
    prepareRenderData(gl){
        this.vertexBuffer = new VertexBuffer(this.vertices,gl);
        this.meshes.forEach(x=>x.prepareRenderData(gl));
    }
    prepareMaterial(callBack){
        var self = this;
        MtlFileParser.getMaterialLibFromFileName(this.materialLibFileName,function (materialLib) {
            self.materialLib=materialLib;
            callBack();
        });
    }
    drawWithShaderProgram(gl,shaderProgram){
        this.meshes.forEach(x=>x.drawWithShaderProgram(gl,shaderProgram));
    }

}

export class StaticMesh{
    constructor(name,parent){
        this.name = name;
        this.parentModel = parent;
        this.material = new Material();
        this.materialName = "";
        this.triangles = [];
        this.elementBuffer = null;
    }
    prepareRenderData(gl){
        this.elementBuffer = new ElementBuffer(this.triangles,gl);
    }

    drawWithShaderProgram(gl,shaderProgram){
        var VAO =  gl.createVertexArray();
        gl.bindVertexArray(VAO);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.elementBuffer.EBO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.parentModel.vertexBuffer.VBO);

        var positionAttributeLocation = gl.getAttribLocation(shaderProgram.program, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        var size = 3;
        var stride = size*4;
        gl.vertexAttribPointer(
            positionAttributeLocation, size, gl.FLOAT, false, stride,0);

        gl.useProgram(shaderProgram.program);
        gl.bindVertexArray(VAO);
        gl.drawElements(gl.TRIANGLES,this.elementBuffer.indexData.length,gl.UNSIGNED_INT,0);

    }
}

export class VertexBuffer{
    constructor(vertices,gl) {
        this.vertexData = [];
        this.VBO = gl.createBuffer();
        for (var i = 0; i < vertices.length; ++i) {
            vertices[i].position.map(x => this.vertexData.push(x));
            //vertices[i].texCoords.map(x=>this.vertexData.push(x));
            //vertices[i].normal.map(x=>this.vertexData.push(x));
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexData), gl.STATIC_DRAW);
    }
}

export class ElementBuffer{
    constructor(triangles,gl){
        this.indexData = [];
        this.EBO = gl.createBuffer();
        for(var i = 0;i<triangles.length;++i){
            triangles[i].indices.map(x=>this.indexData.push(x));
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(this.indexData),gl.STATIC_DRAW);
    }
}

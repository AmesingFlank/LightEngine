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
        for(var i = 0;i<this.meshes.length;++i){
            this.meshes[i].prepareRenderData(gl);
        }
    }
    prepareMaterial(callBack){
        var self = this;
        MtlFileParser.getMaterialLibFromFileName(this.materialLibFileName,function (materialLib) {
            self.materialLib=materialLib;
            callBack();
        });
    }

}

export class StaticMesh{
    constructor(name,parent){
        this.name = name;
        this.parentModel = parent;
        this.material = new Material();
        this.materialName = "";
        this.triangles = [];
        this.renderData = null;
    }
    prepareRenderData(gl){
        this.renderData = new StaticMeshRenderData(this.triangles,gl,this.parentModel.vertexBuffer.VBO);
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

export class StaticMeshRenderData{
    constructor(triangles,gl,VBO){
        this.indexData = [];
        this.EBO = gl.createBuffer();
        this.VAO = null;
        for(var i = 0;i<triangles.length;++i){
            triangles[i].indices.map(x=>this.indexData.push(x));
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(this.indexData),gl.STATIC_DRAW);
        this.setUpVAO(gl,VBO);
    }
    setUpVAO(gl,VBO){
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.EBO);
        gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

    }
}

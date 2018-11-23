import {vec2,vec3} from "./../Utility/gl-matrix.js"
import {FileLoader} from "../Utility/ResourceHandlers.js";
import {Material,MaterialLib} from "./Material.js";
import {MtlFileParser} from "../Utility/FileParsers.js";

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

        this.path = "";
    }
    prepareRenderData(gl){
        this.vertexBuffer = new VertexBuffer(this.vertices,gl);
        this.meshes.forEach(x=>x.prepareRenderData(gl));

    }
    prepareMaterial(callBack){
        var self = this;
        MtlFileParser.getMaterialLibFromFileName(this.path+this.materialLibFileName,function (materialLib) {
            self.materialLib=materialLib;
            self.meshes.forEach(thisMesh =>{
               thisMesh.material = materialLib.materials[thisMesh.materialName];
            });
            callBack();
        });
    }

}

export class StaticMesh{
    constructor(name,parent){
        this.name = name;
        this.parentModel = parent;
        this.material = null;
        this.materialName = "";
        this.triangles = [];
        this.elementBuffer = null;
    }
    prepareRenderData(gl){
        this.elementBuffer = new ElementBuffer(this.triangles,gl);
        var availableTextures = [];
        if(this.material.ambient && this.material.ambient.texture){
            availableTextures.push(this.material.ambient.texture);
        }
        if(this.material.diffuse && this.material.diffuse.texture){
            availableTextures.push(this.material.diffuse.texture);
        }
        if(this.material.specular && this.material.specular.texture){
            availableTextures.push(this.material.specular.texture);
        }
        if(this.material.normal && this.material.normal.texture){
            availableTextures.push(this.material.normal.texture);
        }
        availableTextures.forEach(tex => tex.load(gl));
    }

}

export class VertexBuffer{
    constructor(vertices,gl) {
        this.vertexData = [];
        this.VBO = gl.createBuffer();
        for (var i = 0; i < vertices.length; ++i) {
            vertices[i].position.map(x => this.vertexData.push(x));
            vertices[i].texCoords.map(x=>this.vertexData.push(x));
            vertices[i].normal.map(x=>this.vertexData.push(x));
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

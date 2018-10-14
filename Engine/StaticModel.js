import {vec2,vec3} from "./../Utility/gl-matrix.js"
import {FileLoader} from "../Utility/ResourceHandlers.js";
import {Material,MtlFileParser,MaterialLib} from "./Material.js";

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



export class Parser{
    static beginsWith(line,firstWord){
        var words = line.trim().split(" ").filter(x=>x.length!==0);
        return words[0]===firstWord;
    }
    static tailWords(line){
        var words = line.trim().split(" ").filter(x=>x.length!==0);
        return words.splice(1);
    }
}

export class ObjFileParser{

    static getStaticMeshFromFileName(fileName,callBack){
        FileLoader.getFileString(fileName,function (str) {
            callBack(ObjFileParser.parseObj(str));
        })
    }

    static parseObj(objString){
        var resultStaticModel = new StaticModel();

        var lines = objString.split("\n");
        var currentMesh = null;
        var texCoords = [];
        var normals = [];

        for(var l = 0;l<lines.length;++l){
            var thisLine = lines[l];
            var tailWords = Parser.tailWords(thisLine);
            if(Parser.beginsWith(thisLine,"mtllib")){
                var materialFileName = tailWords[0];
                resultStaticModel.materialLibFileName = materialFileName;
                resultStaticModel.needMaterialLib = true;
            }
            else if(Parser.beginsWith(thisLine,"g") || Parser.beginsWith(thisLine,"o")){
                if(currentMesh!=null){
                    resultStaticModel.meshes.push(currentMesh);
                }
                var thisPieceName = tailWords[0];
                currentMesh = new StaticMesh(thisPieceName,resultStaticModel);
            }
            else if(Parser.beginsWith(thisLine,"v")){
                var newVertex = new StaticMeshVertex();
                newVertex.position= tailWords.map(x=>parseFloat(x));
                resultStaticModel.vertices.push(newVertex);
            }
            else if(Parser.beginsWith(thisLine,"vt")){
                texCoords.push(tailWords.map(x=>parseFloat(x)));
            }
            else if(Parser.beginsWith(thisLine,"vn")){
                normals.push(tailWords.map(x=>parseFloat(x)));
            }
            else if(Parser.beginsWith(thisLine,"usemtl")){
                var materialName = tailWords[0];
                currentMesh.materialName = materialName;
            }
            else if(Parser.beginsWith(thisLine,"f")){
                var newIndices = [];
                var vertexStrings = tailWords;
                for(var v = 0;v<vertexStrings.length;++v){
                    var thisVertexString = vertexStrings[v];
                    var propertiesStr = thisVertexString.split("/");
                    var properties = propertiesStr.map(x=>parseInt(x)-1);
                    var vertexID = properties[0];
                    newIndices[v]=vertexID;
                    if(properties.length>=2 && propertiesStr[1].length!==0){
                        resultStaticModel.vertices[vertexID].texCoords=texCoords[properties[1]];                    }
                    if(properties.length===3){
                        resultStaticModel.vertices[vertexID].normal=normals[properties[2]];
                    }
                }
                var newTriangle = new StaticMeshTriangle();
                newTriangle.indices=newIndices.slice(0,3);
                currentMesh.triangles.push(newTriangle);
                if(newIndices.length===4){
                    var newTriangle2 = new StaticMeshTriangle();
                    newTriangle2.indices[0]=newIndices[0];
                    newTriangle2.indices[1]=newIndices[2];
                    newTriangle2.indices[2]=newIndices[3];
                    currentMesh.triangles.push(newTriangle2);
                }
            }

        }
        if(currentMesh!=null){
            resultStaticModel.meshes.push(currentMesh);
        }

        return resultStaticModel;
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
            this.meshes[i].renderData = new StaticMeshRenderData(this.meshes[i].triangles,gl);
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
        this.staticMesh = parent;
        this.material = new Material();
        this.materialName = "";
        this.triangles = [];
        this.renderData = null;
    }

}

export class VertexBuffer{
    constructor(vertices,gl){
        this.vertexData = [];
        this.VBO = null;
        for(var i = 0;i<vertices.length;++i){
            vertices[i].position.map(x=>this.vertexData.push(x));
            //vertices[i].texCoords.map(x=>this.vertexData.push(x));
            //vertices[i].normal.map(x=>this.vertexData.push(x));
        }
    }
}

export class StaticMeshRenderData{
    constructor(triangles,gl){
        this.indexData = [];
        this.EBO = null;
        this.VAO = null;

        for(var i = 0;i<triangles.length;++i){
            triangles[i].indices.map(x=>this.indexData.push(x));
        }
    }
}

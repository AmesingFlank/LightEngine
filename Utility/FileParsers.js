import {FileLoader} from "./ResourceHandlers.js";
import {StaticMesh, StaticMeshTriangle, StaticMeshVertex, StaticModel} from "../Engine/StaticModel.js";
import {Material, MaterialLib, MaterialProperty} from "../Engine/Material.js";

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
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
    static stringArrayToVec(stringArray,n){
        return stringArray.slice(0,n).map(x=>parseFloat(x));
    }
}

export class ObjFileParser{

    static getStaticModelFromFileName(fileName, callBack){
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
                newVertex.position= Parser.stringArrayToVec(tailWords,3);
                resultStaticModel.vertices.push(newVertex);
            }
            else if(Parser.beginsWith(thisLine,"vt")){
                texCoords.push(Parser.stringArrayToVec(tailWords,2));
            }
            else if(Parser.beginsWith(thisLine,"vn")){
                normals.push(Parser.stringArrayToVec(tailWords,3));
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



export class MtlFileParser{
    static getMaterialLibFromFileName(fileName,callBack){
        FileLoader.getFileString(fileName,function (mtlString) {
            callBack(MtlFileParser.parseMtl(mtlString));
        });
    }
    static parseMtl(mtlString){
        var resultMaterialLib = new MaterialLib();
        var lines = mtlString.split("\n");
        var currentMaterial = null;
        for(var l = 0;l<lines.length;++l){
            var thisLine = lines[l];
            var tailWords = Parser.tailWords(thisLine);
            if(Parser.beginsWith(thisLine,"newmtl")){
                if(currentMaterial!=null){
                    resultMaterialLib.materials[currentMaterial.name]=currentMaterial;
                }
                var thisMaterialName = tailWords[0];
                currentMaterial = new Material(thisMaterialName);
            }
            else if(Parser.beginsWith(thisLine,"Ka")){
                if(currentMaterial.ambient==null) currentMaterial.ambient=new MaterialProperty();
                currentMaterial.ambient.value = Parser.stringArrayToVec(tailWords,3);
            }
            else if(Parser.beginsWith(thisLine,"map_Ka")){
                if(currentMaterial.ambient==null) currentMaterial.ambient=new MaterialProperty();
                currentMaterial.ambient.texture.fileName = tailWords.last();
            }
            else if(Parser.beginsWith(thisLine,"Kd")){
                if(currentMaterial.diffuse==null) currentMaterial.diffuse=new MaterialProperty();
                currentMaterial.diffuse.value = Parser.stringArrayToVec(tailWords,3);
            }
            else if(Parser.beginsWith(thisLine,"map_Kd")){
                if(currentMaterial.diffuse==null) currentMaterial.diffuse=new MaterialProperty();
                currentMaterial.diffuse.texture.fileName = tailWords.last();
            }
            else if(Parser.beginsWith(thisLine,"Ks")){
                if(currentMaterial.specular==null) currentMaterial.specular=new MaterialProperty();
                currentMaterial.specular.value = Parser.stringArrayToVec(tailWords,3);
            }
            else if(Parser.beginsWith(thisLine,"map_Ks")){
                if(currentMaterial.specular==null) currentMaterial.specular=new MaterialProperty();
                currentMaterial.specular.texture.fileName = tailWords.last();
            }
            else if(Parser.beginsWith(thisLine,"Ns")){
                if(currentMaterial.specularIntensity==null) currentMaterial.specularIntensity=new MaterialProperty();
                currentMaterial.specularIntensity.value = Parser.stringArrayToVec(tailWords,3);
            }
            else if(Parser.beginsWith(thisLine,"map_Ns")){
                if(currentMaterial.specularIntensity==null) currentMaterial.specularIntensity=new MaterialProperty();
                currentMaterial.specularIntensity.texture.fileName = tailWords.last();
            }
            else if(Parser.beginsWith(thisLine,"d")){
                if(currentMaterial.alpha==null) currentMaterial.alpha=new MaterialProperty();
                currentMaterial.alpha.value = Parser.stringArrayToVec(tailWords,3);
            }
            else if(Parser.beginsWith(thisLine,"map_d")){
                if(currentMaterial.alpha==null)  currentMaterial.alpha=new MaterialProperty();
                currentMaterial.alpha.texture.fileName = tailWords.last();
            }
            else if(Parser.beginsWith(thisLine,"bump") || Parser.beginsWith(thisLine,"map_Bump")){
                if(currentMaterial.normal==null)  currentMaterial.normal=new MaterialProperty();
                currentMaterial.normal.texture.fileName = tailWords.last();
            }


        }
        if(currentMaterial!=null){
            resultMaterialLib.materials[currentMaterial.name]=currentMaterial;
        }
        return resultMaterialLib;
    }
}

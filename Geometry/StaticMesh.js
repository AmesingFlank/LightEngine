import {vec2,vec3} from "./../Utility/gl-matrix.js"

class StaticMeshVertex{
    constructor(){
        this.position = vec3.create();
        this.texCoords = vec2.create();
        this.normal = vec3.create();
    }
}

class StaticMeshTriangle{
    constructor(){
        this.indices=[];
    }
}



class Parser{
    static beginsWith(line,firstWord){
        var words = line.trim().split(" ");
        return words[0]===firstWord;
    }
    static tailWords(line){
        var words = line.trim().split(" ");
        return words.splice(1);
    }
}

class ObjFileParser{

    static parseObj(objString){
        var resultStaticMesh = new StaticMesh();

        var lines = objString.split("\n");
        var currentPiece = null;
        var texCoords = [];
        var normals = [];

        for(var l = 0;l<lines.length;++l){
            var thisLine = lines[l];
            if(Parser.beginsWith(thisLine,"mtllib")){
                var materialFileName = Parser.tailWords(thisLine)[0];
                resultStaticMesh.materialLib = MtlFileParser.parseMtl(MtlFileParser.getMtlFileString(materialFileName));
            }
            else if(Parser.beginsWith(thisLine,"g") || Parser.beginsWith(thisLine,"o")){
                if(currentPiece!=null){
                    resultStaticMesh.pieces.push(currentPiece);
                }
                var thisPieceName = Parser.tailWords(thisLine)[0];
                currentPiece = new StaticMeshPiece(thisPieceName,resultStaticMesh);
            }
            else if(Parser.beginsWith(thisLine,"v")){
                var newVertex = new StaticMeshVertex();
                newVertex.position= Parser.tailWords(thisLine).map(parseFloat);
                resultStaticMesh.vertices.push(newVertex);
            }
            else if(Parser.beginsWith(thisLine,"vt")){
                texCoords.push(Parser.tailWords(thisLine).map(parseFloat));
            }
            else if(Parser.beginsWith(thisLine,"vn")){
                normals.push(Parser.tailWords(thisLine).map(parseFloat));
            }
            else if(Parser.beginsWith(thisLine,"usemtl")){
                var materialName = Parser.tailWords(thisLine)[0];
                currentPiece.material=resultStaticMesh.materialLib.getMaterialByName(materialName);
            }
            else if(Parser.beginsWith(thisLine,"f")){
                var newTriangle = new StaticMeshTriangle();
                var vertexStrings = Parser.tailWords(thisLine);
                for(var v = 0;v<3;++v){
                    var thisVertexString = vertexStrings[v];
                    var properties = thisVertexString.split("/").map(parseInt);
                    var vertexID = properties[0];
                    newTriangle.indices[v]=vertexID;
                    if(properties.length===2){
                        resultStaticMesh.vertices[vertexID].normal=normals[properties[1]];
                    }
                    else if(properties.length===3){
                        resultStaticMesh.vertices[vertexID].normal=normals[properties[2]];
                        resultStaticMesh.vertices[vertexID].texCoords=texCoords[properties[1]];
                    }
                    else{
                        alert("vertex has wrong number of properties, this should NEVER happen");
                    }
                }
                currentPiece.triangles.push(newTriangle);
            }

        }

        return resultStaticMesh;
    }
}

class MtlFileParser{
    static getMtlFileString(fileName){
        return "";
    }
    static parseMtl(mtlString){
        return new MaterialLib();
    }
}

class StaticMesh{
    constructor(){
        this.pieces = [];
        this.materialLib = null;
        this.vertices = [];
    }

}

class StaticMeshPiece{
    constructor(name,parent){
        this.name = name;
        this.staticMesh = parent;
        this.material = new Material();
        this.triangles = [];
    }
}

class MaterialLib{
    constructor(){
        this.materials = [];
    }
    getMaterialByName(name){
        return this.materials[0];
    }
}

class Material{
    constructor(){

    }
}
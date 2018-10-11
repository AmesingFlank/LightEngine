class StaticMesh{
    constructor(){
        this.pieces = [];
        this.materialLib = null;

    }

}

class ObjFileParser{
    static isCommentLine(line){
        var s = "";
        return s.trim()[0]==="#";
    }
    static isMaterialLibDefinition(line){
        var trimmed = line.trim();
        if(trimmed.indexOf("mtllib")===0){
            return {isMaterialLib:true, fileName: trimmed.split(" ")[1]};
        }
        else return {isMaterialLib:false};
    }

    static parseObj(objString){
        var resultStaticMesh = new StaticMesh();

        var lines = objString.split("\n");
        for(var l = 0;l<lines.length;++l){
            var thisLine = lines[l];
            if(ObjFileParser.isCommentLine(thisLine))
                continue;
            if(ObjFileParser.isMaterialLibDefinition(thisLine).isMaterialLib){
                var materialFileName = ObjFileParser.isMaterialLibDefinition(thisLine).fileName;
                resultStaticMesh.materialLib = MtlFileParser.parseMtl(MtlFileParser.getMtlFileString(materialFileName));
                continue;
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

class StaticMeshPiece{
    constructor(){
        this.material = new Material();
    }
}

class MaterialLib{
    constructor(){
        this.materials = [];
    }
}

class Material{
    constructor(){

    }
}
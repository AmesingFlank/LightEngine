import {FileLoader} from "../Utility/ResourceHandlers.js";
import {Parser} from "./StaticModel.js";
import {Texture2D} from "./Texture.js";
import {vec3} from "../Utility/gl-matrix.js";

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
            else if(Parser.beginsWith(thisLine,"newmtl")){

            }
        }
        if(currentMaterial!=null){
            resultMaterialLib.materials[currentMaterial.name]=currentMaterial;
        }
        return resultMaterialLib;
    }
}


export class MaterialLib{
    constructor(){
        this.materials = {};
    }
    getMaterialByName(name){
        return this.materials[0];
    }
}

export class Material{
    constructor(name){
        this.name = name;
        this.ambient = null;
        this.diffuse = null;
        this.specular = null;
        this.specularIntensity = null;
        this.noraml = null;
        this.alpha = null;
        this.usePBR = false;
    }
}

export class MaterialProperty{
    constructor(){
        this.value = vec3.create();
        this.texture = null;
    }
}


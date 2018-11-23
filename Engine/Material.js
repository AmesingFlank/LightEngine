import {FileLoader} from "../Utility/ResourceHandlers.js";
import {Texture2D} from "./Texture.js";
import {vec3,vec4} from "../Utility/gl-matrix.js";



export class MaterialLib{
    constructor(){
        this.materials = {};
    }
    getMaterialByName(name){
        return this.materials[name];
    }
}

export class Material{
    constructor(name){
        this.name = name;
        this.ambient = null;
        this.diffuse = null;
        this.specular = null;
        this.specularIntensity = null;
        this.normal = null;
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


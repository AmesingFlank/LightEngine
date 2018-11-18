import {vec3} from "../Utility/gl-matrix.js";

export class PointLight{
    constructor(){
        this.position = vec3.create();
        this.color = vec3.fromValues(1,1,1);
    }
}
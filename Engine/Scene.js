import {mat4,vec3} from '../Utility/gl-matrix.js'
import {vec4} from "../Utility/gl-matrix.js";


export class Scene{
    constructor(){
        this.objectList = [];
        this.objectTransformMap = {};
        this.pointLights = [];
        this.ambientLight = vec3.fromValues(0,0,0);
    }
    addObject(object,transform){
        if(!this.objectList.includes(object)) {
            this.objectList.push(object);
            this.objectTransformMap[object.UID] = mat4.clone(transform);
        }
    }
    setObjectTransform(object,transform){
        if(this.objectList.includes(object)) {
            this.objectTransformMap[object.UID] = mat4.clone(transform);
        }
    }
    getObjectTransform(object){
        if(this.objectList.includes(object)) {
            return mat4.clone(this.objectTransformMap[object.UID]);
        }
        return null;
    }
    getReadyObjects(){
        var readyObjects = [];
        this.objectList.forEach(obj => {
            if(obj){
                readyObjects.push(obj);
            }
        });
        return readyObjects;
    }
}
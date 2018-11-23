import {mat4,vec3} from '../Utility/gl-matrix.js'


export class Scene{
    constructor(){
        this.objectList = [];
        this.objectTransformMap = {};
        this.pointLights = [];
        this.ambientLight = vec3.fromValues(0,0,0);
    }
    addObject(object,transform){
        if(!this.objectList.includes(object))
            this.objectList.push(object);
        this.objectTransformMap[object]=transform;
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
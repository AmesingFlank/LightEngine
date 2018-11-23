import {vec2,vec3,mat4} from "./../Utility/gl-matrix.js"

export class Camera{
    constructor(x,y,z){
        this.position = vec3.fromValues(x,y,z);
        this.front = vec3.fromValues(0,0,-1);
        this.up = vec3.create();
        this.right = vec3.create();
        this.worldUp = vec3.fromValues(0,1,0);

        this.yaw = -Math.PI;
        this.pitch = 0;
        this.updateVectorsFromEuler();
    }
    updateVectorsFromEuler(){
        var front = vec3.create();
        front[0]=Math.sin(this.yaw)*Math.cos(this.pitch);
        front[1]=Math.sin(this.pitch);
        front[2]=Math.cos(this.yaw)*Math.cos(this.pitch);
        vec3.normalize(this.front,front);
        vec3.cross(this.right,this.front,this.worldUp);
        vec3.cross(this.up,this.right,this.front);
    }
    updateVectorsFromFront(){
        vec3.normalize(this.front,this.front);
        vec3.cross(this.right,this.front,this.worldUp);
        vec3.cross(this.up,this.right,this.front);
    }
    getViewMatrix()
    {
        var viewMatrix=mat4.create();
        var center = vec3.create();
        return mat4.lookAt(viewMatrix,this.position,vec3.add(center,this.position,this.front),this.up);
    }

}
import {mat4,vec3} from '../Utility/gl-matrix.js'
import {FileLoader} from "../Utility/ResourceHandlers.js";
import {StaticModel} from "../Engine/StaticModel.js";
import {Camera} from "../Engine/Camera.js";
import {ObjFileParser} from "../Utility/FileParsers.js";
import {ShaderProgram,VertexShader,FragmentShader} from "../Engine/ShaderProgram.js";
import {PhongShader} from "../Shaders/PhongShader.js";
import {PointLight} from "../Engine/PointLight.js";
import {Scene} from "../Engine/Scene.js";
import {vec4} from "../Utility/gl-matrix.js";


"use strict";


var canvas = document.getElementById("c");

canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;

var projectionMat = mat4.create();
mat4.perspective(projectionMat,45,canvas.width/canvas.height,0.1,1000);

var gl = canvas.getContext("webgl");
var ext = gl.getExtension('OES_element_index_uint');
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.DEPTH_TEST);

var shaderProgram = new PhongShader(gl);

var mainScene = new Scene();

var pointLight = new PointLight();
pointLight.position=vec3.fromValues(0,100,0);
mainScene.pointLights.push(pointLight);

var camera = new Camera(0, 100,5);
camera.pitch = -0.6;
camera.updateVectorsFromEuler();

var poolTable = null;
var cueBall = null;
var blackBall = null;
var redBalls = [];
var yellowBalls = [];
var stick = null;

var tableHeight = 34.6;
var ballWidth = 2;

var initalBallPositions = [];
for (var i = 0;i<5;++i){
    var start = vec3.fromValues(0-ballWidth*i*0.5,tableHeight,-15-ballWidth*i);
    for(var j = 0;j<=i;++j){
        var thisPos = vec3.create();
        vec3.copy(thisPos,start);
        thisPos[0] += j*ballWidth;
        initalBallPositions.push(thisPos);
    }
}

ObjFileParser.getStaticModelFromFileName("PoolTable/PoolTable.obj",gl,function (staticModel) {
    poolTable = staticModel;
    var poolTableModelMat = mat4.create();
    mainScene.addObject(staticModel,mat4.create());
});

ObjFileParser.getStaticModelFromFileName("Balls/WhiteBall.obj",gl,function (staticModel) {
    cueBall = staticModel;
    var transform = mat4.create();
    mat4.translate(transform,transform,vec3.fromValues(0,tableHeight,20));
    mainScene.addObject(staticModel,transform);
});
ObjFileParser.getStaticModelFromFileName("Balls/BlackBall.obj",gl,function (staticModel) {
    blackBall = staticModel;
    var transform = mat4.create();
    mat4.translate(transform,transform,initalBallPositions[4]);
    mainScene.addObject(staticModel,transform);
});
ObjFileParser.getStaticModelFromFileName("Balls/YellowBall.obj",gl,function (staticModel) {
    var positionIDs = [0,3,5,6,8,11,13];
    positionIDs.forEach(positionID=>{
        var transform = mat4.create();
        mat4.translate(transform,transform,initalBallPositions[positionID]);
        mainScene.addObject(staticModel.clone(),transform);
    });
});
ObjFileParser.getStaticModelFromFileName("Balls/RedBall.obj",gl,function (staticModel) {
    var positionIDs = [1,2,7,9,10,12,14];
    positionIDs.forEach(positionID=>{
        var transform = mat4.create();
        mat4.translate(transform,transform,initalBallPositions[positionID]);
        mainScene.addObject(staticModel.clone(),transform);
    });
});
ObjFileParser.getStaticModelFromFileName("Stick/Stick.obj",gl,function (staticModel) {
    stick = staticModel;
    var transform = mat4.create();
    mat4.translate(transform,transform,vec3.fromValues(0,tableHeight,20));
    mainScene.addObject(staticModel,transform);
});






var pitchVelocity = 0;
var yawVelocity = 0;
var initialStickCueDistance = 10;
var stickCueDistance = initialStickCueDistance;
var stickSpeed = 0;

function animate() {
    gl.clearColor(0.1,0.1,0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    camera.pitch+=pitchVelocity;
    camera.yaw += yawVelocity;
    camera.pitch = Math.min(camera.pitch,0);
    camera.pitch = Math.max(camera.pitch,-Math.PI/2);
    camera.updateVectorsFromEuler();


    stickCueDistance-=stickSpeed;
    if(stickCueDistance<0){
        stickCueDistance=initialStickCueDistance;
        stickSpeed=0;
    }
    var stickTransform = mat4.create();
    mat4.translate(stickTransform,stickTransform,vec3.fromValues(0,0,-stickCueDistance));
    var xRot = mat4.create();
    mat4.rotateX(xRot,xRot,-camera.pitch/2);
    var yRot = mat4.create();
    mat4.rotateY(yRot,yRot,camera.yaw);
    mat4.mul(stickTransform,xRot,stickTransform);
    mat4.mul(stickTransform,yRot,stickTransform);
    mat4.mul(stickTransform,mainScene.getObjectTransform(cueBall),stickTransform);
    mainScene.setObjectTransform(stick,stickTransform);

    var cueBallPosition = vec3.create();
    mat4.getTranslation(cueBallPosition,mainScene.getObjectTransform(cueBall));
    var offsetVec = vec3.create();
    vec3.scale(offsetVec,camera.front,30);
    camera.position = vec3.sub(camera.position,cueBallPosition,offsetVec);

    var viewMat = mat4.create();
    viewMat=camera.getViewMatrix();

    shaderProgram.drawScene(gl,mainScene,viewMat,projectionMat,camera.position);

    requestAnimationFrame( animate );

}
animate();


document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

var maxAngleVelocity = 0.005;
function keyDownHandler(event) {
    switch (event.key) {
        case "w":
            pitchVelocity = -maxAngleVelocity;
            break;
        case "s":
            pitchVelocity = maxAngleVelocity;
            break;
        case "a":
            yawVelocity = -maxAngleVelocity;
            break;
        case "d":
            yawVelocity = maxAngleVelocity;
            break;
        case " ":
            stickSpeed = 1;
    }
}


function keyUpHandler(event) {
    switch (event.key) {
        case "w":
        case "s":
            pitchVelocity = 0;
            break;
        case "a":
        case "d":
            yawVelocity = 0;
            break;
    }
}
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
var stick = null;

var tableHeight = 34.6;
var ballWidth = 2;

class BallState{
    constructor(ball,position,velocity){
        this.ball = ball;
        this.position = position;
        this.velocity = velocity;
    }
}

var ballStates = [];

class TableEdge{
    constructor(edgeEnd0,edgeEnd1){
        this.edgeEnd0 = edgeEnd0;
        this.edgeEnd1 = edgeEnd1;
    }
}


var tableEdges = [];
tableEdges.push(new TableEdge(vec3.fromValues(-20,tableHeight,-40),vec3.fromValues(20,tableHeight,-40)));
tableEdges.push(new TableEdge(vec3.fromValues(-20,tableHeight,-40),vec3.fromValues(-20,tableHeight,40)));
tableEdges.push(new TableEdge(vec3.fromValues(20,tableHeight,40),vec3.fromValues(20,tableHeight,-40)));
tableEdges.push(new TableEdge(vec3.fromValues(20,tableHeight,40),vec3.fromValues(-20,tableHeight,40)));

var cornerPockets = [];
cornerPockets.push(vec3.fromValues(-20,tableHeight,-40));
cornerPockets.push(vec3.fromValues(-20,tableHeight,40));
cornerPockets.push(vec3.fromValues(20,tableHeight,-40));
cornerPockets.push(vec3.fromValues(20,tableHeight,40));

var sidePockets = [];
sidePockets.push(vec3.fromValues(20,tableHeight,0));
sidePockets.push(vec3.fromValues(-20,tableHeight,0));

function reflect(N,L){
    var result = vec3.create();
    vec3.scale(result,N,2*vec3.dot(N,L));
    vec3.sub(result,result,L);
    return result;
}

function collideEdge(ballPosition,edgeEnd0,edgeEnd1,currentVelocity,outNewVelocity) {
    var originalSpeed = vec3.length(currentVelocity);

    var diff = vec3.create();
    vec3.sub(diff,edgeEnd1,edgeEnd0);
    var RHS = vec3.dot(ballPosition,diff)-vec3.dot(edgeEnd0,diff);
    var t = RHS/vec3.dot(diff,diff);
    var perpendicular = vec3.create();
    vec3.scale(perpendicular,diff,t);
    vec3.add(perpendicular,edgeEnd0,perpendicular);

    var perpendicularDiff = vec3.create();
    vec3.sub(perpendicularDiff,ballPosition,perpendicular);
    var perpendicularDistance = vec3.length(perpendicularDiff);
    if(perpendicularDistance<=ballWidth/2){
        var N = vec3.create();
        vec3.normalize(N,perpendicularDiff);
        var L = vec3.create();
        vec3.normalize(L,vec3.negate(L,currentVelocity));
        vec3.copy(outNewVelocity,reflect(N,L));
        vec3.normalize(outNewVelocity,outNewVelocity);
        vec3.scale(outNewVelocity,outNewVelocity,originalSpeed);
        return true;
    }
    vec3.copy(outNewVelocity,currentVelocity);
    vec3.normalize(outNewVelocity,outNewVelocity);
    vec3.scale(outNewVelocity,outNewVelocity,originalSpeed);
    return false;
}

function collideBalls(ballState,otherBallState) {
    if(ballState===otherBallState) return;
    var originalSpeedA = vec3.length(ballState.velocity);
    var originalSpeedB = vec3.length(otherBallState.velocity);
    if(originalSpeedA === 0 && originalSpeedB===0 ) return;
    var diff = vec3.create();
    vec3.sub(diff,ballState.position,otherBallState.position);
    var distance = vec3.length(diff);
    if(distance>ballWidth) return;

    var overlap = ballWidth-distance;
    var move = vec3.create();
    vec3.scale(move,diff,overlap/2);
    vec3.add(ballState.position,ballState.position,move);
    vec3.scale(move,diff,-overlap/2);
    vec3.add(otherBallState.position,otherBallState.position,move);

    var Xa0 = ballState.velocity[0];
    var Ya0 = ballState.velocity[2];
    var Xb0 = otherBallState.velocity[0];
    var Yb0 = otherBallState.velocity[2];

    var C0 = Xa0+Xb0;
    var C1 = Ya0+Yb0;
    var C2 = diff[2]/diff[0];
    var C3 = Xa0*Xa0 + Xb0*Xb0 + Ya0*Ya0 + Yb0*Yb0;

    var C4 = Ya0-C2*Xa0;
    var C5 = C4+C2*C0-C1;

    var a = 2+2*C2*C2;
    var b = -2* (C0+C2*(C1+C5)+C2*C5);
    var c = C0*C0+ (C1+C5)*(C1+C5)+C5*C5 - C3;

    var delta = b*b-4*a*c;
    var Xb1 = (-b+Math.sqrt(delta))/(2*a);
    var Xa1 = C0-Xb1;
    var Yb1 = C2*Xb1 - C5;
    var Ya1 = C1-Yb1;

    ballState.velocity[0] = Xa1;
    ballState.velocity[2] = Ya1;
    otherBallState.velocity[0]=Xb1;
    otherBallState.velocity[2]=Yb1;

}

var initialCueBallPosition = vec3.fromValues(0,tableHeight,20);
var initialBallPositions = [];
for (var i = 0;i<5;++i){
    var start = vec3.fromValues(0-ballWidth*i*0.5,tableHeight,-15-ballWidth*i);
    for(var j = 0;j<=i;++j){
        var thisPos = vec3.create();
        vec3.copy(thisPos,start);
        thisPos[0] += j*ballWidth;
        initialBallPositions.push(thisPos);
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
    mat4.translate(transform,transform,initialCueBallPosition);
    mainScene.addObject(staticModel,transform);
    ballStates.push(new BallState(staticModel,initialCueBallPosition,vec3.create()))
});
ObjFileParser.getStaticModelFromFileName("Balls/BlackBall.obj",gl,function (staticModel) {
    var transform = mat4.create();
    var thisBallPosition = initialBallPositions[4];
    mat4.translate(transform,transform,thisBallPosition);
    mainScene.addObject(staticModel,transform);
    ballStates.push(new BallState(staticModel,thisBallPosition,vec3.create()))
});
ObjFileParser.getStaticModelFromFileName("Balls/YellowBall.obj",gl,function (staticModel) {
    var positionIDs = [0,3,5,6,8,11,13];
    positionIDs.forEach(positionID=>{
        var transform = mat4.create();
        var thisBallPosition = initialBallPositions[positionID];
        mat4.translate(transform,transform,thisBallPosition);
        var thisCopy = staticModel.clone();
        mainScene.addObject(thisCopy,transform);
        ballStates.push(new BallState(thisCopy,thisBallPosition,vec3.create()))

    });
});
ObjFileParser.getStaticModelFromFileName("Balls/RedBall.obj",gl,function (staticModel) {
    var positionIDs = [1,2,7,9,10,12,14];
    positionIDs.forEach(positionID=>{
        var transform = mat4.create();
        var thisBallPosition = initialBallPositions[positionID];
        mat4.translate(transform,transform,thisBallPosition);
        var thisCopy = staticModel.clone();
        mainScene.addObject(thisCopy,transform);
        ballStates.push(new BallState(thisCopy,thisBallPosition,vec3.create()))
    });
});
ObjFileParser.getStaticModelFromFileName("Stick/Stick.obj",gl,function (staticModel) {
    stick = staticModel;
    var transform = mat4.create();
    mat4.translate(transform,transform,vec3.fromValues(0,tableHeight,20));
    mainScene.addObject(staticModel,transform);
});




function handlePhysics(){
    for (var i = 0;i<ballStates.length;++i){
        var thisBall = ballStates[i];
        if(!thisBall.ball.isVisible) continue;
        tableEdges.forEach(edge=>{
            collideEdge(thisBall.position,edge.edgeEnd0,edge.edgeEnd1,thisBall.velocity,thisBall.velocity);
        });
        ballStates.forEach(otherBall=>{
            collideBalls(thisBall,otherBall);
        });
        cornerPockets.forEach(pocket=>{
            var diff = vec3.create();
            vec3.sub(diff,thisBall.position,pocket);
            var distance = vec3.length(diff);
            if(distance<1.5*ballWidth*Math.sqrt(2)/2){
                thisBall.velocity[1]=-1;
                console.log("falling");
            }
        });
        sidePockets.forEach(pocket=>{
            var diff = vec3.create();
            vec3.sub(diff,thisBall.position,pocket);
            var distance = vec3.length(diff);
            if(distance<1.5*ballWidth/2){
                thisBall.velocity[1]=-1;
            }
        });
    }

    for (var i = 0;i<ballStates.length;++i){
        var thisBall = ballStates[i];

        vec3.add(thisBall.position,thisBall.position,thisBall.velocity);
        var newTransformMat = mat4.create();
        mat4.translate(newTransformMat,newTransformMat,thisBall.position);
        mainScene.setObjectTransform(thisBall.ball,newTransformMat);
    }

    for (var i = 0;i<ballStates.length;++i){
        var thisBall = ballStates[i];
        var originalSpeed = vec3.length(thisBall.velocity);
        vec3.normalize(thisBall.velocity,thisBall.velocity);
        vec3.scale(thisBall.velocity,thisBall.velocity,originalSpeed*0.997);
    }


}




var pitchVelocity = 0;
var yawVelocity = 0;
var initialStickCueDistance = 10;
var stickCueDistance = initialStickCueDistance;
var stickSpeed = 0;

function animate() {
    gl.clearColor(0.1,0.1,0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    handlePhysics();

    camera.pitch+=pitchVelocity;
    camera.yaw += yawVelocity;
    camera.pitch = Math.min(camera.pitch,0);
    camera.pitch = Math.max(camera.pitch,-Math.PI/2);
    camera.updateVectorsFromEuler();


    stickCueDistance-=stickSpeed;
    if(stickCueDistance<0){
        stickCueDistance=initialStickCueDistance;
        stickSpeed=0;
        var cueBallNewVelocity = vec3.create();
        cueBallNewVelocity[0]=camera.front[0];
        cueBallNewVelocity[2]=camera.front[2];
        vec3.normalize(cueBallNewVelocity,cueBallNewVelocity);
        vec3.scale(cueBallNewVelocity,cueBallNewVelocity,0.3);
        ballStates[0].velocity = cueBallNewVelocity;
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
import {mat4,vec3} from '../Utility/gl-matrix.js'
import {FileLoader} from "../Utility/ResourceHandlers.js";
import {StaticModel} from "../Engine/StaticModel.js";
import {Camera} from "../Engine/Camera.js";
import {ObjFileParser} from "../Utility/FileParsers.js";
import {ShaderProgram,VertexShader,FragmentShader} from "../Engine/ShaderProgram.js";
import {BlinnPhongShader} from "../Shaders/BlinnPhongShader.js";


"use strict";


var canvas = document.getElementById("c");

canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;

var gl = canvas.getContext("webgl");

var ext = gl.getExtension('OES_element_index_uint');

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.DEPTH_TEST);

var shaderProgram = new BlinnPhongShader(gl);
var testStaticModel = null;

ObjFileParser.getStaticModelFromFileName("WhiteBloodCell/whitebloodcell.obj",gl,function (staticModel) {
    testStaticModel = staticModel;
});

var camera = new Camera(0, 0, 5);

var modelMat = mat4.create();
var viewMat = mat4.create();
var projectionMat = mat4.create();

mat4.rotate(modelMat,modelMat,Math.PI,vec3.fromValues(0,1,0));
viewMat=camera.getViewMatrix();
mat4.perspective(projectionMat,45,1,0.001,1000);


function animate() {
    gl.clearColor(0, 0, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if(testStaticModel){
        shaderProgram.drawObject(gl,testStaticModel,modelMat,viewMat,projectionMat);
    }
    requestAnimationFrame( animate );
}
animate();

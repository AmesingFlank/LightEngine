import {mat4} from '../Utility/gl-matrix.js'
import {FileLoader} from "../Utility/ResourceHandlers.js";
import {StaticModel} from "../Engine/StaticModel.js";
import {Camera} from "../Engine/Camera.js";
import {ObjFileParser} from "../Utility/FileParsers.js";
import {ShaderProgram,VertexShader,FragmentShader} from "../Engine/ShaderProgram.js";
import {BasicShader} from "../Shaders/BasicShader.js";

"use strict";



function main(){
    var canvas = document.getElementById("c");

    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;

    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    var ext = gl.getExtension('OES_element_index_uint');

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);


    var vertexShader = new VertexShader(gl,BasicShader.vertexShaderSource);
    var fragmentShader = new FragmentShader(gl,BasicShader.fragmentShaderSource);
    var shaderProgram = new ShaderProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(shaderProgram.program);

    var modelLocation = gl.getUniformLocation(shaderProgram.program,"model");
    var viewLocation = gl.getUniformLocation(shaderProgram.program,"view");
    var projectionLocation = gl.getUniformLocation(shaderProgram.program,"projection");

    var camera = new Camera(0,0,5);

    var modelMat = mat4.create();
    var viewMat = mat4.create();
    var projectionMat = mat4.create();

    viewMat=camera.getViewMatrix();
    mat4.perspective(projectionMat,45,1,0.001,1000);

    gl.uniformMatrix4fv(modelLocation,false,modelMat);
    gl.uniformMatrix4fv(viewLocation,false,viewMat);
    gl.uniformMatrix4fv(projectionLocation,false,projectionMat);



    ObjFileParser.getStaticModelFromFileName("whitebloodcell.obj",function (staticModel) {
        staticModel.prepareRenderData(gl);
        staticModel.drawWithShaderProgram(gl,shaderProgram);
    });

}

main();

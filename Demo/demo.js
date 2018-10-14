import {mat4} from '../Utility/gl-matrix.js'
import {FileLoader} from "../Utility/ResourceHandlers.js";
import {StaticModel} from "../Engine/StaticModel.js";
import {Camera} from "../Engine/Camera.js";
import {ObjFileParser} from "../Utility/FileParsers.js";
import {ShaderProgram,VertexShader,FragmentShader} from "../Engine/ShaderProgram.js";
import {BasicShader} from "../Shaders/BasicShader.js";

"use strict";



function render(vbo,ebo,length,gl) {

    var vertexShader = new VertexShader(gl,BasicShader.vertexShaderSource);
    var fragmentShader = new FragmentShader(gl,BasicShader.fragmentShaderSource);
    var program = new ShaderProgram(gl, vertexShader, fragmentShader);


    var positionAttributeLocation = gl.getAttribLocation(program.program, "a_position");
    var modelLocation = gl.getUniformLocation(program.program,"model");
    var viewLocation = gl.getUniformLocation(program.program,"view");
    var projectionLocation = gl.getUniformLocation(program.program,"projection");



    var vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ebo);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 3;
    var stride = size*4;
    gl.vertexAttribPointer(
        positionAttributeLocation, size, gl.FLOAT, false, stride,0);

    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);



    gl.useProgram(program.program);

    gl.bindVertexArray(vao);


    var camera = new Camera(0,0,5);

    var modelMat = mat4.create();
    var viewMat = mat4.create();
    var projectionMat = mat4.create();

    viewMat=camera.getViewMatrix();
    mat4.perspective(projectionMat,45,1,0.001,1000);

    gl.uniformMatrix4fv(modelLocation,false,modelMat);
    gl.uniformMatrix4fv(viewLocation,false,viewMat);
    gl.uniformMatrix4fv(projectionLocation,false,projectionMat);

    //gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawElements(gl.TRIANGLES,length,gl.UNSIGNED_INT,0);

}

function main(){
    var canvas = document.getElementById("c");

    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;

    var gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);

    gl.clearColor(0, 0, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    ObjFileParser.getStaticModelFromFileName("whitebloodcell.obj",function (staticModel) {
        staticModel.prepareRenderData(gl);
        for(var i = 0;i<staticModel.meshes.length;++i){
            var thisMesh = staticModel.meshes[i];
            render(staticModel.vertexBuffer.VBO,thisMesh.renderData.EBO,thisMesh.renderData.indexData.length,gl);
        }
    });

}

main();

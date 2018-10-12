import {mat4} from './Utility/gl-matrix.js'
import {FileLoader} from "./Utility/ResourceHandlers.js";
import {StaticModel,ObjFileParser} from "./Geometry/StaticMesh.js";
import {Camera} from "./Geometry/Camera.js";

"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = projection * view * model*a_position;
}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`;

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
    gl.deleteShader(shader);
    return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
    gl.deleteProgram(program);
    return undefined;
}

function render(positions,indices,gl) {

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);


    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var modelLocation = gl.getUniformLocation(program,"model");
    var viewLocation = gl.getUniformLocation(program,"view");
    var projectionLocation = gl.getUniformLocation(program,"projection");


    /*
    var z= -0.8;
    positions = [
        0, 0,z,
        0, 0.5,z,
        0.5, 0,z,
        0.5,0.5,z
    ];

    indices = [
        0,2,1,
        1,2,3,
    ];
    */


    var vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(indices),gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 3;
    var stride = size*4;
    gl.vertexAttribPointer(
        positionAttributeLocation, size, gl.FLOAT, false, stride,0);

    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);



    gl.useProgram(program);

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
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_INT,0);

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

    ObjFileParser.getStaticMeshFromFileName("whitebloodcell.obj",function (staticMesh) {
        staticMesh.prepareRenderData(gl);
        for(var i = 0;i<staticMesh.meshes.length;++i){
            render(staticMesh.vertexBuffer.vertexData,staticMesh.meshes[i].renderData.indexData,gl);
        }
    });

}

main();

export class BasicShader{
    static get vertexShaderSource(){
        var source =
`
attribute vec4 a_position;
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
        return source;
    }

    static get fragmentShaderSource(){
        var source =
`
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;


void main() {
  // Just set the output to a constant redish-purple
  gl_FragColor = vec4(1, 0, 0.5, 1);
}
`;
        return source;
    }
}
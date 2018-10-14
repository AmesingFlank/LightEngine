export class BasicShader{
    static get vertexShaderSource(){
        var source =
`#version 300 es
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
        return source;
    }

    static get fragmentShaderSource(){
        var source =
`#version 300 es
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
        return source;
    }
}
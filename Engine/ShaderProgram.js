export class ShaderProgram{
    constructor(gl,vertexShader,fragmentShader){
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader.shader);
        gl.attachShader(this.program, fragmentShader.shader);
        gl.linkProgram(this.program);
        this.valid = gl.getProgramParameter(this.program, gl.LINK_STATUS);
        if (!this.valid) {
            console.log(gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
        }
    }
}

export class VertexShader{
    constructor(gl,source){
        this.shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
        this.valid = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);

        if (!this.valid) {
            console.log(gl.getShaderInfoLog(this.shader));  // eslint-disable-line
            gl.deleteShader(this.shader);
        }
    }
}

export class FragmentShader{
    constructor(gl,source){
        this.shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
        this.valid = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);

        if (!this.valid) {
            console.log(gl.getShaderInfoLog(this.shader));  // eslint-disable-line
            gl.deleteShader(this.shader);
        }
    }
}
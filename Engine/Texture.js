export class Texture2D{
    constructor(fileName,path){
        this.path=path;
        this.fileName =fileName;
        this.image = new Image();
        this.glHandle = null;
    }

    load(gl){
        var self = this;
        self.image.onload=function () {
            self.glHandle = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D,self.glHandle );
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self.image);
            gl.texParameteri(
                gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST
            );
            gl.texParameteri(
                gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST
            );
            gl.texParameteri(
                gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT
            );
            gl.texParameteri(
                gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT
            );
        };
        self.image.src = this.path+this.fileName;
    }

}
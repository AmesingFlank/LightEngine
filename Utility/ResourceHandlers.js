export class FileLoader{
    static getFileString(fileName,callBack){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState === 4) {
                callBack(this.responseText);
            }
        };
        xhr.open('get', fileName, false);
        xhr.send();
    }

    static getImageFile(fileName,callBack){
        var image = new Image();
        image.onload = function() {
            callBack(image);
        };
        image.src = fileName;
    }
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "processFetchedImage") {
        processImageDataUrl(request.imageDataUrl, request.compress);
    }
});

function processImageDataUrl(dataUrl, compress) {
    let img = new Image();
    img.onload = function() {
        console.log("Image loaded");
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (compress) {
            compressAndSendImage(canvas);
        } else {
            canvas.toBlob(blob => sendImageBlobToBackground(blob), 'image/png');
        }
    };
    img.onerror = function(e) {
        console.error("Error in loading image: ", e);
    };
    img.src = dataUrl;
}

function compressAndSendImage(canvas) {
    let imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let compressedData = UPNG.encode([imageData.data.buffer], canvas.width, canvas.height, 256);
    let blob = new Blob([compressedData], { type: 'image/png' });
    sendImageBlobToBackground(blob);
}

function sendImageBlobToBackground(blob) {
    let reader = new FileReader();
    reader.onload = function() {
        chrome.runtime.sendMessage({
            action: "downloadImage",
            imageDataUrl: reader.result
        });
    };
    reader.readAsDataURL(blob);
}

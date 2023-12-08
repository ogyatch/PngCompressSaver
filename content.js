chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Content script received message:", request);

    if (request.action === "processImage") {
        let img = new Image();
        img.crossOrigin = 'Anonymous'; // Needed if you're fetching images from a different domain
        img.onload = function() {
            console.log("Image loaded");
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Check if compression is needed
            if (request.compress) {
                // Apply compression logic here
                // For example, using UPNG.js to compress the image
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let compressedData = UPNG.encode([imageData.data.buffer], canvas.width, canvas.height, 256);
                // Convert compressed data to Blob
                let blob = new Blob([compressedData], { type: 'image/png' });
                // Send Blob back to background script
                sendImageBlobToBackground(blob);
            } else {
                // If no compression, convert canvas to Blob
                canvas.toBlob(function(blob) {
                    sendImageBlobToBackground(blob);
                }, 'image/png');
            }
        };

        img.onerror = function(e) {
            console.error("Error in loading image: ", e);
        };

        img.src = request.imageUrl;
        console.log("Image src set to:", request.imageUrl);
    }
});

function sendImageBlobToBackground(blob) {
    console.log("Sending blob to background script");
    
    // Convert blob to a data URL and send it to the background script
    let reader = new FileReader();
    reader.onload = function() {
        chrome.runtime.sendMessage({
            action: "downloadImage",
            imageDataUrl: reader.result
        });
    };
    reader.readAsDataURL(blob);
}

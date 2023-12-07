chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "processImage") {
        chrome.runtime.sendMessage({
            action: "downloadImage",
            imageUrl: request.imageUrl,
            compress: request.compress
        });
    }
});

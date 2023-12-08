chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "save-png",
        title: "Save as PNG",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "save-png-compressed",
        title: "Save as PNG (Compressed)",
        contexts: ["image"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-png" || info.menuItemId === "save-png-compressed") {
        fetch(info.srcUrl)
            .then(response => response.blob())
            .then(blob => {
                let reader = new FileReader();
                reader.onload = () => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "processFetchedImage",
                        imageDataUrl: reader.result,
                        compress: info.menuItemId === "save-png-compressed"
                    });
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Error fetching image:', error);
                // Optionally, send an error message back to the content script
            });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "downloadImage" && message.imageDataUrl) {
        chrome.downloads.download({
            url: message.imageDataUrl,
            filename: "downloaded_image.png",
            saveAs: true
        }, downloadId => {
            if (!downloadId) {
                console.error("Download failed:", chrome.runtime.lastError.message);
            }
        });
    }
});

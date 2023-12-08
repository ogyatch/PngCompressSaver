chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "save-png",
        title: "Save PNG",
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "save-png-compressed",
        title: "Save PNG Compressed",
        contexts: ["image"]
    });

    console.log("Context menus created");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-png" || info.menuItemId === "save-png-compressed") {
        if (tab && tab.id) {
            fetch(info.srcUrl)
                .then(response => response.blob())
                .then(blob => {
                    // Send the blob to the content script
                    chrome.tabs.sendMessage(tab.id, {
                        action: "processFetchedImage",
                        imageBlob: blob,
                        compress: info.menuItemId === "save-png-compressed"
                    });
                })
                .catch(error => console.error('Error fetching image:', error));
        }
    }

    fetch(info.srcUrl)
        .then(response => response.blob())
        .then(blob => {
            let reader = new FileReader();
            reader.onload = () => {
                chrome.tabs.sendMessage(tab.id, {
                    action: "processFetchedImage",
                    imageDataUrl: reader.result, // Send as Data URL
                    compress: info.menuItemId === "save-png-compressed"
                });
            };
            reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error fetching image:', error));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script received message:", message);

    if (message.action === "downloadImage" && message.imageDataUrl) {
        // Directly use the data URL for the download
        chrome.downloads.download({
            url: message.imageDataUrl,
            filename: "downloaded_image.png", // You can give any name you like
            saveAs: true // This will prompt the save dialog
        }, (downloadId) => {
            console.log("Download initiated, ID:", downloadId);
        });
    }
});

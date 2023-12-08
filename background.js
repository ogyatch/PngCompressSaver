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
    console.log("Context menu clicked:", info, tab);

    if (info.menuItemId === "save-png" || info.menuItemId === "save-png-compressed") {
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, {
                action: "processImage",
                imageUrl: info.srcUrl,
                compress: info.menuItemId === "save-png-compressed"
            });
            console.log("Message sent to content script");
        }
    }
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

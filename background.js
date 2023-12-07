chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "save-png",
        title: chrome.i18n.getMessage("save_png"),
        contexts: ["image"]
    });

    chrome.contextMenus.create({
        id: "save-png-compressed",
        title: chrome.i18n.getMessage("save_png_compressed"),
        contexts: ["image"]
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    processImage(info.srcUrl, info.menuItemId === "save-png-compressed");
});

function processImage(imageUrl, compress) {
    fetch(imageUrl, { mode: 'cors' }).then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.blob();
    }).then(blob => {
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                if (compress) {
                    // 圧縮処理
                    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    var compressedData = UPNG.encode([imageData.data.buffer], canvas.width, canvas.height, 256);
                    console.log("圧縮データサイズ: ", compressedData.length); // 圧縮データサイズの出力
                    var blob = new Blob([compressedData], { type: 'image/png' });
                    console.log("圧縮後のBlobサイズ: ", blob.size); // 圧縮後のBlobサイズの出力
                    saveImage(blob);
                } else {
                    // 非圧縮処理
                    canvas.toBlob(function (blob) {
                        saveImage(blob);
                    }, 'image/png');
                }
            };
            img.onerror = function (e) {
                console.error("Image loading error: ", e);
            };
            img.src = reader.result;
        };
        reader.onerror = function (e) {
            console.error("FileReader error: ", e);
        };
        reader.readAsDataURL(blob);
    }).catch(error => {
        console.error("Fetch error: ", error);
    });
}

function saveImage(blob) {
    var url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        saveAs: true
    });
}

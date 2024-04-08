const checkIfHelperJSInjected = "typeof copy2Cb === 'function';";

/**
 * create AS context menu in background script
 */
chrome.contextMenus.create({
    id: "copy-as-s3-key",
    title: "Copy AS S3 Key",
    contexts: ["selection"],
}
);

chrome.contextMenus.create(
    {
        id: "copy-as-docid",
        title: "Copy AS Docid",
        contexts: ["all"],
    }
);

var selectedTab = null

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received message" + request)
    if (request.action === "copyToClipboard") {
        console.log("Copied " + request.dataId + " to clipboard")
        // Copy text to clipboard
        executeCopyToCb(selectedTab, request.dataId);
    }
});

/**
 * set the 'onclicked' logic
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {

    if (info.menuItemId === "copy-as-s3-key") {

        let selectedText = info.selectionText;
        let s3Key = getS3Key(selectedText.trim());
        console.log("S3 Key: " + s3Key);

        if (s3Key.length === 0) {
            console.log("Invalid selected text length");
            return;
        }
        executeCopyToCb(tab, s3Key);
    }

    if (info.menuItemId === "copy-as-docid") {
        console.log("Clicked copy-as-docid context menue")
        chrome.tabs.sendMessage(tab.id, "copyDataId", {frameId: info.frameId});
        chrome.runtime.sendMessage({action: "copyDataId"});
        selectedTab = tab

        var elt = {};
        chrome.tabs.sendMessage(tab.id, "getClickedEl", {frameId: info.frameId}, data => {
            elt.value = data.value;
        });

        console.log("elt value:" + elt)
    }
});

/**
 *
 * @param text
 * @returns {string} s3 key
 */
function getS3Key(text) {

    if (text.length === 0) {
        return text;
    }

    return md5(text).substr(0, 5) + "." + text;
}

/**
 *
 * @param tab
 * @param text
 */
function executeCopyToCb(tab, text) {

    let functionCall = "copyToCb(" + JSON.stringify(text) + ");";

    chrome.tabs.executeScript({
        code: checkIfHelperJSInjected
    }, function (checkResults) {
        if (!checkResults || checkResults[0] !== true) {
            chrome.tabs.executeScript(tab.id, {
                file: "script/clipboard-helper.js"
            }, function (injectResults) {
                if (injectResults) {
                    chrome.tabs.executeScript(tab.id, {
                        code: functionCall
                    }, function (copyResults) {
                        if (!copyResults) {
                            console.log("Failed to copy text: ");
                        }
                    })
                }
            })
        }
    });
}

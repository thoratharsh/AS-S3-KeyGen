// Function to recursively search for the nearest parent with data-id attribute
function findNearestDataIdElement(element) {
    if (!element) return null;
    if (element.getAttribute("data-cy-document-id")) {
        return element;
    } else if(element.id === "copyToClip"){
        return element
    } else {
        return findNearestDataIdElement(element.parentElement);
    }
}

// Listen for the context menu item selection
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received message" + request)
    if (request === "copyDataId" || request.action === "copyDataId") {
        // Get the right-clicked element
        var clickedElement = null;
        clickedElement = window.getSelection().anchorNode.parentElement;
        console.log("Click element is:" + clickedElement)
        // Find the nearest parent with data-id attribute
        var nearestDataIdElement = findNearestDataIdElement(clickedElement);
        if (nearestDataIdElement) {
            // Get the data-id attribute
            var dataId = nearestDataIdElement.getAttribute("data-cy-document-id");
            if(nearestDataIdElement.id === 'copyToClip'){
                dataId = nearestDataIdElement.children[0].innerText.split("=").pop()
            }
            // Send the data-id back to the background script
            chrome.runtime.sendMessage({action: "copyToClipboard", dataId: dataId});
            console.log("Sent message copy to clipboard" + request.toString())
        }
    }
});


//content script
var clickedEl = null;

document.addEventListener("contextmenu", function(event){
    clickedEl = event.target;
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == "getClickedEl") {
        sendResponse({value: clickedEl.value});
    }
});
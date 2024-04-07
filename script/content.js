// Function to recursively search for the nearest parent with data-id attribute
function findNearestDataIdElement(element) {
    if (!element) return null;
    if (element.getAttribute("data-cy-document-id")) {
        return element;
    } else {
        return findNearestDataIdElement(element.parentElement);
    }
}

// Listen for the context menu item selection
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received message" + request.toString())
    if (request === "copyDataId") {
        // Get the right-clicked element
        const clickedElement = window.getSelection().anchorNode.parentElement;
        // Find the nearest parent with data-id attribute
        const nearestDataIdElement = findNearestDataIdElement(clickedElement);
        if (nearestDataIdElement) {
            // Get the data-id attribute
            const dataId = nearestDataIdElement.getAttribute("data-cy-document-id");
            // Send the data-id back to the background script
            chrome.runtime.sendMessage({action: "copyToClipboard", dataId: dataId});
            console.log("Sent message copy to clipboard" + request.toString())
        }
    }
});
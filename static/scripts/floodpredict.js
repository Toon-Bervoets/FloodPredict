// Function to trigger the search (for both button click and 'Enter' key)
function triggerSearch() {
    const searchValue = document.getElementById('search-box').value.trim().toLowerCase();
    const iframe = document.getElementById("mapIframe");
    const iframeSrc = iframe.contentWindow.location.href;  // This gives the iframe's URL

    if (searchValue) {
        if (iframeSrc.includes("/predict-info")) {
            iframe.src = "/map";  // Reset iframe back to the map page

            setTimeout(() => {
                iframe.contentWindow.postMessage({ type: "search", value: searchValue }, "*");
            }, 500);
        } else {
            // If already on the map page, just post the search message
            iframe.contentWindow.postMessage({ type: "search", value: searchValue }, "*");
        }
    }
}

// Handle search on button click
document.getElementById('search-button').addEventListener('click', triggerSearch);

// Handle search on pressing 'Enter' key
document.getElementById('search-box').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent form submission or other default behavior
        triggerSearch();  // Trigger search
    }
});

// Listen for feedback from the iframe (e.g., if municipality not found)
window.addEventListener("message", (event) => {
    if (event.data.type === "notFound") {
        alert("Municipality not found");
    }
});
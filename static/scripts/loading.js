function showLoadingScreen() {
    document.getElementById('loading').classList.add('active'); // Show loading screen
}

document.querySelector('form').addEventListener('submit', function() {
    showLoadingScreen(); // Show loading screen on form submission
});


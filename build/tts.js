// Initialize Text-to-Speech functionality
const synth = window.speechSynthesis;
let isTTSEnabled = false; // Track if TTS is enabled

// Function to speak text
function speakText(text) {
    if (synth.speaking) synth.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // Adjust speaking rate if needed
    synth.speak(utterance);
}

// Add hover event listeners to elements with the 'readable' class
function initializeHoverTTS() {
    const readableElements = document.querySelectorAll('.readable');
    readableElements.forEach(element => {
        element.addEventListener('mouseover', () => {
            if (isTTSEnabled) {
                speakText(element.textContent.trim());
            }
        });
    });
}

// Function to toggle TTS
function toggleTTS(button) {
    isTTSEnabled = !isTTSEnabled;

    if (isTTSEnabled) {
        button.textContent = 'TTS Enabled';
        speakText('Text-to-Speech Enabled'); // Announce TTS activation
    } else {
        button.textContent = 'TTS Disabled';
        speakText('Text-to-Speech Disabled'); // Announce TTS deactivation
    }
}

// Initialize TTS toggle button
function initializeTTSToggle() {
    const ttsToggleButton = document.querySelector('#ttsToggleButton');
    ttsToggleButton.addEventListener('click', () => toggleTTS(ttsToggleButton));
}

// Initialize TTS functionality
function initializeTTS() {
    initializeHoverTTS();
    initializeTTSToggle();
}

// Export initialization function
export { initializeTTS };

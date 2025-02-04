const synth = window.speechSynthesis;
let isTTSEnabled = false; // TTS is OFF by default
let isSpeaking = false;
let textElements = [];
let currentIndex = 0;
let selectableElements = [];
let selectedIndex = 0;

// Function to speak text
function speakText(text, delay = 0) {
    if (!isTTSEnabled || !text) return;
    
    setTimeout(() => {
        synth.cancel(); // Stop any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.onend = () => isSpeaking = false;

        synth.speak(utterance);
        isSpeaking = true;
    }, delay);
}

// Function to toggle TTS
function toggleTTS() {
    isTTSEnabled = !isTTSEnabled; // Only enable when user clicks

    const ttsButton = document.getElementById('ttsToggleButton');
    const body = document.body;

    if (ttsButton) {
        if (isTTSEnabled) {
            ttsButton.textContent = 'Disable TTS';
            body.classList.add('tts-enabled'); // Enable yellow outline highlighting
            speakText('Text to Speech is enabled', 0);

            // Speak the title after a delay to avoid overlap
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                speakText(pageTitle.textContent, 1250);
            }

        } else {
            ttsButton.textContent = 'Enable TTS';
            body.classList.remove('tts-enabled'); // Remove yellow outline
            speakText('Text to Speech is disabled', 0);
            synth.cancel();
        }
    }
}

// Function to initialize text elements for navigation
function collectTextElements() {
    textElements = [...document.querySelectorAll('.readable')].map(el => el.textContent.trim());
    selectableElements = [...document.querySelectorAll('.category, .login-button, .tts-button')]; // Selectable buttons
}

// Function to update selection highlight
function updateSelection() {
    selectableElements.forEach((el, index) => {
        if (index === selectedIndex) {
            el.classList.add("selected"); // Highlight selected item
            el.focus();
            speakText(el.textContent); // Read out the selected item
        } else {
            el.classList.remove("selected");
        }
    });
}

// Function to handle keyboard navigation
function handleKeyDown(event) {
    if (!isTTSEnabled) return;
    
    switch (event.key) {
        case ' ':
            event.preventDefault();
            if (isSpeaking) {
                synth.pause();
                isSpeaking = false;
            } else {
                synth.resume();
                isSpeaking = true;
            }
            break;
        case 'ArrowDown': // Move down the list
            event.preventDefault();
            if (selectedIndex < selectableElements.length - 1) {
                selectedIndex++;
                updateSelection();
            }
            break;
        case 'ArrowUp': // Move up the list
            event.preventDefault();
            if (selectedIndex > 0) {
                selectedIndex--;
                updateSelection();
            }
            break;
        case 'Enter': // Activate the selected link
            event.preventDefault();
            if (selectableElements[selectedIndex]) {
                selectableElements[selectedIndex].click();
            }
            break;
        case 'Escape':
            synth.cancel();
            isSpeaking = false;
            break;
    }
}

// Initialize TTS toggle button
function initializeTTSToggle() {
    const ttsToggleButton = document.getElementById('ttsToggleButton');
    if (ttsToggleButton) {
        ttsToggleButton.textContent = 'Enable TTS'; // Ensure button starts with "Enable"
        ttsToggleButton.addEventListener('click', toggleTTS);
    }
}

// Initialize TTS functionality
function initializeTTS() {
    collectTextElements();
    initializeTTSToggle();
    document.addEventListener('keydown', handleKeyDown);

    const ttsButton = document.getElementById('ttsToggleButton');
    if (ttsButton) {
        selectableElements.unshift(ttsButton); // Ensure the TTS button is selectable
        ttsButton.classList.add("readable", "selectable"); // Ensure it remains accessible
    }

    updateSelection();
}

// Ensure `isTTSEnabled` is accessible in index.html
export { initializeTTS, isTTSEnabled };

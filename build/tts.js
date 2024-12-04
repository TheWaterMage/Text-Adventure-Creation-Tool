function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Add hover event listeners to all elements with the data-tts attribute
    document.querySelectorAll('[data-tts]').forEach(element => {
        element.addEventListener('mouseover', () => {
            const text = element.getAttribute('data-tts');
            speakText(text);
        });

        // Stop speaking if the mouse leaves the element
        element.addEventListener('mouseout', () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        });
    });

    // Add click event listener for the manual activation button
    const activateButton = document.getElementById('activate-tts');
    if (activateButton) {
        activateButton.addEventListener('click', () => {
            const text = activateButton.getAttribute('data-tts');
            speakText(text);
        });
    }
});

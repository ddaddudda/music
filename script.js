// API Key Storage Logic
const apiKeyInput = document.getElementById('api-key');
const saveApiKeyBtn = document.getElementById('save-api-key');
const apiKeyStatus = document.getElementById('api-key-status');

// Load API key from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
        apiKeyStatus.textContent = '저장됨';
    }
});

// Save API key to localStorage
saveApiKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        apiKeyStatus.textContent = '저장됨';
    } else {
        apiKeyStatus.textContent = 'API 키를 입력하세요.';
    }
});

// TODO: Add Gemini API call and output formatting logic
// ...
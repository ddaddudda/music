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

const generateBtn = document.getElementById('generate-lyrics');
const topicInput = document.getElementById('topic');
const lyricsOutput = document.getElementById('lyrics-output');
const copyBtn = document.getElementById('copy-output');

// Helper: Format output for SUNO AI
function formatForSuno(lyrics, style) {
    return `### 가사\n${lyrics}\n\n### 노래 스타일\n${style}`;
}

// Helper: Show loading
function setLoading(isLoading) {
    if (isLoading) {
        lyricsOutput.textContent = '가사를 생성 중입니다...';
        generateBtn.disabled = true;
    } else {
        generateBtn.disabled = false;
    }
}

// Gemini API 호출
async function generateLyrics() {
    const apiKey = apiKeyInput.value.trim();
    const topic = topicInput.value.trim();
    if (!apiKey) {
        lyricsOutput.textContent = 'API 키를 입력하세요.';
        return;
    }
    if (!topic) {
        lyricsOutput.textContent = '가사 주제를 입력하세요.';
        return;
    }
    setLoading(true);
    try {
        // Gemini API endpoint
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=' + encodeURIComponent(apiKey);
        // 프롬프트: SUNO 양식에 맞게 가사와 스타일을 추천하도록 요청
        const prompt = `다음 주제에 맞는 노래 가사와 노래 스타일을 SUNO AI 양식에 맞게 추천해줘.\n주제: ${topic}\n\n아래와 같은 형식으로만 출력해줘.\n### 가사\n(여기에 가사)\n\n### 노래 스타일\n(여기에 스타일 설명)\n\n가사와 스타일 모두 반드시 포함해줘.`;
        const body = {
            contents: [{ parts: [{ text: prompt }] }]
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error('API 호출 실패: ' + response.status);
        }
        const data = await response.json();
        console.log('Gemini API 응답:', data); // 디버깅용
        // Gemini 응답 파싱
        let text = '';
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            text = data.candidates[0].content.parts.map(p => p.text).join('');
        } else {
            lyricsOutput.textContent = 'API 응답이 올바르지 않습니다. (콘솔을 확인하세요)';
            setLoading(false);
            return;
        }
        if (!text.trim()) {
            lyricsOutput.textContent = 'API에서 가사가 생성되지 않았습니다. (콘솔을 확인하세요)';
            setLoading(false);
            return;
        }
        // SUNO 양식이 아니면 직접 포맷팅
        let lyrics = '', style = '';
        const lyricsMatch = text.match(/### 가사\n([\s\S]*?)\n+### 노래 스타일/i);
        const styleMatch = text.match(/### 노래 스타일\n([\s\S]*)/i);
        if (lyricsMatch && styleMatch) {
            lyrics = lyricsMatch[1].trim();
            style = styleMatch[1].trim();
        } else {
            // Fallback: 전체를 가사로, 스타일은 "알 수 없음"
            lyrics = text.trim();
            style = '알 수 없음';
        }
        lyricsOutput.textContent = formatForSuno(lyrics, style);
    } catch (err) {
        lyricsOutput.textContent = '오류: ' + err.message + '\n(자세한 내용은 브라우저 콘솔을 확인하세요)';
        console.error('가사 생성 오류:', err);
    } finally {
        setLoading(false);
    }
}

generateBtn.addEventListener('click', generateLyrics);

// 복사 버튼 기능
copyBtn.addEventListener('click', () => {
    const text = lyricsOutput.textContent;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = '복사됨!';
            setTimeout(() => { copyBtn.textContent = '복사'; }, 1200);
        });
    }
});
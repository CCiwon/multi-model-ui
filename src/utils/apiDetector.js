// API 키 패턴으로 제공자 감지
export const detectProvider = (apiKey) => {
  if (!apiKey) return null;

  // OpenAI: sk-로 시작
  if (apiKey.startsWith('sk-')) {
    return 'openai';
  }

  // Anthropic: sk-ant-로 시작
  if (apiKey.startsWith('sk-ant-')) {
    return 'anthropic';
  }

  // Google AI (Gemini): AIza로 시작
  if (apiKey.startsWith('AIza')) {
    return 'google';
  }

  return 'unknown';
};

// 각 제공자별 사용 가능한 모델 목록
export const getAvailableModels = (provider) => {
  const modelsByProvider = {
    openai: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    anthropic: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    ],
    google: [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' },
    ],
  };

  return modelsByProvider[provider] || [];
};

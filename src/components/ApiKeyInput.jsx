import { useState } from 'react';
import { detectProvider, getAvailableModels } from '../utils/apiDetector';

export default function ApiKeyInput({ onApiKeySubmit }) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState(null);

  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    const detectedProvider = detectProvider(key);
    setProvider(detectedProvider);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey && provider && provider !== 'unknown') {
      const models = getAvailableModels(provider);
      onApiKeySubmit({ apiKey, provider, models });
    }
  };

  const getProviderName = (provider) => {
    const names = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google AI',
      unknown: '알 수 없음',
    };
    return names[provider] || '';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Multi-Model Chat</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            API 키 입력
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="API 키를 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {provider && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">감지된 제공자:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              provider === 'unknown'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {getProviderName(provider)}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={!apiKey || !provider || provider === 'unknown'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          시작하기
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">지원되는 API 키 형식:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>OpenAI: sk-로 시작</li>
          <li>Anthropic: sk-ant-로 시작</li>
          <li>Google AI: AIza로 시작</li>
        </ul>
      </div>
    </div>
  );
}

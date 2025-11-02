import { useState, useRef, useEffect } from 'react';
import { detectProvider, getAvailableModels } from '../utils/apiDetector';

export default function ModelPanel({ panelNumber, messages, onConfigUpdate, theme }) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [config, setConfig] = useState({
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: '',
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (provider && selectedModel) {
      const model = availableModels.find(m => m.id === selectedModel);
      onConfigUpdate(panelNumber, {
        apiKey,
        provider,
        modelId: selectedModel,
        modelName: model?.name || selectedModel,
        config,
      });
    }
  }, [provider, selectedModel, config, apiKey]);

  const handleApiKeySubmit = () => {
    const detectedProvider = detectProvider(apiKey);
    if (detectedProvider && detectedProvider !== 'unknown') {
      setProvider(detectedProvider);
      const models = getAvailableModels(detectedProvider);
      setAvailableModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0].id);
      }
      setShowApiInput(false);
    } else {
      alert('유효하지 않은 API 키입니다.');
    }
  };

  const getProviderName = (provider) => {
    const names = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google AI',
    };
    return names[provider] || '';
  };

  const getProviderColor = (provider) => {
    const colors = {
      openai: 'from-green-500 to-emerald-600',
      anthropic: 'from-orange-500 to-red-600',
      google: 'from-blue-500 to-indigo-600',
    };
    return colors[provider] || 'from-gray-500 to-gray-600';
  };

  const getModelName = () => {
    const model = availableModels.find(m => m.id === selectedModel);
    return model?.name || selectedModel;
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden ${
      isDark
        ? 'bg-gray-800/50 border-gray-700/50'
        : 'bg-white/80 border-gray-200'
    }`}>
      {/* 헤더 */}
      <div className={`p-4 border-b backdrop-blur-sm flex-shrink-0 ${
        isDark
          ? 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-gray-700/50'
          : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${provider ? getProviderColor(provider) : 'from-gray-600 to-gray-700'} rounded-lg flex items-center justify-center shadow-lg`}>
              <span className="text-white text-sm font-bold">{panelNumber}</span>
            </div>
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {provider ? getModelName() : `Model ${panelNumber}`}
            </h3>
          </div>
          <div className="flex gap-2">
            {!provider && (
              <button
                onClick={() => setShowApiInput(!showApiInput)}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API Key
              </button>
            )}
            {provider && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all backdrop-blur-sm flex items-center gap-1 ${
                  isDark
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            )}
          </div>
        </div>

        {/* API 키 입력 영역 */}
        {showApiInput && (
          <div className={`mt-3 p-3 border rounded-xl backdrop-blur-sm ${
            isDark
              ? 'bg-gray-900/50 border-gray-700/50'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className={`w-full px-3 py-2.5 border rounded-lg mb-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all ${
                isDark
                  ? 'bg-gray-800/80 text-white border-gray-700/50 focus:border-blue-500/50'
                  : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
              }`}
              onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            <button
              onClick={handleApiKeySubmit}
              className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              Submit
            </button>
          </div>
        )}

        {/* 모델 정보 */}
        {provider && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Provider:</span>
              <span className={`px-2.5 py-1 bg-gradient-to-r ${getProviderColor(provider)} text-white rounded-lg text-xs font-semibold shadow-lg`}>
                {getProviderName(provider)}
              </span>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all ${
                isDark
                  ? 'bg-gray-800/80 text-white border-gray-700/50 focus:border-blue-500/50'
                  : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
              }`}
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 설정 패널 */}
        {showSettings && provider && (
          <div className={`mt-3 p-3 border rounded-xl space-y-3 backdrop-blur-sm ${
            isDark
              ? 'bg-gray-900/50 border-gray-700/50'
              : 'bg-gray-50 border-gray-200'
          }`}>
            {/* 시스템 프롬프트 */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                System Prompt
              </label>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="You are a helpful assistant..."
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg text-xs resize-none focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all ${
                  isDark
                    ? 'bg-gray-800/80 text-white border-gray-700/50 focus:border-blue-500/50 placeholder-gray-500'
                    : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Max Tokens */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Max Tokens
                </label>
                <span className="text-xs text-blue-400 font-semibold">{config.maxTokens}</span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={config.maxTokens}
                onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Temperature
                </label>
                <span className="text-xs text-purple-400 font-semibold">{config.temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" style={{ scrollBehavior: 'smooth' }}>
        {!provider ? (
          <div className={`flex items-center justify-center h-full text-center px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                isDark
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="text-sm font-medium">Setup Required</div>
              <div className="text-xs">Click "API Key" to get started</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className={`flex items-center justify-center h-full text-center px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border ${
                isDark
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/30'
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getModelName()}</div>
              <div className="text-xs">Ready to chat</div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex gap-3 animate-fadeIn">
                {/* 아바타 */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                      : `bg-gradient-to-br ${getProviderColor(provider)}`
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* 메시지 내용 */}
                <div className="flex-1 min-w-0">
                  <div className={`inline-block px-4 py-2.5 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30'
                      : isDark
                        ? 'bg-gray-800/80 border border-gray-700/50'
                        : 'bg-gray-100 border border-gray-200'
                  }`}>
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

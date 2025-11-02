import { useState, useEffect } from 'react';

export default function ModelSelector({ availableModels, onModelsSelected }) {
  const [selectedModels, setSelectedModels] = useState([]);
  const [modelConfigs, setModelConfigs] = useState({});

  useEffect(() => {
    // 기본 설정 초기화
    const defaultConfigs = {};
    availableModels.forEach(model => {
      defaultConfigs[model.id] = {
        maxTokens: 2000,
        temperature: 0.7,
      };
    });
    setModelConfigs(defaultConfigs);
  }, [availableModels]);

  const handleModelToggle = (modelId) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        if (prev.length < 3) {
          return [...prev, modelId];
        }
        return prev;
      }
    });
  };

  const handleConfigChange = (modelId, field, value) => {
    setModelConfigs(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [field]: parseFloat(value),
      },
    }));
  };

  const handleSubmit = () => {
    const configs = selectedModels.map(modelId => {
      const model = availableModels.find(m => m.id === modelId);
      return {
        modelId,
        modelName: model.name,
        config: modelConfigs[modelId],
      };
    });
    onModelsSelected(configs);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">모델 선택 (최대 3개)</h2>

      <div className="space-y-4 mb-6">
        {availableModels.map(model => (
          <div
            key={model.id}
            className={`border rounded-lg p-4 transition-all ${
              selectedModels.includes(model.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id={model.id}
                checked={selectedModels.includes(model.id)}
                onChange={() => handleModelToggle(model.id)}
                disabled={!selectedModels.includes(model.id) && selectedModels.length >= 3}
                className="mt-1 w-4 h-4 text-blue-600"
              />

              <div className="flex-1">
                <label htmlFor={model.id} className="font-medium cursor-pointer">
                  {model.name}
                </label>

                {selectedModels.includes(model.id) && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Max Tokens: {modelConfigs[model.id]?.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="4000"
                        step="100"
                        value={modelConfigs[model.id]?.maxTokens || 2000}
                        onChange={(e) => handleConfigChange(model.id, 'maxTokens', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Temperature: {modelConfigs[model.id]?.temperature?.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={modelConfigs[model.id]?.temperature || 0.7}
                        onChange={(e) => handleConfigChange(model.id, 'temperature', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedModels.length === 0}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        채팅 시작 ({selectedModels.length}/3)
      </button>
    </div>
  );
}

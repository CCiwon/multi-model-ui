import { useState } from 'react';
import MessageList from './MessageList';
import { callAPI } from '../utils/apiClient';

export default function ChatInterface({ provider, apiKey, modelConfigs }) {
  const [conversations, setConversations] = useState(
    modelConfigs.reduce((acc, model) => {
      acc[model.modelId] = [];
      return acc;
    }, {})
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setInput('');
    setIsLoading(true);

    // 모든 모델의 대화에 사용자 메시지 추가
    const updatedConversations = { ...conversations };
    modelConfigs.forEach(model => {
      updatedConversations[model.modelId] = [
        ...updatedConversations[model.modelId],
        userMessage,
      ];
    });
    setConversations(updatedConversations);

    // 각 모델에 동시에 요청
    const promises = modelConfigs.map(async (model) => {
      const messages = updatedConversations[model.modelId];
      let assistantMessage = '';

      try {
        await callAPI(
          provider,
          apiKey,
          model.modelId,
          messages,
          model.config,
          (chunk) => {
            assistantMessage += chunk;
            setConversations(prev => {
              const current = [...prev[model.modelId]];
              const lastMessage = current[current.length - 1];

              if (lastMessage?.role === 'assistant') {
                current[current.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage,
                };
              } else {
                current.push({
                  role: 'assistant',
                  content: assistantMessage,
                });
              }

              return { ...prev, [model.modelId]: current };
            });
          }
        );
      } catch (error) {
        console.error(`Error with ${model.modelName}:`, error);
        setConversations(prev => ({
          ...prev,
          [model.modelId]: [
            ...prev[model.modelId],
            {
              role: 'assistant',
              content: `오류: ${error.message}`,
            },
          ],
        }));
      }
    });

    await Promise.all(promises);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        {modelConfigs.map(model => (
          <div key={model.modelId} className="flex flex-col border rounded-lg bg-white overflow-hidden">
            <MessageList
              messages={conversations[model.modelId] || []}
              modelName={model.modelName}
            />
          </div>
        ))}
      </div>

      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            rows="3"
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
}

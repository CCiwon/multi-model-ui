import { useEffect, useRef } from 'react';

export default function MessageList({ messages, modelName }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="sticky top-0 bg-white border-b pb-2 mb-4">
        <h3 className="font-semibold text-lg">{modelName}</h3>
      </div>

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          </div>
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}

// OpenAI API 호출
export const callOpenAI = async (apiKey, model, messages, config, onChunk) => {
  // 시스템 프롬프트가 있으면 메시지 앞에 추가
  const apiMessages = config.systemPrompt
    ? [{ role: 'system', content: config.systemPrompt }, ...messages]
    : messages;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: apiMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
};

// Anthropic API 호출
export const callAnthropic = async (apiKey, model, messages, config, onChunk) => {
  // Anthropic은 system을 별도 필드로 받음
  const requestBody = {
    model: model,
    messages: messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    stream: true,
  };

  if (config.systemPrompt) {
    requestBody.system = config.systemPrompt;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API Error: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta') {
            const content = parsed.delta?.text;
            if (content) {
              onChunk(content);
            }
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
};

// Google AI (Gemini) API 호출
export const callGoogle = async (apiKey, model, messages, config, onChunk) => {
  // Gemini는 메시지 형식을 변환해야 함
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const requestBody = {
    contents: contents,
    generationConfig: {
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
    },
  };

  // Gemini는 systemInstruction 필드를 사용
  if (config.systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: config.systemPrompt }],
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(`Google AI API Error: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          onChunk(content);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }
  }
};

// 제공자별 API 호출 라우터
export const callAPI = async (provider, apiKey, model, messages, config, onChunk) => {
  switch (provider) {
    case 'openai':
      return await callOpenAI(apiKey, model, messages, config, onChunk);
    case 'anthropic':
      return await callAnthropic(apiKey, model, messages, config, onChunk);
    case 'google':
      return await callGoogle(apiKey, model, messages, config, onChunk);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

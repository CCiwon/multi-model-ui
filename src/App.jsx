import { useState } from "react";
import ModelPanel from "./components/ModelPanel";
import { callAPI } from "./utils/apiClient";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [panelConfigs, setPanelConfigs] = useState({
    1: null,
    2: null,
    3: null,
  });

  const [conversations, setConversations] = useState({
    1: [],
    2: [],
    3: [],
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigUpdate = (panelNumber, config) => {
    setPanelConfigs((prev) => ({
      ...prev,
      [panelNumber]: config,
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 설정된 패널 찾기
    const activePanels = Object.entries(panelConfigs)
      .filter(([_, config]) => config !== null)
      .map(([panelNumber, config]) => ({
        panelNumber: parseInt(panelNumber),
        config,
      }));

    if (activePanels.length === 0) {
      alert("최소 하나의 모델을 설정해주세요.");
      return;
    }

    const userMessage = { role: "user", content: input };
    setInput("");
    setIsLoading(true);

    // 모든 활성 패널에 사용자 메시지 추가
    const updatedConversations = { ...conversations };
    activePanels.forEach(({ panelNumber }) => {
      updatedConversations[panelNumber] = [
        ...updatedConversations[panelNumber],
        userMessage,
      ];
    });
    setConversations(updatedConversations);

    // 각 패널에 동시 요청
    const promises = activePanels.map(async ({ panelNumber, config }) => {
      const messages = updatedConversations[panelNumber];
      let assistantMessage = "";

      try {
        await callAPI(
          config.provider,
          config.apiKey,
          config.modelId,
          messages,
          config.config,
          (chunk) => {
            assistantMessage += chunk;
            setConversations((prev) => {
              const current = [...prev[panelNumber]];
              const lastMessage = current[current.length - 1];

              if (lastMessage?.role === "assistant") {
                current[current.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
              } else {
                current.push({
                  role: "assistant",
                  content: assistantMessage,
                });
              }

              return { ...prev, [panelNumber]: current };
            });
          }
        );
      } catch (error) {
        console.error(`Error with panel ${panelNumber}:`, error);
        setConversations((prev) => ({
          ...prev,
          [panelNumber]: [
            ...prev[panelNumber],
            {
              role: "assistant",
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getActiveCount = () => {
    return Object.values(panelConfigs).filter((config) => config !== null)
      .length;
  };

  return (
    <div
      className={`h-screen flex flex-col ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* 헤더 */}
      <header
        className={`backdrop-blur-xl border-b px-6 py-4 shadow-2xl flex-shrink-0 ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-700/50"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h1
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                다중 모델 채팅
              </h1>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                api키를 이용한 여러 모델 응답 비교
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 테마 토글 버튼 */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all shadow-lg ${
                theme === "dark"
                  ? "bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <div
              className={`px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border rounded-xl text-xs font-semibold shadow-lg ${
                theme === "dark"
                  ? "border-blue-500/30 text-blue-300"
                  : "border-blue-500/30 text-blue-700"
              }`}
            >
              {getActiveCount()} Active{" "}
              {getActiveCount() === 1 ? "Model" : "Models"}
            </div>
          </div>
        </div>
      </header>

      {/* 3개의 패널 */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-hidden min-h-0">
        <ModelPanel
          panelNumber={1}
          messages={conversations[1]}
          onConfigUpdate={handleConfigUpdate}
          theme={theme}
        />
        <ModelPanel
          panelNumber={2}
          messages={conversations[2]}
          onConfigUpdate={handleConfigUpdate}
          theme={theme}
        />
        <ModelPanel
          panelNumber={3}
          messages={conversations[3]}
          onConfigUpdate={handleConfigUpdate}
          theme={theme}
        />
      </div>

      {/* 공통 입력 영역 */}
      <div
        className={`backdrop-blur-xl border-t px-6 py-4 shadow-2xl flex-shrink-0 ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-700/50"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Send a message... (Enter to send, Shift+Enter for new line)"
                rows="1"
                disabled={isLoading}
                style={{ minHeight: "52px", maxHeight: "200px" }}
                className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none shadow-xl backdrop-blur-sm transition-all ${
                  theme === "dark"
                    ? "bg-gray-800/50 text-white border-gray-700/50 placeholder-gray-500"
                    : "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                }`}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 200) + "px";
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || getActiveCount() === 0}
              className={`px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-xl flex items-center gap-2 min-h-[52px] ${
                !input.trim() || isLoading || getActiveCount() === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

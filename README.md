# Multi-Model Chat Interface

여러 AI 모델과 동시에 대화할 수 있는 웹 인터페이스입니다.

## 기능

- API 키 자동 감지 (OpenAI, Anthropic, Google AI)
- 최대 3개 모델 동시 선택
- 모델별 max_tokens, temperature 조정
- 실시간 스트리밍 응답
- 각 모델별 독립적인 대화 히스토리
- ChatGPT 스타일 UI

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 사용 방법

1. **메인 화면**에 3개의 패널이 나란히 표시됩니다

2. **각 패널 설정** (원하는 개수만큼, 1~3개):
   - **API 키 입력** 버튼 클릭
     - OpenAI: `sk-`로 시작
     - Anthropic: `sk-ant-`로 시작
     - Google AI: `AIza`로 시작
   - API 키 입력 시 자동으로 제공자 감지 및 모델 목록 로드
   - 드롭다운에서 원하는 모델 선택
   - **⚙️ 설정** 버튼으로 파라미터 조정
     - Max Tokens (100-4000)
     - Temperature (0-2.0)

3. **채팅 시작**:
   - 하단의 공통 입력창에 메시지 입력
   - **하나의 메시지가 설정된 모든 모델에 동시 전송**
   - 각 패널에서 실시간 스트리밍 응답 표시
   - 각 모델별로 독립적인 대화 히스토리 유지

4. **키보드 단축키**:
   - Enter: 메시지 전송
   - Shift + Enter: 줄바꿈

## 프로젝트 구조

```
ui/
├── src/
│   ├── components/
│   │   └── ModelPanel.jsx        # 개별 모델 패널 (API 키, 설정, 채팅)
│   ├── utils/
│   │   ├── apiDetector.js        # API 제공자 감지
│   │   └── apiClient.js          # API 호출 로직
│   ├── App.jsx                   # 메인 앱 (3개 패널 레이아웃)
│   ├── main.jsx                  # 진입점
│   └── index.css                 # 스타일
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 기술 스택

- React 18
- Tailwind CSS
- Vite
- OpenAI API
- Anthropic API
- Google AI API

/**
 * UI Message Stream Protocol (SSE) 형식의 모의 응답을 생성한다.
 * 형식: `data: {JSON}\n\n` (SSE)
 * @see https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol#ui-message-stream-protocol
 */

/** SSE 이벤트 한 줄 생성 */
function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

/** /api/chat 모의 응답 (SSE): tool call(answer) + text 스트림 */
export function mockChatStreamSSE(): string {
  const parts = [
    // 메시지 시작
    { type: "start", messageId: "mock-msg-1" },
    // 텍스트 파트 시작
    { type: "text-start", id: "text-1" },
    // 텍스트 델타
    { type: "text-delta", id: "text-1", delta: "안녕하세요! " },
    { type: "text-delta", id: "text-1", delta: "최기환의 포트폴리오입니다." },
    // 텍스트 파트 끝
    { type: "text-finish", id: "text-1" },
    // step 완료
    {
      type: "step-finish",
      finishReason: "stop",
      usage: { promptTokens: 100, completionTokens: 50 },
      isContinued: false,
    },
    // 메시지 완료
    {
      type: "finish",
      finishReason: "stop",
      usage: { promptTokens: 100, completionTokens: 50 },
    },
  ]

  return `${parts.map(sse).join("")}data: [DONE]\n\n`
}

/** /api/chat 응답 헤더 */
export const CHAT_RESPONSE_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  connection: "keep-alive",
  "x-vercel-ai-ui-message-stream": "v1",
}

/** /api/followup 모의 응답: 일반 텍스트 스트림 */
export function mockFollowupStream(): string {
  return [
    "1. 어떤 기술 스택을 사용하나요?\n",
    "2. 프로젝트 경험이 어떻게 되나요?\n",
    "3. 팀에서의 역할은 무엇인가요?\n",
  ].join("")
}

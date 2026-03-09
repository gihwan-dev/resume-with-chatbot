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
    { type: "start-step" },
    // 텍스트 파트 시작
    { type: "text-start", id: "text-1" },
    // 텍스트 델타
    { type: "text-delta", id: "text-1", delta: "안녕하세요! " },
    { type: "text-delta", id: "text-1", delta: "최기환의 포트폴리오입니다." },
    // 텍스트 파트 끝
    { type: "text-end", id: "text-1" },
    // step 완료
    {
      type: "finish-step",
    },
    // 메시지 완료
    {
      type: "finish",
      finishReason: "stop",
    },
  ]

  return `${parts.map(sse).join("")}data: [DONE]\n\n`
}

/**
 * /api/chat 모의 응답 (SSE): tool call 포함 스트림
 * tool-input-delta 없이 tool-call-start → tool-call-finish 직행
 * (서버 필터가 적용된 결과와 동일한 형태)
 */
export function mockChatStreamWithToolCall(): string {
  const parts = [
    { type: "start", messageId: "mock-msg-2" },
    { type: "start-step" },
    // tool call (searchDocuments)
    {
      type: "tool-input-available",
      toolCallId: "tc-1",
      toolName: "searchDocuments",
      input: { query: "기술 스택" },
    },
    {
      type: "tool-output-available",
      toolCallId: "tc-1",
      output: { success: true, documents: [] },
    },
    // step 완료 (tool use)
    {
      type: "finish-step",
    },
    // answer tool call
    { type: "start-step" },
    {
      type: "tool-input-available",
      toolCallId: "tc-2",
      toolName: "answer",
      input: {
        answer: "React, TypeScript, Astro를 사용합니다.",
        confidence: "high",
        sources: [],
      },
    },
    {
      type: "tool-output-available",
      toolCallId: "tc-2",
      output: { success: true },
    },
    // step 완료
    {
      type: "finish-step",
    },
    // 최종 텍스트 응답
    { type: "start-step" },
    { type: "text-start", id: "text-1" },
    { type: "text-delta", id: "text-1", delta: "React, TypeScript, Astro를 사용합니다." },
    { type: "text-end", id: "text-1" },
    {
      type: "finish-step",
    },
    {
      type: "finish",
      finishReason: "stop",
    },
  ]

  return `${parts.map(sse).join("")}data: [DONE]\n\n`
}

/** /api/chat 모의 응답 (SSE): answer tool source 카드 포함 */
export function mockChatStreamWithSourceCards(): string {
  const parts = [
    { type: "start", messageId: "mock-msg-source-1" },
    { type: "start-step" },
    {
      type: "tool-input-available",
      toolCallId: "tc-source-1",
      toolName: "answer",
      input: {
        answer: "근거 기반 답변입니다.",
        confidence: "high",
        sources: [
          {
            type: "obsidian",
            title: "DataGrid 리팩토링 노트",
            id: "Exem--Projects--datagrid-refactor",
          },
        ],
      },
    },
    {
      type: "tool-output-available",
      toolCallId: "tc-source-1",
      output: {
        answer: "근거 기반 답변입니다.",
        confidence: "high",
        sources: [
          {
            type: "obsidian",
            title: "DataGrid 리팩토링 노트",
            id: "Exem--Projects--datagrid-refactor",
          },
        ],
      },
    },
    {
      type: "finish-step",
    },
    { type: "start-step" },
    { type: "text-start", id: "text-source-1" },
    { type: "text-delta", id: "text-source-1", delta: "DataGrid 리팩토링을 진행했습니다." },
    { type: "text-end", id: "text-source-1" },
    {
      type: "finish-step",
    },
    {
      type: "finish",
      finishReason: "stop",
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

/** /api/source-preview 모의 응답 */
export function mockSourcePreviewResponse() {
  return {
    id: "Exem--Projects--datagrid-refactor",
    sourceType: "obsidian",
    title: "DataGrid 리팩토링 노트",
    category: "Exem",
    path: "Exem/Projects/datagrid-refactor.md",
    summary: "table 기반 구조를 div + virtualization으로 전환했습니다.",
    excerpt: "DOM 노드를 크게 줄이고 리사이즈 성능을 개선했습니다.",
    tags: ["Exem", "Projects"],
  }
}

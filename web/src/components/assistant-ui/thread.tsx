import {
  ActionBarPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useMessage,
  useThreadRuntime,
} from "@assistant-ui/react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  MessageSquarePlus,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react"
import { type FC, useEffect, useRef } from "react"
import { MarkdownText } from "@/components/assistant-ui/markdown-text"
import { Reasoning, ReasoningGroupWrapper } from "@/components/assistant-ui/reasoning"
import { ToolCallStatus, ToolGroupWrapper } from "@/components/assistant-ui/tool-call-status"
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button"
import { Button } from "@/components/ui/button"
import { useFollowUp } from "@/hooks/use-follow-up"
import { SUGGESTED_QUESTIONS } from "@/lib/chat-utils"

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root @container flex h-full flex-col bg-background"
      style={{
        ["--thread-max-width" as string]: "44rem",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4"
      >
        <ThreadPrimitive.Empty>
          <ThreadWelcome />
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />

        <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mx-auto mt-auto flex w-full max-w-(--thread-max-width) flex-col gap-4 overflow-visible rounded-t-3xl pb-4">
          <ThreadScrollToBottom />
          <Composer />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  )
}

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="아래로 스크롤"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  )
}

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex w-full max-w-(--thread-max-width) grow flex-col">
      <div className="aui-thread-welcome-center flex w-full grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-4">
          <h1 className="fade-in slide-in-from-bottom-1 animate-in font-semibold text-2xl duration-200">
            안녕하세요!
          </h1>
          <p className="fade-in slide-in-from-bottom-1 animate-in text-muted-foreground text-base delay-75 duration-200">
            최기환의 이력서에 대해 궁금한 점을 물어보세요.
          </p>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 pb-4">
        {SUGGESTED_QUESTIONS.map((q) => (
          <SuggestionButton key={q.id} text={q.text} />
        ))}
      </div>
    </div>
  )
}

const SuggestionButton: FC<{ text: string }> = ({ text }) => {
  const threadRuntime = useThreadRuntime()
  return (
    <Button
      variant="ghost"
      className="h-auto w-full items-start justify-start rounded-2xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
      onClick={() => {
        threadRuntime.append({ role: "user", content: [{ type: "text", text }] })
      }}
    >
      <span className="text-sm">{text}</span>
    </Button>
  )
}

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col rounded-2xl border border-input bg-background px-1 pt-2 outline-none transition-shadow has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-ring/20">
      <ComposerPrimitive.Input
        placeholder="메시지를 입력하세요..."
        className="aui-composer-input mb-1 max-h-32 min-h-10 w-full resize-none bg-transparent px-4 pt-1 pb-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
        rows={1}
        autoFocus
        aria-label="메시지 입력"
      />
      <ComposerAction />
    </ComposerPrimitive.Root>
  )
}

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative mx-2 mb-2 flex items-center justify-end gap-2">
      <ComposerPrimitive.Send asChild>
        <TooltipIconButton
          tooltip="메시지 전송"
          side="bottom"
          type="submit"
          variant="default"
          size="icon"
          className="aui-composer-send size-8 rounded-full"
          aria-label="메시지 전송"
        >
          <ArrowUpIcon className="size-4" />
        </TooltipIconButton>
      </ComposerPrimitive.Send>
      <ComposerPrimitive.Cancel asChild>
        <Button
          type="button"
          variant="default"
          size="icon"
          className="aui-composer-cancel size-8 rounded-full"
          aria-label="생성 중지"
        >
          <SquareIcon className="size-3 fill-current" />
        </Button>
      </ComposerPrimitive.Cancel>
    </div>
  )
}

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  )
}

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-assistant-message-root fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-(--thread-max-width) animate-in py-3 duration-150"
      data-role="assistant"
    >
      <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground text-sm leading-relaxed">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
            Reasoning,
            ReasoningGroup: ReasoningGroupWrapper,
            ToolGroup: ToolGroupWrapper,
            tools: {
              by_name: {
                searchNotion: ToolCallStatus,
                getNotionPage: ToolCallStatus,
                searchClickUpTasks: ToolCallStatus,
                searchClickUpDocs: ToolCallStatus,
              },
            },
          }}
        />
        <MessageError />
      </div>

      <div className="mt-1 ml-2 flex">
        <AssistantActionBar />
      </div>

      <FollowUpSuggestions />
    </MessagePrimitive.Root>
  )
}

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="복사">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="다시 생성">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  )
}

const FollowUpSuggestions: FC = () => {
  const message = useMessage()
  const threadRuntime = useThreadRuntime()
  const { questions, generateFollowUp, clearQuestions } = useFollowUp()
  const generatedRef = useRef(false)

  const isLast = message.isLast
  const isComplete = message.status?.type === "complete"

  useEffect(() => {
    if (!isLast || !isComplete || generatedRef.current) return

    // 1차: answer tool call의 args.answer에서 추출
    const answerPart = message.content.find(
      (part) => part.type === "tool-call" && part.toolName === "answer"
    )

    let answerText = ""
    if (
      answerPart &&
      answerPart.type === "tool-call" &&
      answerPart.args &&
      typeof answerPart.args === "object" &&
      "answer" in answerPart.args
    ) {
      answerText = String((answerPart.args as Record<string, unknown>).answer)
    }

    // 2차 fallback: text 파트 (tool call 없는 경우 대비)
    const textContent =
      answerText ||
      message.content
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("")

    if (textContent) {
      generatedRef.current = true
      generateFollowUp(textContent)
    }
  }, [isLast, isComplete, message.content, generateFollowUp])

  // Reset when this message is no longer the last
  useEffect(() => {
    if (!isLast) {
      generatedRef.current = false
      clearQuestions()
    }
  }, [isLast, clearQuestions])

  if (!isLast || !isComplete || questions.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-1.5 px-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageSquarePlus className="h-3.5 w-3.5" />
        <span>이어서 물어보기</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((question) => (
          <Button
            key={question}
            variant="secondary"
            size="sm"
            className="h-auto py-1.5 px-2.5 text-xs font-normal whitespace-normal text-left cursor-pointer border border-transparent hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
            onClick={() => {
              clearQuestions()
              threadRuntime.append({
                role: "user",
                content: [{ type: "text", text: question }],
              })
            }}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-user-message-root fade-in slide-in-from-bottom-1 mx-auto flex w-full max-w-(--thread-max-width) animate-in justify-end px-2 py-3 duration-150"
      data-role="user"
    >
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground text-sm">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  )
}

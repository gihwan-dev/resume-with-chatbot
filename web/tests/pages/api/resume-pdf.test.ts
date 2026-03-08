import { beforeEach, describe, expect, it, vi } from "vitest"
import { GET } from "@/pages/api/resume-pdf"

const { mockRenderToBuffer, mockRegisterFonts, mockSerializeResumeData } = vi.hoisted(() => ({
  mockRenderToBuffer: vi.fn(),
  mockRegisterFonts: vi.fn(),
  mockSerializeResumeData: vi.fn(),
}))

vi.mock("@react-pdf/renderer", () => ({
  renderToBuffer: mockRenderToBuffer,
}))

vi.mock("@/components/pdf/resume-document", () => ({
  ResumeDocument: () => null,
}))

vi.mock("@/lib/pdf/register-fonts", () => ({
  registerFonts: mockRegisterFonts,
}))

vi.mock("@/lib/pdf/serialize-resume", () => ({
  serializeResumeData: mockSerializeResumeData,
}))

describe("/api/resume-pdf", () => {
  beforeEach(() => {
    mockRenderToBuffer.mockReset()
    mockRegisterFonts.mockReset()
    mockSerializeResumeData.mockReset()
  })

  it("variant=ai-agent를 전달하면 serializeResumeData('ai-agent')를 호출한다", async () => {
    mockSerializeResumeData.mockResolvedValue({
      profile: {
        name: "최기환",
        label: "AI Native Frontend Developer",
      },
    })
    mockRenderToBuffer.mockResolvedValue(new Uint8Array([1, 2, 3]))

    const response = await GET({
      request: new Request("http://localhost/api/resume-pdf?variant=ai-agent"),
    })
    const encodedFileName = encodeURIComponent("최기환_AI Native Frontend Developer_이력서.pdf")

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/pdf")
    expect(response.headers.get("Content-Disposition")).toBe(
      `attachment; filename*=UTF-8''${encodedFileName}`
    )
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(mockSerializeResumeData).toHaveBeenCalledWith("ai-agent")
    expect(mockRegisterFonts).toHaveBeenCalledTimes(1)
    expect(mockRenderToBuffer).toHaveBeenCalledTimes(1)
  })

  it("invalid variant는 frontend로 fallback 한다", async () => {
    mockSerializeResumeData.mockResolvedValue({
      profile: {
        name: "최기환",
        label: "Frontend Developer",
      },
    })
    mockRenderToBuffer.mockResolvedValue(new Uint8Array([1, 2, 3]))

    await GET({
      request: new Request("http://localhost/api/resume-pdf?variant=invalid"),
    })

    expect(mockSerializeResumeData).toHaveBeenCalledWith("frontend")
  })
})

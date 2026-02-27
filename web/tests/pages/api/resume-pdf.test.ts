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

  it("PDF 응답 헤더를 유지한다(Content-Type / Content-Disposition / Cache-Control)", async () => {
    mockSerializeResumeData.mockResolvedValue({
      profile: {
        name: "최기환",
        label: "성능·아키텍처 Frontend Engineer",
      },
    })
    mockRenderToBuffer.mockResolvedValue(new Uint8Array([1, 2, 3]))

    const response = await GET()
    const encodedFileName = encodeURIComponent("최기환_성능·아키텍처 Frontend Engineer_이력서.pdf")

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/pdf")
    expect(response.headers.get("Content-Disposition")).toBe(
      `attachment; filename*=UTF-8''${encodedFileName}`
    )
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(mockSerializeResumeData).toHaveBeenCalledTimes(1)
    expect(mockRegisterFonts).toHaveBeenCalledTimes(1)
    expect(mockRenderToBuffer).toHaveBeenCalledTimes(1)
  })
})

import { describe, expect, it } from "vitest"
import {
  extractWikiDocId,
  preprocessWikiLinks,
  WIKI_LINK_HREF_PREFIX,
} from "../../../src/components/chat/wiki-link-preprocessor"

describe("preprocessWikiLinks", () => {
  it("outLinks에 매칭되는 [[target]]은 마크다운 링크로 변환", () => {
    const markdown = "이건 [[TLS 협상]] 참조."
    const result = preprocessWikiLinks(markdown, [{ id: "Network--TLS", title: "TLS 협상" }])
    expect(result).toBe(`이건 [TLS 협상](${WIKI_LINK_HREF_PREFIX}Network--TLS) 참조.`)
  })

  it("alias가 있으면 alias를 링크 텍스트로 사용", () => {
    const markdown = "[[TLS 협상|암호화 과정]]"
    const result = preprocessWikiLinks(markdown, [{ id: "Network--TLS", title: "TLS 협상" }])
    expect(result).toBe(`[암호화 과정](${WIKI_LINK_HREF_PREFIX}Network--TLS)`)
  })

  it("outLinks에 매칭되지 않으면 일반 텍스트로 치환", () => {
    const markdown = "[[알 수 없는 문서]]"
    const result = preprocessWikiLinks(markdown, [])
    expect(result).toBe("알 수 없는 문서")
  })

  it("매칭되지 않고 alias가 있으면 alias를 텍스트로", () => {
    const markdown = "[[not-found|대체 이름]]"
    const result = preprocessWikiLinks(markdown, [])
    expect(result).toBe("대체 이름")
  })

  it("이미지 임베드는 📎 이미지 텍스트로 치환", () => {
    const markdown = "![[Pasted image.png]]"
    const result = preprocessWikiLinks(markdown, [])
    expect(result).toBe("`📎 이미지: Pasted image.png`")
  })

  it("이미지가 아닌 임베드는 display로 치환", () => {
    const markdown = "![[일반 노트]]"
    const result = preprocessWikiLinks(markdown, [])
    expect(result).toBe("일반 노트")
  })

  it("대소문자 무시 매칭", () => {
    const result = preprocessWikiLinks("[[tls 협상]]", [{ id: "Network--TLS", title: "TLS 협상" }])
    expect(result).toBe(`[tls 협상](${WIKI_LINK_HREF_PREFIX}Network--TLS)`)
  })

  it("빈 마크다운 안전 처리", () => {
    expect(preprocessWikiLinks("", [])).toBe("")
  })

  it("여러 링크 동시 처리", () => {
    const markdown = "먼저 [[A]], 그 다음 [[B|비]]."
    const result = preprocessWikiLinks(markdown, [
      { id: "doc-a", title: "A" },
      { id: "doc-b", title: "B" },
    ])
    expect(result).toBe(
      `먼저 [A](${WIKI_LINK_HREF_PREFIX}doc-a), 그 다음 [비](${WIKI_LINK_HREF_PREFIX}doc-b).`
    )
  })
})

describe("extractWikiDocId", () => {
  it("wiki href에서 id 추출", () => {
    expect(extractWikiDocId(`${WIKI_LINK_HREF_PREFIX}doc-abc`)).toBe("doc-abc")
  })

  it("URL 인코딩된 id 복원", () => {
    const encoded = encodeURIComponent("React.js--use Ref")
    expect(extractWikiDocId(`${WIKI_LINK_HREF_PREFIX}${encoded}`)).toBe("React.js--use Ref")
  })

  it("wiki 프리픽스가 아니면 null", () => {
    expect(extractWikiDocId("https://example.com")).toBeNull()
    expect(extractWikiDocId("#hash")).toBeNull()
  })

  it("빈/잘못된 입력에서 null", () => {
    expect(extractWikiDocId("")).toBeNull()
    expect(extractWikiDocId(WIKI_LINK_HREF_PREFIX)).toBeNull()
    expect(extractWikiDocId(undefined as unknown as string)).toBeNull()
  })
})

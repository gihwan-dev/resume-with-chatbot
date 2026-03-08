import { createElement } from "react"
import { parseResumeVariant } from "@/lib/resume/variant"

export const prerender = false

export async function GET({ request }: { request: Request }) {
  const [{ renderToBuffer }, { ResumeDocument }, { registerFonts }, { serializeResumeData }] =
    await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/pdf/resume-document"),
      import("@/lib/pdf/register-fonts"),
      import("@/lib/pdf/serialize-resume"),
    ])

  const variant = parseResumeVariant(new URL(request.url).searchParams.get("variant"))
  const resumeData = await serializeResumeData(variant)
  registerFonts()

  const document = createElement(ResumeDocument, { data: resumeData })
  // @ts-expect-error ResumeDocument ultimately returns react-pdf <Document />.
  const pdfBuffer = await renderToBuffer(document)
  const responseBody = new Uint8Array(pdfBuffer)
  const fileName = `${resumeData.profile.name}_${resumeData.profile.label}_이력서.pdf`
  const encodedFileName = encodeURIComponent(fileName)

  return new Response(responseBody, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
      "Cache-Control": "no-store",
    },
  })
}

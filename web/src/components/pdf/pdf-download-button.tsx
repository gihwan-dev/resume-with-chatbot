import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"
import type { SerializedResumeData } from "@/lib/pdf/types"

export function PdfDownloadButton({ data }: { data: SerializedResumeData }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (loading) return
    setLoading(true)
    trackEvent("pdf_download", { file_name: `${data.profile.name}_이력서` })

    try {
      const [{ pdf }, { registerFonts }, { ResumeDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/pdf/register-fonts"),
        import("@/components/pdf/resume-document"),
      ])

      registerFonts()

      const blob = await pdf(<ResumeDocument data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data.profile.name}_${data.profile.label}_이력서.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF 생성 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {loading ? "PDF 생성 중..." : "PDF 다운로드"}
    </Button>
  )
}

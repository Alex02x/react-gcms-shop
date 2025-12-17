import { Clock, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Version {
  version_number: string
  version_name: string
  created_at: string
  is_latest: boolean
  download_count: number
}

interface ProductVersionHistoryProps {
  versions: Version[]
}

export function ProductVersionHistory({ versions }: ProductVersionHistoryProps) {
  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm ring-1 ring-foreground/10 p-5">
      <h3 className="text-sm font-semibold mb-4">История версий</h3>
      <div className="space-y-3">
        {versions.map((version, index) => (
          <div key={index} className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-foreground">{version.version_number} {version.is_latest && '(Последняя)'}</span>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="h-3 w-3" />
                <span>{new Date(version.created_at).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-1">
                <p className="text-muted-foreground text-xs">{version.version_name}</p>
                 <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Download className="h-3 w-3" />
                    <span>{version.download_count}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

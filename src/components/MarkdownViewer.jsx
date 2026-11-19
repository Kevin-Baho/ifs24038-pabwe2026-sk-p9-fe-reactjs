import React, { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownViewer({ content = '' }) {
  const viewerElRef = useRef(null)
  const viewerInstanceRef = useRef(null)

  useEffect(() => {
    const viewer = Editor.factory({
      el: viewerElRef.current,
      viewer: true,
      initialValue: content,
      usageStatistics: false,
    })
    viewerInstanceRef.current = viewer

    return () => {
      viewer.destroy()
      viewerInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    viewerInstanceRef.current.setMarkdown(content)
  }, [content])

  return (
    <div className="toastui-viewer-container" data-testid="markdown-viewer">
      <div ref={viewerElRef} />
    </div>
  )
}

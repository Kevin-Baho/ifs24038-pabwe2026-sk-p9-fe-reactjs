import React, { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({
  value = '',
  onChange = () => {},
  height = '280px',
  placeholder = 'Tuliskan konten artikel dalam format Markdown...',
}) {
  const editorElRef = useRef(null)
  const editorInstanceRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')

    const editor = new Editor({
      el: editorElRef.current,
      height: height,
      initialEditType: 'markdown',
      previewStyle: 'tab',
      initialValue: value,
      placeholder: placeholder,
      usageStatistics: false,
      theme: isDark ? 'dark' : 'light',
      events: {
        change: () => {
          onChangeRef.current(editor.getMarkdown())
        },
      },
    })
    editorInstanceRef.current = editor

    return () => {
      editor.destroy()
      editorInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const editor = editorInstanceRef.current
    if (value !== editor.getMarkdown()) {
      editor.setMarkdown(value, false)
    }
  }, [value])

  return (
    <div
      className="toastui-editor-container w-full border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white text-slate-800"
      data-testid="markdown-editor"
    >
      <div ref={editorElRef} />
    </div>
  )
}

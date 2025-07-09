"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import { useEffect, useRef } from "react";
import { Toolbar } from "./toolbar";
import { useEditorStore } from "@/app/lib/store";

interface TextEditorProps {
  onUpdate?: (content: any) => void;
  onCursorMove?: (position: { x: number; y: number; from: number; to: number }) => void;
}

export function TextEditor({ onUpdate, onCursorMove }: TextEditorProps) {
  const { document: initialDocument } = useEditorStore();
  const lastCursorMove = useRef(0);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"],
      }),
    ],
    content: initialDocument || { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8",
      },
    },
    onUpdate: ({ editor }: { editor: any }) => {
      const json = editor.getJSON();
      onUpdate?.(json);
    },
    onSelectionUpdate: ({ editor }: { editor: any }) => {
      const now = Date.now();
      if (now - lastCursorMove.current < 100) return;
      lastCursorMove.current = now;

      const { from, to } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      
      if (editorRef.current) {
        const rect = editorRef.current.getBoundingClientRect();
        const x = coords.left;
        const y = coords.top;
        
        onCursorMove?.({ x, y, from, to });
      }
    },
  });

  // Update editor content when document changes from WebSocket
  useEffect(() => {
    if (editor && initialDocument) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(initialDocument);
      
      if (currentContent !== newContent) {
        editor.commands.setContent(initialDocument, false);
      }
    }
  }, [initialDocument, editor]);

  return (
    <div className="flex flex-col h-full" ref={editorRef}>
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}


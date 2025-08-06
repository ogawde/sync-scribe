"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Download,
  FileText,
  Code2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportToPDF } from "@/app/lib/export-pdf";
import { exportToWord } from "@/app/lib/export-docx";

interface ToolbarProps {
  editor: Editor | null;
}


export function Toolbar({ editor }: ToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handlePDFExport = async () => {
    setIsExporting(true);
    const editorElement = document.querySelector(".tiptap") as HTMLElement;
    if (editorElement) {
      await exportToPDF(editorElement);
    }
    setIsExporting(false);
  };

  const handleWordExport = async () => {
    setIsExporting(true);
    const content = editor?.getJSON();
    await exportToWord(content);
    setIsExporting(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="border-b bg-background p-2 flex flex-wrap items-center justify-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 1 (Ctrl + Alt + 1)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 2 (Ctrl + Alt + 2)</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold (Ctrl + B)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic (Ctrl + I)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive("underline") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive("code") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Inline code (Ctrl + E)</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bullet list</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePDFExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export as PDF</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWordExport}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Word
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export as Word</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

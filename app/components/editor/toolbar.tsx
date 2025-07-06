"use client";

import { Editor } from "@tiptap/react";
import { Button } from "@/app/components/ui/button";
import { Select } from "@/app/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Download,
  FileText,
} from "lucide-react";
import { exportToPDF } from "@/app/lib/export-pdf";
import { exportToWord } from "@/app/lib/export-docx";
import { useState } from "react";

interface ToolbarProps {
  editor: Editor | null;
}

const FONTS = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Courier New",
  "Georgia",
  "Arial",
];

export function Toolbar({ editor }: ToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!editor) {
    return null;
  }

  const handlePDFExport = async () => {
    setIsExporting(true);
    const editorElement = document.querySelector('.tiptap') as HTMLElement;
    if (editorElement) {
      await exportToPDF(editorElement);
    }
    setIsExporting(false);
  };

  const handleWordExport = async () => {
    setIsExporting(true);
    const content = editor.getJSON();
    await exportToWord(content);
    setIsExporting(false);
  };

  return (
    <div className="border-b bg-background p-2 flex flex-wrap items-center gap-2">
      {/* Headings */}
      <Button
        variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Formatting */}
      <Button
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("underline") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lists */}
      <Button
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Font Family */}
      <Select
        value={editor.getAttributes("textStyle").fontFamily || "Inter"}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          editor.chain().focus().setFontFamily(e.target.value).run()
        }
        className="h-9 w-40"
      >
        {FONTS.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </Select>

      <div className="flex-1" />

      {/* Export Buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePDFExport}
        disabled={isExporting}
        title="Export as PDF"
      >
        <Download className="h-4 w-4 mr-2" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleWordExport}
        disabled={isExporting}
        title="Export as Word"
      >
        <FileText className="h-4 w-4 mr-2" />
        Word
      </Button>
    </div>
  );
}


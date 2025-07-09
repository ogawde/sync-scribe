import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: any }>;
  attrs?: any;
}

function convertTipTapToDocx(tipTapDoc: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (!tipTapDoc || !tipTapDoc.content) {
    return [new Paragraph({ text: '' })];
  }

  tipTapDoc.content.forEach((node: TipTapNode) => {
    if (node.type === 'paragraph') {
      const textRuns = extractTextRuns(node);
      paragraphs.push(new Paragraph({ children: textRuns }));
    } else if (node.type === 'heading') {
      const level = node.attrs?.level || 1;
      const textRuns = extractTextRuns(node);
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        })
      );
    } else if (node.type === 'bulletList') {
      node.content?.forEach((listItem: TipTapNode) => {
        if (listItem.type === 'listItem') {
          listItem.content?.forEach((itemContent: TipTapNode) => {
            const textRuns = extractTextRuns(itemContent);
            paragraphs.push(
              new Paragraph({
                children: textRuns,
                bullet: { level: 0 },
              })
            );
          });
        }
      });
    }
  });

  return paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: '' })];
}

function extractTextRuns(node: TipTapNode): TextRun[] {
  const textRuns: TextRun[] = [];

  if (node.content) {
    node.content.forEach((childNode: TipTapNode) => {
      if (childNode.type === 'text') {
        const isBold = childNode.marks?.some((mark) => mark.type === 'bold');
        const isItalic = childNode.marks?.some((mark) => mark.type === 'italic');
        const isUnderline = childNode.marks?.some((mark) => mark.type === 'underline');
        const fontFamily = childNode.marks?.find((mark) => mark.type === 'textStyle')?.attrs?.fontFamily;

        textRuns.push(
          new TextRun({
            text: childNode.text || '',
            bold: isBold,
            italics: isItalic,
            underline: isUnderline ? {} : undefined,
            font: fontFamily,
          })
        );
      } else if (childNode.content) {
        textRuns.push(...extractTextRuns(childNode));
      }
    });
  } else if (node.text) {
    textRuns.push(new TextRun({ text: node.text }));
  }

  return textRuns.length > 0 ? textRuns : [new TextRun({ text: '' })];
}

export async function exportToWord(editorContent: any, filename: string = 'document.docx') {
  try {
    const paragraphs = convertTipTapToDocx(editorContent);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}


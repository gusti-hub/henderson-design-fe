import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension, Node } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { plainToHtml } from '../utils/richTextUtils';

// Re-export utilities so existing import paths keep working.
export { isHtml, plainToHtml, renderRichText, renderRichTextHtml } from '../utils/richTextUtils';

// ─── Toolbar helpers ──────────────────────────────────────────────────────────
const Btn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    className={`px-2 py-1 rounded text-xs font-medium transition-colors select-none ${
      active ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-4 bg-gray-200 mx-0.5 self-center" />;

// ─── Main Editor ──────────────────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder = '', minRows = 4 }) => {
  // All TipTap extension creation is deferred into useMemo to avoid
  // circular-initialization (TDZ) errors in production bundles.
  const extensions = useMemo(() => {
    // Extend Paragraph with addAttributes() so padding-left is correctly
    // serialized to HTML by getHTML() — addGlobalAttributes doesn't reliably
    // emit style attributes in TipTap v3.
    const CustomParagraph = Paragraph.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          indent: {
            default: null,
            // Store the full CSS value string (e.g. "3.93em" or legacy "55px")
            // so the value renders correctly at any font-size context.
            parseHTML: (el) => el.style?.paddingLeft || null,
            renderHTML: (attrs) =>
              attrs.indent ? { style: `padding-left: ${attrs.indent}` } : {},
          },
        };
      },
    });

    // Tab key inserts a fixed-width inline span so text can be aligned
    // without moving focus to the next form field.
    const TabStop = Node.create({
      name: 'tabStop',
      group: 'inline',
      inline: true,
      atom: true,
      selectable: false,
      parseHTML() { return [{ tag: 'span[data-tab]' }]; },
      renderHTML() { return ['span', { 'data-tab': '1', class: 'rte-tab' }]; },
      addKeyboardShortcuts() {
        return {
          Tab: () => this.editor.chain().focus().insertContent({ type: 'tabStop' }).run(),
        };
      },
    });

    // When Enter is pressed after a "Label: value" line, the next line
    // is automatically indented to align with the value. Enter on an
    // empty indented line resets to normal; non-empty indented + Enter
    // continues the indent (TipTap copies the attribute naturally).
    const ColonHangingIndent = Extension.create({
      name: 'colonHangingIndent',
      addKeyboardShortcuts() {
        return {
          Enter: () => {
            const editor = this.editor;
            const { $from } = editor.state.selection;
            const node = $from.parent;

            if (
              editor.isActive('listItem') ||
              editor.isActive('bulletList') ||
              editor.isActive('orderedList')
            ) return false;

            if (node.attrs?.indent) {
              if (!node.textContent.trim()) {
                editor.chain().updateAttributes('paragraph', { indent: null }).run();
                return true;
              }
              return false;
            }

            const text = node.textContent;
            const colonIdx = text.indexOf(': ');
            if (colonIdx === -1) return false;

            // Use coordsAtPos to get the exact rendered X of the first char
            // after ": " — accurate regardless of bold/font-size on the label.
            try {
              const afterColonPos = $from.start() + colonIdx + 2;
              const coords = editor.view.coordsAtPos(afterColonPos);
              const tiptapEl = editor.view.dom;
              const rect = tiptapEl.getBoundingClientRect();
              const style = window.getComputedStyle(tiptapEl);
              const padLeft = parseFloat(style.paddingLeft) || 0;
              const fontSize = parseFloat(style.fontSize) || 14;
              const px = coords.left - rect.left - padLeft;
              if (px <= 0) return false;
              // Store as em so the indent scales with font-size in any context
              // (editor uses text-sm/14px; Proposal/PO may use a larger font).
              const em = (px / fontSize).toFixed(3);
              editor.chain().splitBlock().updateAttributes('paragraph', { indent: `${em}em` }).run();
              return true;
            } catch {
              return false;
            }
          },
        };
      },
    });

    return [
      StarterKit.configure({ heading: false, paragraph: false }),
      CustomParagraph,
      TextAlign.configure({ types: ['paragraph'] }),
      Underline,
      TabStop,
      ColonHangingIndent,
    ];
  }, []);

  const editor = useEditor({
    extensions,
    content: plainToHtml(value),
    enableInputRules: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'outline-none px-3 py-2 text-sm text-gray-800 leading-relaxed',
        'data-placeholder': placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = plainToHtml(value);
    if (editor.getHTML() !== incoming) {
      editor.commands.setContent(incoming, false);
    }
  }, [value]);

  if (!editor) return null;

  const minH = `${minRows * 1.6 + 1.5}rem`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#005670]/20 focus-within:border-[#005670] bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Align left">≡←</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Center">≡</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Align right">→≡</Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet list">•—</Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Numbered list">1—</Btn>
      </div>

      {/* Editor area */}
      <div style={{ minHeight: minH }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;

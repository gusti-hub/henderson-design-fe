import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension, Node } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';

// ─── Detect HTML vs legacy plain text ────────────────────────────────────────
export const isHtml = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(val);
};

// ─── Measure pixel width of a label string using the editor's actual font ─────
const measureLabel = (label, editorDom) => {
  try {
    const el = document.createElement('span');
    const font = editorDom
      ? window.getComputedStyle(editorDom).font
      : '14px ui-sans-serif,system-ui,sans-serif';
    el.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${font};`;
    el.textContent = label;
    document.body.appendChild(el);
    const w = el.offsetWidth;
    document.body.removeChild(el);
    return Math.ceil(w);
  } catch {
    return null;
  }
};

// ─── Convert legacy plain text to HTML ───────────────────────────────────────
export const plainToHtml = (text) => {
  if (!text) return '<p></p>';
  if (isHtml(text)) return text;
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withBold = escaped
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '<strong>$1</strong>');
  return withBold
    .split('\n')
    .map(line => `<p>${line || '<br>'}</p>`)
    .join('');
};

// ─── Render rich text in read-only view (Proposal, PO, Bill Invoice) ─────────
export const renderRichText = (value, style = {}) => {
  if (!value) return null;
  const html = isHtml(value) ? value : plainToHtml(value);
  return (
    <div
      className="rich-text-output"
      style={{ lineHeight: '1.5', ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// ─── Render as HTML string (for print / measurement sandboxes) ────────────────
export const renderRichTextHtml = (value) => {
  if (!value) return '';
  return isHtml(value) ? value : plainToHtml(value);
};

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
            parseHTML: (el) => {
              const v = el.style?.paddingLeft;
              return v ? parseInt(v) : null;
            },
            renderHTML: (attrs) =>
              attrs.indent ? { style: `padding-left: ${attrs.indent}px` } : {},
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

            const label = text.substring(0, colonIdx + 2);
            const px = measureLabel(label, editor.view.dom);
            if (!px) return false;

            editor.chain().splitBlock().updateAttributes('paragraph', { indent: px }).run();
            return true;
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

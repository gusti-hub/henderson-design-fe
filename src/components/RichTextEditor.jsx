import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';

// ─── Detect HTML vs legacy plain text ────────────────────────────────────────
export const isHtml = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(val);
};

// ─── Measure pixel width of a label string (for colon hanging indent) ────────
const measureLabel = (label) => {
  try {
    const el = document.createElement('span');
    el.style.cssText =
      'position:absolute;visibility:hidden;white-space:nowrap;' +
      'font-size:14px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;';
    el.textContent = label;
    document.body.appendChild(el);
    const w = el.offsetWidth;
    document.body.removeChild(el);
    return Math.ceil(w) + 2;
  } catch {
    return null;
  }
};

// ─── Convert legacy plain text to HTML ───────────────────────────────────────
// Handles: **bold** (double asterisk), *bold* (single asterisk — legacy format)
export const plainToHtml = (text) => {
  if (!text) return '<p></p>';
  if (isHtml(text)) return text;
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withBold = escaped
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')           // **bold**
    .replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '<strong>$1</strong>'); // *bold*
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

// ─── Custom Extension: colon hanging indent ───────────────────────────────────
// When Enter is pressed on a line containing ": ", the next line is automatically
// indented to align with the text after the colon.
// Pressing Enter on an already-indented line resets to a normal paragraph.
const ColonHangingIndent = Extension.create({
  name: 'colonHangingIndent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          indent: {
            default: null,
            parseHTML: (el) => {
              const v = el.style?.paddingLeft;
              return v ? parseInt(v) : null;
            },
            renderHTML: (attrs) =>
              attrs.indent ? { style: `padding-left: ${attrs.indent}px` } : {},
          },
        },
      },
    ];
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const editor = this.editor;
        const { $from } = editor.state.selection;
        const node = $from.parent;

        // Don't intercept inside lists
        if (
          editor.isActive('listItem') ||
          editor.isActive('bulletList') ||
          editor.isActive('orderedList')
        ) {
          return false;
        }

        // Already-indented line → next Enter resets to normal paragraph
        if (node.attrs?.indent) {
          editor.chain().splitBlock().updateAttributes('paragraph', { indent: null }).run();
          return true;
        }

        const text = node.textContent;
        const colonIdx = text.indexOf(': ');
        if (colonIdx === -1) return false; // no ": " pattern → default Enter

        const label = text.substring(0, colonIdx + 2); // e.g. "Lighting: "
        const px = measureLabel(label);
        if (!px) return false;

        editor.chain().splitBlock().updateAttributes('paragraph', { indent: px }).run();
        return true;
      },
    };
  },
});

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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      TextAlign.configure({ types: ['paragraph'] }),
      Underline,
      ColonHangingIndent,
    ],
    content: plainToHtml(value),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'outline-none px-3 py-2 text-sm text-gray-800 leading-relaxed',
        'data-placeholder': placeholder,
      },
    },
  });

  // Sync when external value changes (e.g. "Copy from Client" button)
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

      <style>{`
        .tiptap p { margin: 0 0 2px; }
        .tiptap ul { list-style: disc; padding-left: 1.2em; margin: 2px 0; }
        .tiptap ol { list-style: decimal; padding-left: 1.2em; margin: 2px 0; }
        .tiptap li { margin: 1px 0; }
        .tiptap p:last-child { margin-bottom: 0; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af; pointer-events: none; float: left; height: 0;
        }
        .rich-text-output p { margin: 0 0 2px; }
        .rich-text-output ul { list-style: disc; padding-left: 1.2em; margin: 2px 0; }
        .rich-text-output ol { list-style: decimal; padding-left: 1.2em; margin: 2px 0; }
        .rich-text-output li { margin: 1px 0; }
        .rich-text-output p:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;

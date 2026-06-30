import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useRef } from 'react';
import {
  TextB, TextItalic, TextStrikethrough, TextHTwo, TextHThree,
  ListBullets, ListNumbers, Quotes, Minus,
  ArrowCounterClockwiseIcon, ArrowClockwiseIcon,
} from '@phosphor-icons/react';

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarBtn({ onClick, active, disabled, title, children }: ToolbarBtnProps) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      style={{
        alignItems: 'center',
        background: active
          ? 'color-mix(in srgb, var(--color-accent) 18%, transparent)'
          : 'transparent',
        border: 'none',
        borderRadius: 6,
        color: active
          ? 'var(--color-accent)'
          : disabled
          ? 'var(--color-border)'
          : 'var(--color-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        height: 30,
        justifyContent: 'center',
        padding: '0 7px',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div style={{
      background: 'var(--color-border)',
      height: 20,
      margin: '0 4px',
      width: 1,
      flexShrink: 0,
    }} />
  );
}

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  charLimit?: number;
  readOnly?: boolean;
}

export default function RichTextEditor({ content, onChange, placeholder, charLimit, readOnly }: Props) {
  const onChangeRef = useRef(onChange);
  // eslint-disable-next-line react-hooks/refs
  onChangeRef.current = onChange; // stable callback ref pattern — safe, not used in render
  const suppressRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write about your day…' }),
      CharacterCount.configure(charLimit !== undefined ? { limit: charLimit } : {}),
    ],
    content,
    editable: !readOnly,
  });

  // Wire up update event manually so onChange stays current
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (suppressRef.current) { suppressRef.current = false; return; }
      onChangeRef.current(editor.getHTML());
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor]);

  // Sync when content changes externally (entry loaded or date switch)
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (editor.getHTML() !== content) {
        suppressRef.current = true;
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount.characters() as number;
  const wordCount = editor.storage.characterCount.words() as number;
  const atLimit = charLimit !== undefined && charCount >= charLimit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      {!readOnly && (
        <div style={{
          alignItems: 'center',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          padding: '6px 8px',
        }}>
          <ToolbarBtn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <ArrowCounterClockwiseIcon size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <ArrowClockwiseIcon size={15} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <TextB size={15} weight="bold" />
          </ToolbarBtn>
          <ToolbarBtn title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <TextItalic size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
            <TextStrikethrough size={15} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
            <TextHTwo size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
            <TextHThree size={15} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <ListBullets size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
            <ListNumbers size={15} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
            <Quotes size={15} />
          </ToolbarBtn>
          <ToolbarBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={15} />
          </ToolbarBtn>
        </div>
      )}

      {/* Editor area */}
      <div
        className="journal-editor"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: readOnly
            ? 'var(--radius-lg)'
            : '0 0 var(--radius-lg) var(--radius-lg)',
          cursor: readOnly ? 'default' : 'text',
          minHeight: 300,
          padding: '14px 16px',
        }}
        onClick={() => !readOnly && editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div style={{
        alignItems: 'center',
        display: 'flex',
        gap: 8,
        justifyContent: 'space-between',
        marginTop: 8,
        padding: '0 2px',
      }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.73rem' }}>
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </span>
        {charLimit !== undefined && (
          <span style={{
            color: atLimit ? 'var(--color-danger)' : 'var(--color-text-muted)',
            fontSize: '0.73rem',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {charCount} / {charLimit} chars
            {atLimit && ' · Upgrade for unlimited'}
          </span>
        )}
      </div>
    </div>
  );
}

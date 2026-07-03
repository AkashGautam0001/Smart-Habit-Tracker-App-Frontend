import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useRef } from 'react';
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  Quotes,
  Minus,
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarBtnProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        'size-[30px]',
        active && 'bg-primary/18 text-primary hover:bg-primary/18 hover:text-primary',
        disabled && 'text-border',
      )}
    >
      {children}
    </Button>
  );
}

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  charLimit?: number;
  readOnly?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  charLimit,
  readOnly,
}: Props) {
  const onChangeRef = useRef(onChange);
  // eslint-disable-next-line react-hooks/refs
  onChangeRef.current = onChange;
  const suppressRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write about your day…',
      }),
      CharacterCount.configure(charLimit !== undefined ? { limit: charLimit } : {}),
    ],
    content,
    editable: !readOnly,
  });

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (suppressRef.current) {
        suppressRef.current = false;
        return;
      }
      onChangeRef.current(editor.getHTML());
    };
    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
    };
  }, [editor]);

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
    <div className="flex flex-col">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-border bg-card px-2 py-1.5">
          <ToolbarBtn
            title="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <ArrowCounterClockwiseIcon size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Redo (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <ArrowClockwiseIcon size={15} />
          </ToolbarBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarBtn
            title="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <TextB size={15} weight="bold" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Italic (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <TextItalic size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
          >
            <TextStrikethrough size={15} />
          </ToolbarBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarBtn
            title="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            <TextHTwo size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
          >
            <TextHThree size={15} />
          </ToolbarBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarBtn
            title="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <ListBullets size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <ListNumbers size={15} />
          </ToolbarBtn>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <ToolbarBtn
            title="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          >
            <Quotes size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={15} />
          </ToolbarBtn>
        </div>
      )}

      <div
        className={cn(
          'min-h-[300px] border border-border bg-card px-4 py-3.5',
          readOnly ? 'cursor-default rounded-lg' : 'cursor-text rounded-b-lg',
        )}
        onClick={() => !readOnly && editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <span className="text-[0.73rem] text-muted-foreground">
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </span>
        {charLimit !== undefined && (
          <span
            className={cn(
              'text-[0.73rem] tabular-nums',
              atLimit ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {charCount} / {charLimit} chars
            {atLimit && ' · Upgrade for unlimited'}
          </span>
        )}
      </div>
    </div>
  );
}

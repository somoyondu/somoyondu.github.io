import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo, Undo,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { MediaPickerModal } from './MediaPicker';

const BUTTON = 'rounded p-1.5 text-slate-600 hover:bg-slate-200';
const ACTIVE = 'bg-brand text-white hover:bg-brand';

export function RichTextEditor({
  value, onChange, placeholder = 'এখানে লিখুন…',
}: { value?: string; onChange: (html: string) => void; placeholder?: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
    ],
    content: value ?? '',
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[240px] px-4 py-3 focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const btn = (active: boolean) => `${BUTTON} ${active ? ACTIVE : ''}`;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <button type="button" className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()} title="বোল্ড">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()} title="ইটালিক">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="হেডিং">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()} title="বুলেট তালিকা">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()} title="সংখ্যায়িত তালিকা">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('blockquote'))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()} title="উদ্ধৃতি">
          <Quote className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('link'))}
          onClick={() => {
            const url = window.prompt('লিংক দিন', editor.getAttributes('link').href ?? 'https://');
            if (url === null) return;
            if (!url) return editor.chain().focus().unsetLink().run();
            editor.chain().focus().setLink({ href: url }).run();
          }}
          title="লিংক">
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" className={BUTTON} onClick={() => setPickerOpen(true)} title="ছবি">
          <ImagePlus className="h-4 w-4" />
        </button>
        <div className="ml-auto flex gap-1">
          <button type="button" className={BUTTON} onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-4 w-4" />
          </button>
          <button type="button" className={BUTTON} onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="posts"
        onSelect={(media) => {
          const m = Array.isArray(media) ? media[0] : media;
          const url = m.secureUrl.replace('/upload/', '/upload/w_1000,q_auto,f_auto/');
          editor.chain().focus().setImage({ src: url, alt: m.alt ?? '' }).run();
        }}
      />
    </div>
  );
}

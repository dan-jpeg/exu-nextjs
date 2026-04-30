'use client';

import { useState, useEffect, useRef, type ReactNode, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import SiloHoverButton from '@/components/admin/SiloHoverButton';
import type { Work, Video, Exhibition, MediaItem, WorkIncluded, ContentItem } from '@/lib/types';

type Tab = 'works' | 'videos' | 'exhibitions';
type FontPreset = 'serif' | 'sans' | 'mono';

const fontFamilies: Record<FontPreset, string> = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: '"Alte Haas Grotesk", "Helvetica Neue", Arial, sans-serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
};

const surfaceInputClass =
  'w-full rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3 text-sm text-stone-800 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] outline-none transition focus:border-stone-500 focus:bg-white focus:ring-4 focus:ring-stone-200/60';
const surfaceLabelClass = 'text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500';
const plainTextClass =
  'min-h-[120px] resize-y rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500 focus:bg-white focus:ring-4 focus:ring-stone-200/60';

function fieldLabel(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function fieldPlaceholder(field: string) {
  if (field === 'safeTitle') return 'Safe title / URL slug';
  return fieldLabel(field);
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={surfaceLabelClass}>{label}</span>
      {children}
      {hint ? <span className="text-xs text-stone-400">{hint}</span> : null}
    </label>
  );
}

function FormShell({
  title,
  subtitle,
  onCancel,
  children,
}: {
  title: string;
  subtitle: string;
  onCancel?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl rounded-[2rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,239,0.96))] p-6 shadow-[0_24px_80px_rgba(28,25,23,0.08)] md:p-8">
      <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">{subtitle}</p>
          <h2 className="mt-2 text-2xl font-light tracking-[0.04em] text-stone-900">{title}</h2>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-stone-300/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-stone-500 transition hover:border-stone-500 hover:text-stone-900"
          >
            Cancel
          </button>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 160,
  blockFontSize,
  onBlockFontSizeChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minHeight?: number;
  blockFontSize?: number;
  onBlockFontSizeChange?: (value: number) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFont, setActiveFont] = useState<FontPreset>('serif');
  const fontSizeOptions = [12, 14, 16, 18, 20, 24];

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function run(command: string, commandValue?: string) {
    focusEditor();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? '');
  }

  function applyFont(font: FontPreset) {
    setActiveFont(font);
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontName', false, fontFamilies[font]);
    } else {
      editor.style.fontFamily = fontFamilies[font];
    }

    onChange(editor.innerHTML);
    focusEditor();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className={surfaceLabelClass}>{label}</span>
        <div className="flex flex-wrap items-center gap-4">
          {onBlockFontSizeChange ? (
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone-500">
              Size
              <select
                value={blockFontSize ?? 14}
                onChange={(e) => onBlockFontSizeChange(Number(e.target.value))}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs tracking-normal text-stone-700 outline-none"
              >
                {fontSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {(['serif', 'sans', 'mono'] as FontPreset[]).map((font) => (
              <button
                key={font}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFont(font)}
                className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] transition ${
                  activeFont === font
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800'
                }`}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-stone-200/80 bg-white/85 shadow-[0_10px_30px_rgba(28,25,23,0.04)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200/80 px-4 py-3">
          {[
            ['bold', 'Bold', 'B'],
            ['italic', 'Italic', 'I'],
            ['underline', 'Underline', 'U'],
            ['insertUnorderedList', 'Bullets', '• List'],
            ['insertOrderedList', 'Numbers', '1. List'],
            ['formatBlock', 'Quote', 'Quote'],
          ].map(([command, title, text]) => (
            <button
              key={title}
              type="button"
              title={title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(command, command === 'formatBlock' ? 'blockquote' : undefined)}
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-600 transition hover:border-stone-400 hover:bg-stone-100 hover:text-stone-900"
            >
              {text}
            </button>
          ))}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run('removeFormat')}
            className="ml-auto rounded-full px-3 py-1.5 text-xs text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            Clear
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={(e) => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
          className="admin-rich-text min-h-[160px] px-4 py-4 text-sm leading-7 text-stone-800 outline-none empty:before:pointer-events-none empty:before:text-stone-300 empty:before:content-[attr(data-placeholder)]"
          style={{ minHeight, fontFamily: fontFamilies[activeFont], fontSize: blockFontSize ? `${blockFontSize}px` : undefined }}
        />
      </div>
    </div>
  );
}

function LayoutGuide({
  marginX = 0,
  paddingTop = 0,
  paddingBottom = 0,
}: {
  marginX?: number;
  paddingTop?: number;
  paddingBottom?: number;
}) {
  const insetPercent = Math.max(0, Math.min(30, (marginX / 240) * 100));
  const topPercent = Math.max(8, Math.min(32, (paddingTop / 160) * 100));
  const bottomPercent = Math.max(8, Math.min(32, (paddingBottom / 160) * 100));

  return (
    <div className="rounded-[1.4rem] border border-stone-200/80 bg-stone-50/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Layout guide</span>
        <span className="text-xs text-stone-400">Margins = outer inset, padding = vertical breathing room</span>
      </div>
      <div className="rounded-[1.2rem] border border-dashed border-stone-300 bg-white p-3">
        <div
          className="rounded-[1rem] bg-stone-100 px-3 py-2"
          style={{ paddingTop: `${topPercent}%`, paddingBottom: `${bottomPercent}%` }}
        >
          <div
            className="rounded-[0.8rem] border border-stone-300 bg-white px-4 py-3 text-center text-xs text-stone-500"
            style={{ marginLeft: `${insetPercent}%`, marginRight: `${insetPercent}%` }}
          >
            Text column preview
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-stone-400 md:grid-cols-3">
        <div>Horizontal margin: {marginX}px</div>
        <div>Padding top: {paddingTop}px</div>
        <div>Padding bottom: {paddingBottom}px</div>
      </div>
    </div>
  );
}

// ── Upload helper ────────────────────────────────────────────────────────────

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).url;
}

function newContentItemId() {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── ContentItemEditor ────────────────────────────────────────────────────────

function ContentItemEditor({
  items,
  onChange,
}: {
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const updated = [...items];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    onChange(updated.map((item, i) => ({ ...item, order: i })));
  }

  function remove(index: number) {
    onChange(
      items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i }))
    );
  }

  function updateField(index: number, field: keyof ContentItem, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: ContentItem[] = await Promise.all(
        files.map(async (f) => ({
          id: newContentItemId(),
          type: 'image' as const,
          url: await uploadFile(f),
          caption: '',
          order: items.length,
        }))
      );
      onChange([...items, ...uploaded].map((item, i) => ({ ...item, order: i })));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function addTextBlock() {
    onChange([
      ...items,
      {
        id: newContentItemId(),
        type: 'text',
        text: '',
        fontSize: 14,
        marginX: 0,
        paddingTop: 0,
        paddingBottom: 0,
        order: items.length,
      },
    ]);
  }

  return (
    <div className="mt-2 rounded-[1.8rem] border border-stone-200/80 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_10px_40px_rgba(28,25,23,0.04)]">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full border border-stone-300/80 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
        >
          Add image
        </button>
        <button
          type="button"
          onClick={addTextBlock}
          className="rounded-full border border-stone-300/80 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
        >
          Add text
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {uploading && <span className="text-xs text-stone-400">Uploading media...</span>}
      </div>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-400">
          No content yet. Start with an image or a formatted text block.
        </p>
      )}
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex gap-3 rounded-[1.6rem] border border-stone-200/80 bg-white/90 p-3 shadow-[0_6px_24px_rgba(28,25,23,0.05)]"
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="h-8 w-8 rounded-full border border-stone-200 text-xs text-stone-400 transition hover:border-stone-500 hover:text-stone-900 disabled:opacity-20"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="h-8 w-8 rounded-full border border-stone-200 text-xs text-stone-400 transition hover:border-stone-500 hover:text-stone-900 disabled:opacity-20"
              >
                ↓
              </button>
            </div>

            <div className="flex-1">
              {item.type === 'image' ? (
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-stone-100 md:w-28">
                    <Image
                      src={item.url ?? ''}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Field label="Caption">
                      <input
                        type="text"
                        placeholder="Optional caption"
                        value={item.caption ?? ''}
                        onChange={(e) => updateField(i, 'caption', e.target.value)}
                        className={surfaceInputClass}
                      />
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label="Text block"
                    value={item.text ?? ''}
                    onChange={(nextValue) => updateField(i, 'text', nextValue)}
                    placeholder="Write exhibition text here..."
                    minHeight={180}
                    blockFontSize={item.fontSize ?? 14}
                    onBlockFontSizeChange={(nextValue) => updateField(i, 'fontSize', nextValue)}
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3 text-xs text-stone-500">
                      <span className="uppercase tracking-[0.2em]">Horizontal margin</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="px"
                        value={item.marginX ?? ''}
                        onChange={(e) => updateField(i, 'marginX', Number(e.target.value))}
                        className="w-20 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-center text-xs text-stone-700 outline-none"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3 text-xs text-stone-500">
                      <span className="uppercase tracking-[0.2em]">Padding top</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="px"
                        value={item.paddingTop ?? ''}
                        onChange={(e) => updateField(i, 'paddingTop', Number(e.target.value))}
                        className="w-20 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-center text-xs text-stone-700 outline-none"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3 text-xs text-stone-500">
                      <span className="uppercase tracking-[0.2em]">Padding bottom</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="px"
                        value={item.paddingBottom ?? ''}
                        onChange={(e) => updateField(i, 'paddingBottom', Number(e.target.value))}
                        className="w-20 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-center text-xs text-stone-700 outline-none"
                      />
                    </label>
                  </div>
                  <LayoutGuide
                    marginX={item.marginX ?? 0}
                    paddingTop={item.paddingTop ?? 0}
                    paddingBottom={item.paddingBottom ?? 0}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => remove(i)}
              className="self-start rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Works form ───────────────────────────────────────────────────────────────

const emptyWork = (): Omit<Work, 'id'> => ({
  category: '',
  location: '',
  title: '',
  description: '',
  year: '',
  dimensions: '',
  material: '',
  media: [],
});

function WorkForm({
  initial,
  editingId,
  onSaved,
  onCancel,
}: {
  initial?: Omit<Work, 'id'>;
  editingId?: string;
  onSaved: () => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Omit<Work, 'id'>>(initial ?? emptyWork());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleMediaUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: MediaItem[] = await Promise.all(
        files.map(async (f) => ({
          type: f.type.startsWith('video') ? ('video' as const) : ('image' as const),
          url: await uploadFile(f),
        }))
      );
      setForm((prev) => ({ ...prev, media: [...prev.media, ...uploaded] }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeMedia(index: number) {
    setForm((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
  }

  function moveMedia(from: number, to: number) {
    setForm((prev) => {
      const next = [...prev.media];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...prev, media: next };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const url = editingId ? `/api/works/${editingId}` : '/api/works';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Save failed (${res.status})`);
      }
      if (!editingId) setForm(emptyWork());
      await onSaved();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormShell
      title={editingId ? 'Edit work entry' : 'Add work entry'}
      subtitle="Works archive"
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(['title', 'year', 'category', 'location', 'dimensions', 'material'] as const).map((field) => (
            <Field key={field} label={fieldLabel(field)}>
              <input
                placeholder={fieldPlaceholder(field)}
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
                className={surfaceInputClass}
              />
            </Field>
          ))}
        </div>

        <RichTextEditor
          label="Description"
          value={form.description}
          onChange={(nextValue) => set('description', nextValue)}
          placeholder="Write a polished work description with serif, sans, or mono accents..."
        />

        <section className="rounded-[1.8rem] border border-stone-200/80 bg-[rgba(255,255,255,0.7)] p-5 shadow-[0_10px_40px_rgba(28,25,23,0.04)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={surfaceLabelClass}>Media</p>
              <p className="mt-2 max-w-xl text-sm text-stone-500">
                Upload stills or video files for this work. The first image remains the thumbnail in the archive.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-stone-300/80 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
            >
              Upload media
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleMediaUpload}
          />
          {uploading ? <p className="mt-3 text-sm text-stone-400">Uploading media...</p> : null}
          {form.media.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {form.media.map((m, i) => (
                <li
                  key={i}
                  draggable
                  onDragStart={() => { dragIndex.current = i; setDraggingIndex(i); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex.current !== null && dragIndex.current !== i) {
                      moveMedia(dragIndex.current, i);
                    }
                    dragIndex.current = null;
                    setDraggingIndex(null);
                  }}
                  onDragEnd={() => { dragIndex.current = null; setDraggingIndex(null); }}
                  className={`group relative overflow-hidden rounded-[1.4rem] border border-stone-200/80 bg-white p-3 shadow-[0_8px_28px_rgba(28,25,23,0.05)] cursor-grab transition-opacity ${draggingIndex === i ? 'opacity-40' : 'opacity-100'}`}
                >
                  {m.type === 'image' ? (
                    <div className="relative h-40 w-full overflow-hidden rounded-xl">
                      <Image
                        src={m.url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-stone-100 text-xs uppercase tracking-[0.24em] text-stone-400">
                      Video asset
                    </div>
                  )}
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Caption (optional)"
                      value={m.caption ?? ''}
                      onChange={(e) => {
                        setForm((prev) => {
                          const next = [...prev.media];
                          next[i] = { ...next[i], caption: e.target.value };
                          return { ...prev, media: next };
                        });
                      }}
                      className="w-full rounded-xl border border-stone-200/80 bg-white/80 px-3 py-2 text-xs text-stone-700 outline-none transition focus:border-stone-400"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-stone-400">
                    <span>{m.type}</span>
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="rounded-full px-2 py-1 uppercase tracking-[0.18em] transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-400">
              No media added yet.
            </p>
          )}
        </section>

        {saveError && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {saveError}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="self-start rounded-full bg-stone-900 px-6 py-3 text-xs uppercase tracking-[0.24em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : editingId ? 'Update work' : 'Save work'}
        </button>
      </form>
    </FormShell>
  );
}

// ── Videos form ──────────────────────────────────────────────────────────────

const emptyVideo = (): Omit<Video, 'id'> => ({
  title: '',
  safeTitle: '',
  year: '',
  duration: '',
  videoUrl: '',
  thumbnail: '',
});

function VideoForm({
  initial,
  editingId,
  onSaved,
  onCancel,
}: {
  initial?: Omit<Video, 'id'>;
  editingId?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Omit<Video, 'id'>>(initial ?? emptyVideo());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileUpload(field: 'videoUrl' | 'thumbnail', file: File) {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setForm((prev) => ({ ...prev, [field]: url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/videos/${editingId}` : '/api/videos';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      if (!editingId) setForm(emptyVideo());
      onSaved();
      onCancel?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormShell
      title={editingId ? 'Edit video entry' : 'Add video entry'}
      subtitle="Video archive"
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(['title', 'safeTitle', 'year', 'duration'] as const).map((field) => (
            <Field key={field} label={fieldLabel(field)}>
              <input
                placeholder={fieldPlaceholder(field)}
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
                className={surfaceInputClass}
              />
            </Field>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-[1.8rem] border border-stone-200/80 bg-[rgba(255,255,255,0.7)] p-5 shadow-[0_10px_40px_rgba(28,25,23,0.04)]">
            <Field
              label="Video file"
              hint={form.videoUrl ? 'Current uploaded URL shown below.' : 'Upload a .mp4, .mov, or other supported video asset.'}
            >
              <input
                type="file"
                accept="video/*"
                className={surfaceInputClass}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('videoUrl', e.target.files[0])}
              />
            </Field>
            {form.videoUrl ? <p className="mt-3 break-all text-sm text-stone-400">{form.videoUrl}</p> : null}
          </section>

          <section className="rounded-[1.8rem] border border-stone-200/80 bg-[rgba(255,255,255,0.7)] p-5 shadow-[0_10px_40px_rgba(28,25,23,0.04)]">
            <Field label="Thumbnail">
              <input
                type="file"
                accept="image/*"
                className={surfaceInputClass}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('thumbnail', e.target.files[0])}
              />
            </Field>
            {form.thumbnail ? (
              <div className="relative mt-4 h-44 w-full overflow-hidden rounded-[1.2rem] border border-stone-200">
                <Image
                  src={form.thumbnail}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="mt-4 flex h-44 items-center justify-center rounded-[1.2rem] border border-dashed border-stone-200 text-sm text-stone-400">
                Thumbnail preview
              </div>
            )}
          </section>
        </div>

        {uploading ? <p className="text-sm text-stone-400">Uploading asset...</p> : null}

        <button
          type="submit"
          disabled={saving || uploading}
          className="self-start rounded-full bg-stone-900 px-6 py-3 text-xs uppercase tracking-[0.24em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : editingId ? 'Update video' : 'Save video'}
        </button>
      </form>
    </FormShell>
  );
}

// ── Exhibition form ──────────────────────────────────────────────────────────

const emptyExhibition = (): Omit<Exhibition, 'id'> => ({
  category: '',
  title: '',
  location: '',
  url: '',
  date: '',
  contentItems: [],
  header: '',
  subheader: '',
  textContent: '',
  footnote: '',
  workIncluded: [],
});

function ExhibitionForm({
  initial,
  editingId,
  onSaved,
  onCancel,
}: {
  initial?: Omit<Exhibition, 'id'>;
  editingId?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Omit<Exhibition, 'id'>>(initial ?? emptyExhibition());
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addWork() {
    const newWork: WorkIncluded = {
      id: Date.now(),
      title: '',
      year: '',
      dimensions: '',
      material: '',
      description: '',
    };
    setForm((prev) => ({ ...prev, workIncluded: [...prev.workIncluded, newWork] }));
  }

  function updateWork(index: number, field: keyof WorkIncluded, value: string) {
    setForm((prev) => {
      const updated = [...prev.workIncluded];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workIncluded: updated };
    });
  }

  function removeWork(index: number) {
    setForm((prev) => ({
      ...prev,
      workIncluded: prev.workIncluded.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/exhibitions/${editingId}` : '/api/exhibitions';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      if (!editingId) setForm(emptyExhibition());
      onSaved();
      onCancel?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormShell
      title={editingId ? 'Edit exhibition entry' : 'Add exhibition entry'}
      subtitle="Exhibitions archive"
      onCancel={onCancel}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(['title', 'category', 'location', 'url', 'date', 'header', 'subheader'] as const).map((field) => (
            <Field key={field} label={fieldLabel(field)}>
              <input
                placeholder={fieldPlaceholder(field)}
                value={(form[field] as string) ?? ''}
                onChange={(e) => set(field, e.target.value)}
                className={surfaceInputClass}
              />
            </Field>
          ))}
        </div>

        <RichTextEditor
          label="Text content"
          value={form.textContent ?? ''}
          onChange={(nextValue) => set('textContent', nextValue)}
          placeholder="Main curatorial text..."
          minHeight={220}
        />

        <RichTextEditor
          label="Footnote"
          value={form.footnote ?? ''}
          onChange={(nextValue) => set('footnote', nextValue)}
          placeholder="Optional footnote or citation..."
          minHeight={140}
        />

        <section className="rounded-[1.8rem] border border-stone-200/80 bg-[rgba(255,255,255,0.7)] p-5 shadow-[0_10px_40px_rgba(28,25,23,0.04)]">
          <div className="mb-4">
            <p className={surfaceLabelClass}>Content flow</p>
            <p className="mt-2 text-sm text-stone-500">
              Arrange images and styled text blocks in the exact order they should appear on the exhibition page.
            </p>
          </div>
          <ContentItemEditor
            items={form.contentItems ?? []}
            onChange={(items) => setForm((prev) => ({ ...prev, contentItems: items }))}
          />
        </section>

        <section className="rounded-[1.8rem] border border-stone-200/80 bg-[rgba(255,255,255,0.7)] p-5 shadow-[0_10px_40px_rgba(28,25,23,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className={surfaceLabelClass}>Works included</p>
              <p className="mt-2 text-sm text-stone-500">List related works with supporting context.</p>
            </div>
            <button
              type="button"
              onClick={addWork}
              className="rounded-full border border-stone-300/80 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
            >
              Add work
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {form.workIncluded.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-400">
                No related works added yet.
              </p>
            ) : null}
            {form.workIncluded.map((w, i) => (
              <div
                key={i}
                className="rounded-[1.4rem] border border-stone-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(28,25,23,0.05)]"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {(['title', 'year', 'dimensions', 'material'] as const).map((field) => (
                    <Field key={field} label={fieldLabel(field)}>
                      <input
                        placeholder={fieldPlaceholder(field)}
                        value={w[field] as string}
                        onChange={(e) => updateWork(i, field, e.target.value)}
                        className={surfaceInputClass}
                      />
                    </Field>
                  ))}
                </div>
                <div className="mt-4">
                  <RichTextEditor
                    label="Description"
                    value={w.description}
                    onChange={(nextValue) => updateWork(i, 'description', nextValue)}
                    placeholder="Describe the work's role in the exhibition..."
                    minHeight={160}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeWork(i)}
                  className="mt-4 rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-full bg-stone-900 px-6 py-3 text-xs uppercase tracking-[0.24em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : editingId ? 'Update exhibition' : 'Save exhibition'}
        </button>
      </form>
    </FormShell>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('exhibitions');
  const [works, setWorks] = useState<Work[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);

  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadWorks = async () => {
    const res = await fetch('/api/works');
    if (res.ok) setWorks(await res.json());
  };
  const loadVideos = async () => {
    const res = await fetch('/api/videos');
    if (res.ok) setVideos(await res.json());
  };
  const loadExhibitions = async () => {
    const res = await fetch('/api/exhibitions');
    if (res.ok) setExhibitions(await res.json());
  };

  useEffect(() => {
    loadWorks();
    loadVideos();
    loadExhibitions();
  }, []);

  async function deleteItem(collection: string, id: string, reload: () => void) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/${collection}/${id}`, { method: 'DELETE' });
    reload();
  }

  function openAdd() {
    setEditingWork(null);
    setEditingVideo(null);
    setEditingExhibition(null);
    setShowForm(true);
  }

  function openEdit(item: Work | Video | Exhibition) {
    if (tab === 'works') setEditingWork(item as Work);
    if (tab === 'videos') setEditingVideo(item as Video);
    if (tab === 'exhibitions') setEditingExhibition(item as Exhibition);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingWork(null);
    setEditingVideo(null);
    setEditingExhibition(null);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'exhibitions', label: 'exhibitions' },
    { key: 'works', label: 'works' },
    { key: 'videos', label: 'videos' },
  ];

  const activeItems =
    tab === 'works' ? works : tab === 'videos' ? videos : exhibitions;

  function renderItemLabel(item: Work | Video | Exhibition) {
    if (tab === 'works') return (item as Work).title || '—';
    if (tab === 'videos') return (item as Video).title || '—';
    return (item as Exhibition).title || '—';
  }

  const workInitial = editingWork
    ? (({ id: _id, ...rest }) => rest)(editingWork)
    : undefined;
  const videoInitial = editingVideo
    ? (({ id: _id, ...rest }) => rest)(editingVideo)
    : undefined;
  const exhibitionInitial = editingExhibition
    ? (({ id: _id, ...rest }) => rest)(editingExhibition)
    : undefined;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(251,248,244,0.96),_rgba(242,236,228,0.98)_38%,_#efe9e0_100%)] text-stone-900">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_35%,rgba(120,113,108,0.08)_100%)]" />

      <div className="relative px-5 pb-20 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_90px_rgba(28,25,23,0.08)] backdrop-blur-xl md:p-6">
            <div className="flex flex-col gap-6 border-b border-stone-200/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Edie Xu</p>
                <h1 className="mt-2 text-3xl font-light tracking-[0.05em] text-stone-900">Admin studio</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                  Edit the archive, upload media, and compose exhibition writing with a cleaner editorial workspace.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:items-end">
                <div className="flex flex-wrap gap-2 rounded-full border border-stone-200/80 bg-stone-50/80 p-1">
                  {tabs.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                        tab === key
                          ? 'bg-stone-900 text-white shadow-[0_8px_24px_rgba(28,25,23,0.18)]'
                          : 'text-stone-500 hover:bg-white hover:text-stone-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="text-[11px] uppercase tracking-[0.24em] text-stone-400 transition hover:text-stone-900"
                >
                  Log out
                </button>
              </div>
            </div>

            <div className="grid gap-8 pt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.7fr)]">
              <section className="rounded-[1.8rem] border border-stone-200/80 bg-white/70 p-5 shadow-[0_12px_36px_rgba(28,25,23,0.05)]">
                <div className="flex items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
                  <div>
                    <p className={surfaceLabelClass}>Current archive</p>
                    <p className="mt-2 text-sm text-stone-500">
                      {activeItems.length} {activeItems.length === 1 ? 'entry' : 'entries'} in {tab}
                    </p>
                  </div>
                  <button
                    onClick={openAdd}
                    className="rounded-full bg-stone-900 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white transition hover:bg-stone-700"
                  >
                    Add new
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {activeItems.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-stone-200 px-4 py-10 text-center text-sm text-stone-400">
                      No entries yet in this section.
                    </p>
                  ) : (
                    activeItems.map((item) => (
                      <article
                        key={item.id}
                        className="group flex items-center justify-between gap-4 rounded-[1.4rem] border border-stone-200/80 bg-[rgba(255,255,255,0.9)] px-4 py-4 shadow-[0_8px_28px_rgba(28,25,23,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(28,25,23,0.08)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-stone-800">{renderItemLabel(item)}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-stone-400">{tab.slice(0, -1)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-stone-500 transition hover:border-stone-500 hover:text-stone-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deleteItem(
                                tab === 'works' ? 'works' : tab === 'videos' ? 'videos' : 'exhibitions',
                                item.id,
                                tab === 'works' ? loadWorks : tab === 'videos' ? loadVideos : loadExhibitions
                              )
                            }
                            className="rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-stone-300 transition hover:bg-rose-50 hover:text-rose-500"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <aside className="flex flex-col justify-between rounded-[1.8rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(247,242,236,0.95))] p-5 shadow-[0_12px_36px_rgba(28,25,23,0.05)]">
                <div>
                  <p className={surfaceLabelClass}>Quick actions</p>
                  <h2 className="mt-3 text-2xl font-light tracking-[0.04em]">Compose and publish</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    Rich text is available inside work descriptions, exhibition copy, footnotes, and exhibition text blocks.
                  </p>
                  <div className="mt-6 grid gap-3">
                    {[
                      'Serif for editorial notes and curatorial body copy',
                      'Sans for clean labels and contemporary emphasis',
                      'Mono for references, captions, and technical texture',
                    ].map((line) => (
                      <div key={line} className="rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3 text-sm text-stone-600">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-center border-t border-stone-200/80 pt-6">
                  <SiloHoverButton label="+" speed={150} onClick={openAdd} />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10003] overflow-y-auto bg-[rgba(244,239,233,0.78)] px-4 py-6 backdrop-blur-md md:px-8"
          >
            <div className="sticky top-0 z-10 mx-auto mb-6 flex max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-[0_12px_40px_rgba(28,25,23,0.08)] backdrop-blur-xl">
              <span className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                {editingWork?.id || editingVideo?.id || editingExhibition?.id ? 'Editing' : 'Creating'} {tab.slice(0, -1)}
              </span>
              <button
                onClick={closeForm}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-500 transition hover:border-stone-500 hover:text-stone-900"
              >
                Close
              </button>
            </div>

            <div className="pb-8">
              {tab === 'works' && (
                <WorkForm
                  key={editingWork?.id ?? 'new-work'}
                  initial={workInitial}
                  editingId={editingWork?.id}
                  onSaved={async () => { await loadWorks(); closeForm(); }}
                  onCancel={closeForm}
                />
              )}
              {tab === 'videos' && (
                <VideoForm
                  key={editingVideo?.id ?? 'new-video'}
                  initial={videoInitial}
                  editingId={editingVideo?.id}
                  onSaved={() => { loadVideos(); closeForm(); }}
                  onCancel={closeForm}
                />
              )}
              {tab === 'exhibitions' && (
                <ExhibitionForm
                  key={editingExhibition?.id ?? 'new-exhibition'}
                  initial={exhibitionInitial}
                  editingId={editingExhibition?.id}
                  onSaved={() => { loadExhibitions(); closeForm(); }}
                  onCancel={closeForm}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

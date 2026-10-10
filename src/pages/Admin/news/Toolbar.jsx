// src/pages/Admin/news/Toolbar.jsx
// The formatting bar above the article, laid out like a word processor's.
import React, { useRef, useState } from "react";
import { useEditorState } from "@tiptap/react";
import { Button, ColorPicker, Dropdown, Input, Popover, Select } from "antd";
import {
  LuAlignCenter,
  LuAlignJustify,
  LuAlignLeft,
  LuAlignRight,
  LuBaseline,
  LuBold,
  LuChevronDown,
  LuFileUp,
  LuHighlighter,
  LuImage,
  LuIndentDecrease,
  LuIndentIncrease,
  LuItalic,
  LuLink,
  LuList,
  LuListOrdered,
  LuMinus,
  LuRedo2,
  LuRemoveFormatting,
  LuStrikethrough,
  LuSubscript,
  LuSuperscript,
  LuTable,
  LuTextQuote,
  LuUnderline,
  LuUndo2,
} from "react-icons/lu";

const BLOCKS = [
  { value: "p", label: "Normal text" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
];

// Fonts every computer and phone already has (all include Cyrillic).
const FONTS = [
  { value: "", label: "Default font" },
  ...[
    ["Arial", "Arial, Helvetica, sans-serif"],
    ["Verdana", "Verdana, Geneva, sans-serif"],
    ["Tahoma", "Tahoma, Geneva, sans-serif"],
    ["Trebuchet MS", "'Trebuchet MS', Helvetica, sans-serif"],
    ["Georgia", "Georgia, serif"],
    ["Times New Roman", "'Times New Roman', Times, serif"],
    ["Garamond", "Garamond, 'Times New Roman', serif"],
    ["Courier New", "'Courier New', Courier, monospace"],
    ["Impact", "Impact, 'Arial Black', sans-serif"],
    ["Comic Sans MS", "'Comic Sans MS', cursive"],
  ].map(([name, stack]) => ({
    value: stack,
    label: <span style={{ fontFamily: stack }}>{name}</span>,
  })),
];

const SIZES = [
  { value: "", label: "Size" },
  ...[10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map((n) => ({
    value: `${n}px`,
    label: String(n),
  })),
];

const SWATCHES = [
  "#000000", "#1e293b", "#64748b", "#94a3b8", "#ffffff",
  "#dc2626", "#ea580c", "#f59e0b", "#16a34a", "#0d9488",
  "#0284c7", "#2563eb", "#4f46e5", "#9333ea", "#db2777",
];

const HIGHLIGHTS = [
  "#fef08a", "#fde68a", "#fed7aa", "#fecaca", "#fbcfe8",
  "#e9d5ff", "#bfdbfe", "#a5f3fc", "#bbf7d0", "#e2e8f0",
];

const ALIGNMENTS = [
  { value: "left", title: "Align left", icon: <LuAlignLeft /> },
  { value: "center", title: "Centre", icon: <LuAlignCenter /> },
  { value: "right", title: "Align right", icon: <LuAlignRight /> },
  { value: "justify", title: "Justify", icon: <LuAlignJustify /> },
];

// preventDefault on mousedown keeps the text selection in the article.
const TbButton = ({ title, active = false, className = "", children, ...rest }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={`pfm-tb-btn ${active ? "is-active" : ""} ${className}`}
    onMouseDown={(e) => e.preventDefault()}
    {...rest}
  >
    {children}
  </button>
);

const Sep = () => <span className="pfm-tb-sep" />;

// Text with its own font size (set from the Size menu, or pasted from Word)
// keeps that size inside a heading, so the heading looks like nothing happened.
// This removes the explicit size from the selected paragraphs so the heading's
// own size shows — the same thing Word and Google Docs do.
const clearFontSizeInBlocks = ({ tr }) => {
  const textStyle = tr.doc.type.schema.marks.textStyle;
  const { from, to } = tr.selection;
  const ranges = [];
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isTextblock) return true;
    node.forEach((child, offset) => {
      const mark = textStyle.isInSet(child.marks);
      if (mark && mark.attrs.fontSize != null) {
        const start = pos + 1 + offset;
        ranges.push({ start, end: start + child.nodeSize, mark });
      }
    });
    return false;
  });
  ranges.forEach(({ start, end, mark }) => {
    const attrs = { ...mark.attrs, fontSize: null };
    tr.removeMark(start, end, textStyle);
    // Keep the colour, font and highlight if the text had them.
    if (Object.values(attrs).some((value) => value != null)) {
      tr.addMark(start, end, textStyle.create(attrs));
    }
  });
  return true;
};

// "example.com" → "https://example.com"; emails become mailto: links.
const normalizeUrl = (raw) => {
  const url = raw.trim();
  if (!url) return "";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[^\s/@]+@[^\s/@]+\.[^\s/@]+$/.test(url)) return `mailto:${url}`;
  return `https://${url}`;
};

const LinkButton = ({ editor, active }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const onOpenChange = (next) => {
    if (next) setUrl(editor.getAttributes("link").href ?? "");
    setOpen(next);
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  };

  const apply = () => {
    const href = normalizeUrl(url);
    if (!href) return remove();
    const chain = editor.chain().focus();
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // Nothing selected: insert the address itself as the link text.
      chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      chain.extendMarkRange("link").setLink({ href }).run();
    }
    setOpen(false);
  };

  return (
    <Popover
      trigger="click"
      placement="bottom"
      open={open}
      onOpenChange={onOpenChange}
      content={
        <div className="pfm-tb-link">
          <Input
            autoFocus
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={apply}
          />
          <Button type="primary" onClick={apply}>
            Apply
          </Button>
          {active && (
            <Button danger onClick={remove}>
              Remove
            </Button>
          )}
        </div>
      }
    >
      <TbButton title="Link" active={active}>
        <LuLink />
      </TbButton>
    </Popover>
  );
};

const ColorButton = ({ title, icon, value, fallback, colors, onPick, onClear }) => (
  <ColorPicker
    value={value || fallback}
    disabledAlpha
    allowClear
    presets={[{ label: title, colors }]}
    onChangeComplete={(color) => onPick(color.toHexString())}
    onClear={onClear}
  >
    <TbButton title={title} className="pfm-tb-color">
      {icon}
      <span className="pfm-tb-color-bar" style={{ background: value || fallback }} />
    </TbButton>
  </ColorPicker>
);

const TableButton = ({ editor, inTable }) => {
  const run = (command) => () => editor.chain().focus()[command]().run();
  const actions = {
    insert: () =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    rowAbove: run("addRowBefore"),
    rowBelow: run("addRowAfter"),
    rowDelete: run("deleteRow"),
    colLeft: run("addColumnBefore"),
    colRight: run("addColumnAfter"),
    colDelete: run("deleteColumn"),
    merge: run("mergeOrSplit"),
    header: run("toggleHeaderRow"),
    remove: run("deleteTable"),
  };
  const item = (key, label, extra = {}) => ({ key, label, disabled: !inTable, ...extra });

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        onClick: ({ key }) => actions[key]?.(),
        items: [
          { key: "insert", label: "Insert table (3 × 3)" },
          { type: "divider" },
          item("rowAbove", "Add row above"),
          item("rowBelow", "Add row below"),
          item("rowDelete", "Delete row"),
          { type: "divider" },
          item("colLeft", "Add column left"),
          item("colRight", "Add column right"),
          item("colDelete", "Delete column"),
          { type: "divider" },
          item("merge", "Merge / split selected cells"),
          item("header", "Toggle header row"),
          item("remove", "Delete table", { danger: true }),
        ],
      }}
    >
      <TbButton title="Table" active={inTable} className="pfm-tb-wide">
        <LuTable />
        <LuChevronDown className="pfm-tb-caret" />
      </TbButton>
    </Dropdown>
  );
};

const Toolbar = ({ editor, onFiles }) => {
  const imageInput = useRef(null);
  const fileInput = useRef(null);

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (e.isDestroyed) return null;
      const textStyle = e.getAttributes("textStyle");
      const heading = [1, 2, 3, 4].find((level) => e.isActive("heading", { level }));
      return {
        block: heading ? `h${heading}` : "p",
        fontFamily: textStyle.fontFamily ?? "",
        fontSize: textStyle.fontSize ?? "",
        color: textStyle.color ?? null,
        highlight: textStyle.backgroundColor ?? null,
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        subscript: e.isActive("subscript"),
        superscript: e.isActive("superscript"),
        align: ALIGNMENTS.find((a) => e.isActive({ textAlign: a.value }))?.value ?? "left",
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        blockquote: e.isActive("blockquote"),
        link: e.isActive("link"),
        inTable: e.isActive("table"),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

  if (!s) return null;

  const chain = () => editor.chain().focus();

  const pickFiles = (event) => {
    const files = [...event.target.files];
    event.target.value = ""; // so the same file can be picked again
    if (files.length) onFiles(files);
  };

  // Values that aren't in the list (e.g. from pasted text) are shown as they are.
  const fontOptions = FONTS.some((f) => f.value === s.fontFamily)
    ? FONTS
    : [...FONTS, { value: s.fontFamily, label: s.fontFamily.split(",")[0].replace(/['"]/g, "") }];
  const sizeOptions = SIZES.some((f) => f.value === s.fontSize)
    ? SIZES
    : [...SIZES, { value: s.fontSize, label: s.fontSize.replace("px", "") }];

  return (
    <div className="pfm-tb" role="toolbar" aria-label="Formatting">
      <TbButton title="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
        <LuUndo2 />
      </TbButton>
      <TbButton title="Redo (Ctrl+Y)" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
        <LuRedo2 />
      </TbButton>
      <Sep />

      <Select
        size="small"
        className="pfm-tb-select"
        style={{ width: 128 }}
        popupMatchSelectWidth={false}
        aria-label="Paragraph style"
        value={s.block}
        options={BLOCKS}
        onChange={(v) =>
          v === "p"
            ? chain().setParagraph().run()
            : chain()
                .setHeading({ level: Number(v[1]) })
                .command(clearFontSizeInBlocks)
                .run()
        }
      />
      <Select
        size="small"
        className="pfm-tb-select"
        style={{ width: 150 }}
        popupMatchSelectWidth={false}
        aria-label="Font"
        value={s.fontFamily}
        options={fontOptions}
        onChange={(v) => (v ? chain().setFontFamily(v).run() : chain().unsetFontFamily().run())}
      />
      <Select
        size="small"
        className="pfm-tb-select"
        style={{ width: 72 }}
        popupMatchSelectWidth={false}
        aria-label="Font size"
        value={s.fontSize}
        options={sizeOptions}
        onChange={(v) => (v ? chain().setFontSize(v).run() : chain().unsetFontSize().run())}
      />
      <Sep />

      <TbButton title="Bold (Ctrl+B)" active={s.bold} onClick={() => chain().toggleBold().run()}>
        <LuBold />
      </TbButton>
      <TbButton title="Italic (Ctrl+I)" active={s.italic} onClick={() => chain().toggleItalic().run()}>
        <LuItalic />
      </TbButton>
      <TbButton
        title="Underline (Ctrl+U)"
        active={s.underline}
        onClick={() => chain().toggleUnderline().run()}
      >
        <LuUnderline />
      </TbButton>
      <TbButton title="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()}>
        <LuStrikethrough />
      </TbButton>
      <TbButton
        title="Subscript"
        active={s.subscript}
        onClick={() => chain().unsetSuperscript().toggleSubscript().run()}
      >
        <LuSubscript />
      </TbButton>
      <TbButton
        title="Superscript"
        active={s.superscript}
        onClick={() => chain().unsetSubscript().toggleSuperscript().run()}
      >
        <LuSuperscript />
      </TbButton>
      <Sep />

      <ColorButton
        title="Text colour"
        icon={<LuBaseline />}
        value={s.color}
        fallback="#1e293b"
        colors={SWATCHES}
        onPick={(hex) => chain().setColor(hex).run()}
        onClear={() => chain().unsetColor().run()}
      />
      <ColorButton
        title="Highlight colour"
        icon={<LuHighlighter />}
        value={s.highlight}
        fallback="#fef08a"
        colors={HIGHLIGHTS}
        onPick={(hex) => chain().setBackgroundColor(hex).run()}
        onClear={() => chain().unsetBackgroundColor().run()}
      />
      <Sep />

      {ALIGNMENTS.map((a) => (
        <TbButton
          key={a.value}
          title={a.title}
          active={s.align === a.value}
          onClick={() => chain().setTextAlign(a.value).run()}
        >
          {a.icon}
        </TbButton>
      ))}
      <Sep />

      <TbButton
        title="Bullet list"
        active={s.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      >
        <LuList />
      </TbButton>
      <TbButton
        title="Numbered list"
        active={s.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <LuListOrdered />
      </TbButton>
      <TbButton title="Decrease indent" onClick={() => chain().liftListItem("listItem").run()}>
        <LuIndentDecrease />
      </TbButton>
      <TbButton title="Increase indent" onClick={() => chain().sinkListItem("listItem").run()}>
        <LuIndentIncrease />
      </TbButton>
      <Sep />

      <TbButton
        title="Quote"
        active={s.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <LuTextQuote />
      </TbButton>
      <TbButton title="Horizontal line" onClick={() => chain().setHorizontalRule().run()}>
        <LuMinus />
      </TbButton>
      <Sep />

      <LinkButton editor={editor} active={s.link} />
      <TbButton title="Insert image" onClick={() => imageInput.current?.click()}>
        <LuImage />
      </TbButton>
      <TbButton title="Attach PDF file" onClick={() => fileInput.current?.click()}>
        <LuFileUp />
      </TbButton>
      <TableButton editor={editor} inTable={s.inTable} />
      <Sep />

      <TbButton
        title="Clear formatting"
        onClick={() => chain().unsetAllMarks().clearNodes().run()}
      >
        <LuRemoveFormatting />
      </TbButton>

      <input
        ref={imageInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={pickFiles}
      />
      <input ref={fileInput} type="file" accept="application/pdf" multiple hidden onChange={pickFiles} />
    </div>
  );
};

export default Toolbar;

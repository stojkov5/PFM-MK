// src/pages/Admin/news/extensions.js
// Everything the article editor can do, as TipTap extensions.
import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import ImageNodeView from "./ImageNodeView.jsx";

export const IMAGE_ALIGNMENTS = ["left", "center", "right"];

export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// An image that can be resized by dragging and placed left / centre / right.
// Left and right make the text wrap around it. Saved as
//   <img src="…" data-align="left" style="width: 40%">
const ArticleImage = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      // Percentage of the text column. null = the image's own size.
      width: {
        default: null,
        parseHTML: (el) => {
          const match = /^(\d+(?:\.\d+)?)%$/.exec(el.style.width);
          return match ? Number(match[1]) : null;
        },
        renderHTML: ({ width }) => (width ? { style: `width: ${width}%` } : {}),
      },
      align: {
        default: "center",
        parseHTML: (el) => {
          const align = el.getAttribute("data-align");
          return IMAGE_ALIGNMENTS.includes(align) ? align : "center";
        },
        renderHTML: ({ align }) => ({ "data-align": align }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView, {
      // Mirror the saved attributes on the wrapper so the shared stylesheet
      // (rich-content.css) lays it out exactly like the published <img>.
      attrs: ({ node }) => ({
        "data-align": node.attrs.align,
        style: node.attrs.width ? `width: ${node.attrs.width}%` : "",
      }),
    });
  },
});

// A downloadable file (PDF) shown as a card. Saved as
//   <div data-file class="pfm-file" data-name="…" data-size="…"><a href="…">…</a></div>
const FileAttachment = Node.create({
  name: "fileAttachment",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (el) => el.querySelector("a")?.getAttribute("href") ?? null,
        renderHTML: () => ({}),
      },
      name: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-name") ?? "",
        renderHTML: ({ name }) => ({ "data-name": name }),
      },
      size: {
        default: null,
        parseHTML: (el) => Number(el.getAttribute("data-size")) || null,
        renderHTML: ({ size }) => (size ? { "data-size": size } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-file]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { href, name, size } = node.attrs;
    const parts = [
      ["span", { class: "pfm-file-icon" }, "PDF"],
      ["span", { class: "pfm-file-name" }, name],
    ];
    if (size) parts.push(["span", { class: "pfm-file-size" }, formatFileSize(size)]);
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-file": "", class: "pfm-file" }),
      ["a", { href, target: "_blank", rel: "noopener noreferrer" }, ...parts],
    ];
  },

  addCommands() {
    return {
      setFileAttachment:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    link: {
      openOnClick: false,
      defaultProtocol: "https",
      // The public page decides how links open (see RichContent.jsx).
      HTMLAttributes: { target: null, rel: null },
    },
    dropcursor: { color: "#38bdf8", width: 3 },
  }),
  // Font family, font size, text colour and highlight colour.
  TextStyleKit,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Subscript,
  Superscript,
  ArticleImage,
  FileAttachment,
  TableKit.configure({ table: { resizable: true } }),
  Placeholder.configure({ placeholder: "Start writing the article…" }),
  CharacterCount,
];

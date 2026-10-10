// src/pages/Admin/news/RichEditor.jsx
// The article body editor: a formatting toolbar on top of a white "page".
import React, { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { App as AntApp } from "antd";
import { editorExtensions } from "./extensions.js";
import { prepareImage } from "./prepareImage.js";
import Toolbar from "./Toolbar.jsx";
import "../../News/rich-content.css";
import "./editor.css";

const WordCount = ({ editor }) => {
  const counts = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e.isDestroyed
        ? null
        : {
            words: e.storage.characterCount.words(),
            characters: e.storage.characterCount.characters(),
          },
  });
  return (
    <div className="pfm-editor-foot">
      {counts?.words ?? 0} words · {counts?.characters ?? 0} characters
    </div>
  );
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const isUploadable = (file) => IMAGE_TYPES.includes(file.type) || file.type === "application/pdf";

/**
 * @param initialContent  HTML the editor shows when it is created
 * @param onChange        called with the new HTML after every edit
 * @param onUpload        (file) => Promise<{ url, filename, size }> — stores a file
 */
const RichEditor = ({ initialContent = "", onChange, onUpload }) => {
  const { message } = AntApp.useApp();

  // The editor is created once; refs let its handlers reach the latest props.
  const latest = useRef({});
  useEffect(() => {
    latest.current = { onChange, onUpload };
  });
  const insertFilesRef = useRef(null);

  const editor = useEditor({
    // Create the editor once this component is on screen, not while rendering:
    // an editor made during a render that React shows later gets thrown away.
    immediatelyRender: false,
    extensions: editorExtensions,
    content: initialContent,
    editorProps: {
      attributes: { class: "pfm-rich pfm-editor-page", spellcheck: "true" },
      // Pasting or dropping picture / PDF files uploads them.
      handlePaste: (view, event) => {
        // Word and Excel put a picture of the copied text next to the text
        // itself — when there is real content, let the normal paste happen.
        if (event.clipboardData?.getData("text/html")) return false;
        const files = [...(event.clipboardData?.files ?? [])].filter(isUploadable);
        if (!files.length) return false;
        event.preventDefault();
        insertFilesRef.current?.(files);
        return true;
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false;
        const files = [...(event.dataTransfer?.files ?? [])].filter(isUploadable);
        if (!files.length) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertFilesRef.current?.(files, at);
        return true;
      },
      handleDOMEvents: {
        // Links and attached files shouldn't open while writing.
        click: (view, event) => {
          if (event.target.closest?.("a")) event.preventDefault();
          return false;
        },
      },
    },
    onUpdate: ({ editor: e }) => latest.current.onChange?.(e.isEmpty ? "" : e.getHTML()),
  });

  const insertFiles = async (files, at) => {
    for (const file of files) {
      if (!isUploadable(file)) {
        message.error(`${file.name}: only images (JPG, PNG, WebP, GIF) and PDF files can be added.`);
        continue;
      }
      const isImage = file.type !== "application/pdf";
      const key = `upload-${file.name}-${file.size}`;
      message.loading({ key, content: `Uploading ${file.name}…`, duration: 0 });
      try {
        const saved = await latest.current.onUpload(isImage ? await prepareImage(file) : file);
        const node = isImage
          ? { type: "image", attrs: { src: saved.url } }
          : {
              type: "fileAttachment",
              attrs: { href: saved.url, name: saved.filename, size: saved.size },
            };
        const chain = editor.chain().focus();
        if (typeof at === "number") chain.insertContentAt(at, node).run();
        else chain.insertContent(node).run();
        message.destroy(key);
      } catch (err) {
        message.error({ key, content: `${file.name}: ${err.message}` });
      }
    }
  };
  useEffect(() => {
    insertFilesRef.current = insertFiles;
  });

  // Not created yet, or torn down and about to be replaced.
  if (!editor || editor.isDestroyed) return <div className="pfm-editor pfm-editor-loading" />;

  // Keyed by editor instance: if the editor is ever rebuilt, the toolbar and
  // word count start over with the new one.
  const key = editor.instanceId;
  return (
    <div className="pfm-editor">
      <Toolbar key={`toolbar-${key}`} editor={editor} onFiles={(files) => insertFiles(files)} />
      <EditorContent editor={editor} className="pfm-editor-body" />
      <WordCount key={`count-${key}`} editor={editor} />
    </div>
  );
};

export default RichEditor;

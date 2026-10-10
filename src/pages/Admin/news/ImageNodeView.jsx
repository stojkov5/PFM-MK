// src/pages/Admin/news/ImageNodeView.jsx
// How an image looks and behaves inside the editor: click to select it, drag a
// corner to resize, and use the small bar above it to place it.
import React, { useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { LuTrash2 } from "react-icons/lu";
import { apiUrl } from "../../../lib/api.js";

const DEFAULT_WRAP_WIDTH = 40; // % given to an image when text first wraps around it
const SIZES = [25, 50, 75, 100];

// Tiny pictograms: a picture block with lines of text beside / around it.
const WrapIcon = ({ side }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
    {side === "center" ? (
      <>
        <rect x="2" y="2" width="14" height="1.5" rx="0.75" />
        <rect x="5" y="5.5" width="8" height="7" rx="1" />
        <rect x="2" y="14.5" width="14" height="1.5" rx="0.75" />
      </>
    ) : (
      <>
        <rect x={side === "left" ? 2 : 9} y="3" width="7" height="7" rx="1" />
        <rect x={side === "left" ? 11 : 2} y="3" width="5" height="1.5" rx="0.75" />
        <rect x={side === "left" ? 11 : 2} y="6" width="5" height="1.5" rx="0.75" />
        <rect x={side === "left" ? 11 : 2} y="9" width="5" height="1.5" rx="0.75" />
        <rect x="2" y="12" width="14" height="1.5" rx="0.75" />
        <rect x="2" y="15" width="10" height="1.5" rx="0.75" />
      </>
    )}
  </svg>
);

const PLACEMENTS = [
  { align: "left", title: "Left — text wraps around the image" },
  { align: "center", title: "Centre — no text beside the image" },
  { align: "right", title: "Right — text wraps around the image" },
];

const ImageNodeView = ({ node, updateAttributes, deleteNode, selected, editor, getPos }) => {
  const { src, alt, width, align } = node.attrs;
  const boxRef = useRef(null);

  const update = (attrs) => {
    updateAttributes(attrs);
    // Keep the image selected so its controls stay open.
    const pos = getPos();
    if (typeof pos === "number") editor.commands.setNodeSelection(pos);
  };

  const place = (next) =>
    update({
      align: next,
      width: next !== "center" && !width ? DEFAULT_WRAP_WIDTH : width,
    });

  const startResize = (event, side) => {
    event.preventDefault();
    event.stopPropagation();

    const outer = boxRef.current?.closest(".node-image");
    const parent = outer?.parentElement;
    if (!outer || !parent) return;

    const style = getComputedStyle(parent);
    const available =
      parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const startX = event.clientX;
    const startWidth = outer.getBoundingClientRect().width;
    // A centred image grows on both sides, so its width changes twice as fast.
    const factor = (side === "left" ? -1 : 1) * (align === "center" ? 2 : 1);
    let percent = width;

    const onMove = (e) => {
      const px = Math.min(available, Math.max(40, startWidth + (e.clientX - startX) * factor));
      percent = Math.max(5, Math.min(100, Math.round((px / available) * 100)));
      outer.style.width = `${percent}%`;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      if (percent !== width) update({ width: percent });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  const active = selected && editor.isEditable;

  return (
    <NodeViewWrapper className={`pfm-img ${active ? "is-selected" : ""}`} ref={boxRef}>
      {active && (
        // Zero-height strip that sticks below the toolbar, so the controls
        // stay reachable while scrolling past a tall image.
        <div className={`pfm-img-bar-anchor ${align === "right" ? "is-right" : ""}`}>
          <div
            className="pfm-img-bar"
            contentEditable={false}
            onMouseDown={(e) => e.preventDefault()}
          >
            {PLACEMENTS.map((p) => (
              <button
                key={p.align}
                type="button"
                title={p.title}
                className={align === p.align ? "is-active" : ""}
                onClick={() => place(p.align)}
              >
                <WrapIcon side={p.align} />
              </button>
            ))}
            <span className="pfm-img-bar-sep" />
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                title={`${size}% of the page width`}
                className={width === size ? "is-active" : ""}
                onClick={() => update({ width: size })}
              >
                {size}%
              </button>
            ))}
            <span className="pfm-img-bar-sep" />
            <button type="button" title="Remove image" onClick={deleteNode}>
              <LuTrash2 />
            </button>
          </div>
        </div>
      )}

      {/* data-drag-handle: dragging the picture itself moves it in the text */}
      <img src={apiUrl(src)} alt={alt ?? ""} draggable={false} data-drag-handle="" />

      {active &&
        ["nw", "ne", "sw", "se"].map((corner) => (
          <span
            key={corner}
            className={`pfm-img-handle pfm-img-handle-${corner}`}
            onPointerDown={(e) => startResize(e, corner.endsWith("w") ? "left" : "right")}
          />
        ))}
    </NodeViewWrapper>
  );
};

export default ImageNodeView;

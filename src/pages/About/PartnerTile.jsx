// src/pages/About/PartnerTile.jsx
// One partner logo on its own background, linking to the partner's site when
// it has one (see src/data/partners.js).
import React from "react";

const PartnerTile = ({ partner, name }) => {
  const Tag = partner.url ? "a" : "div";
  const linkProps = partner.url
    ? { href: partner.url, target: "_blank", rel: "noopener noreferrer", title: name }
    : {};

  return (
    <Tag className="pfm-partner" {...linkProps}>
      <span className="pfm-partner-logo" style={{ background: partner.bg }}>
        <img
          src={`/Partners/${encodeURIComponent(partner.file)}`}
          alt={name}
          loading="lazy"
          style={{
            objectFit: partner.fit ?? "contain",
            transform: partner.zoom ? `scale(${partner.zoom})` : undefined,
          }}
        />
      </span>
    </Tag>
  );
};

export default PartnerTile;

import React, { useMemo, useState } from "react";
import { Row, Col, Button, Segmented, Collapse, Tag } from "antd";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Records.css";

const { Panel } = Collapse;

const Records = () => {
  const { t } = useTranslation();

  const [pool, setPool] = useState("25");
  const [gender, setGender] = useState("female");

  const docs = useMemo(
    () => ({
      25: {
        female: {
          title: t("records.docs.25.female.title"),
          subtitle: t("records.docs.25.female.subtitle"),
          file: "/National-records-25m-pool-FEMALE.pdf",
          tags: [t("records.tags.25m"), t("records.tags.female"), t("records.tags.shortCourse")],
        },
        male: {
          title: t("records.docs.25.male.title"),
          subtitle: t("records.docs.25.male.subtitle"),
          file: "/National-records-25m-pool-MALE.pdf",
          tags: [t("records.tags.25m"), t("records.tags.male"), t("records.tags.shortCourse")],
        },
      },
      50: {
        female: {
          title: t("records.docs.50.female.title"),
          subtitle: t("records.docs.50.female.subtitle"),
          file: "/National-records-50m-pool-FEMALE.pdf",
          tags: [t("records.tags.50m"), t("records.tags.female"), t("records.tags.longCourse")],
        },
        male: {
          title: t("records.docs.50.male.title"),
          subtitle: t("records.docs.50.male.subtitle"),
          file: "/National-records-50m-pool-MALE.pdf",
          tags: [t("records.tags.50m"), t("records.tags.male"), t("records.tags.longCourse")],
        },
      },
    }),
    [t]
  );

  const current = docs[pool][gender];

  // Quick highlights (small, readable – the full truth is in the PDFs)
  const highlights = useMemo(() => {
    if (pool === "25" && gender === "female") {
      return [
        { label: "50m Free (Senior)", value: "0:26:08 — Bogdanovska Anastasija" },
        { label: "100m Free (Senior)", value: "0:55.60 — Blazevska Eminova Mia" },
        { label: "50m Fly (Senior)", value: "0:27.61 — Blazevska Eminova Mia" },
      ];
    }
    if (pool === "25" && gender === "male") {
      return [
        { label: "50m Free (Senior)", value: "0:23:07 — Blazhevski Marko" },
        { label: "100m Free (Senior)", value: "0:50:17 — Blazhevski Marko" },
        { label: "50m Back (Senior)", value: "0:25.77 — Chepisevski Gorazd" },
      ];
    }
    if (pool === "50" && gender === "female") {
      return [
        { label: "50m Free (Senior)", value: "0:26:34 — Bogdanovska Anastasija" },
        { label: "100m Free (Senior)", value: "0:56:12 — Bogdanovska Anastasija" },
        { label: "50m Breast (Senior)", value: "0:33.74 — Jankovik Sara" },
      ];
    }
    return [
      { label: "50m Free (Senior)", value: "0:23:70 — Blazhevski Marko" },
      { label: "100m Free (Senior)", value: "0:51:75 — Malenko Aleksandar" },
      { label: "50m Fly (Senior)", value: "0:25:26 — Lazarevski Zoran" },
    ];
  }, [pool, gender]);

  const openDoc = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="pfm-records pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-records-head">
          <div className="pfm-records-kicker">{t("records.kicker")}</div>
          <h2 className="pfm-records-title">{t("records.title")}</h2>

          <div className="pfm-records-sub">
            <p>{t("records.intro.p1")}</p>

            <div className="pfm-records-sub-list-wrap">
              <div className="pfm-records-sub-list-title">{t("records.intro.mustInclude")}</div>
              <ol className="pfm-records-list">
                <li>{t("records.intro.list.0")}</li>
                <li>{t("records.intro.list.1")}</li>
                <li>{t("records.intro.list.2")}</li>
                <li>{t("records.intro.list.3")}</li>
              </ol>
            </div>

            <p>{t("records.intro.p2")}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="pfm-records-controls pb-3">
          <div className="pfm-control">
            <div className="pfm-control-label">{t("records.controls.pool")}</div>
            <Segmented
              options={[
                { label: "25m", value: "25" },
                { label: "50m", value: "50" },
              ]}
              value={pool}
              onChange={setPool}
            />
          </div>

          <div className="pfm-control">
            <div className="pfm-control-label">{t("records.controls.gender")}</div>
            <Segmented
              options={[
                { label: t("records.controls.female"), value: "female" },
                { label: t("records.controls.male"), value: "male" },
              ]}
              value={gender}
              onChange={setGender}
            />
          </div>
        </div>

        <Row gutter={[16, 16]} align="stretch">
          {/* Document card */}
          <Col xs={24} lg={9}>
            <div className="pfm-doc-card">
              <div className="pfm-doc-top">
                <div className="pfm-doc-ico">
                  <FiFileText />
                </div>
                <div className="pfm-doc-meta">
                  <div className="pfm-doc-title">{current.title}</div>
                  <div className="pfm-doc-sub">{current.subtitle}</div>
                </div>
              </div>

              <div className="pfm-doc-tags">
                {current.tags.map((tag) => (
                  <Tag key={tag} className="pfm-doc-tag">
                    {tag}
                  </Tag>
                ))}
              </div>

              <div className="pfm-doc-actions">
                <Button
                  className="pfm-doc-btn"
                  onClick={() => openDoc(current.file)}
                  icon={<FiExternalLink />}
                >
                  {t("records.actions.openPdf")}
                </Button>

                <a
                  className="pfm-doc-btn pfm-doc-btn-primary"
                  href={current.file}
                  download
                >
                  <FiDownload />
                  <span>{t("records.actions.download")}</span>
                </a>
              </div>

              <div className="pfm-highlights">
                <div className="pfm-highlights-title">{t("records.highlightsTitle")}</div>

                <div className="pfm-highlights-grid">
                  {highlights.map((h) => (
                    <div className="pfm-highlight" key={h.label}>
                      <div className="pfm-highlight-label">{h.label}</div>
                      <div className="pfm-highlight-value">{h.value}</div>
                    </div>
                  ))}
                </div>

                <Collapse className="pfm-collapse" bordered={false}>
                  <Panel header={t("records.noteTitle")} key="note">
                    <div className="pfm-note">{t("records.noteText")}</div>
                  </Panel>
                </Collapse>
              </div>
            </div>
          </Col>

          {/* PDF preview */}
          <Col xs={24} lg={15}>
            <div className="pfm-pdf-card">
              <div className="pfm-pdf-top">
                <div className="pfm-pdf-top-title">{t("records.preview.title")}</div>
                <div className="pfm-pdf-top-sub">{t("records.preview.sub")}</div>
              </div>

              <div className="pfm-pdf-frame">
                <iframe
                  title="records-pdf"
                  src={`${current.file}#view=FitH`}
                  className="pfm-iframe"
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Records;

import React from "react";
import { Row, Col, Button, Collapse, Table, Tag } from "antd";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Criteria.css";

const Criteria = () => {
  const { t } = useTranslation();

  // PDFs in public/
  const docs = [
    {
      title: t("criteria.docs.0.title"),
      subtitle: t("criteria.docs.0.subtitle"),
      file: "/Criteria-DS.pdf",
      tags: [t("criteria.tags.openWater"), "2023", t("criteria.tags.norms")],
      note: t("criteria.docs.0.note"),
    },
    {
      title: t("criteria.docs.1.title"),
      subtitle: t("criteria.docs.1.subtitle"),
      file: "/Criteria-Cup.pdf",
      tags: ["2023", t("criteria.tags.points"), t("criteria.tags.nationalTeam")],
      note: t("criteria.docs.1.note"),
    },
  ];

  // ===== Open water norms table =====
  const openWaterColumns = [
    { title: t("criteria.tables.openWater.discipline"), dataIndex: "discipline", key: "discipline", width: 110 },
    {
      title: t("criteria.tables.openWater.seniors"),
      children: [
        { title: t("criteria.tables.openWater.m"), dataIndex: "sen_m", key: "sen_m", width: 80 },
        { title: t("criteria.tables.openWater.f"), dataIndex: "sen_f", key: "sen_f", width: 80 },
      ],
    },
    {
      title: t("criteria.tables.openWater.youth"),
      children: [
        { title: t("criteria.tables.openWater.m"), dataIndex: "u20_m", key: "u20_m", width: 90 },
        { title: t("criteria.tables.openWater.f"), dataIndex: "u20_f", key: "u20_f", width: 90 },
      ],
    },
    {
      title: t("criteria.tables.openWater.juniors"),
      children: [
        { title: t("criteria.tables.openWater.m"), dataIndex: "jun_m", key: "jun_m", width: 90 },
        { title: t("criteria.tables.openWater.f"), dataIndex: "jun_f", key: "jun_f", width: 90 },
      ],
    },
    {
      title: t("criteria.tables.openWater.cadets"),
      children: [
        { title: t("criteria.tables.openWater.m"), dataIndex: "cad_m", key: "cad_m", width: 90 },
        { title: t("criteria.tables.openWater.f"), dataIndex: "cad_f", key: "cad_f", width: 90 },
      ],
    },
  ];

  const openWaterData = [
    {
      key: "1500",
      discipline: "1500м",
      sen_m: "16:30",
      sen_f: "17:20",
      u20_m: "16:50",
      u20_f: "17:40",
      jun_m: "17:20",
      jun_f: "18:00",
      cad_m: "17:50",
      cad_f: "18:20",
    },
    {
      key: "2500",
      discipline: "2500м",
      sen_m: "—",
      sen_f: "—",
      u20_m: "—",
      u20_f: "—",
      jun_m: "—",
      jun_f: "—",
      cad_m: "30:30",
      cad_f: "31:30",
    },
    {
      key: "5000",
      discipline: "5000м",
      sen_m: "57:00",
      sen_f: "60:00",
      u20_m: "58:30",
      u20_f: "61:00",
      jun_m: "59:30",
      jun_f: "62:00",
      cad_m: "—",
      cad_f: "—",
    },
  ];

  // ===== Points table =====
  const pointsColumns = [
    { title: t("criteria.tables.points.category"), dataIndex: "group", key: "group", width: 170 },
    { title: t("criteria.tables.points.points"), dataIndex: "points", key: "points", width: 130 },
    { title: t("criteria.tables.points.note"), dataIndex: "note", key: "note" },
  ];

  const pointsData = [
    { key: "b14", group: t("criteria.pointsData.b14.group"), points: "500", note: t("criteria.pointsData.base") },
    { key: "b16", group: t("criteria.pointsData.b16.group"), points: "550", note: t("criteria.pointsData.base") },
    { key: "b18", group: t("criteria.pointsData.b18.group"), points: "600", note: t("criteria.pointsData.base") },
    { key: "g13", group: t("criteria.pointsData.g13.group"), points: "500", note: t("criteria.pointsData.base") },
    { key: "g15", group: t("criteria.pointsData.g15.group"), points: "550", note: t("criteria.pointsData.base") },
    { key: "g17", group: t("criteria.pointsData.g17.group"), points: "600", note: t("criteria.pointsData.base") },

    { key: "avgB13", group: t("criteria.pointsData.avgB13.group"), points: "525", note: t("criteria.pointsData.avg") },
    { key: "avgB15", group: t("criteria.pointsData.avgB15.group"), points: "575", note: t("criteria.pointsData.avg") },
    { key: "avgG14", group: t("criteria.pointsData.avgG14.group"), points: "525", note: t("criteria.pointsData.avg") },
    { key: "avgG16", group: t("criteria.pointsData.avgG16.group"), points: "575", note: t("criteria.pointsData.avg") },
  ];

  const openDoc = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="pfm-criteria pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-criteria-head">
          <div className="pfm-criteria-kicker">{t("criteria.kicker")}</div>
          <h2 className="pfm-criteria-title">{t("criteria.title")}</h2>
          <p className="pfm-criteria-sub">{t("criteria.subtitle")}</p>
        </div>

        <div className="pfm-criteria-preview">
          <Collapse
            accordion
            className="pfm-collapse"
            expandIconPosition="end"
            items={[
              {
                key: "1",
                label: t("criteria.preview.1.label"),
                children: (
                  <div className="pfm-preview-block">
                    <div className="pfm-preview-text">
                      <p>{t("criteria.preview.1.p1")}</p>

                      <ul className="pfm-preview-ul">
                        <li>{t("criteria.preview.1.li1")}</li>
                        <li>{t("criteria.preview.1.li2")}</li>
                        <li>{t("criteria.preview.1.li3")}</li>
                      </ul>
                    </div>

                    <div className="pfm-table-wrap">
                      <Table
                        columns={openWaterColumns}
                        dataSource={openWaterData}
                        pagination={false}
                        size="middle"
                        bordered={false}
                        className="pfm-table-dark"
                        scroll={{ x: 860 }}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: "2",
                label: t("criteria.preview.2.label"),
                children: (
                  <div className="pfm-preview-block">
                    <div className="pfm-preview-text">
                      <p>{t("criteria.preview.2.p1")}</p>
                      <p className="pfm-preview-warn">{t("criteria.preview.2.warn")}</p>
                    </div>

                    <div className="pfm-table-wrap">
                      <Table
                        columns={pointsColumns}
                        dataSource={pointsData}
                        pagination={false}
                        size="middle"
                        bordered={false}
                        className="pfm-table-dark"
                        scroll={{ x: 700 }}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <Row gutter={[16, 16]} align="stretch">
          {docs.map((d) => (
            <Col xs={24} lg={12} key={d.title}>
              <div className="pfm-doc-card">
                <div className="pfm-doc-top">
                  <div className="pfm-doc-ico">
                    <FiFileText />
                  </div>
                  <div className="pfm-doc-meta">
                    <div className="pfm-doc-title">{d.title}</div>
                    <div className="pfm-doc-sub">{d.subtitle}</div>
                  </div>
                </div>

                <div className="pfm-doc-tags">
                  {d.tags.map((tag) => (
                    <Tag key={tag} className="pfm-doc-tag">
                      {tag}
                    </Tag>
                  ))}
                </div>

                <div className="pfm-doc-note">{d.note}</div>

                <div className="pfm-doc-actions">
                  <Button
                    className="pfm-doc-btn"
                    onClick={() => openDoc(d.file)}
                    icon={<FiExternalLink />}
                  >
                    {t("criteria.actions.openPdf")}
                  </Button>

                  <a className="pfm-doc-btn pfm-doc-btn-primary" href={d.file} download>
                    <FiDownload />
                    <span>{t("criteria.actions.download")}</span>
                  </a>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Criteria;

import React from "react";
import { Row, Col, Button, Collapse, Table, Tag } from "antd";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import criteriaData from "../../data/criteriaData.json";
import "./Criteria.css";

const Criteria = () => {
  const { t } = useTranslation();

  const openDoc = (url) => window.open(encodeURI(url), "_blank", "noopener,noreferrer");

  const officialColumns = [
    {
      title: t("criteria.table.discipline"),
      dataIndex: "discipline",
      key: "discipline",
      width: 180,
      fixed: "left",
    },
    {
      title: t("criteria.table.female"),
      children: [
        { title: t("criteria.table.bNorm"), dataIndex: "femaleB", key: "femaleB", width: 110 },
        { title: t("criteria.table.aNorm"), dataIndex: "femaleA", key: "femaleA", width: 110 },
      ],
    },
    {
      title: t("criteria.table.male"),
      children: [
        { title: t("criteria.table.aNorm"), dataIndex: "maleA", key: "maleA", width: 110 },
        { title: t("criteria.table.bNorm"), dataIndex: "maleB", key: "maleB", width: 110 },
      ],
    },
  ];

  const nationalColumns = [
    {
      title: t("criteria.table.discipline"),
      dataIndex: "discipline",
      key: "discipline",
      width: 180,
      fixed: "left",
    },
    { title: t("criteria.national.columns.youngerPioneers"), dataIndex: "c1", key: "c1", width: 120 },
    { title: t("criteria.national.columns.olderPioneers"), dataIndex: "c2", key: "c2", width: 120 },
    { title: t("criteria.national.columns.cadets"), dataIndex: "c3", key: "c3", width: 110 },
    { title: t("criteria.national.columns.juniors"), dataIndex: "c4", key: "c4", width: 110 },
    { title: t("criteria.national.columns.seniors"), dataIndex: "c5", key: "c5", width: 110 },
  ];

  const officialItems = criteriaData.officialEvents.map((event) => ({
    key: event.id,
    label: `${t(event.titleKey)} · ${t(event.subtitleKey)}`,
    children: (
      <div className="pfm-preview-block">
        <div className="pfm-preview-text">
          <p>
            <strong>{t("criteria.eligibilityTitle")}</strong> {t("criteria.eligibilityText")}
          </p>

          <ul className="pfm-preview-ul">
            <li>{t("criteria.aNormInfo")}</li>
            <li>{t("criteria.bNormInfo")}</li>
            {event.birth.map((item) => (
              <li key={item}>
                {t("criteria.birthLabel")} {item}
              </li>
            ))}
          </ul>

          <p className="pfm-preview-warn">{t(event.noteKey)}</p>
        </div>

        <div className="pfm-table-wrap">
          <Table
            columns={officialColumns}
            dataSource={event.rows}
            pagination={false}
            size="middle"
            scroll={{ x: 700 }}
            className="pfm-table-dark"
          />
        </div>
      </div>
    ),
  }));

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
            className="pfm-collapse"
            expandIconPosition="end"
            items={officialItems}
          />
        </div>

        <div className="mt-8">
          <h3 className="pfm-section-title">{t("criteria.officialDocsTitle")}</h3>

          <Row gutter={[16, 16]} align="stretch">
            {criteriaData.officialEvents.map((event) => (
              <Col xs={24} md={12} xl={8} key={event.id}>
                <div className="pfm-doc-card">
                  <div className="pfm-doc-top">
                    <div className="pfm-doc-ico">
                      <FiFileText />
                    </div>

                    <div>
                      <div className="pfm-doc-title">{t(event.titleKey)}</div>
                      <div className="pfm-doc-sub">{t(event.subtitleKey)}</div>
                    </div>
                  </div>

                  <div className="pfm-doc-tags">
                    {event.tags.map((tag) => (
                      <Tag key={`${event.id}-${tag}`} className="pfm-doc-tag">
                        {tag}
                      </Tag>
                    ))}
                  </div>

                  <div className="pfm-doc-note">
                    <strong>{t("criteria.birthGroups")}:</strong> {event.birth.join(" · ")}
                  </div>

                  <div className="pfm-doc-actions">
                    <Button
                      className="pfm-doc-btn"
                      icon={<FiExternalLink />}
                      onClick={() => openDoc(event.file)}
                    >
                      {t("criteria.openPdf")}
                    </Button>

                    <a
                      className="pfm-doc-btn pfm-doc-btn-primary"
                      href={encodeURI(event.file)}
                      download
                    >
                      <FiDownload />
                      <span>{t("criteria.downloadPdf")}</span>
                    </a>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div className="mt-10">
          <h3 className="pfm-section-title">{t("criteria.national.title")}</h3>
          <p className="pfm-criteria-sub">{t("criteria.national.subtitle")}</p>

          <Row gutter={[16, 16]} align="stretch">
            {criteriaData.nationalLimits.map((section) => (
              <Col xs={24} key={section.id}>
                <div className="pfm-doc-card">
                  <div className="pfm-doc-top">
                    <div className="pfm-doc-ico">
                      <FiFileText />
                    </div>

                    <div>
                      <div className="pfm-doc-title">{t(section.titleKey)}</div>
                      <div className="pfm-doc-sub">
                        {t("criteria.national.poolLabel")}: {section.pool} · {t("criteria.national.genderLabel")}: {section.gender}
                      </div>
                    </div>
                  </div>

                  <div className="pfm-doc-actions">
                    <Button
                      className="pfm-doc-btn"
                      icon={<FiExternalLink />}
                      onClick={() => openDoc(section.file)}
                    >
                      {t("criteria.openPdf")}
                    </Button>

                    <a
                      className="pfm-doc-btn pfm-doc-btn-primary"
                      href={encodeURI(section.file)}
                      download
                    >
                      <FiDownload />
                      <span>{t("criteria.downloadPdf")}</span>
                    </a>
                  </div>

                  <div className="pfm-table-wrap">
                    <Table
                      columns={nationalColumns}
                      dataSource={section.rows}
                      pagination={false}
                      size="middle"
                      scroll={{ x: 900 }}
                      className="pfm-table-dark"
                    />
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div className="pfm-doc-note mt-4">
            <strong>{t("criteria.national.additionalProvisions")}:</strong>
            <ul className="pfm-preview-ul mt-3">
              {criteriaData.nationalExtraNotesKeys.map((noteKey) => (
                <li key={noteKey}>{t(noteKey)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Criteria;
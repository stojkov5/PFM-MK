import React from "react";
import { Row, Col, Button, Collapse, Table, Tag } from "antd";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import "./Criteria.css";

const { Panel } = Collapse;

const Criteria = () => {
  // ✅ Put PDFs in: public/docs/
  const docs = [
    {
      title: "Норми за далечинско пливање – 2023",
      subtitle:
        "Светско/Европско првенство (сениори) + младинци/јуниори/кадети + Комен куп.",
      file: "/public/Criteria-DS.pdf",
      tags: ["Open Water", "2023", "Норми"],
      note: "Времињата се однесуваат на резултати во 50-метарски базен и се изразени во минути.",
    },
    {
      title: "Критериуми за Комен Куп / ЦЕИ / Мултинации – 2023",
      subtitle:
        "Критериум за настап / статус репрезентативец преку бодови по возрасни категории.",
      file: "/public/Criteria-Cup.pdf",
      tags: ["2023", "Бодови", "Репрезентација"],
      note: "Во случаи со непарни/парни години се применува просек на бодови помеѓу годиштата.",
    },
  ];

  // ===== PDF #1: Open water norms (from your PDF) =====
  const openWaterColumns = [
    {
      title: "Дисциплина",
      dataIndex: "discipline",
      key: "discipline",
      width: 110,
    },
    {
      title: "Сениори",
      children: [
        { title: "М", dataIndex: "sen_m", key: "sen_m", width: 80 },
        { title: "Ж", dataIndex: "sen_f", key: "sen_f", width: 80 },
      ],
    },
    {
      title: "Младинци (2004–2005)",
      children: [
        { title: "М", dataIndex: "u20_m", key: "u20_m", width: 90 },
        { title: "Ж", dataIndex: "u20_f", key: "u20_f", width: 90 },
      ],
    },
    {
      title: "Јуниори (2006–2007)",
      children: [
        { title: "М", dataIndex: "jun_m", key: "jun_m", width: 90 },
        { title: "Ж", dataIndex: "jun_f", key: "jun_f", width: 90 },
      ],
    },
    {
      title: "Кадети (2008–2009)",
      children: [
        { title: "М", dataIndex: "cad_m", key: "cad_m", width: 90 },
        { title: "Ж", dataIndex: "cad_f", key: "cad_f", width: 90 },
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

  // ===== PDF #2: Points criteria (from your PDF) =====
  const pointsColumns = [
    { title: "Категорија", dataIndex: "group", key: "group", width: 170 },
    { title: "Бодови", dataIndex: "points", key: "points", width: 130 },
    { title: "Забелешка", dataIndex: "note", key: "note" },
  ];

  const pointsData = [
    {
      key: "b14",
      group: "Машки – до 14 год.",
      points: "500",
      note: "Основен праг",
    },
    {
      key: "b16",
      group: "Машки – до 16 год.",
      points: "550",
      note: "Основен праг",
    },
    {
      key: "b18",
      group: "Машки – до 18 год.",
      points: "600",
      note: "Основен праг",
    },
    {
      key: "g13",
      group: "Женски – до 13 год.",
      points: "500",
      note: "Основен праг",
    },
    {
      key: "g15",
      group: "Женски – до 15 год.",
      points: "550",
      note: "Основен праг",
    },
    {
      key: "g17",
      group: "Женски – до 17 год.",
      points: "600",
      note: "Основен праг",
    },
    {
      key: "avgB13",
      group: "Пример (машки – 13 год.)",
      points: "525",
      note: "Просек помеѓу годишта (пример од документ)",
    },
    {
      key: "avgB15",
      group: "Пример (машки – 15 год.)",
      points: "575",
      note: "Просек помеѓу годишта (пример од документ)",
    },
    {
      key: "avgG14",
      group: "Пример (женски – 14 год.)",
      points: "525",
      note: "Просек помеѓу годишта (пример од документ)",
    },
    {
      key: "avgG16",
      group: "Пример (женски – 16 год.)",
      points: "575",
      note: "Просек помеѓу годишта (пример од документ)",
    },
  ];

  const openDoc = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="pfm-criteria pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-criteria-head">
          <div className="pfm-criteria-kicker">Criteria</div>
          <h2 className="pfm-criteria-title">Критериуми и нормативи</h2>
          <p className="pfm-criteria-sub">
            Оваа секција ги содржи официјалните документи за критериуми и норми
            за настап. Подолу имаш и брз преглед на клучните точки од PDF
            документите.
          </p>
        </div>
        <div className="pfm-criteria-preview">
          <Collapse
            accordion
            className="pfm-collapse"
            expandIconPosition="end"
            items={[
              {
                key: "1",
                label: "Преглед: Норми за далечинско пливање (2023)",
                children: (
                  <div className="pfm-preview-block">
                    <div className="pfm-preview-text">
                      <p>
                        Табелата подолу ги прикажува нормативите по дисциплина и
                        категорија. (минутaжа, базирана на резултати во 50м
                        базен).
                      </p>
                      <ul className="pfm-preview-ul">
                        <li>
                          Дополнителен критериум: влез во репрезентација преку{" "}
                          <b>1.5%</b> од времето на победникот или пласман во
                          првата половина на одредени натпревари.
                        </li>
                        <li>
                          На 2.5км: 2-ро/3-то место да не е повеќе од{" "}
                          <b>1:30</b> мин. зад победникот.
                        </li>
                        <li>
                          На 5.0км: 2-ро/3-то место да не е повеќе од{" "}
                          <b>3:00</b> мин. зад победникот.
                        </li>
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
                label: "Преглед: Комен Куп / ЦЕИ / Мултинации (2023) – бодови",
                children: (
                  <div className="pfm-preview-block">
                    <div className="pfm-preview-text">
                      <p>
                        Критериумот за настап/статус репрезентативец е дефиниран
                        преку бодови по возраст и пол. Во случаи со
                        непарни/парни години се применува просек помеѓу
                        годиштата (примерите се наведени во документот).
                      </p>
                      <p className="pfm-preview-warn">
                        Забелешка: Одборот го задржува правото по интерес на
                        пливањето да одлучи за настап и во специфични случаи.
                      </p>
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
                  {d.tags.map((t) => (
                    <Tag key={t} className="pfm-doc-tag">
                      {t}
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
                    Отвори PDF
                  </Button>

                  <a
                    className="pfm-doc-btn pfm-doc-btn-primary"
                    href={d.file}
                    download
                  >
                    <FiDownload />
                    <span>Преземи</span>
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

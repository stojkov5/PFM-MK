import React, { useMemo, useState } from "react";
import { Row, Col, Button, Segmented, Collapse, Tag } from "antd";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import "./Records.css";

const { Panel } = Collapse;

const Records = () => {
  const [pool, setPool] = useState("25");
  const [gender, setGender] = useState("female");

  const docs = useMemo(
    () => ({
      25: {
        female: {
          title: "National Records — 25m Pool (Female)",
          subtitle: "Short Course Pool / 25 meters — по категории и дисциплини",
          file: "/National-records-25m-pool-FEMALE.pdf",
          tags: ["25m", "Female", "Short course"],
        },
        male: {
          title: "National Records — 25m Pool (Male)",
          subtitle: "Short Course Pool / 25 meters — по категории и дисциплини",
          file: "/National-records-25m-pool-MALE.pdf",
          tags: ["25m", "Male", "Short course"],
        },
      },
      50: {
        female: {
          title: "National Records — 50m Pool (Female)",
          subtitle: "Long Course Pool / 50 meters — по категории и дисциплини",
          file: "/National-records-50m-pool-FEMALE.pdf",
          tags: ["50m", "Female", "Long course"],
        },
        male: {
          title: "National Records — 50m Pool (Male)",
          subtitle: "Long Course Pool / 50 meters — по категории и дисциплини",
          file: "/National-records-50m-pool-MALE.pdf",
          tags: ["50m", "Male", "Long course"],
        },
      },
    }),
    [],
  );

  const current = docs[pool][gender];

  // Quick highlights (small, readable – the full truth is in the PDFs)
  // These values are taken from your PDFs:
  const highlights = useMemo(() => {
    // Female 25m sample: 50 free senior 0:26:08 Bogdanovska Anastasija :contentReference[oaicite:4]{index=4}
    // Male 25m sample: 50 free senior 0:23:07 Blazhevski Marko :contentReference[oaicite:5]{index=5}
    // Female 50m sample: 50 free senior 0:26:34 Bogdanovska Anastasija :contentReference[oaicite:6]{index=6}
    // Male 50m sample: 50 free senior 0:23:70 Marko Blazhevski :contentReference[oaicite:7]{index=7}

    if (pool === "25" && gender === "female") {
      return [
        {
          label: "50m Free (Senior)",
          value: "0:26:08 — Bogdanovska Anastasija",
        },
        {
          label: "100m Free (Senior)",
          value: "0:55.60 — Blazevska Eminova Mia",
        },
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
        {
          label: "50m Free (Senior)",
          value: "0:26:34 — Bogdanovska Anastasija",
        },
        {
          label: "100m Free (Senior)",
          value: "0:56:12 — Bogdanovska Anastasija",
        },
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
      {/* Header */}
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-records-head">
          <div className="pfm-records-kicker">Record List</div>
          <h2 className="pfm-records-title">Национални рекорди</h2>
          <p className="pfm-records-sub">
            Пријавувањето на Национален рекорд се прави исклучиво на
            официјалната електронска пошта на Националната пливачка федерација.
            Клубот чиј пливач го испливал рекордот мора да го пријави истото на
            официјален меморандум од клубот и треба да ги содржи следните
            работи:
            <ol className="pfm-records-list">
              <li> Име и Презиме на пливачот</li>
              <li> Година на раѓање</li>
              <li> Испливано време</li>
              <li>
                {" "}
                Линк од натпреварот и дисциплината за проверка на резултат
              </li>
            </ol>
            Доколку не се почитуваа горенаведените работи,рекордот нема да биде
            внесен во рекордерска листа.
          </p>
        </div>

        {/* Controls */}
        <div className="pfm-records-controls pb-3 ">
          <div className="pfm-control">
            <div className="pfm-control-label">Pool</div>
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
            <div className="pfm-control-label">Competition</div>
            <Segmented
              options={[
                { label: "Female", value: "female" },
                { label: "Male", value: "male" },
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
                {current.tags.map((t) => (
                  <Tag key={t} className="pfm-doc-tag">
                    {t}
                  </Tag>
                ))}
              </div>

              <div className="pfm-doc-actions">
                <Button
                  className="pfm-doc-btn"
                  onClick={() => openDoc(current.file)}
                  icon={<FiExternalLink />}
                >
                  Отвори PDF
                </Button>

                <a
                  className="pfm-doc-btn pfm-doc-btn-primary"
                  href={current.file}
                  download
                >
                  <FiDownload />
                  <span>Преземи</span>
                </a>
              </div>

              <div className="pfm-highlights">
                <div className="pfm-highlights-title">Quick highlights</div>
                <div className="pfm-highlights-grid">
                  {highlights.map((h) => (
                    <div className="pfm-highlight" key={h.label}>
                      <div className="pfm-highlight-label">{h.label}</div>
                      <div className="pfm-highlight-value">{h.value}</div>
                    </div>
                  ))}
                </div>

                <Collapse className="pfm-collapse" bordered={false}>
                  <Panel header="Забелешка" key="note">
                    <div className="pfm-note">
                      За целосни листи (сите дисциплини, категории, штафети)
                      користи PDF прегледот десно или преземи документ.
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </div>
          </Col>

          {/* PDF preview */}
          <Col xs={24} lg={15}>
            <div className="pfm-pdf-card">
              <div className="pfm-pdf-top">
                <div className="pfm-pdf-top-title">Preview</div>
                <div className="pfm-pdf-top-sub">
                  Ако прегледот не се прикажува во некој browser, користи
                  “Отвори PDF”.
                </div>
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

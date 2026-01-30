// src/pages/Swimming/Clubs.jsx
import React, { useMemo, useState } from "react";
import { Row, Col, Input, Select, Tag } from "antd";
import { FiSearch, FiMail } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Clubs.css";

const { Option } = Select;

const Clubs = () => {
  const { t } = useTranslation();

  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");

  const clubs = useMemo(
    () => [
      {
        id: 1,
        name: "ПК Младост",
        city: "",
        type: "Пливачки клуб",
        email: "pkmladost@hotmail.com",
      },
      { id: 2, name: "ПК Орион", city: "Скопје", type: "Пливачки клуб" },
      { id: 3, name: "ПК Делфин", city: "Скопје", type: "Пливачки клуб" },
      {
        id: 4,
        name: "ПК Вип Работнички",
        city: "Скопје",
        type: "Пливачки клуб",
      },
      { id: 5, name: "ПК Бета", city: "", type: "Пливачки и ватерполо клуб" },
      { id: 6, name: "ПК Челични", city: "Штип", type: "Пливачки клуб" },
      { id: 7, name: "ПК Феникс", city: "Скопје", type: "Пливачки клуб" },
      { id: 8, name: "ПК Карпош", city: "Скопје", type: "Пливачки клуб" },
      { id: 9, name: "ПК Немо", city: "Куманово", type: "Пливачки клуб" },
      { id: 10, name: "ПК Ноти", city: "Скопје", type: "Пливачки клуб" },
      { id: 11, name: "ПК Орки 2012", city: "Битола", type: "Пливачки клуб" },
      { id: 12, name: "ПК Тумба", city: "Куманово", type: "Пливачки клуб" },
      { id: 13, name: "ПК Вардар 2018", city: "Скопје", type: "Пливачки клуб" },
      { id: 14, name: "ПК Аква", city: "Куманово", type: "Пливачки клуб" },
      { id: 15, name: "ПК Струга", city: "Струга", type: "Пливачки клуб" },
      { id: 16, name: "ПК Звезда", city: "Скопје", type: "Пливачки клуб" },
      { id: 17, name: "ПК Пес", city: "Скопје", type: "Пливачки клуб" },
      { id: 18, name: "ПК Делфини", city: "Куманово", type: "Пливачки клуб" },
    ],
    []
  );

  const cities = useMemo(() => {
    const set = new Set(clubs.map((c) => c.city).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [clubs]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return clubs.filter((c) => {
      const matchesCity = city === "all" ? true : c.city === city;
      const matchesQ = !s
        ? true
        : [c.name, c.city, c.type, c.email].join(" ").toLowerCase().includes(s);
      return matchesCity && matchesQ;
    });
  }, [clubs, q, city]);

  return (
    <div className="pfm-clubs pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-clubs-head">
          <div className="pfm-clubs-kicker">{t("clubs.kicker")}</div>
          <h2 className="pfm-clubs-title">{t("clubs.title")}</h2>
          <p className="pfm-clubs-sub">{t("clubs.subtitle")}</p>

          <div className="pfm-clubs-controls pb-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              prefix={<FiSearch />}
              placeholder={t("clubs.searchPlaceholder")}
              className="pfm-clubs-search"
              allowClear
            />

            <Select
              value={city}
              onChange={setCity}
              className="pfm-clubs-select"
              popupClassName="pfm-clubs-select-popup"
            >
              {cities.map((c) => (
                <Option key={c} value={c}>
                  {c === "all" ? t("clubs.allCities") : c}
                </Option>
              ))}
            </Select>

            <Tag className="pfm-clubs-tag">
              {t("clubs.total")} <b>{filtered.length}</b>
            </Tag>
          </div>
        </div>

        <Row gutter={[14, 14]}>
          {filtered.map((c) => (
            <Col xs={24} sm={12} lg={8} key={c.id}>
              <div className="pfm-club-card">
                <div className="pfm-club-top">
                  <div className="pfm-club-badge">{c.id}</div>
                  <div className="pfm-club-name">{c.name}</div>
                </div>

                <div className="pfm-club-meta">
                  <div className="pfm-club-line">
                    <span className="pfm-club-label">{t("clubs.labels.city")}</span>
                    <span className="pfm-club-value">{c.city || t("common.dash")}</span>
                  </div>

                  <div className="pfm-club-line">
                    <span className="pfm-club-label">{t("clubs.labels.type")}</span>
                    <span className="pfm-club-value">{c.type || t("common.dash")}</span>
                  </div>

                  {c.email && (
                    <a className="pfm-club-email" href={`mailto:${c.email}`}>
                      <FiMail />
                      <span>{c.email}</span>
                    </a>
                  )}
                </div>

                <div className="pfm-club-tags">
                  {c.city ? <Tag className="pfm-tag">{c.city}</Tag> : null}
                  {c.type ? (
                    <Tag className="pfm-tag pfm-tag-alt">{c.type}</Tag>
                  ) : null}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Clubs;

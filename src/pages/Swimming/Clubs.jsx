import React, { useMemo, useState } from "react";
import { Row, Col, Input, Select, Tag } from "antd";
import { FiSearch, FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import clubsData from "../../data/Clubs.json";
import "./Clubs.css";

const { Option } = Select;

const Clubs = () => {
  const { t } = useTranslation();

  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");

  const clubs = useMemo(() => clubsData, []);

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(clubs.map((club) => club.city).filter(Boolean))];
    return ["all", ...uniqueCities.sort((a, b) => a.localeCompare(b, "mk"))];
  }, [clubs]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    return clubs.filter((club) => {
      const matchesCity = city === "all" ? true : club.city === city;

      const haystack = [
        club.name,
        club.city,
        club.type,
        club.address,
        club.email,
        club.phone,
        club.president
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search ? true : haystack.includes(search);

      return matchesCity && matchesSearch;
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
              {cities.map((item) => (
                <Option key={item} value={item}>
                  {item === "all" ? t("clubs.allCities") : item}
                </Option>
              ))}
            </Select>

            <Tag className="pfm-clubs-tag">
              {t("clubs.total")} <b>{filtered.length}</b>
            </Tag>
          </div>
        </div>

        <Row gutter={[14, 14]}>
          {filtered.map((club) => (
            <Col xs={24} sm={12} lg={8} key={club.id}>
              <div className="pfm-club-card">
                <div className="pfm-club-top">
                  <div className="pfm-club-badge">{club.id}</div>
                  <div className="pfm-club-name">{club.name}</div>
                </div>

                <div className="pfm-club-meta">
                  <div className="pfm-club-line">
                    <span className="pfm-club-label">{t("clubs.labels.city")}</span>
                    <span className="pfm-club-value">
                      {club.city || t("clubs.dash", { defaultValue: "—" })}
                    </span>
                  </div>

                  <div className="pfm-club-line">
                    <span className="pfm-club-label">{t("clubs.labels.type")}</span>
                    <span className="pfm-club-value">
                      {club.type || t("clubs.dash", { defaultValue: "—" })}
                    </span>
                  </div>

                  <div className="pfm-club-line">
                    <span className="pfm-club-label">{t("clubs.labels.address")}</span>
                    <span className="pfm-club-value">
                      {club.address || t("clubs.dash", { defaultValue: "—" })}
                    </span>
                  </div>

                  <div className="pfm-club-line">
                    <span className="pfm-club-label">{t("clubs.labels.phone")}</span>
                    <span className="pfm-club-value">
                      {club.phone || t("clubs.dash", { defaultValue: "—" })}
                    </span>
                  </div>

                  <div className="pfm-club-line">
                    <span className="pfm-club-label">{t("clubs.labels.president")}</span>
                    <span className="pfm-club-value">
                      {club.president || t("clubs.dash", { defaultValue: "—" })}
                    </span>
                  </div>

                  {club.email && (
                    <a className="pfm-club-email" href={`mailto:${club.email}`}>
                      <FiMail />
                      <span>{club.email}</span>
                    </a>
                  )}
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
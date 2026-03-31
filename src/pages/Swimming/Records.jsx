import React, { useMemo, useState } from "react";
import { Row, Col, Segmented, Collapse, Tag, Empty } from "antd";
import { FiFileText, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import "./Records.css";

import women25 from "../../data/records/women25.json";
import women50 from "../../data/records/women50.json";
import men25 from "../../data/records/men25.json";
import men50 from "../../data/records/men50.json";

const { Panel } = Collapse;

const DATA_MAP = {
  25: {
    female: women25,
    male: men25,
  },
  50: {
    female: women50,
    male: men50,
  },
};

const FALLBACK_CATEGORIES = [
  "Seniors",
  "Juniors",
  "Cadets",
  "Pioneers",
];

const getCategoryName = (category, t) => {
  if (typeof category === "string") return category;

  if (category?.name) return category.name;
  if (category?.title) return category.title;
  if (category?.category) return category.category;

  return t("records.defaultCategory", "Category");
};

const getCategoryRecords = (category) => {
  if (!category) return [];

  if (Array.isArray(category.records)) return category.records;
  if (Array.isArray(category.items)) return category.items;
  if (Array.isArray(category.disciplines)) return category.disciplines;

  return [];
};

const getRecordDiscipline = (record) =>
  record?.discipline ||
  record?.event ||
  record?.name ||
  record?.title ||
  "-";

const getRecordTime = (record) =>
  record?.time ||
  record?.result ||
  record?.mark ||
  "-";

const getRecordAthlete = (record) =>
  record?.athlete ||
  record?.swimmer ||
  record?.nameAthlete ||
  record?.holder ||
  "-";

const getRecordClub = (record) =>
  record?.club ||
  record?.team ||
  record?.organization ||
  "";

const getRecordDate = (record) =>
  record?.date ||
  record?.recordDate ||
  "";

const getRecordPlace = (record) =>
  record?.place ||
  record?.city ||
  record?.competition ||
  "";

const normalizeData = (rawData, t) => {
  if (!rawData) return [];

  if (Array.isArray(rawData)) {
    const looksLikeCategoryArray = rawData.some(
      (item) =>
        item?.records ||
        item?.items ||
        item?.disciplines ||
        item?.name ||
        item?.title ||
        item?.category
    );

    if (looksLikeCategoryArray) {
      return rawData.map((category, index) => ({
        id: category?.id || category?.slug || `${getCategoryName(category, t)}-${index}`,
        name: getCategoryName(category, t),
        records: getCategoryRecords(category),
      }));
    }

    return [
      {
        id: "all-records",
        name: t("records.allRecords", "All Records"),
        records: rawData,
      },
    ];
  }

  if (Array.isArray(rawData.categories)) {
    return rawData.categories.map((category, index) => ({
      id: category?.id || category?.slug || `${getCategoryName(category, t)}-${index}`,
      name: getCategoryName(category, t),
      records: getCategoryRecords(category),
    }));
  }

  if (rawData.records && Array.isArray(rawData.records)) {
    return [
      {
        id: "all-records",
        name: rawData?.title || t("records.allRecords", "All Records"),
        records: rawData.records,
      },
    ];
  }

  return [];
};

const Records = () => {
  const { t } = useTranslation();

  const [pool, setPool] = useState("25");
  const [gender, setGender] = useState("female");

  const rawData = DATA_MAP?.[pool]?.[gender];

  const categories = useMemo(() => normalizeData(rawData, t), [rawData, t]);

  const currentMeta = useMemo(() => {
    const genderLabel =
      gender === "female"
        ? t("records.controls.female", "Women")
        : t("records.controls.male", "Men");

    return {
      title: `${genderLabel} · ${pool}m`,
      subtitle: t(
        "records.subtitle",
        "National swimming records grouped by category and discipline."
      ),
      tags: [
        `${pool}m`,
        genderLabel,
        pool === "25"
          ? t("records.tags.shortCourse", "Short Course")
          : t("records.tags.longCourse", "Long Course"),
      ],
    };
  }, [gender, pool, t]);

  const totalRecords = useMemo(() => {
    return categories.reduce((sum, category) => sum + category.records.length, 0);
  }, [categories]);

  return (
    <div className="pfm-records pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-records-head">
          <div className="pfm-records-kicker">
            {t("records.kicker", "Swimming Records")}
          </div>

          <h2 className="pfm-records-title">
            {t("records.title", "National Records")}
          </h2>

          <div className="pfm-records-sub">
            
          </div>
        </div>

        <div className="pfm-records-controls pb-3">
          <div className="pfm-control">
            <div className="pfm-control-label">
              {t("records.controls.pool", "Pool")}
            </div>

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
            <div className="pfm-control-label">
              {t("records.controls.gender", "Gender")}
            </div>

            <Segmented
              options={[
                {
                  label: t("records.controls.female", "Women"),
                  value: "female",
                },
                {
                  label: t("records.controls.male", "Men"),
                  value: "male",
                },
              ]}
              value={gender}
              onChange={setGender}
            />
          </div>
        </div>

        <Row gutter={[16, 16]} align="stretch">
          <Col span={24}>
            <div className="pfm-doc-card">
              <div className="pfm-doc-top">
                <div className="pfm-doc-ico">
                  <FiFileText />
                </div>

                <div className="pfm-doc-meta">
                  <div className="pfm-doc-title">{currentMeta.title}</div>
                  <div className="pfm-doc-sub">{currentMeta.subtitle}</div>
                </div>
              </div>

              <div className="pfm-doc-tags">
                {currentMeta.tags.map((tag) => (
                  <Tag key={tag} className="pfm-doc-tag">
                    {tag}
                  </Tag>
                ))}
              </div>

              <div className="pfm-highlights">
                <div className="pfm-highlights-title">
                  {t("records.overviewTitle")}
                </div>

                <div className="pfm-highlights-grid">
                  <div className="pfm-highlight">
                    <div className="pfm-highlight-label">
                      {t("records.summary.categories", "Categories")}
                    </div>
                    <div className="pfm-highlight-value">
                      {categories.length || FALLBACK_CATEGORIES.length}
                    </div>
                  </div>

                  <div className="pfm-highlight">
                    <div className="pfm-highlight-label">
                      {t("records.summary.records", "Records")}
                    </div>
                    <div className="pfm-highlight-value">{totalRecords}</div>
                  </div>

                  <div className="pfm-highlight">
                    <div className="pfm-highlight-label">
                      {t("records.summary.selection", "Selection")}
                    </div>
                    <div className="pfm-highlight-value">
                      {gender === "female"
                        ? t("records.controls.female", "Women")
                        : t("records.controls.male", "Men")}{" "}
                      / {pool}m
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          </Col>

          <Col span={24}>
            <div className="pfm-pdf-card">
              <div className="pfm-pdf-top">
                <div className="pfm-pdf-top-title">
                  {t("records.table.list")}
                </div>
                
              </div>

              <div className="p-4 md:p-5">
                {categories.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t(
                      "records.empty",
                      "No records yet. Add the JSON data files and the records will appear here."
                    )}
                  />
                ) : (
                  <Collapse
                    className="pfm-collapse pfm-record-list"
                    bordered={false}
                    defaultActiveKey={categories[0]?.id ? [categories[0].id] : []}
                  >
                    {categories.map((category, index) => (
                      <Panel
                        key={category.id || `category-${index}`}
                        header={`${category.name} (${category.records.length})`}
                      >
                        <div className="grid gap-3">
                          {category.records.length === 0 ? (
                            <div className="pfm-note">
                              {t("records.noCategoryRecords", "No records in this category.")}
                            </div>
                          ) : (
                            category.records.map((record, recordIndex) => (
                              <div
                                key={`${category.id}-${getRecordDiscipline(record)}-${recordIndex}`}
                                className="pfm-highlight"
                              >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div className="flex-1">
                                    <div className="pfm-highlight-label">
                                      {getRecordDiscipline(record)}
                                    </div>
                                    <div className="pfm-highlight-value">
                                      {getRecordTime(record)}
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <div className="pfm-highlight-label">
                                      {t("records.fields.athlete", "Athlete")}
                                    </div>
                                    <div className="pfm-highlight-value">
                                      {getRecordAthlete(record)}
                                    </div>
                                  </div>
                                </div>

                                {(getRecordClub(record) ||
                                  getRecordDate(record) ||
                                  getRecordPlace(record)) && (
                                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                                    {getRecordClub(record) && (
                                      <div>
                                        <div className="pfm-highlight-label">
                                          {t("records.fields.club", "Club")}
                                        </div>
                                        <div className="pfm-note">
                                          {getRecordClub(record)}
                                        </div>
                                      </div>
                                    )}

                                    {getRecordDate(record) && (
                                      <div>
                                        <div className="pfm-highlight-label">
                                          {t("records.fields.date", "Date")}
                                        </div>
                                        <div className="pfm-note">
                                          {getRecordDate(record)}
                                        </div>
                                      </div>
                                    )}

                                    {getRecordPlace(record) && (
                                      <div>
                                        <div className="pfm-highlight-label">
                                          {t("records.fields.place", "Place")}
                                        </div>
                                        <div className="pfm-note">
                                          {getRecordPlace(record)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </Panel>
                    ))}
                  </Collapse>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Records;
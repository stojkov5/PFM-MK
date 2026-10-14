import React, { useState } from "react";
import { ConfigProvider, Modal } from "antd";
import { FiDownload, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { apiGet, apiUrl } from "../../lib/api.js";
import { antDarkTheme } from "../../lib/antDarkTheme.js";
import Reveal from "../../components/fx/Reveal.jsx";
import RecordApplicationForm from "./RecordApplicationForm.jsx";
import PillSwitch from "./PillSwitch.jsx";
import "./Records.css";

const POOLS = ["25", "50"];
const GENDERS = ["female", "male"];

const CategoryRow = ({ category, index, open, onToggle }) => {
  const { t } = useTranslation();
  const panelId = `pfm-rec-panel-${index}`;

  return (
    <li className={`pfm-rec-row ${open ? "is-open" : ""}`} style={{ "--i": index }}>
      <button
        type="button"
        className="pfm-rec-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="pfm-rec-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="pfm-rec-name">{category.name}</span>
        <span className="pfm-rec-count">
          {t("records.count", { count: category.records.length })}
        </span>
        <span className="pfm-rec-icon">
          <FiPlus />
        </span>
      </button>

      <div className="pfm-rec-panel" id={panelId} role="region" aria-hidden={!open}>
        <div className="pfm-rec-panel-inner">
          {category.records.length === 0 ? (
            <p className="pfm-rec-none">{t("records.noCategoryRecords")}</p>
          ) : (
            <table className="pfm-rec-table">
              <thead>
                <tr>
                  <th scope="col">{t("records.fields.discipline")}</th>
                  <th scope="col">{t("records.fields.time")}</th>
                  <th scope="col">{t("records.fields.athlete")}</th>
                </tr>
              </thead>
              <tbody>
                {category.records.map((record) => (
                  <tr key={record.discipline}>
                    <th scope="row" className="pfm-rec-discipline">
                      {record.discipline}
                    </th>
                    <td className="pfm-rec-time">{record.time || "—"}</td>
                    <td className="pfm-rec-athlete">{record.athlete || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </li>
  );
};

const Records = () => {
  const { t, i18n } = useTranslation();

  const [pool, setPool] = useState("25");
  const [gender, setGender] = useState("female");
  // Name of the expanded category; undefined = the first one, null = none.
  const [openName, setOpenName] = useState(undefined);
  const [applying, setApplying] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["records", pool, gender],
    queryFn: () => apiGet(`/api/records?pool=${pool}&gender=${gender}`),
  });

  const categories = Array.isArray(data) ? data : [];
  const activeName = openName === undefined ? categories[0]?.name : openName;

  const lang = (i18n.resolvedLanguage || i18n.language) === "mk" ? "mk" : "en";
  const exportUrl = apiUrl(`/api/records/export?pool=${pool}&gender=${gender}&lang=${lang}`);

  return (
    <div className="pfm-rec pt-24">
      <div className="pfm-landing-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-rec-head">
            <div className="pfm-rec-kicker">{t("records.kicker")}</div>
            <h2 className="pfm-rec-title">{t("records.title")}</h2>
            <p className="pfm-rec-sub">{t("records.subtitle")}</p>
          </header>

          <div className="pfm-rec-bar">
            <div className="pfm-rec-filters">
              <PillSwitch
                label={t("records.controls.pool")}
                value={pool}
                onChange={setPool}
                options={POOLS.map((value) => ({ value, label: `${value}m` }))}
              />
              <PillSwitch
                label={t("records.controls.gender")}
                value={gender}
                onChange={setGender}
                options={GENDERS.map((value) => ({
                  value,
                  label: t(`records.controls.${value}`),
                }))}
              />
            </div>

            <div className="pfm-rec-actions">
              <a className="pfm-rec-btn" href={exportUrl} target="_blank" rel="noopener noreferrer">
                <FiDownload /> {t("records.actions.excel")}
              </a>
              <button
                type="button"
                className="pfm-rec-btn is-primary"
                onClick={() => setApplying(true)}
              >
                <FiPlus /> {t("records.actions.add")}
              </button>
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="pfm-rec-state" aria-busy="true">
            {t("records.loading")}
          </div>
        ) : isError ? (
          <div className="pfm-rec-state">
            <p>{t("records.loadError")}</p>
            <button type="button" className="pfm-rec-btn" onClick={() => refetch()}>
              {t("records.retry")}
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="pfm-rec-state">{t("records.empty")}</div>
        ) : (
          // Keyed by the selection so the rows replay their entrance when it changes.
          <ol className="pfm-rec-list" key={`${pool}-${gender}`}>
            {categories.map((category, index) => (
              <CategoryRow
                key={category.name}
                category={category}
                index={index}
                open={activeName === category.name}
                onToggle={() =>
                  setOpenName(activeName === category.name ? null : category.name)
                }
              />
            ))}
          </ol>
        )}
      </div>

      <ConfigProvider theme={antDarkTheme}>
        <Modal
          open={applying}
          onCancel={() => setApplying(false)}
          title={t("records.apply.title")}
          footer={null}
          width={680}
          destroyOnHidden
          className="pfm-rec-modal"
        >
          <p className="pfm-rec-modal-intro">{t("records.apply.intro")}</p>
          <RecordApplicationForm
            initialPool={pool}
            initialGender={gender}
            onClose={() => setApplying(false)}
          />
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default Records;

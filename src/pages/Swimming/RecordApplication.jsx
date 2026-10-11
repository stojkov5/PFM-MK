import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import RecordApplicationForm from "./RecordApplicationForm.jsx";
import "./RecordApplication.css";

// Standalone page for the record application form (also offered as a dialog
// on the records page).
const RecordApplication = () => {
  const { t } = useTranslation();

  return (
    <div className="pfm-recapp pt-24">
      <div className="pfm-landing-inner max-w-3xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-recapp-head">
            <div className="pfm-recapp-kicker">{t("recordApplication.kicker")}</div>
            <h2 className="pfm-recapp-title pfm-lane-underline pfm-lane-underline-left">
              {t("recordApplication.title")}
            </h2>
            <p className="pfm-recapp-sub">{t("recordApplication.subtitle")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="pfm-recapp-card">
            <RecordApplicationForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default RecordApplication;

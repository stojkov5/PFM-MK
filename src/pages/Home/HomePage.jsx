// src/pages/Home/HomePage.jsx
// The home page, kept short: a hero, the three sports, the latest news, the
// next competitions, and a few words about the federation.
import React, { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiBookOpen, FiGitBranch, FiHeart, FiUsers } from "react-icons/fi";
import Reveal from "../../components/fx/Reveal.jsx";
import { ArticleCard } from "../News/News.jsx";
import { useCompetitions } from "../../components/competitions/hooks.js";
import { apiGet } from "../../lib/api.js";
import { formatRange, todayString } from "../../lib/competitions.js";
import { PARTNERS } from "../../data/partners.js";
import "../News/News.css";
import "./Home.css";

// The moving water at the bottom of the hero (three.js), loaded only when the
// browser supports WebGL and the visitor hasn't asked for reduced motion.
const HeroWater = lazy(() => import("../../components/fx/HeroWater.jsx"));

const canUseWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const SPORTS = [
  { key: "swimming", to: "/swimming", image: "/Images/Swim.webp" },
  { key: "waterpolo", to: "/waterpolo", image: "/Images/Waterpolo.webp" },
  { key: "distance", to: "/distance-swimming", image: "/Images/Distance.webp" },
];

const ABOUT_LINKS = [
  { key: "documents", to: "/documents", icon: <FiBookOpen /> },
  { key: "clubs", to: "/clubs", icon: <FiUsers /> },
  { key: "structure", to: "/about/structure", icon: <FiGitBranch /> },
  { key: "partners", to: "/about/partners", icon: <FiHeart /> },
];

const SectionHead = ({ title, link, linkText }) => (
  <div className="pfm-home-head">
    <h2 className="pfm-home-title">{title}</h2>
    {link && (
      <Link to={link} className="pfm-home-more">
        {linkText} <FiArrowRight />
      </Link>
    )}
  </div>
);

// The partner logos, scrolling endlessly along the bottom of the hero. The
// track holds the list twice per half (five logos are narrower than the
// screen), and slides by exactly one half so the loop has no seam.
const PartnerMarquee = () => {
  const { t } = useTranslation();
  const half = [...PARTNERS, ...PARTNERS];

  return (
    <div className="pfm-home-marquee max-w-6xl mx-auto px-4 md:px-6" role="region" aria-label={t("home.hero.partners")}>
      <div className="pfm-home-marquee-viewport">
        <div className="pfm-home-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="pfm-home-marquee-list" aria-hidden={copy === 1 || undefined}>
              {half.map((p, i) => {
                const name = t(`about.partners.items.${p.key}`);
                const Tag = p.url ? "a" : "span";
                const linkProps = p.url
                  ? { href: p.url, target: "_blank", rel: "noopener noreferrer", title: name }
                  : { title: name };
                // Only the first copy of each logo is reachable by keyboard.
                const hidden = copy === 1 || i >= PARTNERS.length;
                return (
                  <li key={i}>
                    <Tag
                      className="pfm-home-marquee-logo"
                      style={{ background: p.bg }}
                      tabIndex={hidden && p.url ? -1 : undefined}
                      {...linkProps}
                    >
                      <img
                        src={`/Partners/${encodeURIComponent(p.file)}`}
                        alt={hidden ? "" : name}
                        style={{
                          objectFit: p.fit ?? "contain",
                          transform: p.zoom ? `scale(${p.zoom})` : undefined,
                        }}
                      />
                    </Tag>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [showWater, setShowWater] = useState(false);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = requestAnimationFrame(() => setShowWater(canUseWebGL()));
    return () => cancelAnimationFrame(id);
  }, [reduceMotion]);

  return (
    <section className="pfm-home-hero">
      {showWater && (
        <Suspense fallback={null}>
          <HeroWater />
        </Suspense>
      )}
      <div className="pfm-home-hero-inner max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <span className="pfm-home-kicker">{t("home.hero.kicker")}</span>
          <h1 className="pfm-home-hero-title">{t("home.hero.title")}</h1>
          <p className="pfm-home-hero-text">{t("home.hero.text")}</p>
          <div className="pfm-home-hero-actions">
            <Link to="/news" className="pfm-home-btn is-primary">
              {t("home.hero.news")} <FiArrowRight />
            </Link>
            <Link to="/calendar" className="pfm-home-btn">
              {t("home.hero.calendar")}
            </Link>
          </div>
        </Reveal>
      </div>
      <PartnerMarquee />
    </section>
  );
};

const Sports = () => {
  const { t } = useTranslation();
  return (
    <section className="pfm-home-section">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <SectionHead title={t("home.sports.title")} />
        </Reveal>
        <div className="pfm-home-sports">
          {SPORTS.map((s, i) => (
            <Reveal key={s.key} delay={i * 0.08}>
              <Link to={s.to} className="pfm-home-sport">
                <img src={s.image} alt="" loading="lazy" />
                <span className="pfm-home-sport-body">
                  <span className="pfm-home-sport-title">{t(`home.sports.${s.key}.title`)}</span>
                  <span className="pfm-home-sport-desc">{t(`home.sports.${s.key}.desc`)}</span>
                </span>
                <FiArrowRight className="pfm-home-sport-arrow" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const LatestNews = () => {
  const { t } = useTranslation();
  const latest = useQuery({
    queryKey: ["news", "latest"],
    queryFn: () => apiGet("/api/news?limit=3"),
  });
  const items = latest.data?.items ?? [];

  return (
    <section className="pfm-home-section">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <SectionHead title={t("home.news.title")} link="/news" linkText={t("home.news.all")} />
        </Reveal>
        {items.length === 0 ? (
          <p className="pfm-home-empty">
            {latest.isPending ? t("news.loading") : latest.isError ? t("news.error") : t("news.empty")}
          </p>
        ) : (
          <div className="pfm-articles-grid pfm-home-news">
            {items.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Upcoming = () => {
  const { t, i18n } = useTranslation();
  const { data, isPending } = useCompetitions();
  const today = todayString();
  const upcoming = (data?.competitions ?? []).filter((c) => c.endDate >= today).slice(0, 4);

  return (
    <section className="pfm-home-section">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <SectionHead
            title={t("home.upcoming.title")}
            link="/swimming/calendar-national"
            linkText={t("home.upcoming.all")}
          />
        </Reveal>
        {upcoming.length === 0 ? (
          <p className="pfm-home-empty">{isPending ? "…" : t("competitions.upcoming.empty")}</p>
        ) : (
          <ul className="pfm-home-events">
            {upcoming.map((c) => (
              <li key={c.id}>
                <Link to="/swimming/calendar-national" className="pfm-home-event">
                  <span className="pfm-home-event-date">
                    {formatRange(c.startDate, c.endDate, i18n.resolvedLanguage)}
                  </span>
                  <span className="pfm-home-event-main">
                    <span className="pfm-home-event-name">{c.name}</span>
                    <span className="pfm-home-event-meta">
                      {c.city} · {t(`competitions.courses.${c.course}`)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

const About = () => {
  const { t } = useTranslation();
  return (
    <section className="pfm-home-section pfm-home-section-last">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-home-about">
            <div>
              <span className="pfm-home-kicker">{t("home.about.kicker")}</span>
              <h2 className="pfm-home-title">{t("home.about.title")}</h2>
              <p className="pfm-home-about-text">{t("home.about.text")}</p>
              <Link to="/about" className="pfm-home-more">
                {t("home.about.more")} <FiArrowRight />
              </Link>
            </div>
            <ul className="pfm-home-links">
              {ABOUT_LINKS.map((l) => (
                <li key={l.key}>
                  <Link to={l.to} className="pfm-home-link">
                    <span className="pfm-home-link-icon">{l.icon}</span>
                    {t(`home.about.links.${l.key}`)}
                    <FiArrowRight className="pfm-home-link-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const HomePage = () => (
  <>
    <Hero />
    <Sports />
    <LatestNews />
    <Upcoming />
    <About />
  </>
);

export default HomePage;

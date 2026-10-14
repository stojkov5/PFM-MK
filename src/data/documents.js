// src/data/documents.js
// The federation's documents, shown on the /documents page and in the footer.
// Titles and descriptions are translated: documents.items.<key>.* in the locales.
import { FiBookOpen, FiClipboard, FiGitBranch, FiShield, FiUsers } from "react-icons/fi";

export const DOCUMENTS = [
  { key: "statute", Icon: FiBookOpen, accent: "blue", href: "/documents/Статут-Национална-Пливачка-Федерација.pdf" },
  { key: "registration", Icon: FiClipboard, accent: "emerald", href: "/documents/Регистрационен Правилник.pdf" },
  { key: "disciplinary", Icon: FiShield, accent: "rose", href: "/documents/Дисциплински Правилник.pdf" },
  { key: "championships", Icon: FiUsers, accent: "amber", href: "/documents/Правилник за Национални првенства НПФ (1).pdf" },
  { key: "structure", Icon: FiGitBranch, accent: "violet", href: "/documents/Организациска Структура.pdf" },
];

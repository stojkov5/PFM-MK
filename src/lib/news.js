// src/lib/news.js
import { formatLongDate } from "./dates.js";

// Keep in sync with ARTICLE_CATEGORIES in server/lib/news.js. Labels are in the
// translation files under news.categories.<key>.
export const NEWS_CATEGORIES = ["swimming", "waterpolo", "distance-swimming", "other"];

export const categoryLabelKey = (category) => `news.categories.${category}`;

export const formatNewsDate = (value, language) =>
  value ? formatLongDate(value, language === "mk" ? "mk" : "en-GB") : "";

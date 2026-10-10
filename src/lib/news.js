// src/lib/news.js

// Keep in sync with ARTICLE_CATEGORIES in server/lib/news.js. Labels are in the
// translation files under news.categories.<key>.
export const NEWS_CATEGORIES = ["swimming", "waterpolo", "distance-swimming", "other"];

export const categoryLabelKey = (category) => `news.categories.${category}`;

export const formatNewsDate = (value, language) =>
  value
    ? new Date(value).toLocaleDateString(language === "mk" ? "mk-MK" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

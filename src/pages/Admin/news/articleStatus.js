// src/pages/Admin/news/articleStatus.js

// What an article's status means for visitors, with the tag to show for it.
export const articleStatus = (article) => {
  if (article.status !== "published") return { key: "draft", label: "Draft", color: "default" };
  if (article.publishedAt && new Date(article.publishedAt) > new Date()) {
    return { key: "scheduled", label: "Scheduled", color: "gold" };
  }
  return { key: "live", label: "Published", color: "green" };
};

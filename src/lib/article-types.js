export const ARTICLE_TYPES = [
  "technology",
  "interview",
  "algorithm",
  "private",
];

const ARTICLE_TYPE_LABELS = {
  technology: "软件技术",
  interview: "面试经验",
  algorithm: "LeetCode",
  private: "个人文档",
};

export function normalizeArticleType(type) {
  const normalized = String(type || "technology").toLowerCase();
  if (normalized === "daily") return "private";
  return ARTICLE_TYPES.includes(normalized) ? normalized : "technology";
}

export function getArticleTypeLabel(type) {
  return ARTICLE_TYPE_LABELS[normalizeArticleType(type)];
}

// src/pages/Admin/news/ArticleEditor.jsx
// Create or edit one news article: title + body on the left, settings on the right.
import React, { useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App as AntApp, Button, DatePicker, Input, Result, Select, Spin, Tag } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { FiArrowLeft, FiExternalLink, FiImage, FiTrash2 } from "react-icons/fi";
import { apiUrl } from "../../../lib/api.js";
import { NEWS_CATEGORIES, categoryLabelKey } from "../../../lib/news.js";
import { useAdminApi } from "../useAdminApi.js";
import { articleStatus } from "./articleStatus.js";
import { prepareImage } from "./prepareImage.js";
import RichEditor from "./RichEditor.jsx";

const EMPTY = {
  id: null,
  slug: null,
  title: "",
  category: undefined,
  excerpt: "",
  coverImage: null,
  content: "",
  status: "draft",
  publishedAt: null,
};

const ArticleForm = ({ initial, onClose }) => {
  const api = useAdminApi();
  const { message, modal } = AntApp.useApp();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const coverInput = useRef(null);

  // `saved` is what the server has; `form` is what's on screen.
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [coverBusy, setCoverBusy] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const dirty = ["title", "category", "excerpt", "coverImage", "content", "publishedAt"].some(
    (k) => (form[k] ?? "") !== (saved[k] ?? "")
  );

  const upload = (file) => api.upload("/api/admin/media", file);

  const save = useMutation({
    mutationFn: (status) => {
      const body = {
        title: form.title,
        category: form.category,
        excerpt: form.excerpt,
        coverImage: form.coverImage,
        content: form.content,
        publishedAt: form.publishedAt,
        status,
      };
      return saved.id
        ? api.put(`/api/admin/news/${saved.id}`, body)
        : api.post("/api/admin/news", body);
    },
    onSuccess: (article, status) => {
      // The summary and date may have been filled in by the server.
      setSaved(article);
      setForm((f) => ({ ...f, excerpt: article.excerpt, publishedAt: article.publishedAt }));
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      const state = articleStatus(article).key;
      message.success(
        status === "draft"
          ? "Saved as draft — not visible on the site."
          : state === "scheduled"
            ? "Saved — it will appear on the site at the publish date."
            : "Published — it's live on the site."
      );
    },
    onError: (err) => message.error(err.message),
  });

  const submit = (status) => {
    if (!form.title.trim()) return message.warning("Give the article a title first.");
    if (!form.category) return message.warning("Choose a category first.");
    save.mutate(status);
  };

  const pickCover = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    setCoverBusy(true);
    try {
      const media = await upload(await prepareImage(file));
      set({ coverImage: media.url });
    } catch (err) {
      message.error(err.message);
    } finally {
      setCoverBusy(false);
    }
  };

  // Don't lose unsaved work: warn on closing the tab…
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // …and on clicking a link to another page of the site.
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    modal.confirm({
      title: "Leave without saving?",
      content: "Your changes to this article haven't been saved.",
      okText: "Leave",
      okButtonProps: { danger: true },
      cancelText: "Keep editing",
      onOk: () => blocker.proceed(),
      onCancel: () => blocker.reset(),
    });
  }, [blocker, modal]);

  const close = () => {
    if (!dirty) return onClose();
    modal.confirm({
      title: "Close without saving?",
      content: "Your changes to this article haven't been saved.",
      okText: "Discard changes",
      okButtonProps: { danger: true },
      cancelText: "Keep editing",
      onOk: onClose,
    });
  };

  const status = articleStatus(saved);
  const isPublished = saved.status === "published";

  return (
    <div className="pfm-admin-inner max-w-7xl mx-auto px-4 md:px-6">
      <div className="pfm-article-form-head">
        <Button icon={<FiArrowLeft />} onClick={close}>
          Articles
        </Button>
        <h1 className="pfm-admin-title">{saved.id ? "Edit article" : "New article"}</h1>
        <Tag color={status.color}>{status.label}</Tag>
        {dirty && <span className="pfm-admin-dim">Unsaved changes</span>}

        <div className="pfm-article-form-head-actions">
          {status.key === "live" && (
            <a
              href={`/news/${saved.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pfm-admin-link"
            >
              View on site <FiExternalLink />
            </a>
          )}
          {isPublished ? (
            <>
              <Button onClick={() => submit("draft")} disabled={save.isPending}>
                Unpublish
              </Button>
              <Button
                type="primary"
                onClick={() => submit("published")}
                loading={save.isPending}
                disabled={!dirty}
              >
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => submit("draft")} disabled={save.isPending || !dirty}>
                Save draft
              </Button>
              <Button type="primary" onClick={() => submit("published")} loading={save.isPending}>
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="pfm-article-form">
        <div className="pfm-article-main">
          <Input
            className="pfm-article-title-input"
            placeholder="Article title"
            maxLength={200}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
          />
          <RichEditor
            // The current text, so nothing is lost if the editor has to rebuild itself.
            initialContent={form.content}
            onChange={(content) => set({ content })}
            onUpload={upload}
          />
        </div>

        <aside className="pfm-article-side pfm-admin-card">
          <div className="pfm-article-field">
            <label className="pfm-article-label" htmlFor="article-category">
              Category
            </label>
            <Select
              id="article-category"
              placeholder="Choose a category"
              value={form.category}
              onChange={(category) => set({ category })}
              options={NEWS_CATEGORIES.map((c) => ({ value: c, label: t(categoryLabelKey(c)) }))}
            />
          </div>

          <div className="pfm-article-field">
            <span className="pfm-article-label">Cover image</span>
            {form.coverImage && (
              <div className="pfm-article-cover-preview">
                <img src={apiUrl(form.coverImage)} alt="" />
              </div>
            )}
            <div className="pfm-article-cover-actions">
              <Button
                icon={<FiImage />}
                loading={coverBusy}
                onClick={() => coverInput.current?.click()}
              >
                {form.coverImage ? "Change" : "Upload image"}
              </Button>
              {form.coverImage && (
                <Button icon={<FiTrash2 />} onClick={() => set({ coverImage: null })}>
                  Remove
                </Button>
              )}
            </div>
            <span className="pfm-admin-dim">
              Shown on the news cards and at the top of the article.
            </span>
            <input
              ref={coverInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={pickCover}
            />
          </div>

          <div className="pfm-article-field">
            <label className="pfm-article-label" htmlFor="article-excerpt">
              Short summary
            </label>
            <Input.TextArea
              id="article-excerpt"
              rows={4}
              maxLength={500}
              showCount
              placeholder="Shown on the news cards. Leave empty to use the start of the article."
              value={form.excerpt}
              onChange={(e) => set({ excerpt: e.target.value })}
            />
          </div>

          <div className="pfm-article-field">
            <label className="pfm-article-label" htmlFor="article-date">
              Publish date
            </label>
            <DatePicker
              id="article-date"
              showTime={{ format: "HH:mm" }}
              format="DD.MM.YYYY HH:mm"
              placeholder="When you press Publish"
              value={form.publishedAt ? dayjs(form.publishedAt) : null}
              onChange={(d) => set({ publishedAt: d ? d.toISOString() : null })}
            />
            <span className="pfm-admin-dim">
              The date shown on the article. A date in the future schedules it: it appears on
              the site by itself at that time.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

/** @param articleId  id of the article to edit, or null to write a new one */
const ArticleEditor = ({ articleId, onClose }) => {
  const api = useAdminApi();

  const article = useQuery({
    queryKey: ["admin-article", articleId],
    queryFn: () => api.get(`/api/admin/news/${articleId}`),
    enabled: articleId != null,
    // Loaded once when the editor opens; a refetch must not reset what's being typed.
    staleTime: Infinity,
    gcTime: 0,
  });

  if (articleId == null) return <ArticleForm initial={EMPTY} onClose={onClose} />;
  if (article.isPending) {
    return (
      <div className="pfm-admin-center">
        <Spin size="large" />
      </div>
    );
  }
  if (article.isError) {
    return (
      <div className="pfm-admin-center">
        <Result
          status="error"
          title="Couldn't open the article"
          subTitle={article.error.message}
          extra={<Button onClick={onClose}>Back to articles</Button>}
        />
      </div>
    );
  }
  return <ArticleForm initial={article.data} onClose={onClose} />;
};

export default ArticleEditor;

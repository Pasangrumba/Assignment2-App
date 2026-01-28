import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { assetsApi, tagsApi, workspacesApi } from "./api";

const TAG_TYPES = [
  "Industry",
  "Capability",
  "Region",
  "DeliverableType",
  "AssetType",
  "AccessLevel",
];

function CreateAsset() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    keywords: "",
    sourceUrl: "",
    assetType: "",
    confidentiality: "",
    sourceProjectId: "",
    workspaceId: "",
    versionMajor: 1,
    versionMinor: 0,
  });
  const [tagsByType, setTagsByType] = useState({});
  const [selectedTags, setSelectedTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    Promise.all([tagsApi.list(), workspacesApi.list()])
      .then(([tagData, workspaceData]) => {
        const grouped = (tagData.tags || []).reduce((acc, tag) => {
          acc[tag.tag_type] = acc[tag.tag_type] || [];
          acc[tag.tag_type].push(tag);
          return acc;
        }, {});
        setTagsByType(grouped);
        setWorkspaces(workspaceData.workspaces || []);
        if ((workspaceData.workspaces || []).length > 0) {
          setForm((prev) => ({
            ...prev,
            workspaceId: String(workspaceData.workspaces[0].id),
          }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleTagChange = (type, value) => {
    setSelectedTags((prev) => ({ ...prev, [type]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const tagIds = TAG_TYPES.map((type) => selectedTags[type]).filter(Boolean);
    const assetTypeTag = (tagsByType.AssetType || []).find(
      (tag) => String(tag.id) === String(selectedTags.AssetType)
    );
    const accessLevelTag = (tagsByType.AccessLevel || []).find(
      (tag) => String(tag.id) === String(selectedTags.AccessLevel)
    );

    const parsedVersionMajor = Number(form.versionMajor);
    const parsedVersionMinor = Number(form.versionMinor);

    assetsApi
      .create({
        title: form.title.trim(),
        description: form.description.trim(),
        tagIds,
        keywords: form.keywords.trim() || undefined,
        sourceUrl: form.sourceUrl.trim() || undefined,
        assetType: form.assetType.trim() || assetTypeTag?.tag_value,
        confidentiality:
          form.confidentiality.trim() || accessLevelTag?.tag_value || undefined,
        sourceProjectId: form.sourceProjectId.trim() || undefined,
        workspaceId: form.workspaceId || undefined,
        versionMajor: Number.isFinite(parsedVersionMajor) ? parsedVersionMajor : 1,
        versionMinor: Number.isFinite(parsedVersionMinor) ? parsedVersionMinor : 0,
      })
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
        <h2 className="h4 mb-3">Create Knowledge Asset</h2>
        {loading && <p>Loading tags...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && (
          <form onSubmit={handleSubmit} className="card p-3">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Keywords</label>
              <input
                name="keywords"
                className="form-control"
                placeholder="e.g. logistics, AI ops, middleware"
                value={form.keywords}
                onChange={handleChange}
              />
              <div className="form-text">
                Comma-separated terms to improve discovery.
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Source URL (optional)</label>
              <input
                name="sourceUrl"
                type="url"
                className="form-control"
                placeholder="https://example.com/resource"
                value={form.sourceUrl}
                onChange={handleChange}
              />
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Asset Type</label>
                <select
                  className="form-select"
                  name="assetType"
                  value={form.assetType}
                  onChange={handleChange}
                >
                  <option value="">Use metadata selection</option>
                  {(tagsByType.AssetType || []).map((tag) => (
                    <option key={tag.id} value={tag.tag_value}>
                      {tag.tag_value}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  DKN knowledge asset type (falls back to the AssetType tag).
                </div>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Confidentiality</label>
                <select
                  className="form-select"
                  name="confidentiality"
                  value={form.confidentiality}
                  onChange={handleChange}
                >
                  <option value="">Use AccessLevel tag</option>
                  {(tagsByType.AccessLevel || []).map((tag) => (
                    <option key={tag.id} value={tag.tag_value}>
                      {tag.tag_value}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  Access rules for the KnowledgeAsset record.
                </div>
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12 col-md-6">
                <label className="form-label">Workspace</label>
                <select
                  className="form-select"
                  name="workspaceId"
                  value={form.workspaceId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Source Project ID</label>
                <input
                  name="sourceProjectId"
                  className="form-control"
                  placeholder="e.g. PRJ-2048"
                  value={form.sourceProjectId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12 col-md-6">
                <label className="form-label">Version Major</label>
                <input
                  type="number"
                  min="0"
                  name="versionMajor"
                  className="form-control"
                  value={form.versionMajor}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Version Minor</label>
                <input
                  type="number"
                  min="0"
                  name="versionMinor"
                  className="form-control"
                  value={form.versionMinor}
                  onChange={handleChange}
                />
              </div>
            </div>

            {TAG_TYPES.map((type) => (
              <div className="mb-3" key={type}>
                <label className="form-label">{type}</label>
                <select
                  className="form-select"
                  value={selectedTags[type] || ""}
                  onChange={(event) => handleTagChange(type, event.target.value)}
                  required
                >
                  <option value="">Select {type}</option>
                  {(tagsByType[type] || []).map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.tag_value}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}

export default CreateAsset;

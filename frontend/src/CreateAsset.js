import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { assetsApi, tagsApi } from "./api";

const TAG_TYPES = ["Industry", "Capability", "Region", "DeliverableType"];

function CreateAsset() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [tagsByType, setTagsByType] = useState({});
  const [selectedTags, setSelectedTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tagsApi
      .list()
      .then((data) => {
        const grouped = (data.tags || []).reduce((acc, tag) => {
          acc[tag.tag_type] = acc[tag.tag_type] || [];
          acc[tag.tag_type].push(tag);
          return acc;
        }, {});
        setTagsByType(grouped);
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

    assetsApi
      .create({
        title: form.title.trim(),
        description: form.description.trim(),
        tagIds,
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
    <div>
      <NavBar />
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
  );
}

export default CreateAsset;

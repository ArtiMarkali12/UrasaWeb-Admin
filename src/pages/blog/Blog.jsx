import { useState, useEffect } from "react";
import { blogAPI } from "../../services/api";
import "./Blog.css";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getAll();
      setBlogs(response.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      showToast("Failed to fetch blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size should be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData((prev) => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await blogAPI.create(formData);
      setShowAddModal(false);
      setFormData({ title: "", description: "", image: "" });
      setImagePreview(null);
      fetchBlogs();
      showToast("Blog created successfully", "success");
    } catch (error) {
      console.error("Error creating blog:", error);
      showToast(error.response?.data?.message || "Failed to create blog", "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await blogAPI.update(selectedBlog._id, formData);
      setShowEditModal(false);
      setSelectedBlog(null);
      setFormData({ title: "", description: "", image: "" });
      setImagePreview(null);
      fetchBlogs();
      showToast("Blog updated successfully", "success");
    } catch (error) {
      console.error("Error updating blog:", error);
      showToast(error.response?.data?.message || "Failed to update blog", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await blogAPI.delete(id);
        setBlogs(blogs.filter((b) => b._id !== id));
        showToast("Blog deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting blog:", error);
        showToast("Failed to delete blog", "error");
      }
    }
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setShowViewModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title || "",
      description: blog.description || "",
      image: blog.image || "",
    });
    setImagePreview(blog.image || null);
    setShowEditModal(true);
    document.body.classList.add("modal-open");
  };

  const handleAdd = () => {
    setFormData({ title: "", description: "", image: "" });
    setImagePreview(null);
    setShowAddModal(true);
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedBlog(null);
    setImagePreview(null);
    document.body.classList.remove("modal-open");
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="blog-page">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ ...toast, show: false })}>×</button>
        </div>
      )}

      <div className="book-header">
        <h2>Blog Management</h2>
      </div>

      <div className="tab-content">
        <div className="blog-actions-bar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search blogs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-blog-btn" onClick={handleAdd}>
            <span>+</span> Add Blog
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading blogs...</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <div key={blog._id} className="blog-card">
                  <div className="blog-card-image">
                    {blog.image ? (
                      <img src={blog.image} alt={blog.title} />
                    ) : (
                      <div className="blog-image-placeholder">📝</div>
                    )}
                  </div>
                  <div className="blog-card-content">
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-description">
                      {blog.description?.length > 100
                        ? blog.description.substring(0, 100) + "..."
                        : blog.description}
                    </p>
                    <div className="blog-card-footer">
                      <span className="blog-date">{formatDate(blog.createdAt)}</span>
                      <div className="blog-card-actions">
                        <button className="action-btn view-btn" onClick={() => handleView(blog)}>View</button>
                        <button className="action-btn edit-btn" onClick={() => handleEdit(blog)}>Edit</button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(blog._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>No blogs found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Blog Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content blog-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <h2>Add New Blog</h2>
            </div>
            <form className="blog-form" onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group full-width">
                  <label>Blog Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Blog Image</label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="blog-image-upload"
                      className="image-upload-input"
                      required
                    />
                    <label htmlFor="blog-image-upload" className="image-upload-label">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="image-upload-preview" />
                      ) : (
                        <>
                          <span className="upload-icon">📷</span>
                          <span className="upload-text">Click to upload image</span>
                          <span className="upload-hint">JPG, PNG, GIF up to 5MB</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter blog description"
                    rows="5"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">Create Blog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {showEditModal && selectedBlog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content blog-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <h2>Edit Blog</h2>
            </div>
            <form className="blog-form" onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group full-width">
                  <label>Blog Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Blog Image</label>
                  <div className="image-upload-area">
                    {/* Removed required to allow keeping the existing image */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="blog-image-edit"
                      className="image-upload-input"
                    />
                    <label htmlFor="blog-image-edit" className="image-upload-label">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="image-upload-preview" />
                      ) : (
                        <>
                          <span className="upload-icon">📷</span>
                          <span className="upload-text">Click to change image</span>
                          <span className="upload-hint">JPG, PNG, GIF up to 5MB</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter blog description"
                    rows="5"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">Update Blog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Blog Modal */}
      {showViewModal && selectedBlog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content blog-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <h2>{selectedBlog.title}</h2>
            </div>
            <div className="modal-body">
              {selectedBlog.image && (
                <div className="blog-view-image">
                  <img src={selectedBlog.image} alt={selectedBlog.title} />
                </div>
              )}
              <div className="blog-view-meta">
                <span className="blog-view-date">{formatDate(selectedBlog.createdAt)}</span>
              </div>
              <div className="blog-view-description">
                <p>{selectedBlog.description}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-save" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
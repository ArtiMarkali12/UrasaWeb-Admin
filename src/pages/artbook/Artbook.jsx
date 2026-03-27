import { useState, useEffect } from "react";
import { artbookAPI, artbookOptionsAPI } from "../../services/api";
import "./Artbook.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Artbooks = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  const [optionsVersion, setOptionsVersion] = useState(0); // Track options updates

  // Quotes State
  const [Artbooks, setArtbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtbook, setSelectedArtbook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({});

  // Options State
  const [options, setOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [attributeInputs, setAttributeInputs] = useState({}); // Track input per subcategory
  const [editingOption, setEditingOption] = useState(null);
  const [editOptionValue, setEditOptionValue] = useState("");

  // Category Management State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryKey, setEditCategoryKey] = useState("");

  // Subcategory Management State
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editSubcategoryKey, setEditSubcategoryKey] = useState("");

  // Toast/Success Message State
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (activeTab === "quotes") {
      fetchArtbooks();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchArtbooks = async () => {
    try {
      const response = await artbookAPI.getAll();
      setArtbooks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Artbooks:", error);
      showToast("Failed to fetch Artbook quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Artbook quote?")) {
      try {
        await artbookAPI.delete(id);
        setArtbooks(Artbooks.filter((b) => b._id !== id));
        showToast("Artbook quote is deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting Artbook:", error);
        showToast("Failed to delete Artbook quote", "error");
      }
    }
  };

  const handleView = (Artbook) => {
    setSelectedArtbook(Artbook);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (Artbook) => {
    setFormData({
      quantity: Artbook.quantityRequired || Artbook.quantity || "",
      size: Artbook.bookFormatAndBinding?.size || "",
      bindingStyle: Artbook.bookFormatAndBinding?.bindingStyle || "",
      numberOfPages: Artbook.bookFormatAndBinding?.numberOfPages || "",
      paperType: Artbook.paperSelection?.paperType || "",
      paperWeight: Artbook.paperSelection?.paperWeight || "",
      coverMaterial:
        Artbook.coverAndProfessionalExtras?.coverMaterial?.join(", ") || "",
      features: Artbook.coverAndProfessionalExtras?.features?.join(", ") || "",
      artistNotes: Artbook.artistNotes || "",
      expectedDate: Artbook.timeline?.expectedDate
        ? new Date(Artbook.timeline.expectedDate).toISOString().split("T")[0]
        : "",
      deliveryDate: Artbook.timeline?.deliveryDate
        ? new Date(Artbook.timeline.deliveryDate).toISOString().split("T")[0]
        : "",
    });
    setSelectedArtbook(Artbook);
    setShowEditModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        quantityRequired: formData.quantity
          ? parseInt(formData.quantity)
          : undefined,
        bookFormatAndBinding: {
          size: formData.size,
          bindingStyle: formData.bindingStyle,
          numberOfPages: formData.numberOfPages,
        },
        paperSelection: {
          paperType: formData.paperType,
          paperWeight: formData.paperWeight,
        },
        coverAndProfessionalExtras: {
          coverMaterial: formData.coverMaterial
            ? formData.coverMaterial
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item)
            : [],
          features: formData.features
            ? formData.features
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item)
            : [],
        },
        artistNotes: formData.artistNotes,
        timeline: {
          expectedDate: formData.expectedDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      };
      await artbookAPI.update(selectedArtbook._id, updateData);
      fetchArtbooks();
      setShowEditModal(false);
      document.body.classList.remove("modal-open");
      setSelectedArtbook(null);
      showToast("Artbook quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating Artbook:", error);
      showToast("Failed to update Artbook quote", "error");
    }
  };

  const filteredArtbooks = Artbooks.filter(
    (Artbook) =>
      Artbook.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      Artbook.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const fetchOptions = async () => {
    try {
      const response = await artbookOptionsAPI.getAll();
      const newOptions = response.data?.data || {};

      // Create a deep clone to ensure all nested data is fresh
      const clonedOptions = JSON.parse(JSON.stringify(newOptions));
      setOptions(clonedOptions);
      setOptionsVersion((prev) => prev + 1); // Increment version to force re-render
    } catch (error) {
      console.error("Error fetching options:", error);
      showToast(
        error.response?.data?.message || "Failed to fetch options",
        "error",
      );
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleAddAttribute = async (categoryKey, subcategoryKey) => {
    const value = attributeInputs[`${categoryKey}-${subcategoryKey}`] || "";
    if (!value.trim() || !categoryKey || !subcategoryKey) return;
    try {
      const response = await artbookOptionsAPI.addAttribute(
        categoryKey,
        subcategoryKey,
        { value: value },
      );
      // Clear only this subcategory's input
      setAttributeInputs((prev) => ({
        ...prev,
        [`${categoryKey}-${subcategoryKey}`]: "",
      }));
      // Small delay to ensure database has saved
      await new Promise((resolve) => setTimeout(resolve, 100));
      await fetchOptions();
      setRefreshKey((prev) => prev + 1); // Force re-render
      showToast(
        response?.data?.message || "Attribute added successfully",
        "success",
      );
    } catch (error) {
      console.error("Error adding attribute:", error);
      showToast(
        error.response?.data?.message || "Error adding attribute",
        "error",
      );
    }
  };

  const handleEditAttribute = (categoryKey, subcategoryKey, value) => {
    setEditingOption(`${categoryKey}-${subcategoryKey}-${value}`);
    setEditOptionValue(value);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("Category name is required", "error");
      return;
    }
    try {
      const response = await artbookOptionsAPI.addCategory({
        categoryKey: newCategoryName,
        displayName: newCategoryName,
      });
      setNewCategoryName("");
      setShowAddCategory(false);
      document.body.classList.remove("modal-open");
      fetchOptions();
      showToast(
        response?.data?.message ||
          `Category "${newCategoryName}" added successfully`,
        "success",
      );
    } catch (error) {
      console.error("Error adding category:", error);
      showToast(
        error.response?.data?.message || "Error adding category",
        "error",
      );
    }
  };

  const handleDeleteCategory = async (categoryKey, categoryLabel) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the "${categoryLabel}" category?`,
      )
    )
      return;
    try {
      await artbookOptionsAPI.deleteCategory({ categoryKey });
      if (selectedCategory === categoryKey) {
        const remainingCategories = Object.keys(options).filter(
          (k) => k !== categoryKey,
        );
        setSelectedCategory(
          remainingCategories.length > 0 ? remainingCategories[0] : null,
        );
        setSelectedSubcategory(null);
      }
      fetchOptions();
      showToast(`Category "${categoryLabel}" deleted successfully`, "success");
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast(
        error.response?.data?.message || "Error deleting category",
        "error",
      );
    }
  };

  const handleEditCategory = (categoryKey, currentKey) => {
    setEditingCategory(categoryKey);
    setEditCategoryKey(currentKey);
  };

  const handleUpdateCategory = async (categoryKey) => {
    if (!editCategoryKey.trim()) {
      showToast("Category key is required", "error");
      return;
    }
    try {
      if (editCategoryKey !== categoryKey) {
        showToast("Category key cannot be changed after creation", "error");
        setEditingCategory(null);
        return;
      }
      setEditingCategory(null);
      setEditCategoryKey("");
      showToast("Category updated successfully", "success");
    } catch (error) {
      console.error("Error updating category:", error);
      showToast("Error updating category", "error");
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !selectedCategory) {
      showToast("Subcategory name is required", "error");
      return;
    }
    try {
      const response = await artbookOptionsAPI.addSubcategory(
        selectedCategory,
        {
          subcategoryKey: newSubcategoryName,
          displayName: newSubcategoryName,
        },
      );
      setNewSubcategoryName("");
      setShowAddSubcategory(false);
      document.body.classList.remove("modal-open");
      fetchOptions();
      showToast(
        response?.data?.message ||
          `Subcategory "${newSubcategoryName}" added successfully`,
        "success",
      );
    } catch (error) {
      console.error("Error adding subcategory:", error);
      showToast(
        error.response?.data?.message || "Error adding subcategory",
        "error",
      );
    }
  };

  const handleDeleteSubcategory = async (subcategoryKey, subcategoryLabel) => {
    if (
      !window.confirm(`Are you sure you want to delete "${subcategoryLabel}"?`)
    )
      return;
    try {
      await artbookOptionsAPI.deleteSubcategory(
        selectedCategory,
        subcategoryKey,
      );
      if (selectedSubcategory === subcategoryKey) {
        const remainingSubcategories = Object.keys(
          options[selectedCategory]?.subcategories || {},
        ).filter((k) => k !== subcategoryKey);
        setSelectedSubcategory(
          remainingSubcategories.length > 0 ? remainingSubcategories[0] : null,
        );
      }
      fetchOptions();
      showToast(
        `Subcategory "${subcategoryLabel}" deleted successfully`,
        "success",
      );
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      showToast(
        error.response?.data?.message || "Error deleting subcategory",
        "error",
      );
    }
  };

  const handleEditSubcategory = (subcategoryKey, currentKey) => {
    setEditingSubcategory(subcategoryKey);
    setEditSubcategoryKey(currentKey);
  };

  const handleUpdateSubcategory = async (subcategoryKey) => {
    if (!editSubcategoryKey.trim()) {
      showToast("Subcategory key is required", "error");
      return;
    }
    try {
      if (editSubcategoryKey !== subcategoryKey) {
        showToast("Subcategory key cannot be changed after creation", "error");
        setEditingSubcategory(null);
        return;
      }
      setEditingSubcategory(null);
      setEditSubcategoryKey("");
      showToast("Subcategory updated successfully", "success");
    } catch (error) {
      console.error("Error updating subcategory:", error);
      showToast("Error updating subcategory", "error");
    }
  };

  const formatLabel = (id) => {
    let result = "";
    for (let i = 0; i < id.length; i++) {
      const char = id[i];
      if (
        char === char.toUpperCase() &&
        char !== char.toLowerCase() &&
        i > 0 &&
        id[i - 1] !== " "
      ) {
        result += " ";
      }
      result += char;
    }
    return result.trim();
  };

  return (
    <div className="Artbooks-page">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast({ ...toast, show: false })}
          >
            ×
          </button>
        </div>
      )}

      <div className="book-header">
        <h2>Artbook Management</h2>
      </div>

      <div className="main-tabs">
        <button
          className={`main-tab ${activeTab === "quotes" ? "active" : ""}`}
          onClick={() => setActiveTab("quotes")}
        >
          <span className="tab-icon">📋</span> Quotes
        </button>
        <button
          className={`main-tab ${activeTab === "options" ? "active" : ""}`}
          onClick={() => setActiveTab("options")}
        >
          <span className="tab-icon">⚙️</span> Manage Options
        </button>
        <button
          className={`main-tab ${activeTab === "viewOptions" ? "active" : ""}`}
          onClick={() => setActiveTab("viewOptions")}
        >
          <span className="tab-icon">📊</span> View Options
        </button>
      </div>

      {activeTab === "quotes" && (
        <div className="tab-content">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading Artbook quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredArtbooks.length > 0 ? (
                filteredArtbooks.map((Artbook) => (
                  <div key={Artbook._id} className="booklet-card">
                    <div className="card-badge">
                      #{Artbook._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {Artbook.customerDetails?.name?.charAt(0) || "C"}
                      </div>
                      <div className="customer-name">
                        {Artbook.customerDetails?.name}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {Artbook.customerDetails?.email}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone</span>
                        <span className="info-value">
                          {Artbook.customerDetails?.phone}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Quantity</span>
                        <span className="info-value">{Artbook.quantity}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Size</span>
                        <span className="info-value">
                          {Artbook.ArtbookDetails?.size}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Pages</span>
                        <span className="info-value">
                          {Artbook.interiorPages?.numberOfPages || "N/A"}
                        </span>
                      </div>
                      {Artbook.files && Artbook.files.length > 0 && (
                        <div className="files-badge">
                          📎 {Artbook.files.length} file(s)
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(Artbook.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(Artbook)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(Artbook)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(Artbook._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <p>No Artbook quotes found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "options" && (
        <div className="tab-content">
          <div className="manage-options-header">
            <h2>Manage Configuration Options</h2>
            <div className="header-actions-group">
              <button
                className="add-category-top-btn"
                onClick={() => {
                  setShowAddCategory(true);
                  document.body.classList.add("modal-open");
                }}
              >
                <span style={{ color: "white", fontWeight: "bold" }}>+</span>{" "}
                Add Category
              </button>
            </div>
          </div>

          <div
            className="unified-options-layout"
            key={`options-${optionsVersion}`}
          >
            {optionsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading options...</p>
              </div>
            ) : options && Object.keys(options).length > 0 ? (
              Object.keys(options).map((categoryKey) => {
                // Skip empty or invalid category keys
                if (
                  !categoryKey ||
                  categoryKey.trim() === "" ||
                  categoryKey === "0"
                ) {
                  return null;
                }

                const category = options[categoryKey];
                const subcategories = category?.subcategories || {};
                const hasSubcategories =
                  subcategories && Object.keys(subcategories).length > 0;
                const isCategoryExpanded = selectedCategory === categoryKey;
                const categoryAttributes = category?.attributes || [];

                // Skip if category data is invalid
                if (!category) {
                  return null;
                }

                return (
                  <div
                    key={`${categoryKey}-${optionsVersion}`}
                    className="unified-category-card"
                  >
                    <div
                      className={`unified-category-header ${isCategoryExpanded ? "expanded" : ""}`}
                      onClick={() => {
                        setSelectedCategory(
                          isCategoryExpanded ? null : categoryKey,
                        );
                        if (!isCategoryExpanded && hasSubcategories) {
                          setSelectedSubcategory(Object.keys(subcategories)[0]);
                        }
                      }}
                    >
                      <div className="category-header-content">
                        <span className="category-expand-icon">
                          {isCategoryExpanded ? "▼" : "▶"}
                        </span>
                        <h3>
                          {category?.displayName || formatLabel(categoryKey)}
                        </h3>
                      </div>
                      <div className="category-header-actions">
                        <span className="category-subcount">
                          {hasSubcategories
                            ? `${Object.keys(subcategories).length} subcategor${Object.keys(subcategories).length === 1 ? "y" : "ies"}`
                            : "No subcategories"}
                        </span>
                        <button
                          className="add-subcategory-inline-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(categoryKey);
                            setShowAddSubcategory(true);
                            document.body.classList.add("modal-open");
                          }}
                          title="Add Subcategory"
                        >
                          <span style={{ color: "white", fontWeight: "bold" }}>
                            +
                          </span>{" "}
                          Add Subcategory
                        </button>
                        <button
                          className="category-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(
                              categoryKey,
                              category?.displayName || formatLabel(categoryKey),
                            );
                          }}
                          title="Edit Category"
                        >
                          Edit
                        </button>
                        <button
                          className="category-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(
                              categoryKey,
                              category?.displayName || formatLabel(categoryKey),
                            );
                          }}
                          title="Delete Category"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isCategoryExpanded && (
                      <div className="unified-category-content">
                        {hasSubcategories ? (
                          <div className="subcategories-section">
                            <div className="subsection-header">
                              <h4>Subcategories</h4>
                              <span className="subsection-info">
                                Manage attributes directly in each card
                              </span>
                            </div>
                            <div
                              className="subcategories-grid"
                              key={refreshKey}
                            >
                              {Object.keys(subcategories).map((subcatKey) => {
                                const subcategory = subcategories[subcatKey];
                                const attrs = subcategory?.attributes || [];

                                return (
                                  <div
                                    key={`${subcatKey}-${optionsVersion}`}
                                    className="unified-subcategory-card"
                                  >
                                    <div className="unified-subcategory-header">
                                      <div className="subcategory-header-content">
                                        <span className="subcategory-name">
                                          {subcategory?.displayName ||
                                            formatLabel(subcatKey)}
                                        </span>
                                      </div>
                                      <div className="subcategory-header-actions">
                                        <span className="attr-count-badge">
                                          {attrs.length}
                                        </span>
                                        <button
                                          className="subcategory-edit-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSubcategory(
                                              subcatKey,
                                              subcategory?.displayName ||
                                                formatLabel(subcatKey),
                                            );
                                          }}
                                          title="Edit Subcategory"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="subcategory-delete-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSubcategory(
                                              subcatKey,
                                              subcategory?.displayName ||
                                                formatLabel(subcatKey),
                                            );
                                          }}
                                          title="Delete Subcategory"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                    <div className="attributes-section">
                                      <form
                                        className="add-attribute-inline-form"
                                        onSubmit={async (e) => {
                                          e.preventDefault();
                                          await handleAddAttribute(
                                            categoryKey,
                                            subcatKey,
                                          );
                                        }}
                                      >
                                        <input
                                          type="text"
                                          placeholder="Enter attribute value..."
                                          value={
                                            attributeInputs[
                                              `${categoryKey}-${subcatKey}`
                                            ] || ""
                                          }
                                          onChange={(e) =>
                                            setAttributeInputs((prev) => ({
                                              ...prev,
                                              [`${categoryKey}-${subcatKey}`]:
                                                e.target.value,
                                            }))
                                          }
                                          className="attribute-input"
                                        />
                                        <button
                                          type="submit"
                                          className="add-attribute-btn"
                                        >
                                          ➕ Add
                                        </button>
                                      </form>
                                      <div
                                        className="attributes-chip-list"
                                        key={`${categoryKey}-${subcatKey}-${optionsVersion}`}
                                      >
                                        {attrs.length > 0 ? (
                                          attrs.map((attr) => {
                                            const isEditing =
                                              editingOption ===
                                              `${categoryKey}-${subcatKey}-${attr}`;
                                            return (
                                              <div
                                                key={attr}
                                                className="attribute-chip"
                                              >
                                                {isEditing ? (
                                                  <form
                                                    className="edit-attribute-inline"
                                                    onSubmit={async (e) => {
                                                      e.preventDefault();
                                                      if (
                                                        !editOptionValue.trim()
                                                      )
                                                        return;
                                                      try {
                                                        // Find the original value from editingOption
                                                        const parts =
                                                          editingOption.split(
                                                            "-",
                                                          );
                                                        const originalValue =
                                                          parts
                                                            .slice(2)
                                                            .join("-");
                                                        // Find the index of the original value in the current attrs
                                                        const index =
                                                          attrs.indexOf(
                                                            originalValue,
                                                          );

                                                        if (index === -1) {
                                                          showToast(
                                                            "Attribute not found",
                                                            "error",
                                                          );
                                                          return;
                                                        }

                                                        const response =
                                                          await artbookOptionsAPI.updateAttribute(
                                                            categoryKey,
                                                            subcatKey,
                                                            index,
                                                            {
                                                              value:
                                                                editOptionValue,
                                                            },
                                                          );
                                                        setEditingOption(null);
                                                        // Small delay to ensure database has saved
                                                        await new Promise(
                                                          (resolve) =>
                                                            setTimeout(
                                                              resolve,
                                                              100,
                                                            ),
                                                        );
                                                        // Fetch fresh data
                                                        await fetchOptions();
                                                        setRefreshKey(
                                                          (prev) => prev + 1,
                                                        );
                                                        showToast(
                                                          response?.data
                                                            ?.message ||
                                                            "Attribute updated successfully",
                                                          "success",
                                                        );
                                                      } catch (error) {
                                                        console.error(
                                                          "Error updating attribute:",
                                                          error,
                                                        );
                                                        showToast(
                                                          error.response?.data
                                                            ?.message ||
                                                            "Error updating attribute",
                                                          "error",
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    <input
                                                      type="text"
                                                      value={editOptionValue}
                                                      onChange={(e) =>
                                                        setEditOptionValue(
                                                          e.target.value,
                                                        )
                                                      }
                                                      className="edit-attr-input"
                                                      autoFocus
                                                    />
                                                    <button
                                                      type="submit"
                                                      className="save-attr-btn"
                                                      title="Save"
                                                    >
                                                      💾
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="cancel-attr-btn"
                                                      onClick={() =>
                                                        setEditingOption(null)
                                                      }
                                                      title="Cancel"
                                                    >
                                                      ❌
                                                    </button>
                                                  </form>
                                                ) : (
                                                  <>
                                                    <span className="chip-text">
                                                      {attr}
                                                    </span>
                                                    <div className="chip-actions">
                                                      <button
                                                        className="chip-edit-btn"
                                                        onClick={() => {
                                                          handleEditAttribute(
                                                            categoryKey,
                                                            subcatKey,
                                                            attr,
                                                          );
                                                        }}
                                                        title="Edit"
                                                      >
                                                        ✏️
                                                      </button>
                                                      <button
                                                        className="chip-delete-btn"
                                                        onClick={async () => {
                                                          if (
                                                            !window.confirm(
                                                              `Are you sure you want to delete "${attr}"?`,
                                                            )
                                                          )
                                                            return;
                                                          try {
                                                            // Get the current attributes to find the index
                                                            const currentAttrs =
                                                              attrs || [];
                                                            const index =
                                                              currentAttrs.indexOf(
                                                                attr,
                                                              );
                                                            const response =
                                                              await artbookOptionsAPI.deleteAttribute(
                                                                categoryKey,
                                                                subcatKey,
                                                                index,
                                                              );
                                                            // Small delay to ensure database has saved
                                                            await new Promise(
                                                              (resolve) =>
                                                                setTimeout(
                                                                  resolve,
                                                                  100,
                                                                ),
                                                            );
                                                            // Fetch fresh data
                                                            await fetchOptions();
                                                            setRefreshKey(
                                                              (prev) =>
                                                                prev + 1,
                                                            );
                                                            showToast(
                                                              response?.data
                                                                ?.message ||
                                                                "Attribute deleted successfully",
                                                              "success",
                                                            );
                                                          } catch (error) {
                                                            console.error(
                                                              "Error deleting attribute:",
                                                              error,
                                                            );
                                                            showToast(
                                                              error.response
                                                                ?.data
                                                                ?.message ||
                                                                "Error deleting attribute",
                                                              "error",
                                                            );
                                                          }
                                                        }}
                                                        title="Delete"
                                                      >
                                                        🗑️
                                                      </button>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            );
                                          })
                                        ) : (
                                          <p className="empty-attr-text">
                                            No attributes yet. Add the first one
                                            above!
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="attributes-only-section">
                            <div className="direct-attributes-header">
                              <h4>Direct Attributes</h4>
                              <span className="direct-attr-info">
                                Add attributes directly to this category
                              </span>
                            </div>
                            <form
                              className="add-attribute-inline-form"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const value =
                                  attributeInputs[`${categoryKey}-category`] ||
                                  "";
                                if (!value.trim()) return;

                                try {
                                  const response =
                                    await artbookOptionsAPI.addCategoryAttribute(
                                      categoryKey,
                                      { value: value },
                                    );
                                  // Clear only this category's input
                                  setAttributeInputs((prev) => ({
                                    ...prev,
                                    [`${categoryKey}-category`]: "",
                                  }));
                                  await fetchOptions();
                                  showToast(
                                    response?.data?.message ||
                                      "Attribute added successfully",
                                    "success",
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error adding attribute:",
                                    error,
                                  );
                                  showToast(
                                    error.response?.data?.message ||
                                      "Error adding attribute",
                                    "error",
                                  );
                                }
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Enter attribute value..."
                                value={
                                  attributeInputs[`${categoryKey}-category`] ||
                                  ""
                                }
                                onChange={(e) =>
                                  setAttributeInputs((prev) => ({
                                    ...prev,
                                    [`${categoryKey}-category`]: e.target.value,
                                  }))
                                }
                                className="attribute-input"
                              />
                              <button
                                type="submit"
                                className="add-attribute-btn"
                              >
                                ➕ Add Attribute
                              </button>
                            </form>
                            {categoryAttributes.length > 0 && (
                              <div
                                className="attributes-chip-list"
                                style={{ marginTop: "12px" }}
                              >
                                {categoryAttributes.map((attr, index) => {
                                  const isEditing =
                                    editingOption ===
                                    `${categoryKey}-category-${index}`;
                                  return (
                                    <div key={attr} className="attribute-chip">
                                      {isEditing ? (
                                        <form
                                          className="edit-attribute-inline"
                                          onSubmit={async (e) => {
                                            e.preventDefault();
                                            await artbookOptionsAPI.updateCategoryAttribute(
                                              categoryKey,
                                              index,
                                              { value: editOptionValue },
                                            );
                                            setEditingOption(null);
                                            fetchOptions();
                                            showToast(
                                              "Attribute updated successfully",
                                              "success",
                                            );
                                          }}
                                        >
                                          <input
                                            type="text"
                                            value={editOptionValue}
                                            onChange={(e) =>
                                              setEditOptionValue(e.target.value)
                                            }
                                            className="edit-attr-input"
                                            autoFocus
                                          />
                                          <button
                                            type="submit"
                                            className="save-attr-btn"
                                            title="Save"
                                          >
                                            💾
                                          </button>
                                          <button
                                            type="button"
                                            className="cancel-attr-btn"
                                            onClick={() =>
                                              setEditingOption(null)
                                            }
                                            title="Cancel"
                                          >
                                            ❌
                                          </button>
                                        </form>
                                      ) : (
                                        <>
                                          <span className="chip-text">
                                            {attr}
                                          </span>
                                          <div className="chip-actions">
                                            <button
                                              className="chip-edit-btn"
                                              onClick={() => {
                                                setSelectedCategory(
                                                  categoryKey,
                                                );
                                                setEditingOption(
                                                  `${categoryKey}-category-${index}`,
                                                );
                                                setEditOptionValue(attr);
                                              }}
                                              title="Edit"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              className="chip-delete-btn"
                                              onClick={async () => {
                                                if (
                                                  !window.confirm(
                                                    `Delete "${attr}"?`,
                                                  )
                                                )
                                                  return;
                                                setSelectedCategory(
                                                  categoryKey,
                                                );
                                                await artbookOptionsAPI.deleteCategoryAttribute(
                                                  categoryKey,
                                                  index,
                                                );
                                                fetchOptions();
                                                showToast(
                                                  "Attribute deleted successfully",
                                                  "success",
                                                );
                                              }}
                                              title="Delete"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <p
                              className="prompt-subtext"
                              style={{ marginTop: "12px" }}
                            >
                              💡 Tip: You can also add more subcategories to
                              organize attributes better
                            </p>
                            <button
                              className="add-subcategory-secondary-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory(categoryKey);
                                setShowAddSubcategory(true);
                                document.body.classList.add("modal-open");
                              }}
                            >
                              ➕ Add Subcategory
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No configuration options found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "viewOptions" && (
        <div className="tab-content">
          <div className="view-options-header">
            <div>
              <h2>All Configuration Options</h2>
              <p>
                View all Artbook configuration options organized by categories
              </p>
            </div>
          </div>
          {optionsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading all options...</p>
            </div>
          ) : (
            <div className="hierarchical-view-container">
              {options && Object.keys(options).length > 0 ? (
                Object.keys(options).map((categoryKey) => {
                  const category = options[categoryKey];
                  const subcategories = category?.subcategories || {};
                  const categoryAttributes = category?.attributes || [];
                  const hasSubcategories =
                    Object.keys(subcategories).length > 0;

                  return (
                    <div
                      key={categoryKey}
                      className="hierarchical-category-card"
                    >
                      <div className="hierarchical-category-header">
                        <h3>
                          {category?.displayName || formatLabel(categoryKey)}
                        </h3>
                        <span className="hierarchical-category-count">
                          {hasSubcategories
                            ? `${Object.keys(subcategories).length} subcategor${Object.keys(subcategories).length === 1 ? "y" : "ies"}`
                            : categoryAttributes.length > 0
                              ? `${categoryAttributes.length} attribute${categoryAttributes.length === 1 ? "" : "s"}`
                              : "No subcategories"}
                        </span>
                      </div>
                      {hasSubcategories ? (
                        <div className="hierarchical-subcategories-list">
                          {Object.keys(subcategories).map((subcatKey) => {
                            const subcategory = subcategories[subcatKey];
                            const attributes = subcategory?.attributes || [];
                            return (
                              <div
                                key={subcatKey}
                                className="hierarchical-subcategory-item"
                              >
                                <div className="hierarchical-subcategory-header">
                                  <h4>
                                    {subcategory?.displayName ||
                                      formatLabel(subcatKey)}
                                  </h4>
                                  <span className="hierarchical-subcategory-count">
                                    {attributes.length} attributes
                                  </span>
                                </div>
                                {attributes.length > 0 ? (
                                  <div className="hierarchical-attributes-list">
                                    {attributes.map((attr, index) => (
                                      <span
                                        key={index}
                                        className="hierarchical-attribute-tag"
                                      >
                                        {attr}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="hierarchical-empty">
                                    No attributes
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : categoryAttributes.length > 0 ? (
                        <div className="hierarchical-category-attributes">
                          <div className="hierarchical-attributes-list">
                            {categoryAttributes.map((attr, index) => (
                              <span
                                key={index}
                                className="hierarchical-attribute-tag"
                              >
                                {attr}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="hierarchical-empty">
                          No subcategories or attributes
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>No configuration options found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showModal && selectedArtbook && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => {
                setShowModal(false);
                document.body.classList.remove("modal-open");
              }}
            >
              ×
            </button>
            <h2>Artbook Quote Details</h2>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div>
                    <strong>Name:</strong>{" "}
                    {selectedArtbook.customerDetails?.name}
                  </div>
                  <div>
                    <strong>Email:</strong>{" "}
                    {selectedArtbook.customerDetails?.email}
                  </div>
                  <div>
                    <strong>Phone:</strong>{" "}
                    {selectedArtbook.customerDetails?.phone}
                  </div>
                  <div>
                    <strong>Address:</strong>{" "}
                    {selectedArtbook.customerDetails?.address || "N/A"}
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Artbook Specifications</h3>
                <div className="info-grid">
                  <div>
                    <strong>Quantity:</strong> {selectedArtbook.quantity}
                  </div>
                  <div>
                    <strong>Size:</strong>{" "}
                    {selectedArtbook.ArtbookDetails?.size}
                  </div>
                  <div>
                    <strong>Binding:</strong>{" "}
                    {selectedArtbook.ArtbookDetails?.bindingStyle || "N/A"}
                  </div>
                  <div>
                    <strong>Pages:</strong>{" "}
                    {selectedArtbook.interiorPages?.numberOfPages || "N/A"}
                  </div>
                  <div>
                    <strong>Ruling:</strong>{" "}
                    {selectedArtbook.interiorPages?.pageRuling || "N/A"}
                  </div>
                  <div>
                    <strong>Cover Type:</strong>{" "}
                    {selectedArtbook.interiorPages?.coverTypes || "N/A"}
                  </div>
                  <div>
                    <strong>Cover Finish:</strong>{" "}
                    {selectedArtbook.interiorPages?.coverFinish || "N/A"}
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Timeline</h3>
                <div className="info-grid">
                  <div>
                    <strong>Order Date:</strong>{" "}
                    {formatDate(selectedArtbook.timeline?.orderDate)}
                  </div>
                  <div>
                    <strong>Expected Date:</strong>{" "}
                    {formatDate(selectedArtbook.timeline?.expectedDate)}
                  </div>
                  <div>
                    <strong>Delivery Date:</strong>{" "}
                    {formatDate(selectedArtbook.timeline?.deliveryDate)}
                  </div>
                </div>
              </div>

              {selectedArtbook.notes?.additionalInstructions && (
                <div className="modal-section">
                  <h3>Additional Instructions</h3>
                  <p>{selectedArtbook.notes.additionalInstructions}</p>
                </div>
              )}

              {selectedArtbook.files && selectedArtbook.files.length > 0 && (
                <div className="modal-section">
                  <h3>Attached Files</h3>
                  <div className="files-list">
                    {selectedArtbook.files.map((file, index) => (
                      <a
                        key={index}
                        href={`${API}/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📎 {file.split("/").pop()}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedArtbook && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditModal(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => {
                setShowEditModal(false);
                document.body.classList.remove("modal-open");
              }}
            >
              ×
            </button>
            <h2>Edit Artbook Quote</h2>

            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="edit-section">
                <h3>Artbook Details</h3>
                <div className="edit-grid">
                  <div className="edit-field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Binding Style</label>
                    <input
                      type="text"
                      value={formData.bindingStyle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bindingStyle: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Number of Pages</label>
                    <input
                      type="text"
                      value={formData.numberOfPages}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numberOfPages: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Paper Type</label>
                    <input
                      type="text"
                      value={formData.paperType}
                      onChange={(e) =>
                        setFormData({ ...formData, paperType: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Paper Weight</label>
                    <input
                      type="text"
                      value={formData.paperWeight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paperWeight: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Cover Material (comma separated)</label>
                    <input
                      type="text"
                      value={formData.coverMaterial}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coverMaterial: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="edit-field">
                    <label>Features (comma separated)</label>
                    <input
                      type="text"
                      value={formData.features}
                      onChange={(e) =>
                        setFormData({ ...formData, features: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="edit-section">
                <h3>Timeline</h3>
                <div className="edit-grid">
                  <div className="edit-field">
                    <label>Expected Date</label>
                    <input
                      type="date"
                      value={formData.expectedDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expectedDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="edit-field">
                    <label>Delivery Date</label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="edit-section">
                <h3>Notes</h3>
                <div className="edit-field">
                  <label>Artist Notes</label>
                  <textarea
                    value={formData.artistNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, artistNotes: e.target.value })
                    }
                    rows="3"
                  />
                </div>
              </div>

              <div className="edit-actions">
                <button
                  type="button"
                  className="action-btn cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddCategory && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddCategory(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div
            className="add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Category</h2>
              <p>Create a new category to organize Artbook options</p>
            </div>

            <form
              onSubmit={(e) => {
                handleAddCategory(e);
                document.body.classList.remove("modal-open");
              }}
              className="simple-form-body"
            >
              <div className="simple-form-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Binding Styles, Cover Types"
                  autoFocus
                  required
                />
                <small>
                  This will be the main category. You can add subcategories
                  later.
                </small>
              </div>

              <div className="simple-form-footer">
                <button
                  type="button"
                  className="btn-simple-cancel"
                  onClick={() => {
                    setShowAddCategory(false);
                    document.body.classList.remove("modal-open");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-simple-create">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddSubcategory && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddSubcategory(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div
            className="add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Subcategory</h2>
              <p>Add a subcategory under "{selectedCategory}"</p>
            </div>

            <form
              onSubmit={(e) => {
                handleAddSubcategory(e);
                document.body.classList.remove("modal-open");
              }}
              className="simple-form-body"
            >
              <div className="simple-form-group">
                <label htmlFor="subcategoryName">Subcategory Name</label>
                <input
                  type="text"
                  id="subcategoryName"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="e.g., Spiral Bound, Perfect Binding"
                  autoFocus
                  required
                />
                <small>
                  This subcategory will contain specific attribute options.
                </small>
              </div>

              <div className="simple-form-footer">
                <button
                  type="button"
                  className="btn-simple-cancel"
                  onClick={() => {
                    setShowAddSubcategory(false);
                    document.body.classList.remove("modal-open");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-simple-create">
                  Create Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default Artbooks;

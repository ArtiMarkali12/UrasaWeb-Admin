import { useState, useEffect } from "react";
import {
  productCatalogueAPI,
  productCatalogueOptionsAPI,
} from "../../services/api";
import "./ProductCatalogue.css";

const API = import.meta.env.VITE_API_BASE_URL;

const ProductCatalogues = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Quotes State
  const [productCatalogues, setProductCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductCatalogue, setSelectedProductCatalogue] =
    useState(null);
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
      fetchProductCatalogues();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchProductCatalogues = async () => {
    try {
      const response = await productCatalogueAPI.getAll();
      setProductCatalogues(response.data.data || []);
    } catch (error) {
      console.error("Error fetching productCatalogues:", error);
      showToast("Failed to fetch productCatalogue quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this productCatalogue quote?",
      )
    ) {
      try {
        await productCatalogueAPI.delete(id);
        setProductCatalogues(productCatalogues.filter((b) => b._id !== id));
        showToast("productCatalogue quote deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting productCatalogue:", error);
        showToast("Failed to delete productCatalogue quote", "error");
      }
    }
  };

  const handleView = (productCatalogue) => {
    setSelectedProductCatalogue(productCatalogue);
    setShowModal(true);
  };

  const handleEdit = (productCatalogue) => {
    setFormData({
      quantity: productCatalogue.quantity || "",
      bookSize: productCatalogue.bookSize || "",
      orientation: productCatalogue.orientation || "",
      bindingType: productCatalogue.bindingStyle?.bindingType || "",
      coverStyle: productCatalogue.bindingStyle?.coverStyle || "",
      coverFlaps: productCatalogue.bindingStyle?.coverFlaps || false,
      numberOfPages:
        productCatalogue.interiorSpecifications?.numberOfPages || "",
      printColor: productCatalogue.interiorSpecifications?.printColor || "",
      paperWeight: productCatalogue.interiorSpecifications?.paperWeight || "",
      paperType: productCatalogue.interiorSpecifications?.paperType || "",
      coverFinish: productCatalogue.interiorSpecifications?.coverFinish || "",
      printFinishing:
        productCatalogue.specialFinishing?.printFinishing?.join(", ") || "",
      pageEdges: productCatalogue.specialFinishing?.pageEdges || "",
      packaging: productCatalogue.packaging || "",
      additionalNotes: productCatalogue.additionalNotes || "",
      expectedDate: productCatalogue.timeline?.expectedDate
        ? new Date(productCatalogue.timeline.expectedDate)
            .toISOString()
            .split("T")[0]
        : "",
      deliveryDate: productCatalogue.timeline?.deliveryDate
        ? new Date(productCatalogue.timeline.deliveryDate)
            .toISOString()
            .split("T")[0]
        : "",
    });
    setSelectedProductCatalogue(productCatalogue);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        quantity: formData.quantity,
        bookSize: formData.bookSize,
        orientation: formData.orientation,
        bindingStyle: {
          bindingType: formData.bindingType,
          coverStyle: formData.coverStyle,
          coverFlaps: formData.coverFlaps,
        },
        interiorSpecifications: {
          numberOfPages: formData.numberOfPages
            ? parseInt(formData.numberOfPages)
            : undefined,
          printColor: formData.printColor,
          paperWeight: formData.paperWeight,
          paperType: formData.paperType,
          coverFinish: formData.coverFinish,
        },
        specialFinishing: {
          printFinishing: formData.printFinishing
            ? formData.printFinishing
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item)
            : [],
          pageEdges: formData.pageEdges,
        },
        packaging: formData.packaging,
        additionalNotes: formData.additionalNotes,
        timeline: {
          expectedDate: formData.expectedDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      };
      await productCatalogueAPI.update(
        selectedProductCatalogue._id,
        updateData,
      );
      fetchProductCatalogues();
      setShowEditModal(false);
      setSelectedProductCatalogue(null);
      showToast("productCatalogue quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating productCatalogue:", error);
      showToast("Failed to update productCatalogue quote", "error");
    }
  };

  const filteredproductCatalogues = productCatalogues.filter(
    (productCatalogue) =>
      productCatalogue.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      productCatalogue.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const fetchOptions = async () => {
    try {
      const response = await productCatalogueOptionsAPI.getAll();
      const newOptions = response.data.data || {};
      setOptions(newOptions);
      // Don't auto-select first category/subcategory - preserve current selection
    } catch (error) {
      console.error("Error fetching options:", error);
      showToast("Failed to fetch options", "error");
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleAddAttribute = async (categoryKey, subcategoryKey) => {
    const value = attributeInputs[`${categoryKey}-${subcategoryKey}`] || "";
    if (!value.trim() || !categoryKey || !subcategoryKey) return;
    try {
      const response = await productCatalogueOptionsAPI.addAttribute(
        categoryKey,
        subcategoryKey,
        { value: value },
      );
      // Clear only this subcategory's input
      setAttributeInputs((prev) => ({
        ...prev,
        [`${categoryKey}-${subcategoryKey}`]: "",
      }));
      fetchOptions();
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

  const handleUpdateAttribute = async (e) => {
    e.preventDefault();
    if (!editOptionValue.trim() || !editingOption) return;

    // Parse the editing option to get category, subcategory, and original value
    const parts = editingOption.split("-");
    if (parts.length < 3) return;

    const updateCategory = parts[0];
    const updateSubcategory = parts[1];
    const originalValue = parts.slice(2).join("-"); // In case value contains hyphens

    try {
      const currentAttributes =
        options[updateCategory]?.subcategories[updateSubcategory]?.attributes ||
        [];
      const index = currentAttributes.indexOf(originalValue);
      const response = await productCatalogueOptionsAPI.updateAttribute(
        updateCategory,
        updateSubcategory,
        index,
        { value: editOptionValue },
      );
      setEditingOption(null);
      fetchOptions();
      showToast(
        response?.data?.message || "Attribute updated successfully",
        "success",
      );
    } catch (error) {
      console.error("Error updating attribute:", error);
      showToast(
        error.response?.data?.message || "Error updating attribute",
        "error",
      );
    }
  };

  const handleDeleteAttribute = async (value) => {
    if (!window.confirm(`Are you sure you want to delete "${value}"?`)) return;
    try {
      const currentAttributes =
        options[selectedCategory]?.subcategories[selectedSubcategory]
          ?.attributes || [];
      const index = currentAttributes.indexOf(value);
      const response = await productCatalogueOptionsAPI.deleteAttribute(
        selectedCategory,
        selectedSubcategory,
        index,
      );
      fetchOptions();
      showToast(
        response?.data?.message || "Attribute deleted successfully",
        "success",
      );
    } catch (error) {
      console.error("Error deleting attribute:", error);
      showToast(
        error.response?.data?.message || "Error deleting attribute",
        "error",
      );
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("Category name is required", "error");
      return;
    }
    try {
      const response = await productCatalogueOptionsAPI.addCategory({
        categoryKey: newCategoryName,
        displayName: newCategoryName,
      });
      setNewCategoryName("");
      setShowAddCategory(false);
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
      await productCatalogueOptionsAPI.deleteCategory({ categoryKey });
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
      // Delete old category and create new one with updated key
      if (editCategoryKey !== categoryKey) {
        // For now, just show toast - full implementation would require complex migration
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
      const response = await productCatalogueOptionsAPI.addSubcategory(
        selectedCategory,
        {
          subcategoryKey: newSubcategoryName,
          displayName: newSubcategoryName,
        },
      );
      setNewSubcategoryName("");
      setShowAddSubcategory(false);
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
      await productCatalogueOptionsAPI.deleteSubcategory(
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
    <div className="booklets-page">
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
        <h2>productCatalogue Management</h2>
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
              <p>Loading productCatalogue quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredproductCatalogues.length > 0 ? (
                filteredproductCatalogues.map((productCatalogue) => (
                  <div
                    key={productCatalogue._id}
                    className="booklet-card"
                  >
                    <div className="card-badge">
                      #{productCatalogue._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {productCatalogue.customerDetails?.name?.charAt(0) ||
                          "C"}
                      </div>
                      <div className="customer-name">
                        {productCatalogue.customerDetails?.name}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {productCatalogue.customerDetails?.email}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone</span>
                        <span className="info-value">
                          {productCatalogue.customerDetails?.phone}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Quantity</span>
                        <span className="info-value">
                          {productCatalogue.quantity}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Size</span>
                        <span className="info-value">
                          {productCatalogue.bookSize}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Pages</span>
                        <span className="info-value">
                          {productCatalogue.interiorSpecifications
                            ?.numberOfPages || "N/A"}
                        </span>
                      </div>
                      {productCatalogue.files &&
                        productCatalogue.files.length > 0 && (
                          <div className="files-badge">
                            📎 {productCatalogue.files.length} file(s)
                          </div>
                        )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(productCatalogue.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(productCatalogue)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(productCatalogue)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(productCatalogue._id)}
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
                  <p>No productCatalogue quotes found</p>
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
                onClick={() => setShowAddCategory(true)}
              >
                <span style={{ color: "white", fontWeight: "bold" }}>+</span>{" "}
                Add Category
              </button>
            </div>
          </div>

          <div className="unified-options-layout">
            {optionsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading options...</p>
              </div>
            ) : options && Object.keys(options).length > 0 ? (
              Object.keys(options).map((categoryKey) => {
                const category = options[categoryKey];
                const subcategories = category?.subcategories || {};
                const hasSubcategories =
                  subcategories && Object.keys(subcategories).length > 0;
                const isCategoryExpanded = selectedCategory === categoryKey;
                const categoryAttributes = category?.attributes || [];

                return (
                  <div key={categoryKey} className="unified-category-card">
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
                            <div className="subcategories-grid">
                              {Object.keys(subcategories).map((subcatKey) => {
                                const subcategory = subcategories[subcatKey];
                                const attrs = subcategory?.attributes || [];

                                return (
                                  <div
                                    key={subcatKey}
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
                                      <div className="attributes-chip-list">
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
                                                      await handleUpdateAttribute(
                                                        e,
                                                      );
                                                      setEditingOption(null);
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
                                                        onClick={() => {
                                                          setSelectedCategory(
                                                            categoryKey,
                                                          );
                                                          setSelectedSubcategory(
                                                            subcatKey,
                                                          );
                                                          handleDeleteAttribute(
                                                            attr,
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
                                    await productCatalogueOptionsAPI.addCategoryAttribute(
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
                                            await productCatalogueOptionsAPI.updateCategoryAttribute(
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
                                                await productCatalogueOptionsAPI.deleteCategoryAttribute(
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
                View all productCatalogue configuration options organized by
                categories
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

      {showAddCategory && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddCategory(false)}
        >
          <div
            className="modal-content add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Category</h2>
              <p>Create a new category to manage productCatalogue options</p>
            </div>
            <form className="simple-category-form" onSubmit={handleAddCategory}>
              <div className="simple-form-body">
                <div className="simple-form-group">
                  <label>Category Key</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., paperType"
                    required
                  />
                  <small>
                    Unique identifier (no spaces, camelCase recommended)
                  </small>
                </div>
              </div>
              <div className="simple-form-footer">
                <button
                  type="button"
                  className="btn-simple-cancel"
                  onClick={() => setShowAddCategory(false)}
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
          onClick={() => setShowAddSubcategory(false)}
        >
          <div
            className="modal-content add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Subcategory</h2>
              <p>Add subcategory to "{selectedCategory}"</p>
            </div>
            <form
              className="simple-category-form"
              onSubmit={handleAddSubcategory}
            >
              <div className="simple-form-body">
                <div className="simple-form-group">
                  <label>Subcategory Key</label>
                  <input
                    type="text"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="e.g., bindingType"
                    required
                  />
                  <small>
                    Unique identifier (no spaces, camelCase recommended)
                  </small>
                </div>
              </div>
              <div className="simple-form-footer">
                <button
                  type="button"
                  className="btn-simple-cancel"
                  onClick={() => setShowAddSubcategory(false)}
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

      {showModal && selectedProductCatalogue && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <div className="modal-header">
              <h2>productCatalogue Quote Details</h2>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="section-icon">👤</div>
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Name</span>
                    <span className="value">
                      {selectedProductCatalogue.customerDetails?.name}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">
                      {selectedProductCatalogue.customerDetails?.email}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">
                      {selectedProductCatalogue.customerDetails?.phone}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Address</span>
                    <span className="value">
                      {selectedProductCatalogue.customerDetails?.address ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="section-icon">📋</div>
                <h3>Basic Specifications</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Quantity</span>
                    <span className="value">
                      {selectedProductCatalogue.quantity}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Book Size</span>
                    <span className="value">
                      {selectedProductCatalogue.bookSize}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Orientation</span>
                    <span className="value">
                      {selectedProductCatalogue.orientation || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="section-icon">📚</div>
                <h3>Binding Style</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Binding Type</span>
                    <span className="value">
                      {selectedProductCatalogue.bindingStyle?.bindingType ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Cover Style</span>
                    <span className="value">
                      {selectedProductCatalogue.bindingStyle?.coverStyle ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Cover Flaps</span>
                    <span className="value">
                      {selectedProductCatalogue.bindingStyle?.coverFlaps
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="section-icon">📄</div>
                <h3>Interior Specifications</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Number of Pages</span>
                    <span className="value">
                      {selectedProductCatalogue.interiorSpecifications
                        ?.numberOfPages || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Print Color</span>
                    <span className="value">
                      {selectedProductCatalogue.interiorSpecifications
                        ?.printColor || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Paper Weight</span>
                    <span className="value">
                      {selectedProductCatalogue.interiorSpecifications
                        ?.paperWeight || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Paper Type</span>
                    <span className="value">
                      {selectedProductCatalogue.interiorSpecifications
                        ?.paperType || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Cover Finish</span>
                    <span className="value">
                      {selectedProductCatalogue.interiorSpecifications
                        ?.coverFinish || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="section-icon">✨</div>
                <h3>Special Finishing</h3>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <span className="label">Print Finishing</span>
                    <span className="value">
                      {selectedProductCatalogue.specialFinishing?.printFinishing
                        ?.length > 0
                        ? selectedProductCatalogue.specialFinishing.printFinishing.join(
                            ", ",
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Page Edges</span>
                    <span className="value">
                      {selectedProductCatalogue.specialFinishing?.pageEdges ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="section-icon">📦</div>
                <h3>Packaging</h3>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <span className="label">Packaging Type</span>
                    <span className="value">
                      {selectedProductCatalogue.packaging || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="section-icon">📅</div>
                <h3>Timeline</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Order Date</span>
                    <span className="value">
                      {formatDate(selectedProductCatalogue.timeline?.orderDate)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Expected Date</span>
                    <span className="value">
                      {formatDate(
                        selectedProductCatalogue.timeline?.expectedDate,
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Delivery Date</span>
                    <span className="value">
                      {formatDate(
                        selectedProductCatalogue.timeline?.deliveryDate,
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {selectedProductCatalogue.additionalNotes && (
                <div className="modal-section">
                  <div className="section-icon">📝</div>
                  <h3>Additional Notes</h3>
                  <p className="notes-text">
                    {selectedProductCatalogue.additionalNotes}
                  </p>
                </div>
              )}
              {selectedProductCatalogue.files &&
                selectedProductCatalogue.files.length > 0 && (
                  <div className="modal-section">
                    <div className="section-icon">📎</div>
                    <h3>Attached Files</h3>
                    <div className="files-list">
                      {selectedProductCatalogue.files.map((file, index) => (
                        <a
                          key={index}
                          href={`${API}/${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          <span className="file-name">
                            {file.split("/").pop()}
                          </span>
                          <span className="file-open">🔗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProductCatalogue && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowEditModal(false)}
            >
              ×
            </button>
            <div className="modal-header">
              <h2>Edit productCatalogue Quote</h2>
            </div>
            <form className="edit-form" onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-section">
                  <div className="section-icon">📋</div>
                  <h3>Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="text"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Book Size</label>
                      <input
                        type="text"
                        value={formData.bookSize}
                        onChange={(e) =>
                          setFormData({ ...formData, bookSize: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Orientation</label>
                      <select
                        value={formData.orientation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            orientation: e.target.value,
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-section">
                  <div className="section-icon">📚</div>
                  <h3>Binding Style</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Binding Type</label>
                      <input
                        type="text"
                        value={formData.bindingType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bindingType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Cover Style</label>
                      <input
                        type="text"
                        value={formData.coverStyle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coverStyle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.coverFlaps}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coverFlaps: e.target.checked,
                            })
                          }
                        />{" "}
                        Cover Flaps
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-section">
                  <div className="section-icon">📄</div>
                  <h3>Interior Specifications</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Pages</label>
                      <input
                        type="number"
                        value={formData.numberOfPages}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfPages: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Print Color</label>
                      <input
                        type="text"
                        value={formData.printColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            printColor: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
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
                      />
                    </div>
                    <div className="form-group">
                      <label>Paper Type</label>
                      <input
                        type="text"
                        value={formData.paperType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Cover Finish</label>
                      <input
                        type="text"
                        value={formData.coverFinish}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coverFinish: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-section">
                  <div className="section-icon">✨</div>
                  <h3>Special Finishing</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Print Finishing (comma separated)</label>
                      <input
                        type="text"
                        value={formData.printFinishing || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            printFinishing: e.target.value,
                          })
                        }
                        placeholder="e.g., UV coating, Matte lamination"
                      />
                    </div>
                    <div className="form-group">
                      <label>Page Edges</label>
                      <input
                        type="text"
                        value={formData.pageEdges}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pageEdges: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-section">
                  <div className="section-icon">📦</div>
                  <h3>Packaging & Additional Notes</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Packaging</label>
                      <input
                        type="text"
                        value={formData.packaging}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packaging: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Additional Notes</label>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalNotes: e.target.value,
                          })
                        }
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-section">
                  <div className="section-icon">📅</div>
                  <h3>Timeline</h3>
                  <div className="form-grid">
                    <div className="form-group">
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
                    <div className="form-group">
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
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  💾 Save Changes
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

export default ProductCatalogues;

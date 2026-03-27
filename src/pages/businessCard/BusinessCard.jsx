import { useState, useEffect } from "react";
import { businessCardAPI, businessCardOptionsAPI } from "../../services/api";
import "./BusinessCard.css";

const API = import.meta.env.VITE_API_BASE_URL;

const BusinessCards = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  const [optionsVersion, setOptionsVersion] = useState(0); // Track options updates

  // Quotes State
  const [businessCards, setBusinessCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusinessCard, setSelectedBusinessCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

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
      fetchBusinessCards();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchBusinessCards = async () => {
    try {
      const response = await businessCardAPI.getAll();
      setBusinessCards(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Business Cards:", error);
      showToast("Failed to fetch Business Card quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this Business Card quote?",
      )
    ) {
      try {
        await businessCardAPI.delete(id);
        setBusinessCards(businessCards.filter((b) => b._id !== id));
        showToast("Business Card quote deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting Business Card:", error);
        showToast("Failed to delete Business Card quote", "error");
      }
    }
  };

  const handleView = (businessCard) => {
    setSelectedBusinessCard(businessCard);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (businessCard) => {
    setFormData({
      projectName: businessCard.basicsAndDimensions?.projectName || "",
      quantity: businessCard.basicsAndDimensions?.quantity || "",
      numberOfDifferentNames:
        businessCard.basicsAndDimensions?.numberOfDifferentNames || "",
      cardSize: businessCard.basicsAndDimensions?.cardSize || "",
      orientation: businessCard.basicsAndDimensions?.orientation || "",
      paperStock: businessCard.paperAndMaterial?.paperStock || "",
      printingSides: businessCard.paperAndMaterial?.printingSides || "",
      specialEffects:
        businessCard.laminationAndCoating?.premiumFinishes?.specialEffects?.join(
          ", ",
        ) || "",
      foilColor:
        businessCard.laminationAndCoating?.premiumFinishes?.foilColor || "",
      cornerType: businessCard.cornerStyle?.type || "",
      comments: businessCard.uploadAndNotes?.comments || "",
      expectedDate: businessCard.timeline?.expectedDate
        ? new Date(businessCard.timeline.expectedDate)
            .toISOString()
            .split("T")[0]
        : "",
      deliveryDate: businessCard.timeline?.deliveryDate
        ? new Date(businessCard.timeline.deliveryDate)
            .toISOString()
            .split("T")[0]
        : "",
    });
    setSelectedBusinessCard(businessCard);
    setShowEditModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        basicsAndDimensions: {
          projectName: formData.projectName,
          quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
          numberOfDifferentNames: formData.numberOfDifferentNames
            ? parseInt(formData.numberOfDifferentNames)
            : undefined,
          cardSize: formData.cardSize,
          orientation: formData.orientation,
        },
        paperAndMaterial: {
          paperStock: formData.paperStock,
          printingSides: formData.printingSides,
        },
        laminationAndCoating: {
          premiumFinishes: {
            specialEffects: formData.specialEffects
              ? formData.specialEffects
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item)
              : [],
            foilColor: formData.foilColor,
          },
        },
        cornerStyle: {
          type: formData.cornerType,
        },
        uploadAndNotes: {
          comments: formData.comments,
        },
        timeline: {
          expectedDate: formData.expectedDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      };
      await businessCardAPI.update(selectedBusinessCard._id, updateData);
      fetchBusinessCards();
      setShowEditModal(false);
      document.body.classList.remove("modal-open");
      setSelectedBusinessCard(null);
      showToast("Business Card quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating business card:", error);
      showToast("Failed to update business card quote", "error");
    }
  };

  const filteredBusinessCards = businessCards.filter(
    (businessCard) =>
      businessCard.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      businessCard.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const fetchOptions = async () => {
    try {
      const response = await businessCardOptionsAPI.getAll();
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
      const response = await businessCardOptionsAPI.addAttribute(
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
      const response = await businessCardOptionsAPI.addCategory({
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
      await businessCardOptionsAPI.deleteCategory({ categoryKey });
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
      const response = await businessCardOptionsAPI.addSubcategory(
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
      await businessCardOptionsAPI.deleteSubcategory(
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
    <div className="BusinessCards-page">
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
        <h2>Business Card Management</h2>
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
              <p>Loading Business Card quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredBusinessCards.length > 0 ? (
                filteredBusinessCards.map((businessCard) => (
                  <div key={businessCard._id} className="booklet-card">
                    <div className="card-badge">
                      #{businessCard._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {businessCard.customerDetails?.name?.charAt(0) || "C"}
                      </div>
                      <div className="customer-name">
                        {businessCard.customerDetails?.name}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {businessCard.customerDetails?.email}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone</span>
                        <span className="info-value">
                          {businessCard.customerDetails?.phone}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Quantity</span>
                        <span className="info-value">
                          {businessCard.basicsAndDimensions?.quantity}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Card Size</span>
                        <span className="info-value">
                          {businessCard.basicsAndDimensions?.cardSize}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Orientation</span>
                        <span className="info-value">
                          {businessCard.basicsAndDimensions?.orientation}
                        </span>
                      </div>
                      {businessCard.files && businessCard.files.length > 0 && (
                        <div className="files-badge">
                          📎 {businessCard.files.length} file(s)
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(businessCard.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(businessCard)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(businessCard)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(businessCard._id)}
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
                  <p>No Business Card quotes found</p>
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
                                                          await businessCardOptionsAPI.updateAttribute(
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
                                                              await businessCardOptionsAPI.deleteAttribute(
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
                                    await businessCardOptionsAPI.addCategoryAttribute(
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
                                            try {
                                              const response =
                                                await businessCardOptionsAPI.updateCategoryAttribute(
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
                                            } catch (error) {
                                              console.error(
                                                "Error updating attribute:",
                                                error,
                                              );
                                              showToast(
                                                error.response?.data?.message ||
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
                                                await businessCardOptionsAPI.deleteCategoryAttribute(
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
                View all Business Card configuration options organized by
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
                        <div className="category-header-top">
                          <h3>
                            {category?.displayName || formatLabel(categoryKey)}
                          </h3>
                          <span className="category-count">
                            {hasSubcategories
                              ? `${Object.keys(subcategories).length} subcategor${Object.keys(subcategories).length === 1 ? "y" : "ies"}`
                              : `${categoryAttributes.length} attribute${categoryAttributes.length === 1 ? "" : "s"}`}
                          </span>
                        </div>
                      </div>

                      {hasSubcategories ? (
                        <div className="hierarchical-subcategories-list">
                          {Object.keys(subcategories).map((subcatKey) => {
                            const subcategory = subcategories[subcatKey];
                            const attrs = subcategory?.attributes || [];

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
                                  <span className="attr-count">
                                    {attrs.length}{" "}
                                    {attrs.length === 1
                                      ? "attribute"
                                      : "attributes"}
                                  </span>
                                </div>
                                {attrs.length > 0 && (
                                  <div className="hierarchical-attribute-tags">
                                    {attrs.map((attr, idx) => (
                                      <span
                                        key={idx}
                                        className="hierarchical-attribute-tag"
                                      >
                                        {attr}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="hierarchical-attributes-list">
                          {categoryAttributes.length > 0 && (
                            <div className="hierarchical-direct-attributes">
                              {categoryAttributes.map((attr, idx) => (
                                <span
                                  key={idx}
                                  className="hierarchical-attribute-tag"
                                >
                                  {attr}
                                </span>
                              ))}
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
          )}
        </div>
      )}

      {showModal && selectedBusinessCard && (
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
            <h2>Business Card Quote Details</h2>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div>
                    <strong>Name:</strong>{" "}
                    {selectedBusinessCard.customerDetails?.name}
                  </div>
                  <div>
                    <strong>Email:</strong>{" "}
                    {selectedBusinessCard.customerDetails?.email}
                  </div>
                  <div>
                    <strong>Phone:</strong>{" "}
                    {selectedBusinessCard.customerDetails?.phone}
                  </div>
                  <div>
                    <strong>Address:</strong>{" "}
                    {selectedBusinessCard.customerDetails?.address || "N/A"}
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Business Card Specifications</h3>
                <div className="info-grid">
                  <div>
                    <strong>Project Name:</strong>{" "}
                    {selectedBusinessCard.basicsAndDimensions?.projectName}
                  </div>
                  <div>
                    <strong>Quantity:</strong>{" "}
                    {selectedBusinessCard.basicsAndDimensions?.quantity}
                  </div>
                  <div>
                    <strong>Card Size:</strong>{" "}
                    {selectedBusinessCard.basicsAndDimensions?.cardSize}
                  </div>
                  <div>
                    <strong>Orientation:</strong>{" "}
                    {selectedBusinessCard.basicsAndDimensions?.orientation}
                  </div>
                  <div>
                    <strong>Paper Stock:</strong>{" "}
                    {selectedBusinessCard.paperAndMaterial?.paperStock}
                  </div>
                  <div>
                    <strong>Printing Sides:</strong>{" "}
                    {selectedBusinessCard.paperAndMaterial?.printingSides}
                  </div>
                  <div>
                    <strong>Special Effects:</strong>{" "}
                    {selectedBusinessCard.laminationAndCoating?.premiumFinishes?.specialEffects?.join(
                      ", ",
                    ) || "N/A"}
                  </div>
                  <div>
                    <strong>Corner Style:</strong>{" "}
                    {selectedBusinessCard.cornerStyle?.type || "N/A"}
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Timeline</h3>
                <div className="info-grid">
                  <div>
                    <strong>Order Date:</strong>{" "}
                    {formatDate(selectedBusinessCard.timeline?.orderDate)}
                  </div>
                  <div>
                    <strong>Expected Date:</strong>{" "}
                    {formatDate(selectedBusinessCard.timeline?.expectedDate)}
                  </div>
                  <div>
                    <strong>Delivery Date:</strong>{" "}
                    {formatDate(selectedBusinessCard.timeline?.deliveryDate)}
                  </div>
                </div>
              </div>

              {selectedBusinessCard.uploadAndNotes?.comments && (
                <div className="modal-section">
                  <h3>Additional Notes</h3>
                  <p>{selectedBusinessCard.uploadAndNotes.comments}</p>
                </div>
              )}

              {selectedBusinessCard.files &&
                selectedBusinessCard.files.length > 0 && (
                  <div className="modal-section">
                    <h3>Attached Files</h3>
                    <div className="files-list">
                      {selectedBusinessCard.files.map((file, index) => (
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

      {showEditModal && selectedBusinessCard && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditModal(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div
            className="modal-content edit-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => {
                setShowEditModal(false);
                document.body.classList.remove("modal-open");
              }}
            >
              ×
            </button>
            <h2>Edit Business Card Quote</h2>

            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-sections">
                <div className="form-section">
                  <h3>Basics & Dimensions</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>No. of Different Names</label>
                      <input
                        type="number"
                        value={formData.numberOfDifferentNames}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfDifferentNames: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Card Size</label>
                      <input
                        type="text"
                        value={formData.cardSize}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardSize: e.target.value,
                          })
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
                        required
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Paper & Material</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Paper Stock</label>
                      <input
                        type="text"
                        value={formData.paperStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperStock: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Printing Sides</label>
                      <input
                        type="text"
                        value={formData.printingSides}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            printingSides: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Lamination & Coating</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Special Effects (comma separated)</label>
                      <input
                        type="text"
                        value={formData.specialEffects}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialEffects: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Foil Color</label>
                      <input
                        type="text"
                        value={formData.foilColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            foilColor: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Corner Style & Notes</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Corner Type</label>
                      <input
                        type="text"
                        value={formData.cornerType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cornerType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Comments</label>
                      <textarea
                        value={formData.comments}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            comments: e.target.value,
                          })
                        }
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
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

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddCategory && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddCategory(false)}
        >
          <div
            className="add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Category</h2>
              <p>Create a new category to organize Business Card options</p>
            </div>

            <form onSubmit={handleAddCategory} className="simple-form-body">
              <div className="simple-form-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Card Sizes, Paper Stocks"
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
            className="add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Subcategory</h2>
              <p>Add a subcategory under "{selectedCategory}"</p>
            </div>

            <form onSubmit={handleAddSubcategory} className="simple-form-body">
              <div className="simple-form-group">
                <label htmlFor="subcategoryName">Subcategory Name</label>
                <input
                  type="text"
                  id="subcategoryName"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="e.g., Standard Sizes, Premium Sizes"
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

export default BusinessCards;

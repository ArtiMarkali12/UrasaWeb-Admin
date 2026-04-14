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

  // Dropdown Options State (for hierarchical selects)
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [selectedCategoryDropdown, setSelectedCategoryDropdown] = useState("");
  const [selectedSubcategoryDropdown, setSelectedSubcategoryDropdown] =
    useState("");
  const [selectedAttributeDropdown, setSelectedAttributeDropdown] =
    useState("");

  // Category Management State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryFieldType, setNewCategoryFieldType] = useState("select");
  const [newCategoryPlaceholder, setNewCategoryPlaceholder] = useState("");
  const [newCategoryRequired, setNewCategoryRequired] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryKey, setEditCategoryKey] = useState("");
  const [editCategoryDisplayName, setEditCategoryDisplayName] = useState("");
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editCategoryFieldType, setEditCategoryFieldType] = useState("select");
  const [editCategoryPlaceholder, setEditCategoryPlaceholder] = useState("");
  const [editCategoryRequired, setEditCategoryRequired] = useState(false);

  // Subcategory Management State
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryFieldType, setNewSubcategoryFieldType] =
    useState("select");
  const [newSubcategoryPlaceholder, setNewSubcategoryPlaceholder] =
    useState("");
  const [newSubcategoryRequired, setNewSubcategoryRequired] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editSubcategoryKey, setEditSubcategoryKey] = useState("");
  const [editSubcategoryDisplayName, setEditSubcategoryDisplayName] =
    useState("");
  const [showEditSubcategory, setShowEditSubcategory] = useState(false);
  const [editSubcategoryFieldType, setEditSubcategoryFieldType] =
    useState("select");
  const [editSubcategoryPlaceholder, setEditSubcategoryPlaceholder] =
    useState("");
  const [editSubcategoryRequired, setEditSubcategoryRequired] = useState(false);

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
    // Dynamically flatten all fields from bookFormatAndBinding
    const options = Artbook.bookFormatAndBinding || {};
    const formDataDynamic = {};

    Object.entries(options).forEach(([fieldKey, fieldValue]) => {
      if (Array.isArray(fieldValue)) {
        formDataDynamic[fieldKey] = fieldValue.join(", ");
      } else if (typeof fieldValue === "object" && fieldValue !== null) {
        Object.entries(fieldValue).forEach(([nestedKey, nestedVal]) => {
          formDataDynamic[nestedKey] = nestedVal;
        });
      } else {
        formDataDynamic[fieldKey] = fieldValue;
      }
    });

    setFormData({
      ...formDataDynamic,
      customerName: Artbook.customerDetails?.name || "",
      customerEmail: Artbook.customerDetails?.email || "",
      customerCountry: Artbook.customerDetails?.country || "",
      quantity: Artbook.quantityRequired || Artbook.quantity || "",
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
    fetchDropdownOptions();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build bookFormatAndBinding dynamically from formData
      const {
        customerName,
        customerEmail,
        customerCountry,
        quantity,
        expectedDate,
        deliveryDate,
        ...fields
      } = formData;

      const bookFormatAndBinding = {};
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Convert comma-separated strings back to arrays for known array fields
          if (
            typeof value === "string" &&
            value.includes(",") &&
            (key === "coverMaterial" || key === "features")
          ) {
            bookFormatAndBinding[key] = value
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item);
          } else {
            bookFormatAndBinding[key] = value;
          }
        }
      });

      const updateData = {
        quantityRequired: quantity ? parseInt(quantity) : undefined,
        bookFormatAndBinding: bookFormatAndBinding,
        customerDetails: {
          name: customerName || "",
          email: customerEmail || "",
          country: customerCountry || "",
        },
        timeline: {
          expectedDate: expectedDate || undefined,
          deliveryDate: deliveryDate || undefined,
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

  const fetchDropdownOptions = async () => {
    try {
      const response = await artbookOptionsAPI.getDropdown();
      setDropdownOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
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
        fieldType: newCategoryFieldType,
        placeholder: newCategoryPlaceholder,
        required: newCategoryRequired,
      });
      setNewCategoryName("");
      setNewCategoryFieldType("select");
      setNewCategoryPlaceholder("");
      setNewCategoryRequired(false);
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

  const handleEditCategory = (categoryKey, category) => {
    setEditingCategory(categoryKey);
    setEditCategoryKey(category?.displayName || categoryKey);
    setEditCategoryFieldType(category?.fieldType || "select");
    setEditCategoryPlaceholder(category?.placeholder || "");
    setEditCategoryRequired(category?.required || false);
    setShowEditCategory(true);
    document.body.classList.add("modal-open");
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryKey.trim()) {
      showToast("Category name is required", "error");
      return;
    }
    try {
      const response = await artbookOptionsAPI.updateCategory(editingCategory, {
        displayName: editCategoryKey,
        fieldType: editCategoryFieldType,
        placeholder: editCategoryPlaceholder,
        required: editCategoryRequired,
      });
      setEditingCategory(null);
      setEditCategoryKey("");
      setShowEditCategory(false);
      document.body.classList.remove("modal-open");
      fetchOptions();
      showToast(
        response?.data?.message || "Category updated successfully",
        "success",
      );
    } catch (error) {
      console.error("Error updating category:", error);
      showToast(
        error.response?.data?.message || "Error updating category",
        "error",
      );
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
          fieldType: newSubcategoryFieldType,
          placeholder: newSubcategoryPlaceholder,
          required: newSubcategoryRequired,
        },
      );
      setNewSubcategoryName("");
      setNewSubcategoryFieldType("select");
      setNewSubcategoryPlaceholder("");
      setNewSubcategoryRequired(false);
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

  const handleEditSubcategory = (subcategoryKey, subcategory, categoryKey) => {
    setEditingSubcategory(subcategoryKey);
    setEditSubcategoryKey(subcategory?.displayName || subcategoryKey);
    setEditingCategory(categoryKey);
    setEditSubcategoryFieldType(subcategory?.fieldType || "select");
    setEditSubcategoryPlaceholder(subcategory?.placeholder || "");
    setEditSubcategoryRequired(subcategory?.required || false);
    setShowEditSubcategory(true);
    document.body.classList.add("modal-open");
  };

  const handleUpdateSubcategory = async (e) => {
    e.preventDefault();
    if (!editSubcategoryKey.trim() || !editingCategory) {
      showToast("Subcategory name and category are required", "error");
      return;
    }
    try {
      const response = await artbookOptionsAPI.updateSubcategory(
        editingCategory,
        editingSubcategory,
        {
          displayName: editSubcategoryKey,
          fieldType: editSubcategoryFieldType,
          placeholder: editSubcategoryPlaceholder,
          required: editSubcategoryRequired,
        },
      );
      setEditingSubcategory(null);
      setEditSubcategoryKey("");
      setShowEditSubcategory(false);
      document.body.classList.remove("modal-open");
      fetchOptions();
      showToast(
        response?.data?.message || "Subcategory updated successfully",
        "success",
      );
    } catch (error) {
      console.error("Error updating subcategory:", error);
      showToast(
        error.response?.data?.message || "Error updating subcategory",
        "error",
      );
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

                      {/* Dynamically render ALL fields from bookFormatAndBinding */}
                      {Artbook.bookFormatAndBinding &&
                        typeof Artbook.bookFormatAndBinding === "object" &&
                        Object.entries(Artbook.bookFormatAndBinding)
                          .filter(([key]) => key !== "size") // Remove duplicate; keep only sizeSelection
                          .map(([fieldKey, fieldValue]) => {
                            if (
                              !fieldValue &&
                              fieldValue !== 0 &&
                              fieldValue !== false
                            )
                              return null;

                            const formattedLabel = fieldKey
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase());

                            // Handle arrays
                            if (Array.isArray(fieldValue)) {
                              return (
                                <div key={fieldKey} className="info-row">
                                  <span className="info-label">
                                    {formattedLabel}
                                  </span>
                                  <span className="info-value">
                                    {fieldValue.join(", ")}
                                  </span>
                                </div>
                              );
                            }

                            // Handle nested objects
                            if (typeof fieldValue === "object") {
                              return (
                                <div key={fieldKey} className="info-row">
                                  <span className="info-label">
                                    {formattedLabel}
                                  </span>
                                  <span className="info-value">
                                    {Object.entries(fieldValue)
                                      .filter(
                                        ([key, val]) =>
                                          val && val !== "" && val !== 0,
                                      )
                                      .map(([key, val]) => {
                                        const subLabel = key
                                          .replace(/([A-Z])/g, " $1")
                                          .replace(/^./, (str) =>
                                            str.toUpperCase(),
                                          );
                                        return (
                                          <span
                                            key={key}
                                            className="nested-value"
                                          >
                                            {subLabel}: {String(val)}
                                          </span>
                                        );
                                      })
                                      .reduce((prev, curr, index, array) => [
                                        prev,
                                        index < array.length - 1 && (
                                          <br key={`br-${index}`} />
                                        ),
                                        curr,
                                      ])}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div key={fieldKey} className="info-row">
                                <span className="info-label">
                                  {formattedLabel}
                                </span>
                                <span className="info-value">
                                  {String(fieldValue)}
                                </span>
                              </div>
                            );
                          })}

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
                            handleEditCategory(categoryKey, category);
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
                                              subcategory,
                                              categoryKey,
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
                  {selectedArtbook.bookFormatAndBinding &&
                    typeof selectedArtbook.bookFormatAndBinding === "object" &&
                    Object.entries(selectedArtbook.bookFormatAndBinding)
                      .filter(([key]) => key !== "size") // Remove duplicate; keep only sizeSelection
                      .map(([fieldKey, fieldValue]) => {
                        if (
                          !fieldValue &&
                          fieldValue !== 0 &&
                          fieldValue !== false
                        )
                          return null;

                        const formattedLabel = fieldKey
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase());

                        // Handle arrays
                        if (Array.isArray(fieldValue)) {
                          return (
                            <div key={fieldKey}>
                              <strong>{formattedLabel}:</strong>{" "}
                              {fieldValue.join(", ")}
                            </div>
                          );
                        }

                        // Handle nested objects
                        if (typeof fieldValue === "object") {
                          return (
                            <div key={fieldKey}>
                              <strong>{formattedLabel}:</strong>{" "}
                              {Object.entries(fieldValue)
                                .filter(
                                  ([key, val]) =>
                                    val && val !== "" && val !== 0,
                                )
                                .map(([key, val]) => {
                                  const subLabel = key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase());
                                  return `${subLabel}: ${String(val)}`;
                                })
                                .join(", ")}
                            </div>
                          );
                        }

                        return (
                          <div key={fieldKey}>
                            <strong>{formattedLabel}:</strong>{" "}
                            {String(fieldValue)}
                          </div>
                        );
                      })}
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

                  {/* Dynamically render ALL fields from bookFormatAndBinding */}
                  {Object.entries(formData)
                    .filter(
                      ([key]) =>
                        ![
                          "customerName",
                          "customerEmail",
                          "customerCountry",
                          "quantity",
                          "expectedDate",
                          "deliveryDate",
                          "size", // Remove duplicate; keep only sizeSelection
                        ].includes(key),
                    )
                    .map(([key, value]) => {
                      const formattedLabel = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase());

                      // Known array fields or fields that might be comma-separated
                      const isTextarea =
                        key === "coverMaterial" ||
                        key === "features" ||
                        key === "additionalInstructions";

                      return (
                        <div className="edit-field" key={key}>
                          <label>
                            {formattedLabel}
                            {isTextarea ? " (comma separated)" : ""}
                          </label>
                          {isTextarea ? (
                            <textarea
                              value={value || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [key]: e.target.value,
                                })
                              }
                              rows="2"
                            />
                          ) : (
                            <input
                              type="text"
                              value={value || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [key]: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      );
                    })}
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
            className="modal-content add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Category</h2>
              <p>Create a new category to manage artbook options</p>
            </div>
            <form
              className="simple-category-form"
              onSubmit={(e) => {
                handleAddCategory(e);
                document.body.classList.remove("modal-open");
              }}
            >
              <div className="simple-form-body">
                <div className="simple-form-group">
                  <label>Category Key</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., bookFormatAndBinding"
                    required
                  />
                  <small>
                    Unique identifier (no spaces, camelCase recommended)
                  </small>
                </div>
                <div className="simple-form-group">
                  <label>Field Type (if no subcategories)</label>
                  <select
                    value={newCategoryFieldType}
                    onChange={(e) => setNewCategoryFieldType(e.target.value)}
                    className="simple-form-select"
                  >
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">
                      Checkbox (Multiple Options)
                    </option>
                    <option value="boolean">Boolean (Yes/No)</option>
                    <option value="number">Number Input</option>
                    <option value="text">Text Input</option>
                    <option value="textarea">Text Area</option>
                    <option value="radio">
                      Radio Buttons (Single Selection)
                    </option>
                  </select>
                  <small>
                    Choose how this field will be displayed if it has no
                    subcategories
                  </small>
                </div>
                <div className="simple-form-group">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={newCategoryPlaceholder}
                    onChange={(e) => setNewCategoryPlaceholder(e.target.value)}
                    placeholder="e.g., Enter value..."
                  />
                  <small>Optional placeholder text</small>
                </div>
                <div className="simple-form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newCategoryRequired}
                      onChange={(e) => setNewCategoryRequired(e.target.checked)}
                    />
                    <span>Required Field</span>
                  </label>
                </div>
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
            className="modal-content add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Add New Subcategory</h2>
              <p>Add subcategory to "{selectedCategory}"</p>
            </div>
            <form
              className="simple-category-form"
              onSubmit={(e) => {
                handleAddSubcategory(e);
                document.body.classList.remove("modal-open");
              }}
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
                <div className="simple-form-group">
                  <label>Field Type</label>
                  <select
                    value={newSubcategoryFieldType}
                    onChange={(e) => setNewSubcategoryFieldType(e.target.value)}
                    className="simple-form-select"
                  >
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">
                      Checkbox (Multiple Options)
                    </option>
                    <option value="boolean">Boolean (Yes/No)</option>
                    <option value="number">Number Input</option>
                    <option value="text">Text Input</option>
                    <option value="textarea">Text Area</option>
                    <option value="radio">
                      Radio Buttons (Single Selection)
                    </option>
                  </select>
                  <small>Choose how this field will accept input values</small>
                </div>
                <div className="simple-form-group">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={newSubcategoryPlaceholder}
                    onChange={(e) =>
                      setNewSubcategoryPlaceholder(e.target.value)
                    }
                    placeholder="e.g., Select an option..."
                  />
                  <small>Optional placeholder text</small>
                </div>
                <div className="simple-form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newSubcategoryRequired}
                      onChange={(e) =>
                        setNewSubcategoryRequired(e.target.checked)
                      }
                    />
                    <span>Required Field</span>
                  </label>
                </div>
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

      {showEditCategory && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditCategory(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div
            className="modal-content add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Edit Category</h2>
              <p>Edit "{editingCategory}"</p>
            </div>
            <form
              className="simple-category-form"
              onSubmit={handleUpdateCategory}
            >
              <div className="simple-form-body">
                <div className="simple-form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    value={editCategoryKey}
                    onChange={(e) => setEditCategoryKey(e.target.value)}
                    placeholder="e.g., Cover Type"
                    required
                  />
                </div>
                <div className="simple-form-group">
                  <label>Field Type (if no subcategories)</label>
                  <select
                    value={editCategoryFieldType}
                    onChange={(e) => setEditCategoryFieldType(e.target.value)}
                    className="simple-form-select"
                  >
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">
                      Checkbox (Multiple Options)
                    </option>
                    <option value="boolean">Boolean (Yes/No)</option>
                    <option value="number">Number Input</option>
                    <option value="text">Text Input</option>
                    <option value="textarea">Text Area</option>
                    <option value="radio">
                      Radio Buttons (Single Selection)
                    </option>
                  </select>
                </div>
                <div className="simple-form-group">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={editCategoryPlaceholder}
                    onChange={(e) => setEditCategoryPlaceholder(e.target.value)}
                    placeholder="e.g., Enter value..."
                  />
                  <small>Optional placeholder text</small>
                </div>
                <div className="simple-form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editCategoryRequired}
                      onChange={(e) =>
                        setEditCategoryRequired(e.target.checked)
                      }
                    />
                    <span>Required Field</span>
                  </label>
                </div>
              </div>
              <div className="simple-form-footer">
                <button
                  type="button"
                  className="btn-simple-cancel"
                  onClick={() => {
                    setShowEditCategory(false);
                    document.body.classList.remove("modal-open");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-simple-create">
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditSubcategory && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditSubcategory(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div
            className="modal-content add-category-modal-simple"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="simple-modal-header">
              <h2>Edit Subcategory</h2>
              <p>Edit "{editingSubcategory}"</p>
            </div>
            <form
              className="simple-category-form"
              onSubmit={handleUpdateSubcategory}
            >
              <div className="simple-form-body">
                <div className="simple-form-group">
                  <label>Subcategory Name</label>
                  <input
                    type="text"
                    value={editSubcategoryKey}
                    onChange={(e) => setEditSubcategoryKey(e.target.value)}
                    placeholder="e.g., Binding Type"
                    required
                  />
                </div>
                <div className="simple-form-group">
                  <label>Field Type</label>
                  <select
                    value={editSubcategoryFieldType}
                    onChange={(e) =>
                      setEditSubcategoryFieldType(e.target.value)
                    }
                    className="simple-form-select"
                  >
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">
                      Checkbox (Multiple Options)
                    </option>
                    <option value="boolean">Boolean (Yes/No)</option>
                    <option value="number">Number Input</option>
                    <option value="text">Text Input</option>
                    <option value="textarea">Text Area</option>
                    <option value="radio">
                      Radio Buttons (Single Selection)
                    </option>
                  </select>
                </div>
                <div className="simple-form-group">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={editSubcategoryPlaceholder}
                    onChange={(e) =>
                      setEditSubcategoryPlaceholder(e.target.value)
                    }
                    placeholder="e.g., Select an option..."
                  />
                  <small>Optional placeholder text</small>
                </div>
                <div className="simple-form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editSubcategoryRequired}
                      onChange={(e) =>
                        setEditSubcategoryRequired(e.target.checked)
                      }
                    />
                    <span>Required Field</span>
                  </label>
                </div>
              </div>
              <div className="simple-form-footer">
                <button
                  type="button"
                  className="btn-simple-cancel"
                  onClick={() => {
                    setShowEditSubcategory(false);
                    document.body.classList.remove("modal-open");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-simple-create">
                  Update Subcategory
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

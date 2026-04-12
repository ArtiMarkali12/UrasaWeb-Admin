import { useState, useEffect } from "react";
import { bookletAPI, bookletOptionsAPI } from "../../services/api";
import "./Booklet.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Booklets = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Quotes State
  const [booklets, setBooklets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooklet, setSelectedBooklet] = useState(null);
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
      fetchBooklets();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchBooklets = async () => {
    try {
      const response = await bookletAPI.getAll();
      setBooklets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching booklets:", error);
      showToast("Failed to fetch booklet quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booklet quote?")) {
      try {
        await bookletAPI.delete(id);
        setBooklets(booklets.filter((b) => b._id !== id));
        showToast("Booklet quote deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting booklet:", error);
        showToast("Failed to delete booklet quote", "error");
      }
    }
  };

  const handleView = (booklet) => {
    setSelectedBooklet(booklet);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (booklet) => {
    // Read from dynamic options structure - preserve category structure
    const options = booklet.options || {};

    // Build form data preserving category structure
    const formDataDynamic = {};
    Object.entries(options).forEach(([catKey, catData]) => {
      if (catData && typeof catData === "object" && !Array.isArray(catData)) {
        // For nested objects, preserve the structure
        Object.entries(catData).forEach(([fieldKey, value]) => {
          formDataDynamic[fieldKey] = value;
        });
      } else {
        // For simple values (arrays, strings, etc.)
        formDataDynamic[catKey] = catData;
      }
    });

    setFormData({
      ...formDataDynamic,
      orderType: booklet.orderType || "",
      customerName: booklet.customerDetails?.name || "",
      customerEmail: booklet.customerDetails?.email || "",
      customerCountry: booklet.customerDetails?.country || "",
      orderDate: booklet.timeline?.orderDate
        ? new Date(booklet.timeline.orderDate).toISOString().split("T")[0]
        : "",
      expectedDate: booklet.timeline?.expectedDate
        ? new Date(booklet.timeline.expectedDate).toISOString().split("T")[0]
        : "",
      deliveryDate: booklet.timeline?.deliveryDate
        ? new Date(booklet.timeline.deliveryDate).toISOString().split("T")[0]
        : "",
    });
    setSelectedBooklet(booklet);
    setShowEditModal(true);
    document.body.classList.add("modal-open");
    fetchDropdownOptions();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Rebuild options using the same structure as the original options
      // Use dropdownOptions to know the category structure
      const options = {};

      if (dropdownOptions && dropdownOptions.length > 0) {
        // Build options object using category structure from dropdownOptions
        dropdownOptions.forEach((category) => {
          const catKey = category.categoryKey;
          const subcategories = category.subcategories || [];

          if (subcategories.length > 0) {
            // Has subcategories - build nested object
            options[catKey] = {};
            subcategories.forEach((subcat) => {
              const subKey = subcat.subcategoryKey;
              if (formData[subKey] !== undefined) {
                options[catKey][subKey] = formData[subKey];
              }
            });
          } else {
            // No subcategories - use direct value or attributes
            if (formData[catKey] !== undefined) {
              options[catKey] = formData[catKey];
            }
          }
        });
      } else {
        // Fallback: use existing options from selectedBooklet
        Object.assign(options, selectedBooklet.options || {});
      }

      const updateData = {
        options: options,
        orderType: formData.orderType,
        customerDetails: {
          name: formData.customerName || "",
          email: formData.customerEmail || "",
          country: formData.customerCountry || "",
        },
        timeline: {
          orderDate: formData.orderDate || undefined,
          expectedDate: formData.expectedDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      };
      await bookletAPI.update(selectedBooklet._id, updateData);
      fetchBooklets();
      setShowEditModal(false);
      document.body.classList.remove("modal-open");
      setSelectedBooklet(null);
      showToast("Booklet quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating booklet:", error);
      showToast("Failed to update booklet quote", "error");
    }
  };

  const filteredBooklets = booklets.filter(
    (booklet) =>
      booklet.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booklet.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const fetchOptions = async () => {
    try {
      const response = await bookletOptionsAPI.getAll();
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

  const fetchDropdownOptions = async () => {
    try {
      const response = await bookletOptionsAPI.getDropdown();
      setDropdownOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  const handleAddAttribute = async (categoryKey, subcategoryKey) => {
    const value = attributeInputs[`${categoryKey}-${subcategoryKey}`] || "";
    if (!value.trim() || !categoryKey || !subcategoryKey) return;
    try {
      const response = await bookletOptionsAPI.addAttribute(
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
      const response = await bookletOptionsAPI.updateAttribute(
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
      const response = await bookletOptionsAPI.deleteAttribute(
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
      const response = await bookletOptionsAPI.addCategory({
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
      await bookletOptionsAPI.deleteCategory({ categoryKey });
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
      const response = await bookletOptionsAPI.updateCategory(editingCategory, {
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
      const response = await bookletOptionsAPI.addSubcategory(
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
      await bookletOptionsAPI.deleteSubcategory(
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
    setEditingCategory(categoryKey);
    setEditingSubcategory(subcategoryKey);
    setEditSubcategoryKey(subcategory?.displayName || subcategoryKey);
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
      const response = await bookletOptionsAPI.updateSubcategory(
        editingCategory,
        editingSubcategory,
        {
          displayName: editSubcategoryKey,
          fieldType: editSubcategoryFieldType,
          placeholder: editSubcategoryPlaceholder,
          required: editSubcategoryRequired,
        },
      );
      setEditingCategory(null);
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

  // Dynamic data renderer - shows ALL data from database
  const renderDynamicData = (data, parentKey = "") => {
    if (!data) return null;

    if (typeof data !== "object") {
      return data === null || data === undefined || data === ""
        ? "N/A"
        : String(data);
    }

    const items = [];

    // Debug: log the data being rendered
    if (parentKey === "") {
      console.log(
        "🔍 View Modal - Data structure:",
        JSON.stringify(data, null, 2),
      );
    }

    Object.entries(data).forEach(([key, value]) => {
      // Skip internal MongoDB fields and timestamps
      if (
        key === "_id" ||
        key === "__v" ||
        key === "createdAt" ||
        key === "updatedAt"
      )
        return;

      // Skip orderType, status, and files fields (not displayed)
      if (key === "orderType" || key === "status" || key === "files") return;

      // Skip timeline - display dates individually
      if (key === "timeline") {
        if (value && typeof value === "object") {
          if (value.orderDate) {
            items.push(
              <div key={`${parentKey}-orderDate`} className="info-item">
                <span className="label">Order Date</span>
                <span className="value">{formatDate(value.orderDate)}</span>
              </div>,
            );
          }
          if (value.expectedDate) {
            items.push(
              <div key={`${parentKey}-expectedDate`} className="info-item">
                <span className="label">Expected Date</span>
                <span className="value">{formatDate(value.expectedDate)}</span>
              </div>,
            );
          }
          if (value.deliveryDate) {
            items.push(
              <div key={`${parentKey}-deliveryDate`} className="info-item">
                <span className="label">Delivery Date</span>
                <span className="value">{formatDate(value.deliveryDate)}</span>
              </div>,
            );
          }
        }
        return;
      }

      const label = formatLabel(key);
      const itemKey = `${parentKey}-${key}`;

      // Handle nested objects - FULLY DYNAMIC, no hardcoded field names
      if (value && typeof value === "object" && !Array.isArray(value)) {
        // Special handling for sizeSelection if it's still an old object structure
        if (key === "sizeSelection") {
          const sizeValue =
            value.selectedSize || value.cardSize || value.dimensions || "";
          if (sizeValue) {
            items.push(
              <div key={itemKey} className="info-item">
                <span className="label">Size Selection</span>
                <span className="value">{sizeValue}</span>
              </div>,
            );
          }
          return;
        }

        // For options object, render all children as flat info-items (no nested section)
        if (key === "options") {
          Object.entries(value).forEach(([optKey, optValue]) => {
            const optLabel = formatLabel(optKey);
            const optItemKey = `${itemKey}-${optKey}`;

            // Skip _attributes here - it will be rendered inside its parent category
            if (optKey === "_attributes") return;

            // Handle sizeSelection as object (old data)
            if (
              optKey === "sizeSelection" &&
              optValue &&
              typeof optValue === "object"
            ) {
              const sizeVal =
                optValue.selectedSize ||
                optValue.cardSize ||
                optValue.dimensions ||
                "";
              if (sizeVal) {
                items.push(
                  <div key={optItemKey} className="info-item">
                    <span className="label">Size Selection</span>
                    <span className="value">{sizeVal}</span>
                  </div>,
                );
              }
              return;
            }

            // Handle sizeSelection as string (new data)
            if (optKey === "sizeSelection" && typeof optValue === "string") {
              items.push(
                <div key={optItemKey} className="info-item">
                  <span className="label">Size Selection</span>
                  <span className="value">{optValue}</span>
                </div>,
              );
              return;
            }

            // Handle nested objects inside options
            if (
              optValue &&
              typeof optValue === "object" &&
              !Array.isArray(optValue)
            ) {
              // Check if this nested object has _attributes
              const attributes = optValue._attributes;
              const hasAttributes =
                attributes &&
                Array.isArray(attributes) &&
                attributes.length > 0;

              items.push(
                <div key={optItemKey} className="modal-section">
                  <div className="section-icon">📋</div>
                  <h3>{optLabel}</h3>
                  <div className="info-grid">
                    {renderDynamicData(
                      Object.fromEntries(
                        Object.entries(optValue).filter(
                          ([k]) => k !== "_attributes",
                        ),
                      ),
                      optItemKey,
                    )}
                    {hasAttributes && (
                      <div className="info-item full-width">
                        <span className="label">{optLabel} Attributes</span>
                        <span className="value">{attributes.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>,
              );
            } else if (Array.isArray(optValue)) {
              items.push(
                <div key={optItemKey} className="info-item full-width">
                  <span className="label">{optLabel}</span>
                  <span className="value">
                    {optValue.length > 0 ? optValue.join(", ") : "N/A"}
                  </span>
                </div>,
              );
            } else {
              // Handle primitive values inside options
              items.push(
                <div key={optItemKey} className="info-item">
                  <span className="label">{optLabel}</span>
                  <span className="value">
                    {optValue === null ||
                    optValue === undefined ||
                    optValue === ""
                      ? "N/A"
                      : typeof optValue === "boolean"
                        ? optValue
                          ? "Yes"
                          : "No"
                        : String(optValue)}
                  </span>
                </div>,
              );
            }
          });
          return;
        }

        // Recursively render all other nested objects dynamically
        items.push(
          <div key={itemKey} className="modal-section">
            <div className="section-icon">📋</div>
            <h3>{label}</h3>
            <div className="info-grid">{renderDynamicData(value, itemKey)}</div>
          </div>,
        );
        return;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        items.push(
          <div key={itemKey} className="info-item full-width">
            <span className="label">{label}</span>
            <span className="value">
              {value.length > 0 ? value.join(", ") : "N/A"}
            </span>
          </div>,
        );
        return;
      }

      // Handle primitive values
      items.push(
        <div key={itemKey} className="info-item">
          <span className="label">{label}</span>
          <span className="value">
            {value === null || value === undefined || value === ""
              ? "N/A"
              : typeof value === "boolean"
                ? value
                  ? "Yes"
                  : "No"
                : value instanceof Date
                  ? formatDate(value.toISOString())
                  : String(value)}
          </span>
        </div>,
      );
    });

    return items;
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
        <h2>Booklet Management</h2>
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
              <p>Loading booklet quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredBooklets.length > 0 ? (
                filteredBooklets.map((booklet) => (
                  <div key={booklet._id} className="booklet-card">
                    <div className="card-badge">
                      #{booklet._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {booklet.customerDetails?.name?.charAt(0) || "C"}
                      </div>
                      <div className="customer-name">
                        {booklet.customerDetails?.name}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {booklet.customerDetails?.email}
                        </span>
                      </div>

                      {/* Hardcoded fields: Order Type */}
                      <div className="info-row">
                        <span className="info-label">Order Type</span>
                        <span className="info-value">
                          {booklet.orderType || "N/A"}
                        </span>
                      </div>

                      {/* Size Selection - from options (new string format or old object format) */}
                      {booklet.options?.sizeSelection && (
                        <div className="info-row">
                          <span className="info-label">Size</span>
                          <span className="info-value">
                            {typeof booklet.options.sizeSelection === "string"
                              ? booklet.options.sizeSelection
                              : booklet.options.sizeSelection.selectedSize ||
                                booklet.options.sizeSelection.cardSize ||
                                "N/A"}
                          </span>
                        </div>
                      )}

                      {/* Dynamically render ALL fields from options - no hardcoding */}
                      {booklet.options &&
                        typeof booklet.options === "object" &&
                        Object.entries(booklet.options).map(
                          ([categoryKey, categoryData]) => {
                            if (
                              !categoryData ||
                              typeof categoryData !== "object" ||
                              Array.isArray(categoryData)
                            ) {
                              return null;
                            }

                            return Object.entries(categoryData).map(
                              ([fieldKey, fieldValue]) => {
                                if (typeof fieldValue === "object") return null;
                                if (!fieldValue && fieldValue !== 0)
                                  return null;

                                const formattedLabel = fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase());

                                return (
                                  <div
                                    key={`${categoryKey}-${fieldKey}`}
                                    className="info-row"
                                  >
                                    <span className="info-label">
                                      {formattedLabel}
                                    </span>
                                    <span className="info-value">
                                      {String(fieldValue)}
                                    </span>
                                  </div>
                                );
                              },
                            );
                          },
                        )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(booklet.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(booklet)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(booklet)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(booklet._id)}
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
                  <p>No booklet quotes found</p>
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
                            {/* Show category-level attributes first */}
                            {categoryAttributes.length > 0 && (
                              <div className="category-attributes-direct-section">
                                <div className="subsection-header">
                                  <h4>General Options</h4>
                                  <span className="subsection-info">
                                    Attributes directly under this category
                                  </span>
                                </div>
                                <form
                                  className="add-attribute-inline-form"
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    const value =
                                      attributeInputs[
                                        `${categoryKey}-category`
                                      ] || "";
                                    if (!value.trim()) return;

                                    try {
                                      const response =
                                        await bookletOptionsAPI.addCategoryAttribute(
                                          categoryKey,
                                          { value: value },
                                        );
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
                                      attributeInputs[
                                        `${categoryKey}-category`
                                      ] || ""
                                    }
                                    onChange={(e) =>
                                      setAttributeInputs((prev) => ({
                                        ...prev,
                                        [`${categoryKey}-category`]:
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
                                  {categoryAttributes.length > 0 ? (
                                    categoryAttributes.map((attr, index) => {
                                      const isEditing =
                                        editingOption ===
                                        `${categoryKey}-category-${index}`;
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
                                                await bookletOptionsAPI.updateCategoryAttribute(
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
                                                    await bookletOptionsAPI.deleteCategoryAttribute(
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
                                    })
                                  ) : (
                                    <p className="empty-attr-text">
                                      No attributes yet. Add the first one
                                      above!
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* Show subcategories */}
                            <div
                              className="subsection-header"
                              style={{
                                marginTop:
                                  categoryAttributes.length > 0 ? "24px" : "0",
                              }}
                            >
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
                                    await bookletOptionsAPI.addCategoryAttribute(
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
                                            await bookletOptionsAPI.updateCategoryAttribute(
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
                                                await bookletOptionsAPI.deleteCategoryAttribute(
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
                View all booklet configuration options organized by categories
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
                      <div className="hierarchical-subcategories-list">
                        {/* Render category-level attributes first (if any) */}
                        {categoryAttributes.length > 0 && (
                          <div className="hierarchical-category-attributes-section">
                            <div className="hierarchical-subcategory-header">
                              <h4>General Options</h4>
                              <span className="hierarchical-subcategory-count">
                                {categoryAttributes.length} attribute
                                {categoryAttributes.length === 1 ? "" : "s"}
                              </span>
                            </div>
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
                        )}
                        {/* Render subcategories */}
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
                      {!hasSubcategories && categoryAttributes.length === 0 && (
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
              <p>Create a new category to manage booklet options</p>
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
                    placeholder="e.g., additionalNotes"
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
                  <small>Choose how this field will be displayed</small>
                </div>
                <div className="simple-form-group">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={newSubcategoryPlaceholder}
                    onChange={(e) =>
                      setNewSubcategoryPlaceholder(e.target.value)
                    }
                    placeholder="e.g., Enter value..."
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

      {/* Edit Category Modal */}
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
                  <small>
                    Choose how this field will be displayed if it has no
                    subcategories
                  </small>
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

      {/* Edit Subcategory Modal */}
      {showEditSubcategory && (
        <div
          className="modal-overlay"
          onClick={() => {
            setEditingCategory(null);
            setEditingSubcategory(null);
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
                  <small>Choose how this field will be displayed</small>
                </div>
                <div className="simple-form-group">
                  <label>Placeholder</label>
                  <input
                    type="text"
                    value={editSubcategoryPlaceholder}
                    onChange={(e) =>
                      setEditSubcategoryPlaceholder(e.target.value)
                    }
                    placeholder="e.g., Enter value..."
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
                    setEditingCategory(null);
                    setEditingSubcategory(null);
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

      {showModal && selectedBooklet && (
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
            <div className="modal-header">
              <h2>Booklet Quote Details</h2>
            </div>
            <div className="modal-body">
              {/* Dynamically render ALL data from database */}
              {renderDynamicData(selectedBooklet)}
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedBooklet && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditModal(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div
            className="modal-content edit-modal"
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
            <div className="modal-header">
              <h2>Edit Booklet Quote</h2>
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
                      <label>Order Type</label>
                      <select
                        value={formData.orderType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            orderType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Order Type</option>
                        <option value="Saddle Booklet">Saddle Booklet</option>
                        <option value="Coffee Table Book">
                          Coffee Table Book
                        </option>
                        <option value="Perfect Bound Booklet">
                          Perfect Bound Booklet
                        </option>
                        <option value="Spiral/Comb Coil Booklet">
                          Spiral/Comb Coil Booklet
                        </option>
                        <option value="Hard Cover Booklet">
                          Hard Cover Booklet
                        </option>
                      </select>
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
                  <div className="section-icon">⚙️</div>
                  <h3>Configuration Options</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={selectedCategoryDropdown}
                        onChange={(e) => {
                          setSelectedCategoryDropdown(e.target.value);
                          setSelectedSubcategoryDropdown("");
                          setSelectedAttributeDropdown("");
                        }}
                      >
                        <option value="">Select Category...</option>
                        {dropdownOptions.map((option) => (
                          <option
                            key={option.categoryKey}
                            value={option.categoryKey}
                          >
                            {option.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subcategory</label>
                      <select
                        value={selectedSubcategoryDropdown}
                        onChange={(e) => {
                          setSelectedSubcategoryDropdown(e.target.value);
                          setSelectedAttributeDropdown("");
                        }}
                        disabled={!selectedCategoryDropdown}
                      >
                        <option value="">Select Subcategory...</option>
                        {selectedCategoryDropdown &&
                          dropdownOptions
                            .find(
                              (opt) =>
                                opt.categoryKey === selectedCategoryDropdown,
                            )
                            ?.subcategories.map((sub) => (
                              <option
                                key={sub.subcategoryKey}
                                value={sub.subcategoryKey}
                              >
                                {sub.subcategoryName}
                              </option>
                            ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Attribute</label>
                      <select
                        value={selectedAttributeDropdown}
                        onChange={(e) => {
                          setSelectedAttributeDropdown(e.target.value);
                        }}
                        disabled={!selectedSubcategoryDropdown}
                      >
                        <option value="">Select Attribute...</option>
                        {selectedSubcategoryDropdown &&
                          dropdownOptions
                            .find(
                              (opt) =>
                                opt.categoryKey === selectedCategoryDropdown,
                            )
                            ?.subcategories.find(
                              (sub) =>
                                sub.subcategoryKey ===
                                selectedSubcategoryDropdown,
                            )
                            ?.attributes.map((attr) => (
                              <option key={attr} value={attr}>
                                {attr}
                              </option>
                            ))}
                      </select>
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
                  onClick={() => {
                    setShowEditModal(false);
                    document.body.classList.remove("modal-open");
                  }}
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

export default Booklets;

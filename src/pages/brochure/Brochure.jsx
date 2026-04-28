import { useState, useEffect } from "react";
import { brochureAPI, brochureOptionsAPI } from "../../services/api";
import "./Brochure.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Brochures = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  const [optionsVersion, setOptionsVersion] = useState(0); // Track options updates

  // Quotes State
  const [Brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrochure, setSelectedBrochure] = useState(null);
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
      fetchBrochures();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchBrochures = async () => {
    try {
      const response = await brochureAPI.getAll();
      setBrochures(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Brochures:", error);
      showToast("Failed to fetch Brochure quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this Brochure quote?")
    ) {
      try {
        await brochureAPI.delete(id);
        setBrochures(Brochures.filter((b) => b._id !== id));
        showToast("Brochure quote deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting Brochure:", error);
        showToast("Failed to delete Brochure quotes", "error");
      }
    }
  };

  const handleView = (Brochure) => {
    setSelectedBrochure(Brochure);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (Brochure) => {
    const opts = Brochure.options || {};
    setFormData({
      customerName: Brochure.customerDetails?.name || "",
      customerEmail: Brochure.customerDetails?.email || "",
      customerCountry: Brochure.customerDetails?.country || "",
      expectedDate: Brochure.timeline?.expectedDate
        ? new Date(Brochure.timeline.expectedDate).toISOString().split("T")[0]
        : "",
      deliveryDate: Brochure.timeline?.deliveryDate
        ? new Date(Brochure.timeline.deliveryDate).toISOString().split("T")[0]
        : "",
    });
    setSelectedBrochure(Brochure);
    setShowEditModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        customerDetails: {
          name: formData.customerName || "",
          email: formData.customerEmail || "",
          country: formData.customerCountry || "",
        },
        timeline: {
          expectedDate: formData.expectedDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      };
      await brochureAPI.update(selectedBrochure._id, updateData);
      fetchBrochures();
      setShowEditModal(false);
      document.body.classList.remove("modal-open");
      setSelectedBrochure(null);
      showToast("Brochure quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating brochure:", error);
      showToast("Failed to update brochure quote", "error");
    }
  };

  const filteredBrochures = Brochures.filter(
    (Brochure) =>
      Brochure.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      Brochure.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const fetchOptions = async () => {
    try {
      const response = await brochureOptionsAPI.getAll();
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
      const response = await brochureOptionsAPI.getDropdown();
      setDropdownOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  const handleAddAttribute = async (categoryKey, subcategoryKey) => {
    const value = attributeInputs[`${categoryKey}-${subcategoryKey}`] || "";
    if (!value.trim() || !categoryKey || !subcategoryKey) return;
    try {
      const response = await brochureOptionsAPI.addAttribute(
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
      const response = await brochureOptionsAPI.addCategory({
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
      await brochureOptionsAPI.deleteCategory({ categoryKey });
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
      const response = await brochureOptionsAPI.updateCategory(
        editingCategory,
        {
          displayName: editCategoryKey,
          fieldType: editCategoryFieldType,
          placeholder: editCategoryPlaceholder,
          required: editCategoryRequired,
        },
      );
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
      const response = await brochureOptionsAPI.addSubcategory(
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
      await brochureOptionsAPI.deleteSubcategory(
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
    setEditSubcategoryFieldType(subcategory?.fieldType || "select");
    setEditSubcategoryPlaceholder(subcategory?.placeholder || "");
    setEditSubcategoryRequired(subcategory?.required || false);
    setEditingCategory(categoryKey);
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
      const response = await brochureOptionsAPI.updateSubcategory(
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

  // Dynamic data renderer - shows ALL data from database (same as Booklet)
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
    <div className="Brochures-page">
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
        <h2>Brochure Management</h2>
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
              <p>Loading Brochure quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredBrochures.length > 0 ? (
                filteredBrochures.map((Brochure) => (
                  <div key={Brochure._id} className="booklet-card">
                    <div className="card-badge">
                      #{Brochure._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {Brochure.customerDetails?.name?.charAt(0) || "C"}
                      </div>
                      <div className="customer-name">
                        {Brochure.customerDetails?.name}
                      </div>
                    </div>
                     <div className="card-body">
                       {/* Email (always shown) */}
                       <div className="info-row">
                         <span className="info-label">Email</span>
                         <span className="info-value">
                           {Brochure.customerDetails?.email}
                         </span>
                       </div>

                       {/* Size Selection - from options (both string and object formats) */}
                       {Brochure.options?.sizeSelection && (
                         <div className="info-row">
                           <span className="info-label">Size Selection</span>
                           <span className="info-value">
                             {typeof Brochure.options.sizeSelection === "string"
                               ? Brochure.options.sizeSelection
                               : Brochure.options.sizeSelection.selectedSize ||
                                 Brochure.options.sizeSelection.cardSize ||
                                 Brochure.options.sizeSelection.dimensions ||
                                 "N/A"}
                           </span>
                         </div>
                       )}

                       {/* Dynamically render ALL other fields from options categories */}
                       {Brochure.options &&
                         typeof Brochure.options === "object" &&
                         Object.entries(Brochure.options).map(
                           ([categoryKey, categoryData]) => {
                             // Skip sizeSelection (already displayed) and _attributes
                             if (
                               !categoryData ||
                               typeof categoryData !== "object" ||
                               Array.isArray(categoryData) ||
                               categoryKey === "sizeSelection" ||
                               categoryKey === "_attributes"
                             ) {
                               return null;
                             }

                             // Render each field in this category as a flat info-row
                             return Object.entries(categoryData).map(
                               ([fieldKey, fieldValue]) => {
                                 // Skip nested objects (like size object in General Details)
                                 if (typeof fieldValue === "object" && fieldValue !== null) {
                                   return null;
                                 }
                                 // Skip empty values unless 0
                                 if (fieldValue === "" || fieldValue === null || fieldValue === undefined) {
                                   return null;
                                 }

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

                       {/* Show files count if any */}
                       {Brochure.files && Brochure.files.length > 0 && (
                         <div className="files-badge">
                           📎 {Brochure.files.length} file(s)
                         </div>
                       )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(Brochure.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(Brochure)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(Brochure)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(Brochure._id)}
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
                  <p>No Brochure quotes found</p>
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
                                                          await brochureOptionsAPI.updateAttribute(
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
                                                              await brochureOptionsAPI.deleteAttribute(
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
                                    await brochureOptionsAPI.addCategoryAttribute(
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
                                            await brochureOptionsAPI.updateCategoryAttribute(
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
                                                await brochureOptionsAPI.deleteCategoryAttribute(
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
                View all Brochure configuration options organized by categories
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

       {showModal && selectedBrochure && (
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
               <h2>Brochure Quote Details</h2>
             </div>
             <div className="modal-body">
               {/* Dynamically render ALL data from database */}
               {renderDynamicData(selectedBrochure)}
             </div>
           </div>
         </div>
       )}

      {showEditModal && selectedBrochure && (
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
            <h2>Edit Brochure Quote</h2>

            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-sections">
                <div className="form-section">
                  <h3>Brochure Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Fold Style</label>
                      <input
                        type="text"
                        value={formData.foldStyle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            foldStyle: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
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
                      <label>Finishing (comma separated)</label>
                      <input
                        type="text"
                        value={formData.finishing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            finishing: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Quantity & Notes</h3>
                  <div className="form-grid">
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
              <p>Create a new category to manage brochure options</p>
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

export default Brochures;

import { useState, useEffect } from "react";
import { pamphletAPI, pamphletOptionsAPI } from "../../services/api";
import "./Pamphlet.css";

const API = import.meta.env.VITE_API_BASE_URL;

const Pamphlets = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Quotes State
  const [pamphlets, setPamphlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPamphlet, setSelectedPamphlet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({});

  // Options State
  const [options, setOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [attributeInputs, setAttributeInputs] = useState({});
  const [editingOption, setEditingOption] = useState(null);
  const [editOptionValue, setEditOptionValue] = useState("");

  // Dropdown Options State
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
      fetchPamphlets();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchPamphlets = async () => {
    try {
      const response = await pamphletAPI.getAll();
      setPamphlets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Pamphlets:", error);
      showToast("Failed to fetch Pamphlet quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this Pamphlet quote?")
    ) {
      try {
        await pamphletAPI.delete(id);
        setPamphlets(pamphlets.filter((b) => b._id !== id));
        showToast("Pamphlet quote deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting Pamphlet:", error);
        showToast("Failed to delete Pamphlet quote", "error");
      }
    }
  };

  const handleView = (pamphlet) => {
    setSelectedPamphlet(pamphlet);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (pamphlet) => {
    setFormData({
      customerName: pamphlet.customerDetails?.name || "",
      customerEmail: pamphlet.customerDetails?.email || "",
      customerCountry: pamphlet.customerDetails?.country || "",
      expectedDate: pamphlet.timeline?.expectedDate
        ? new Date(pamphlet.timeline.expectedDate).toISOString().split("T")[0]
        : "",
      deliveryDate: pamphlet.timeline?.deliveryDate
        ? new Date(pamphlet.timeline.deliveryDate).toISOString().split("T")[0]
        : "",
    });
    setSelectedPamphlet(pamphlet);
    setShowEditModal(true);
    document.body.classList.add("modal-open");
    fetchDropdownOptions();
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
      await pamphletAPI.update(selectedPamphlet._id, updateData);
      fetchPamphlets();
      setShowEditModal(false);
      document.body.classList.remove("modal-open");
      setSelectedPamphlet(null);
      showToast("Pamphlet quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating pamphlet:", error);
      showToast("Failed to update pamphlet quote", "error");
    }
  };

  const filteredPamphlets = pamphlets.filter(
    (pamphlet) =>
      pamphlet.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pamphlet.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const fetchOptions = async () => {
    try {
      const response = await pamphletOptionsAPI.getAll();
      const newOptions = response.data.data || {};
      setOptions(newOptions);
    } catch (error) {
      console.error("Error fetching options:", error);
      showToast("Failed to fetch options", "error");
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      const response = await pamphletOptionsAPI.getDropdown();
      setDropdownOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  const handleAddAttribute = async (categoryKey, subcategoryKey) => {
    const value = attributeInputs[`${categoryKey}-${subcategoryKey}`] || "";
    if (!value.trim() || !categoryKey || !subcategoryKey) return;
    try {
      const response = await pamphletOptionsAPI.addAttribute(
        categoryKey,
        subcategoryKey,
        { value: value },
      );
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

    const parts = editingOption.split("-");
    if (parts.length < 3) return;

    const updateCategory = parts[0];
    const updateSubcategory = parts[1];
    const originalValue = parts.slice(2).join("-");

    try {
      const currentAttributes =
        options[updateCategory]?.subcategories[updateSubcategory]?.attributes ||
        [];
      const index = currentAttributes.indexOf(originalValue);
      const response = await pamphletOptionsAPI.updateAttribute(
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
      const response = await pamphletOptionsAPI.deleteAttribute(
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
      const response = await pamphletOptionsAPI.addCategory({
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
      await pamphletOptionsAPI.deleteCategory({ categoryKey });
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
      const response = await pamphletOptionsAPI.updateCategory(
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
      const response = await pamphletOptionsAPI.addSubcategory(
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
      await pamphletOptionsAPI.deleteSubcategory(
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
    setEditingCategory(categoryKey);
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
      const response = await pamphletOptionsAPI.updateSubcategory(
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderDynamicData = (data, parentKey = "") => {
    if (!data) return null;

    if (typeof data !== "object") {
      return data === null || data === undefined || data === ""
        ? "N/A"
        : String(data);
    }

    const items = [];

    Object.entries(data).forEach(([key, value]) => {
      if (
        key === "_id" ||
        key === "__v" ||
        key === "createdAt" ||
        key === "updatedAt" ||
        key === "customerDetails" ||
        key === "files" ||
        key === "status"
      )
        return;

      if (key === "options") {
        if (value && typeof value === "object") {
          Object.entries(value).forEach(([optKey, optValue]) => {
            if (optKey === "sizeSelection") {
              if (optValue) {
                items.push(
                  <div key={`${parentKey}-sizeSelection`} className="info-item">
                    <span className="label">Size Selection</span>
                    <span className="value">{String(optValue)}</span>
                  </div>,
                );
              }
              return;
            }

            if (typeof optValue === "object" && optValue !== null) {
              Object.entries(optValue).forEach(([fieldKey, fieldValue]) => {
                // Handle nested objects like generalDetails.size with width/height
                if (typeof fieldValue === "object" && fieldValue !== null) {
                  // Check if it's a size object with width and height
                  if (fieldValue.width && fieldValue.height) {
                    const sizeStr = `${fieldValue.width} × ${fieldValue.height}`;
                    items.push(
                      <div key={`${optKey}-${fieldKey}`} className="info-item">
                        <span className="label">Size</span>
                        <span className="value">{sizeStr}</span>
                      </div>,
                    );
                  } else {
                    // For other nested objects, iterate their properties
                    Object.entries(fieldValue).forEach(([nestedKey, nestedValue]) => {
                      if (typeof nestedValue === "object") return;
                      if (!nestedValue && nestedValue !== 0) return;
                      const label = nestedKey
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase());
                      items.push(
                        <div key={`${optKey}-${fieldKey}-${nestedKey}`} className="info-item">
                          <span className="label">{label}</span>
                          <span className="value">{String(nestedValue)}</span>
                        </div>,
                      );
                    });
                  }
                  return;
                }
                if (!fieldValue && fieldValue !== 0) return;

                const label = fieldKey
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

                items.push(
                  <div key={`${optKey}-${fieldKey}`} className="info-item">
                    <span className="label">{label}</span>
                    <span className="value">
                      {Array.isArray(fieldValue)
                        ? fieldValue.join(", ")
                        : String(fieldValue)}
                    </span>
                  </div>,
                );
              });
            } else if (optValue !== null && optValue !== undefined && optValue !== "") {
              const label = optKey
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              items.push(
                <div key={optKey} className="info-item">
                  <span className="label">{label}</span>
                  <span className="value">{String(optValue)}</span>
                </div>,
              );
            }
          });
        }
        return;
      }

      if (key === "timeline") {
        if (value && typeof value === "object") {
          items.push(
            <div key={parentKey + "timeline"} className="modal-section">
              <div className="section-icon">📅</div>
              <h3>Timeline</h3>
              <div className="info-grid">
                {value.orderDate && (
                  <div key={`${parentKey}-orderDate`} className="info-item">
                    <span className="label">Order Date</span>
                    <span className="value">{formatDate(value.orderDate)}</span>
                  </div>
                )}
                {value.expectedDate && (
                  <div key={`${parentKey}-expectedDate`} className="info-item">
                    <span className="label">Expected Date</span>
                    <span className="value">{formatDate(value.expectedDate)}</span>
                  </div>
                )}
                {value.deliveryDate && (
                  <div key={`${parentKey}-deliveryDate`} className="info-item">
                    <span className="label">Delivery Date</span>
                    <span className="value">{formatDate(value.deliveryDate)}</span>
                  </div>
                )}
              </div>
            </div>,
          );
        }
        return;
      }

      const label = formatLabel(key);
      const itemKey = `${parentKey}-${key}`;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        items.push(
          <div key={itemKey} className="modal-section">
            <div className="section-icon">📦</div>
            <h3>{label}</h3>
            <div className="info-grid">{renderDynamicData(value, itemKey)}</div>
          </div>,
        );
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          items.push(
            <div key={itemKey} className="info-item full-width">
              <span className="label">{label}</span>
              <span className="value">{value.join(", ")}</span>
            </div>,
          );
        }
      } else if (value !== null && value !== undefined && value !== "") {
        items.push(
          <div key={itemKey} className="info-item">
            <span className="label">{label}</span>
            <span className="value">{String(value)}</span>
          </div>,
        );
      }
    });

    return items;
  };

  return (
    <div className="pamphlets-page">
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
        <h2>Pamphlet Management</h2>
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
              <p>Loading Pamphlet quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredPamphlets.length > 0 ? (
                filteredPamphlets.map((pamphlet) => (
                  <div key={pamphlet._id} className="booklet-card">
                    <div className="card-badge">
                      #{pamphlet._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {pamphlet.customerDetails?.name?.charAt(0) || "P"}
                      </div>
                      <div className="customer-name">
                        {pamphlet.customerDetails?.name}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {pamphlet.customerDetails?.email}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Country</span>
                        <span className="info-value">
                          {pamphlet.customerDetails?.country || "N/A"}
                        </span>
                      </div>

                      {/* Size Selection - from options */}
                      {pamphlet.options?.sizeSelection && (
                        <div className="info-row">
                          <span className="info-label">Size</span>
                          <span className="info-value">
                            {pamphlet.options.sizeSelection}
                          </span>
                        </div>
                      )}

                      {/* Dynamically render ALL fields from options */}
                      {pamphlet.options &&
                        typeof pamphlet.options === "object" &&
                        Object.entries(pamphlet.options).map(
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
                                // Handle nested objects like generalDetails.size
                                if (typeof fieldValue === "object" && fieldValue !== null) {
                                  if (fieldValue.width && fieldValue.height) {
                                    const sizeStr = `${fieldValue.width} × ${fieldValue.height}`;
                                    return (
                                      <div
                                        key={`${categoryKey}-${fieldKey}`}
                                        className="info-row"
                                      >
                                        <span className="info-label">Size</span>
                                        <span className="info-value">{sizeStr}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                }
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

                      {pamphlet.files && pamphlet.files.length > 0 && (
                        <div className="files-badge">
                          📎 {pamphlet.files.length} file(s)
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(pamphlet.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(pamphlet)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(pamphlet)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(pamphlet._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p>No Pamphlet quotes found</p>
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
                                                      if (
                                                        !editOptionValue.trim()
                                                      )
                                                        return;
                                                      try {
                                                        const parts =
                                                          editingOption.split(
                                                            "-",
                                                          );
                                                        const originalValue =
                                                          parts
                                                            .slice(2)
                                                            .join("-");
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
                                                          await pamphletOptionsAPI.updateAttribute(
                                                            categoryKey,
                                                            subcatKey,
                                                            index,
                                                            {
                                                              value:
                                                                editOptionValue,
                                                            },
                                                          );
                                                        setEditingOption(null);
                                                        await fetchOptions();
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
                                                      className="edit-attribute-input"
                                                    />
                                                    <button
                                                      type="submit"
                                                      className="save-attribute-btn"
                                                    >
                                                      ✓
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="cancel-attribute-btn"
                                                      onClick={() =>
                                                        setEditingOption(null)
                                                      }
                                                    >
                                                      ×
                                                    </button>
                                                  </form>
                                                ) : (
                                                  <>
                                                    <span>{attr}</span>
                                                    <div className="chip-actions">
                                                      <button
                                                        className="edit-chip-btn"
                                                        onClick={() =>
                                                          handleEditAttribute(
                                                            categoryKey,
                                                            subcatKey,
                                                            attr,
                                                          )
                                                        }
                                                      >
                                                        ✏️
                                                      </button>
                                                      <button
                                                        className="delete-chip-btn"
                                                        onClick={() =>
                                                          handleDeleteAttribute(
                                                            attr,
                                                          )
                                                        }
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
                                          <p className="no-attributes-text">
                                            No attributes yet. Add one above!
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
                          <div className="empty-subcategories">
                            <p>No subcategories in this category.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚙️</div>
                <p>No configuration options found.</p>
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
                View all pamphlet configuration options organized by categories
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

      {/* Add Category Modal */}
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
              <p>Create a new category to manage pamphlet options</p>
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
                    placeholder="e.g., foldingStyles"
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

      {/* Add Subcategory Modal */}
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
                    placeholder="e.g., premiumFinish"
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
                    placeholder="e.g., Folding Styles"
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
                    placeholder="e.g., Premium Finish"
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

      {/* View Modal */}
      {showModal && selectedPamphlet && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            document.body.classList.remove("modal-open");
          }}
        >
          <div
            className="modal-content view-modal"
            onClick={(e) => e.stopPropagation()}
          >
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
              <h2>Pamphlet Quote Details</h2>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="section-icon">👤</div>
                <h3>Customer Details</h3>
                <div className="info-grid">
                  {selectedPamphlet.customerDetails?.name && (
                    <div className="info-item">
                      <span className="label">Name</span>
                      <span className="value">
                        {selectedPamphlet.customerDetails.name}
                      </span>
                    </div>
                  )}
                  {selectedPamphlet.customerDetails?.email && (
                    <div className="info-item">
                      <span className="label">Email</span>
                      <span className="value">
                        {selectedPamphlet.customerDetails.email}
                      </span>
                    </div>
                  )}
                  {selectedPamphlet.customerDetails?.country && (
                    <div className="info-item">
                      <span className="label">Country</span>
                      <span className="value">
                        {selectedPamphlet.customerDetails.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {renderDynamicData(selectedPamphlet)}

              {selectedPamphlet.files && selectedPamphlet.files.length > 0 && (
                <div className="modal-section">
                  <div className="section-icon">📎</div>
                  <h3>Uploaded Files</h3>
                  <div className="files-grid">
                    {selectedPamphlet.files.map((file, index) => (
                      <a
                        key={index}
                        href={`${API}/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        📄 File {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  document.body.classList.remove("modal-open");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPamphlet && (
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
              <h2>Edit Pamphlet Quote</h2>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-section">
                  <h3>Format & Folding Style</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Format and Folding Style</label>
                      <select
                        value={formData.formatAndFoldingStyle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            formatAndFoldingStyle: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Format</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "foldingStyles")
                          ?.attributes.map((attr) => (
                            <option key={attr} value={attr}>
                              {attr}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Size</label>
                      <select
                        value={formData.size || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            size: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Size</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "pamphletSizes")
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
                  <h3>Paper Stock</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Paper Weight</label>
                      <select
                        value={formData.paperWeight || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperWeight: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Paper Weight</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "paperWeights")
                          ?.attributes.map((attr) => (
                            <option key={attr} value={attr}>
                              {attr}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Paper Type</label>
                      <select
                        value={formData.paperType || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Paper Type</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "paperTypes")
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
                  <h3>Printing & Finishes</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Printed Sides</label>
                      <select
                        value={formData.printedSides || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            printedSides: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Printed Sides</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "printedSides")
                          ?.attributes.map((attr) => (
                            <option key={attr} value={attr}>
                              {attr}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Lamination</label>
                      <input
                        type="text"
                        value={formData.lamination || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lamination: e.target.value,
                          })
                        }
                        placeholder="Comma separated values"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Quantity</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Quantity Required</label>
                      <input
                        type="number"
                        value={formData.quantity || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Timeline</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Target Deadline</label>
                      <input
                        type="text"
                        value={formData.targetDeadline || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetDeadline: e.target.value,
                          })
                        }
                        placeholder="e.g., 2 weeks"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expected Date</label>
                      <input
                        type="date"
                        value={formData.expectedDate || ""}
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
                        value={formData.deliveryDate || ""}
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
                  className="close-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    document.body.classList.remove("modal-open");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pamphlets;

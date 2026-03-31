import { useState, useEffect } from "react";
import { customCardAPI, customCardOptionsAPI } from "../../services/api";
import "./CustomCard.css";

const API = import.meta.env.VITE_API_BASE_URL;

const CustomCards = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Quotes State
  const [customCards, setCustomCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomCard, setSelectedCustomCard] = useState(null);
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
      fetchCustomCards();
    } else {
      fetchOptions();
    }
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchCustomCards = async () => {
    try {
      const response = await customCardAPI.getAll();
      setCustomCards(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Custom Cards:", error);
      showToast("Failed to fetch Custom Card quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this Custom Card quote?")
    ) {
      try {
        await customCardAPI.delete(id);
        setCustomCards(customCards.filter((b) => b._id !== id));
        showToast("Custom Card quote deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting Custom Card:", error);
        showToast("Failed to delete Custom Card quote", "error");
      }
    }
  };

  const handleView = (customCard) => {
    setSelectedCustomCard(customCard);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (customCard) => {
    setFormData({
      cardTypeId: customCard.cardTypeSelection?.cardTypeId || "",
      cardTypeLabel: customCard.cardTypeSelection?.cardTypeLabel || "",
      cardSize: customCard.cardTypeSelection?.size || "",
      cardShape: customCard.cardTypeSelection?.shape || "",
      selectCard: customCard.selectCardTypeAndSize?.selectCard || "",
      size: customCard.selectCardTypeAndSize?.size || "",
      paperStock: customCard.paperAndQuantity?.paperStock || "",
      quantity: customCard.paperAndQuantity?.quantity || "",
      printedSides: customCard.printingAndFinish?.printedSides || "",
      lamination: customCard.printingAndFinish?.lamination || "",
      corners: customCard.extras?.corners || "",
      envelopesIncluded: customCard.extras?.envelopesIncluded || "",
      notes: customCard.additionalNotes?.notes || "",
      customerName: customCard.customerDetails?.name || "",
      customerEmail: customCard.customerDetails?.email || "",
      customerPhone: customCard.customerDetails?.phone || "",
      customerAddress: customCard.customerDetails?.address || "",
      orderDate: customCard.timeline?.orderDate
        ? new Date(customCard.timeline.orderDate).toISOString().split("T")[0]
        : "",
      expectedDate: customCard.timeline?.expectedDate
        ? new Date(customCard.timeline.expectedDate).toISOString().split("T")[0]
        : "",
      deliveryDate: customCard.timeline?.deliveryDate
        ? new Date(customCard.timeline.deliveryDate).toISOString().split("T")[0]
        : "",
    });
    setSelectedCustomCard(customCard);
    setShowEditModal(true);
    document.body.classList.add("modal-open");
    fetchDropdownOptions();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        cardTypeSelection: {
          cardTypeId: formData.cardTypeId || "",
          cardTypeLabel: formData.cardTypeLabel || "",
          size: formData.cardSize || "",
          shape: formData.cardShape || "",
        },
        selectCardTypeAndSize: {
          selectCard: formData.selectCard || "",
          size: formData.size || "",
        },
        paperAndQuantity: {
          paperStock: formData.paperStock,
          quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        },
        printingAndFinish: {
          printedSides: formData.printedSides,
          lamination: formData.lamination,
        },
        extras: {
          corners: formData.corners,
          envelopesIncluded: formData.envelopesIncluded,
        },
        additionalNotes: {
          notes: formData.notes,
        },
        customerDetails: {
          name: formData.customerName || "",
          email: formData.customerEmail || "",
          phone: formData.customerPhone || "",
          address: formData.customerAddress || "",
        },
        timeline: {
          orderDate: formData.orderDate || undefined,
          expectedDate: formData.expectedDate || undefined,
          deliveryDate: formData.deliveryDate || undefined,
        },
      };
      await customCardAPI.update(selectedCustomCard._id, updateData);
      fetchCustomCards();
      setShowEditModal(false);
      document.body.classList.remove("modal-open");
      setSelectedCustomCard(null);
      showToast("Custom Card quote updated successfully", "success");
    } catch (error) {
      console.error("Error updating custom card:", error);
      showToast("Failed to update custom card quote", "error");
    }
  };

  const filteredCustomCards = customCards.filter(
    (customCard) =>
      customCard.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customCard.customerDetails?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const fetchOptions = async () => {
    try {
      const response = await customCardOptionsAPI.getAll();
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
      const response = await customCardOptionsAPI.getDropdown();
      setDropdownOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  const handleAddAttribute = async (categoryKey, subcategoryKey) => {
    const value = attributeInputs[`${categoryKey}-${subcategoryKey}`] || "";
    if (!value.trim() || !categoryKey || !subcategoryKey) return;
    try {
      const response = await customCardOptionsAPI.addAttribute(
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
      const response = await customCardOptionsAPI.updateAttribute(
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
      const response = await customCardOptionsAPI.deleteAttribute(
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
      const response = await customCardOptionsAPI.addCategory({
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
      await customCardOptionsAPI.deleteCategory({ categoryKey });
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
      const response = await customCardOptionsAPI.updateCategory(
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
      const response = await customCardOptionsAPI.addSubcategory(
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
      await customCardOptionsAPI.deleteSubcategory(
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
      const response = await customCardOptionsAPI.updateSubcategory(
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
        key === "updatedAt"
      )
        return;

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
    <div className="custom-cards-page">
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
        <h2>Custom Card Management</h2>
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
              <p>Loading Custom Card quotes...</p>
            </div>
          ) : (
            <div className="booklets-grid">
              {filteredCustomCards.length > 0 ? (
                filteredCustomCards.map((customCard) => (
                  <div key={customCard._id} className="booklet-card">
                    <div className="card-badge">
                      #{customCard._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="card-header">
                      <div className="customer-avatar">
                        {customCard.customerDetails?.name?.charAt(0) || "C"}
                      </div>
                      <div className="customer-name">
                        {customCard.customerDetails?.name}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {customCard.customerDetails?.email}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone</span>
                        <span className="info-value">
                          {customCard.customerDetails?.phone}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Quantity</span>
                        <span className="info-value">
                          {customCard.paperAndQuantity?.quantity}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Paper Stock</span>
                        <span className="info-value">
                          {customCard.paperAndQuantity?.paperStock}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Printed Sides</span>
                        <span className="info-value">
                          {customCard.printingAndFinish?.printedSides}
                        </span>
                      </div>
                      {customCard.files && customCard.files.length > 0 && (
                        <div className="files-badge">
                          📎 {customCard.files.length} file(s)
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <div className="card-date">
                        {formatDate(customCard.createdAt)}
                      </div>
                      <div className="card-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(customCard)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(customCard)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(customCard._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🎴</div>
                  <p>No Custom Card quotes found</p>
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
                                                          await customCardOptionsAPI.updateAttribute(
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
                <button
                  className="add-first-category-btn"
                  onClick={() => setShowAddCategory(true)}
                >
                  + Add Your First Category
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "viewOptions" && (
        <div className="tab-content">
          <h2>View All Options</h2>
          <div className="view-options-container">
            {dropdownOptions.length > 0 ? (
              dropdownOptions.map((option) => (
                <div key={option.categoryKey} className="view-option-card">
                  <h3>{option.categoryName}</h3>
                  {option.subcategories && option.subcategories.length > 0 && (
                    <div className="view-subcategories">
                      {option.subcategories.map((subcat) => (
                        <div
                          key={subcat.subcategoryKey}
                          className="view-subcategory"
                        >
                          <h4>{subcat.subcategoryName}</h4>
                          <div className="view-attributes">
                            {subcat.attributes &&
                            subcat.attributes.length > 0 ? (
                              subcat.attributes.map((attr, idx) => (
                                <span key={idx} className="attribute-tag">
                                  {attr}
                                </span>
                              ))
                            ) : (
                              <span className="no-attrs">No attributes</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No options configured yet.</p>
              </div>
            )}
          </div>
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
              <p>Create a new category to manage custom card options</p>
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
                    placeholder="e.g., paperStocks"
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
                    placeholder="e.g., premiumStock"
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
                    placeholder="e.g., Paper Stocks"
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
                    placeholder="e.g., Premium Stock"
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
      {showModal && selectedCustomCard && (
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
            <div className="modal-header">
              <h2>Custom Card Quote Details</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowModal(false);
                  document.body.classList.remove("modal-open");
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="section-icon">👤</div>
                <h3>Customer Details</h3>
                <div className="info-grid">
                  {selectedCustomCard.customerDetails?.name && (
                    <div className="info-item">
                      <span className="label">Name</span>
                      <span className="value">
                        {selectedCustomCard.customerDetails.name}
                      </span>
                    </div>
                  )}
                  {selectedCustomCard.customerDetails?.email && (
                    <div className="info-item">
                      <span className="label">Email</span>
                      <span className="value">
                        {selectedCustomCard.customerDetails.email}
                      </span>
                    </div>
                  )}
                  {selectedCustomCard.customerDetails?.phone && (
                    <div className="info-item">
                      <span className="label">Phone</span>
                      <span className="value">
                        {selectedCustomCard.customerDetails.phone}
                      </span>
                    </div>
                  )}
                  {selectedCustomCard.customerDetails?.address && (
                    <div className="info-item full-width">
                      <span className="label">Address</span>
                      <span className="value">
                        {selectedCustomCard.customerDetails.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {renderDynamicData(selectedCustomCard)}

              {selectedCustomCard.files &&
                selectedCustomCard.files.length > 0 && (
                  <div className="modal-section">
                    <div className="section-icon">📎</div>
                    <h3>Uploaded Files</h3>
                    <div className="files-grid">
                      {selectedCustomCard.files.map((file, index) => (
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
      {showEditModal && selectedCustomCard && (
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
            <div className="modal-header">
              <h2>Edit Custom Card Quote</h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowEditModal(false);
                  document.body.classList.remove("modal-open");
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-section">
                  <h3>Card Type Selection</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Card Type</label>
                      <select
                        value={formData.cardTypeId || ""}
                        onChange={(e) => {
                          const selected = dropdownOptions.find(
                            (opt) =>
                              opt.categoryKey === "cardTypes" ||
                              opt.categoryKey === "cardTypeLabels",
                          );
                          const attr = selected?.attributes?.find(
                            (a) => a === e.target.value,
                          );
                          setFormData({
                            ...formData,
                            cardTypeId: e.target.value,
                            cardTypeLabel: attr || "",
                          });
                        }}
                      >
                        <option value="">Select Card Type</option>
                        {dropdownOptions
                          .find(
                            (opt) =>
                              opt.categoryKey === "cardTypes" ||
                              opt.categoryKey === "cardTypeLabels",
                          )
                          ?.attributes.map((attr) => (
                            <option key={attr} value={attr}>
                              {attr}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Size</label>
                      <input
                        type="text"
                        value={formData.cardSize || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardSize: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Shape</label>
                      <input
                        type="text"
                        value={formData.cardShape || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardShape: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Paper And Quantity</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Paper Stock</label>
                      <select
                        value={formData.paperStock || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paperStock: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Paper Stock</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "paperStocks")
                          ?.attributes.map((attr) => (
                            <option key={attr} value={attr}>
                              {attr}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
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
                  <h3>Printing And Finish</h3>
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
                    <div className="form-group">
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
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Extras</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Corners</label>
                      <input
                        type="text"
                        value={formData.corners || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            corners: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Envelopes Included</label>
                      <input
                        type="text"
                        value={formData.envelopesIncluded || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            envelopesIncluded: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Additional Notes</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Enter any additional notes"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Timeline</h3>
                  <div className="form-grid">
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

export default CustomCards;

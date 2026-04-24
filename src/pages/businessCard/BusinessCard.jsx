import { useState, useEffect } from "react";
import { businessCardAPI, businessCardOptionsAPI } from "../../services/api";
import "./BusinessCard.css";

const API = import.meta.env.VITE_API_BASE_URL;

const BusinessCards = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Quotes State
  const [businessCards, setBusinessCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusinessCard, setSelectedBusinessCard] = useState(null);
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
    console.log("🔍 View Business Card data:", businessCard);
    console.log("📦 TOP LEVEL KEYS:", Object.keys(businessCard));
    console.log("📦 basicsAndDimensions:", businessCard.basicsAndDimensions);
    console.log("📦 paperAndMaterial:", businessCard.paperAndMaterial);
    console.log("📦 laminationAndCoating:", businessCard.laminationAndCoating);
    console.log("📦 cuttingAndEdges:", businessCard.cuttingAndEdges);
    console.log("📦 cornerStyle:", businessCard.cornerStyle);
    console.log("📦 uploadAndNotes:", businessCard.uploadAndNotes);
    console.log("📦 customerDetails:", businessCard.customerDetails);
    console.log("📦 timeline:", businessCard.timeline);
    console.log("📦 orderType:", businessCard.orderType);
    setSelectedBusinessCard(businessCard);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (businessCard) => {
    // Read from dynamic options structure
    const options = businessCard.options || {};
    const basicsAndDimensions =
      options.basicsAndDimensions || businessCard.basicsAndDimensions || {};
    const paperAndMaterial =
      options.paperAndMaterial || businessCard.paperAndMaterial || {};
    const laminationAndCoating =
      options.laminationAndCoating || businessCard.laminationAndCoating || {};
    const cornerStyle = options.cornerStyle || businessCard.cornerStyle || {};
    const uploadAndNotes =
      options.uploadAndNotes || businessCard.uploadAndNotes || {};

    setFormData({
      projectName: basicsAndDimensions.projectName || "",
      quantity: basicsAndDimensions.quantity || "",
      numberOfDifferentNames: basicsAndDimensions.numberOfDifferentNames || "",
      cardSize: basicsAndDimensions.cardSize || "",
      orientation: basicsAndDimensions.orientation || "",
      paperStock: paperAndMaterial.paperStock || "",
      printingSides: paperAndMaterial.printingSides || "",
      specialEffects:
        laminationAndCoating.premiumFinishes?.specialEffects?.join(", ") || "",
      foilColor: laminationAndCoating.premiumFinishes?.foilColor || "",
      cornerType: cornerStyle.type || "",
      comments: uploadAndNotes.comments || "",
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
    // Fetch dropdown options when edit modal opens
    fetchDropdownOptions();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build updateData with dynamic options structure
      const updateData = {
        options: {
          basicsAndDimensions: {
            projectName: formData.projectName,
            quantity: formData.quantity
              ? parseInt(formData.quantity)
              : undefined,
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
      const response = await businessCardOptionsAPI.getDropdown();
      setDropdownOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
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
      const response = await businessCardOptionsAPI.updateAttribute(
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
      const response = await businessCardOptionsAPI.deleteAttribute(
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
      const response = await businessCardOptionsAPI.addCategory({
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
      const response = await businessCardOptionsAPI.updateCategory(
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
      const response = await businessCardOptionsAPI.addSubcategory(
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
      const response = await businessCardOptionsAPI.updateSubcategory(
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

  // Dynamic data renderer - shows ALL data from database
  // Helper function to get value from dynamic options structure
  const getOptionValue = (businessCard, categoryKey, fieldKey) => {
    // Try to get from options.[categoryKey].[fieldKey] first
    if (businessCard.options && businessCard.options[categoryKey]) {
      const categoryData = businessCard.options[categoryKey];
      // If it's a nested object
      if (typeof categoryData === "object" && !Array.isArray(categoryData)) {
        return categoryData[fieldKey] || "";
      }
      // If it's a simple value
      return categoryData || "";
    }
    // Fallback to old structure for backward compatibility
    if (businessCard[categoryKey]) {
      return businessCard[categoryKey][fieldKey] || "";
    }
    return "";
  };

  const renderDynamicData = (data, parentKey = "") => {
    if (!data) return null;

    // Debug: Log what data is being received
    if (parentKey === "") {
      console.log(
        "🔍 View Modal - Full data received:",
        JSON.stringify(data, null, 2),
      );
      console.log("🔍 Top-level keys:", Object.keys(data));
    }

    if (typeof data !== "object") {
      return data === null || data === undefined || data === ""
        ? "N/A"
        : String(data);
    }

    const items = [];

    Object.entries(data).forEach(([key, value]) => {
      // Skip internal MongoDB fields and timestamps
      if (
        key === "_id" ||
        key === "__v" ||
        key === "createdAt" ||
        key === "updatedAt"
      )
        return;

      // Skip phone and address fields completely
      if (key === "phone" || key === "address") return;

      // Skip orderType field completely (no longer used)
      if (key === "orderType") return;

      // Skip status field
      if (key === "status") return;

      // Skip files field (removed from display)
      if (key === "files") return;

      console.log(
        `📋 Rendering field: ${key} (type: ${typeof value}, isArray: ${Array.isArray(value)})`,
      );

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

      // Handle nested objects (like specialFinishing, bindingStyle, etc.)
      if (value && typeof value === "object" && !Array.isArray(value)) {
        // Special handling for specialFinishing to ensure it displays
        if (key === "specialFinishing") {
          const printFinishing =
            value.printFinishing || value.printfinishing || [];
          const pageEdges = value.pageEdges || value.pageedges || "";

          if (printFinishing.length > 0 || pageEdges) {
            items.push(
              <div key={itemKey} className="modal-section">
                <div className="section-icon">✨</div>
                <h3>{label}</h3>
                <div className="info-grid">
                  {printFinishing.length > 0 && (
                    <div
                      key={`${itemKey}-print`}
                      className="info-item full-width"
                    >
                      <span className="label">Print Finishing</span>
                      <span className="value">
                        {Array.isArray(printFinishing)
                          ? printFinishing.join(", ")
                          : printFinishing}
                      </span>
                    </div>
                  )}
                  {pageEdges && (
                    <div
                      key={`${itemKey}-edges`}
                      className="info-item full-width"
                    >
                      <span className="label">Page Edges</span>
                      <span className="value">{pageEdges}</span>
                    </div>
                  )}
                </div>
              </div>,
            );
          }
          return;
        }

        // Special handling for bindingStyle to properly display coverFlaps
        if (key === "bindingStyle") {
          const bindingType = value.bindingType || value.bindingtype || "";
          const coverStyle = value.coverStyle || value.coverstyle || "";
          const coverFlaps =
            value.coverFlaps !== undefined
              ? value.coverFlaps
              : value.coverflaps;

          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">📚</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {bindingType && (
                  <div key={`${itemKey}-type`} className="info-item">
                    <span className="label">Binding Type</span>
                    <span className="value">{bindingType}</span>
                  </div>
                )}
                {coverStyle && (
                  <div key={`${itemKey}-style`} className="info-item">
                    <span className="label">Cover Style</span>
                    <span className="value">{coverStyle}</span>
                  </div>
                )}
                {coverFlaps !== undefined && coverFlaps !== "" && (
                  <div key={`${itemKey}-flaps`} className="info-item">
                    <span className="label">Cover Flaps</span>
                    <span className="value">
                      {coverFlaps === true ||
                      coverFlaps === "true" ||
                      coverFlaps === "yes"
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                )}
              </div>
            </div>,
          );
          return;
        }

        // Special handling for customerDetails to properly display all fields
        if (key === "customerDetails") {
          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">👤</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {renderDynamicData(value, itemKey)}
              </div>
            </div>,
          );
          return;
        }

        // Special handling for basicsAndDimensions
        if (key === "basicsAndDimensions") {
          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">📐</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {renderDynamicData(value, itemKey)}
              </div>
            </div>,
          );
          return;
        }

        // Special handling for paperAndMaterial
        if (key === "paperAndMaterial") {
          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">📄</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {renderDynamicData(value, itemKey)}
              </div>
            </div>,
          );
          return;
        }

        // Special handling for laminationAndCoating
        if (key === "laminationAndCoating") {
          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">✨</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {renderDynamicData(value, itemKey)}
              </div>
            </div>,
          );
          return;
        }

        // Special handling for cuttingAndEdges
        if (key === "cuttingAndEdges") {
          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">✂️</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {renderDynamicData(value, itemKey)}
              </div>
            </div>,
          );
          return;
        }

        // Special handling for cornerStyle
        if (key === "cornerStyle") {
          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">🔲</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {renderDynamicData(value, itemKey)}
              </div>
            </div>,
          );
          return;
        }

        // Special handling for uploadAndNotes
        if (key === "uploadAndNotes") {
          items.push(
            <div key={itemKey} className="modal-section">
              <div className="section-icon">📝</div>
              <h3>{label}</h3>
              <div className="info-grid">
                {renderDynamicData(value, itemKey)}
              </div>
            </div>,
          );
          return;
        }

        // Handle other nested objects normally
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

                      {/* Dynamically render ALL fields from options - no hardcoding */}
                      {businessCard.options &&
                        typeof businessCard.options === "object" &&
                        Object.entries(businessCard.options).map(
                          ([categoryKey, categoryData]) => {
                            // Skip if not a valid object
                            if (
                              !categoryData ||
                              typeof categoryData !== "object" ||
                              Array.isArray(categoryData)
                            ) {
                              return null;
                            }

                            // Render fields from this category
                            return Object.entries(categoryData).map(
                              ([fieldKey, fieldValue]) => {
                                // Skip nested objects
                                if (typeof fieldValue === "object") {
                                  return null;
                                }

                                // Skip empty values
                                if (!fieldValue && fieldValue !== 0) {
                                  return null;
                                }

                                // Format the label
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
          <div className="view-options-header">
            <div>
              <h2>All Configuration Options</h2>
              <p>
                View all business card configuration options organized by
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
              <p>Create a new category to manage business card options</p>
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
                    placeholder="e.g., cardSizes"
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
                    placeholder="e.g., paperStock"
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
                    placeholder="e.g., Card Sizes"
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
                    placeholder="e.g., Paper Stock"
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
            <div className="modal-header">
              <h2>Business Card Quote Details</h2>
            </div>
            <div className="modal-body">
              {/* Dynamically render ALL data from database */}
              {renderDynamicData(selectedBusinessCard)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBusinessCard && (
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
              <h2>Edit Business Card Quote</h2>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-section">
                  <h3>Basics & Dimensions</h3>
                  <div className="form-grid">
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
                    <div className="form-group">
                      <label>Card Size</label>
                      <select
                        value={formData.cardSize || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardSize: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Card Size</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "cardSizes")
                          ?.attributes.map((attr) => (
                            <option key={attr} value={attr}>
                              {attr}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Orientation</label>
                      <select
                        value={formData.orientation || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            orientation: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Orientation</option>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>Paper & Material</h3>
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
                      <label>Printing Sides</label>
                      <select
                        value={formData.printingSides || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            printingSides: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Printing Sides</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "printingSides")
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
                  <h3>Lamination & Coating</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Special Effects</label>
                      <input
                        type="text"
                        value={formData.specialEffects || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialEffects: e.target.value,
                          })
                        }
                        placeholder="Comma separated values"
                      />
                    </div>
                    <div className="form-group">
                      <label>Foil Color</label>
                      <select
                        value={formData.foilColor || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            foilColor: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Foil Color</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "foilColors")
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
                  <h3>Corner Style</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Corner Type</label>
                      <select
                        value={formData.cornerType || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cornerType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Corner Type</option>
                        {dropdownOptions
                          .find((opt) => opt.categoryKey === "cornerStyles")
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

                <div className="modal-section">
                  <h3>Upload & Notes</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Comments</label>
                      <textarea
                        value={formData.comments || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            comments: e.target.value,
                          })
                        }
                        placeholder="Enter any additional comments or notes"
                        rows="4"
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

export default BusinessCards;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  bookletAPI,
  notebookAPI,
  ledgerRegisterAPI,
  letterheadAPI,
  shoppingBagsAPI,
  artbookAPI,
  businessCardAPI,
  brochureAPI,
  customCardAPI,
  customEnvelopeAPI,
  magazineAPI,
  pamphletAPI,
  productCatalogueAPI,
} from "../../services/api";
import {
  HiOutlineDocumentText,
  HiOutlineBookOpen,
  HiOutlineClipboard,
  HiOutlinePhotograph,
  HiOutlineDocumentDuplicate,
  HiOutlineBriefcase,
  HiOutlineNewspaper,
  HiOutlineCreditCard,
  HiOutlineMail,
  HiOutlineArchive,
  HiOutlineDocumentReport,
  HiOutlineDocumentSearch,
  HiOutlineCube,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./Dashboard.css";

const API = import.meta.env.VITE_API_BASE_URL;

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#db2777",
  "#0d9488",
  "#4f46e5",
  "#ea580c",
  "#65a30d",
  "#9333ea",
  "#0284c7",
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    booklets: 0,
    notebooks: 0,
    ledgers: 0,
    letterheads: 0,
    shoppingBags: 0,
    artbooks: 0,
    businessCards: 0,
    brochures: 0,
    customCards: 0,
    customEnvelopes: 0,
    magazines: 0,
    pamphlets: 0,
    productCatalogues: 0,
    total: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const fetchStats = async () => {
    try {
      const [
        booklets,
        notebooks,
        ledgers,
        letterheads,
        shoppingBags,
        artbooks,
        businessCards,
        brochures,
        customCards,
        customEnvelopes,
        magazines,
        pamphlets,
        productCatalogues,
      ] = await Promise.all([
        bookletAPI.getAll(),
        notebookAPI.getAll(),
        ledgerRegisterAPI.getAll(),
        letterheadAPI.getAll(),
        shoppingBagsAPI.getAll(),
        artbookAPI.getAll(),
        businessCardAPI.getAll(),
        brochureAPI.getAll(),
        customCardAPI.getAll(),
        customEnvelopeAPI.getAll(),
        magazineAPI.getAll(),
        pamphletAPI.getAll(),
        productCatalogueAPI.getAll(),
      ]);

      const bookletCount = booklets.data.data?.length || 0;
      const notebookCount = notebooks.data.data?.length || 0;
      const ledgerCount = ledgers.data.data?.length || 0;
      const letterheadCount = letterheads.data.data?.length || 0;
      const shoppingBagsCount = shoppingBags.data.data?.length || 0;
      const artbookCount = artbooks.data.data?.length || 0;
      const businessCardCount = businessCards.data.data?.length || 0;
      const brochureCount = brochures.data.data?.length || 0;
      const customCardCount = customCards.data.data?.length || 0;
      const customEnvelopeCount = customEnvelopes.data.data?.length || 0;
      const magazineCount = magazines.data.data?.length || 0;
      const pamphletCount = pamphlets.data.data?.length || 0;
      const productCatalogueCount = productCatalogues.data.data?.length || 0;

      setStats({
        booklets: bookletCount,
        notebooks: notebookCount,
        ledgers: ledgerCount,
        letterheads: letterheadCount,
        shoppingBags: shoppingBagsCount,
        artbooks: artbookCount,
        businessCards: businessCardCount,
        brochures: brochureCount,
        customCards: customCardCount,
        customEnvelopes: customEnvelopeCount,
        magazines: magazineCount,
        pamphlets: pamphletCount,
        productCatalogues: productCatalogueCount,
        total:
          bookletCount +
          notebookCount +
          ledgerCount +
          letterheadCount +
          shoppingBagsCount +
          artbookCount +
          businessCardCount +
          brochureCount +
          customCardCount +
          customEnvelopeCount +
          magazineCount +
          pamphletCount +
          productCatalogueCount,
      });

      const allOrders = [
        ...(booklets.data.data || []).map((o) => ({
          ...o,
          type: "Booklet",
          date: o.createdAt,
        })),
        ...(notebooks.data.data || []).map((o) => ({
          ...o,
          type: "Notebook",
          date: o.createdAt,
        })),
        ...(ledgers.data.data || []).map((o) => ({
          ...o,
          type: "Ledger",
          date: o.createdAt,
        })),
        ...(letterheads.data.data || []).map((o) => ({
          ...o,
          type: "Letterhead",
          date: o.createdAt,
        })),
        ...(shoppingBags.data.data || []).map((o) => ({
          ...o,
          type: "Shopping Bag",
          date: o.createdAt,
        })),
        ...(artbooks.data.data || []).map((o) => ({
          ...o,
          type: "Artbook",
          date: o.createdAt,
        })),
        ...(businessCards.data.data || []).map((o) => ({
          ...o,
          type: "Business Card",
          date: o.createdAt,
        })),
        ...(brochures.data.data || []).map((o) => ({
          ...o,
          type: "Brochure",
          date: o.createdAt,
        })),
        ...(customCards.data.data || []).map((o) => ({
          ...o,
          type: "Custom Card",
          date: o.createdAt,
        })),
        ...(customEnvelopes.data.data || []).map((o) => ({
          ...o,
          type: "Custom Envelope",
          date: o.createdAt,
        })),
        ...(magazines.data.data || []).map((o) => ({
          ...o,
          type: "Magazine",
          date: o.createdAt,
        })),
        ...(pamphlets.data.data || []).map((o) => ({
          ...o,
          type: "Pamphlet",
          date: o.createdAt,
        })),
        ...(productCatalogues.data.data || []).map((o) => ({
          ...o,
          type: "Product Catalogue",
          date: o.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

      setRecentOrders(allOrders);

      // Prepare chart data
      const chartData = [
        { name: "Booklets", value: bookletCount },
        { name: "Notebooks", value: notebookCount },
        { name: "Artbooks", value: artbookCount },
        { name: "Brochures", value: brochureCount },
        { name: "Business Cards", value: businessCardCount },
        { name: "Magazines", value: magazineCount },
        { name: "Custom Cards", value: customCardCount },
        { name: "Custom Envelopes", value: customEnvelopeCount },
        { name: "Ledger", value: ledgerCount },
        { name: "Letterheads", value: letterheadCount },
        { name: "Pamphlets", value: pamphletCount },
        { name: "Catalogues", value: productCatalogueCount },
        { name: "Shopping Bags", value: shoppingBagsCount },
      ];
      setOrderData(chartData);

      const pieChartData = chartData.filter((item) => item.value > 0);
      setPieData(pieChartData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.total,
      icon: HiOutlineDocumentText,
      color: "#1e40af",
      bg: "#dbeafe",
      onClick: () => {
        const recentOrders = document.getElementById("recent-orders");
        if (recentOrders) {
          recentOrders.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
    },
    {
      title: "Booklets",
      value: stats.booklets,
      icon: HiOutlineBookOpen,
      color: "#7c3aed",
      bg: "#ede9fe",
      link: "/booklets",
    },
    {
      title: "Notebooks",
      value: stats.notebooks,
      icon: HiOutlineClipboard,
      color: "#059669",
      bg: "#d1fae5",
      link: "/notebooks",
    },
    {
      title: "Artbooks",
      value: stats.artbooks,
      icon: HiOutlinePhotograph,
      color: "#d97706",
      bg: "#fef3c7",
      link: "/artbooks",
    },
    {
      title: "Brochures",
      value: stats.brochures,
      icon: HiOutlineDocumentDuplicate,
      color: "#dc2626",
      bg: "#fee2e2",
      link: "/brochures",
    },
    {
      title: "Business Cards",
      value: stats.businessCards,
      icon: HiOutlineBriefcase,
      color: "#0891b2",
      bg: "#cffafe",
      link: "/business-cards",
    },
    {
      title: "Magazines",
      value: stats.magazines,
      icon: HiOutlineNewspaper,
      color: "#db2777",
      bg: "#fce7f3",
      link: "/magazines",
    },
    {
      title: "Custom Cards",
      value: stats.customCards,
      icon: HiOutlineCreditCard,
      color: "#0d9488",
      bg: "#ccfbf1",
      link: "/custom-cards",
    },
    {
      title: "Custom Envelopes",
      value: stats.customEnvelopes,
      icon: HiOutlineMail,
      color: "#4f46e5",
      bg: "#e0e7ff",
      link: "/custom-envelopes",
    },
    {
      title: "Ledger Registers",
      value: stats.ledgers,
      icon: HiOutlineArchive,
      color: "#ea580c",
      bg: "#ffedd5",
      link: "/ledger-registers",
    },
    {
      title: "Letterheads",
      value: stats.letterheads,
      icon: HiOutlineDocumentReport,
      color: "#65a30d",
      bg: "#ecfccb",
      link: "/letterheads",
    },
    {
      title: "Pamphlets",
      value: stats.pamphlets,
      icon: HiOutlineDocumentSearch,
      color: "#9333ea",
      bg: "#f3e8ff",
      link: "/pamphlets",
    },
    {
      title: "Product Catalogues",
      value: stats.productCatalogues,
      icon: HiOutlineCube,
      color: "#0891b2",
      bg: "#cffafe",
      link: "/product-catalogues",
    },
    {
      title: "Shopping Bags",
      value: stats.shoppingBags,
      icon: HiOutlineShoppingBag,
      color: "#0284c7",
      bg: "#e0f2fe",
      link: "/shopping-bags",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="dashboard-subtitle">
          Welcome to Urasa Admin Panel - Manage all your print orders
        </p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((stat, index) =>
              stat.onClick ? (
                <div
                  key={index}
                  className="stat-card-professional"
                  onClick={stat.onClick}
                  style={{ cursor: "pointer", "--stat-icon-color": stat.color }}
                >
                  <div className="stat-card-icon">
                    <stat.icon />
                  </div>
                  <div className="stat-card-content-professional">
                    <h3 className="stat-value-professional">{stat.value}</h3>
                    <p className="stat-label-professional">{stat.title}</p>
                  </div>
                </div>
              ) : (
                <Link
                  to={stat.link}
                  key={index}
                  className="stat-card-link-professional"
                >
                  <div
                    className="stat-card-professional"
                    style={{ "--stat-icon-color": stat.color }}
                  >
                    <div className="stat-card-icon">
                      <stat.icon />
                    </div>
                    <div className="stat-card-content-professional">
                      <h3 className="stat-value-professional">{stat.value}</h3>
                      <p className="stat-label-professional">{stat.title}</p>
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>

          <div className="recent-orders" id="recent-orders">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/dashboard" className="view-all">
                View All
              </Link>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="order-type">{order.type}</span>
                        </td>
                        <td>{order.customerDetails?.name || "N/A"}</td>
                        <td>{order.customerDetails?.email || "N/A"}</td>
                        <td>{order.customerDetails?.phone || "N/A"}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => handleView(order)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-orders">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Statistics Chart */}
          <div className="order-statistics-chart">
            <div className="chart-header">
              <h2>Order Statistics</h2>
              <p className="chart-subtitle">Overview of orders by category</p>
            </div>
            <div className="bar-chart-full">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={orderData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {orderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <div className="modal-header">
              <h2>{selectedOrder.type} Order Details</h2>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="section-icon">👤</div>
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Name</span>
                    <span className="value">
                      {selectedOrder.customerDetails?.name || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">
                      {selectedOrder.customerDetails?.email || "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">
                      {selectedOrder.customerDetails?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Address</span>
                    <span className="value">
                      {selectedOrder.customerDetails?.address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="section-icon">📋</div>
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Order Type</span>
                    <span className="value">{selectedOrder.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Order Date</span>
                    <span className="value">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status</span>
                    <span className="value">
                      {selectedOrder.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.quantity && (
                <div className="modal-section">
                  <div className="section-icon">📦</div>
                  <h3>Order Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Quantity</span>
                      <span className="value">{selectedOrder.quantity}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.files && selectedOrder.files.length > 0 && (
                <div className="modal-section">
                  <div className="section-icon">📎</div>
                  <h3>Attached Files</h3>
                  <div className="files-list">
                    {selectedOrder.files.map((file, index) => (
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

              {selectedOrder.additionalNotes && (
                <div className="modal-section">
                  <div className="section-icon">📝</div>
                  <h3>Additional Notes</h3>
                  <p className="notes-text">{selectedOrder.additionalNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default Dashboard;

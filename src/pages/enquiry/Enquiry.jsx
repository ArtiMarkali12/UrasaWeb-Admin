import { useState, useEffect } from "react";
import { enquiryAPI } from "../../services/api";
import "./Enquiry.css";

const Enquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchEnquiries = async () => {
    try {
      const response = await enquiryAPI.getAll();
      setEnquiries(response.data.data || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      showToast("Failed to fetch enquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        await enquiryAPI.delete(id);
        setEnquiries(enquiries.filter((e) => e._id !== id));
        showToast("Enquiry deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting enquiry:", error);
        showToast("Failed to delete enquiry", "error");
      }
    }
  };

  const handleView = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowViewModal(true);
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    setShowViewModal(false);
    setSelectedEnquiry(null);
    document.body.classList.remove("modal-open");
  };

  const filteredEnquiries = enquiries.filter(
    (enquiry) =>
      enquiry.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  return (
    <div className="enquiry-page">
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
        <h2>Enquiry Management</h2>
      </div>

      <div className="tab-content">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search enquiries by name, email, subject or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading enquiries...</p>
          </div>
        ) : (
          <div className="enquiries-table-wrapper">
            {filteredEnquiries.length > 0 ? (
              <table className="enquiries-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry._id}>
                      <td>
                        <div className="enquiry-name">
                          <div className="enquiry-avatar">
                            {enquiry.firstName?.charAt(0) || "?"}
                          </div>
                          <span>
                            {enquiry.firstName} {enquiry.lastName}
                          </span>
                        </div>
                      </td>
                      <td>{enquiry.email}</td>
                      <td>{enquiry.subject || "N/A"}</td>
                      <td>
                        <span className="enquiry-message-preview">
                          {enquiry.message?.length > 50
                            ? enquiry.message.substring(0, 50) + "..."
                            : enquiry.message || "N/A"}
                        </span>
                      </td>
                      <td>{formatDate(enquiry.createdAt)}</td>
                      <td>
                        <div className="enquiry-actions">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleView(enquiry)}
                          >
                            View
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(enquiry._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📩</div>
                <p>No enquiries found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Enquiry Modal */}
      {showViewModal && selectedEnquiry && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content enquiry-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-header">
              <h2>Enquiry Details</h2>
            </div>
            <div className="modal-body">
              <div className="enquiry-detail-grid">
                <div className="info-item">
                  <span className="label">First Name</span>
                  <span className="value">
                    {selectedEnquiry.firstName || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Last Name</span>
                  <span className="value">
                    {selectedEnquiry.lastName || "N/A"}
                  </span>
                </div>
                <div className="info-item full-width">
                  <span className="label">Email</span>
                  <span className="value">
                    {selectedEnquiry.email || "N/A"}
                  </span>
                </div>
                <div className="info-item full-width">
                  <span className="label">Subject</span>
                  <span className="value">
                    {selectedEnquiry.subject || "N/A"}
                  </span>
                </div>
                <div className="info-item full-width">
                  <span className="label">Message</span>
                  <span className="value enquiry-message">
                    {selectedEnquiry.message || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Submitted On</span>
                  <span className="value">
                    {formatDate(selectedEnquiry.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-save" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiry;

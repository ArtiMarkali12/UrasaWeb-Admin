import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/api";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlinePencil,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { admin, logout, updateAdminProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await adminAPI.updateProfile(formData);
      updateAdminProfile(response.data.data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);

    try {
      await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {admin?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="profile-status-indicator"></div>
            </div>
            <div className="profile-info">
              <h1>{admin?.name || "Admin User"}</h1>
              <p className="profile-email-display">
                <HiOutlineMail /> {admin?.email || "admin@urasa.com"}
              </p>
              <div className="profile-badges">
                <span className="badge badge-primary">
                  <HiOutlineShieldCheck /> {admin?.role || "Administrator"}
                </span>
                <span className="badge badge-success">
                  <HiOutlineCheckCircle /> Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="profile-content-grid">
          {/* Profile Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <div className="card-title">
                <HiOutlineUser className="card-icon" />
                <h2>Profile Information</h2>
              </div>
              <button
                className={`btn-icon ${isEditing ? "btn-editing" : ""}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <HiOutlineX /> Cancel
                  </>
                ) : (
                  <>
                    <HiOutlinePencil /> Edit
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>
                  <HiOutlineUser /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>
                  <HiOutlineMail /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    <HiOutlineSave /> {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password Card */}
          <div className="profile-card">
            <div className="card-header">
              <div className="card-title">
                <HiOutlineLockClosed className="card-icon" />
                <h2>Change Password</h2>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="profile-form">
              <div className="form-group">
                <label>
                  <HiOutlineKey /> Current Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    tabIndex={-1}
                  >
                    {showPasswords.currentPassword ? (
                      <HiOutlineEyeOff />
                    ) : (
                      <HiOutlineEye />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <HiOutlineLockClosed /> New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    tabIndex={-1}
                  >
                    {showPasswords.newPassword ? (
                      <HiOutlineEyeOff />
                    ) : (
                      <HiOutlineEye />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <HiOutlineLockClosed /> Confirm New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    tabIndex={-1}
                  >
                    {showPasswords.confirmPassword ? (
                      <HiOutlineEyeOff />
                    ) : (
                      <HiOutlineEye />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-secondary"
                  disabled={loading}
                >
                  <HiOutlineKey /> {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Security Card */}
          <div className="profile-card security-card">
            <div className="card-header">
              <div className="card-title">
                <HiOutlineShieldCheck className="card-icon" />
                <h2>Security Settings</h2>
              </div>
            </div>

            <div className="security-info">
              <div className="security-item">
                <div className="security-item-icon success">
                  <HiOutlineCheckCircle />
                </div>
                <div className="security-item-content">
                  <h4>Account Status</h4>
                  <p>Your account is active and secure</p>
                </div>
              </div>

              <div className="security-item">
                <div className="security-item-icon primary">
                  <HiOutlineShieldCheck />
                </div>
                <div className="security-item-content">
                  <h4>Access Level</h4>
                  <p>
                    {admin?.role === "super-admin"
                      ? "Super Administrator"
                      : "Standard Administrator"}
                  </p>
                </div>
              </div>

              <div className="security-divider"></div>

              <button className="btn-logout" onClick={handleLogout}>
                <HiOutlineLogout /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Message Toast */}
        {message.text && (
          <div className={`message-toast ${message.type}`}>
            {message.type === "success" ? (
              <HiOutlineCheckCircle className="toast-icon" />
            ) : (
              <HiOutlineExclamation className="toast-icon" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

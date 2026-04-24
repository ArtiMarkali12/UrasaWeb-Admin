import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/booklets", label: "Booklets", icon: "📚" },
    { path: "/notebooks", label: "Notebooks", icon: "📓" },
    { path: "/artbooks", label: "Artbooks", icon: "🎨" },
    { path: "/brochures", label: "Brochures", icon: "📄" },
    { path: "/business-cards", label: "Business Cards", icon: "💼" },
    { path: "/magazines", label: "Magazines", icon: "📰" },
    { path: "/custom-cards", label: "Custom Cards", icon: "�" },
    { path: "/custom-envelopes", label: "Custom Envelopes", icon: "✉️" },
    { path: "/ledger-registers", label: "Ledger Registers", icon: "📒" },
    { path: "/letterheads", label: "Letterheads", icon: "📝" },
    { path: "/pamphlets", label: "Pamphlets", icon: "📑" },
    { path: "/product-catalogues", label: "Product Catalogues", icon: "📦" },
    { path: "/offset-packaging", label: "Offset Packaging", icon: "📦" },
    { path: "/shopping-bags", label: "Shopping Bags", icon: "🛍️" },
    { path: "/postcards", label: "Postcards", icon: "📬" },
    { path: "/textbooks", label: "TextBooks", icon: "�" },
    { path: "/diaries", label: "Diaries", icon: "📓" },
    { path: "/calendars", label: "Calendars", icon: "📅" },
    { path: "/filesfolders", label: "Files & Folders", icon: "📁" },
    { path: "/blog", label: "Blog", icon: "📝" },
    { path: "/enquiry", label: "Enquiry", icon: "📩" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      ></div>
      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${isMobile ? "mobile" : ""}`}
      >
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">U</span>
            <span className={`logo-text ${isOpen ? "visible" : ""}`}>
              URASA
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="menu-item">
                <Link
                  to={item.path}
                  className={`menu-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className={`menu-label ${isOpen ? "visible" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className={`footer-text ${isOpen ? "visible" : ""}`}>
            © 2024 Urasa Admin
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

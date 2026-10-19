import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import "./ProfilePanel.css";

const ProfilePanel = ({ title = "My Profile" }) => {
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/profile");
        setProfile(res.data);
        setFormData({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoadError(getErrorMessage(err, "Failed to load profile."));
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/users/profile", formData);
      toast.success("Profile updated successfully!");
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    });
    setIsEditing(false);
  };

  const fullName = profile && profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Not set";

  return (
    <section className="card my-profile-page">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        {profile && !isEditing && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
            <Pencil size={15} /> Edit Profile
          </button>
        )}
      </div>
      {profile ? (
        <div className="profile-details">
          {!isEditing && (
            <dl className="detail-list">
              <div><dt>Username</dt><dd>{profile.username}</dd></div>
              <div><dt>Email</dt><dd>{profile.email}</dd></div>
              <div><dt>Role</dt><dd><RoleBadge role={profile.role} /></dd></div>
              <div><dt>Full Name</dt><dd className={fullName === "Not set" ? "muted" : ""}>{fullName}</dd></div>
              <div><dt>Phone</dt><dd className={profile.phone ? "" : "muted"}>{profile.phone || "Not set"}</dd></div>
              <div><dt>Address</dt><dd className={profile.address ? "" : "muted"}>{profile.address || "Not set"}</dd></div>
            </dl>
          )}
          {isEditing && (
            <div className="edit-form">
              <p className="muted edit-form-note">
                Only your name, phone number and address can be changed here.
              </p>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="profile-first">First Name</label>
                  <input
                    id="profile-first"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="field">
                  <label htmlFor="profile-last">Last Name</label>
                  <input
                    id="profile-last"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="field span-2">
                  <label htmlFor="profile-phone">Phone</label>
                  <input
                    id="profile-phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="field span-2">
                  <label htmlFor="profile-address">Address</label>
                  <textarea
                    id="profile-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving && <span className="spinner" aria-hidden="true" />} Save
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className={loadError ? "error" : "muted"}>{loadError || "Loading profile..."}</p>
      )}
    </section>
  );
};

export default ProfilePanel;

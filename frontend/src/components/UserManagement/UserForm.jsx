import { useState } from "react";

const ROLE_OPTIONS = ["admin", "staff", "customer"];

function UserForm({ user, isSaving, onClose, onSave }) {
    const isCreate = !user || !user.id;
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [role, setRole] = useState(user?.role || "customer");
    const [isActive, setIsActive] = useState(Boolean(user?.isActive ?? true));

    if (user === undefined || user === null) {
        return null;
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        const payload = {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: phone || undefined,
            role,
            isActive,
        };

        if (isCreate) {
            payload.username = username;
            payload.email = email;
            if (password) payload.password = password;
        }

        onSave(payload);
    };

    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-form-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h3 id="user-form-title">{user.id ? "Edit User" : "Add User"}</h3>
                        <p>{([user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username) || ""}</p>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
                        Close
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    {isCreate ? (
                        <>
                            <label className="field-group">
                                <span>Username</span>
                                <input
                                    className="input-field"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isSaving}
                                />
                            </label>

                            <label className="field-group">
                                <span>Email</span>
                                <input
                                    className="input-field"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSaving}
                                />
                            </label>

                            <label className="field-group field-span-2">
                                <span>Password (optional)</span>
                                <input
                                    className="input-field"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSaving}
                                />
                            </label>
                        </>
                    ) : (
                        <div className="meta-row">
                            <div>
                                <strong>Username:</strong> {user.username}
                            </div>
                            <div>
                                <strong>Email:</strong> {user.email}
                            </div>
                        </div>
                    )}

                    <label className="field-group">
                        <span>First Name</span>
                        <input className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSaving} />
                    </label>

                    <label className="field-group">
                        <span>Last Name</span>
                        <input className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSaving} />
                    </label>

                    <label className="field-group">
                        <span>Phone</span>
                        <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSaving} />
                    </label>

                    <label className="field-group">
                        <span>Role</span>
                        <select className="input-field" value={role} onChange={(event) => setRole(event.target.value)} disabled={isSaving}>
                            {ROLE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option === "admin" ? "Admin" : option === "staff" ? "Staff" : "Customer"}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field-check field-span-2">
                        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} disabled={isSaving} />
                        <span>Active</span>
                    </label>

                    <div className="modal-footer field-span-2">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserForm;
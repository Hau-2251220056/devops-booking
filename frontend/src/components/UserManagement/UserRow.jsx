import { FaEdit, FaTrash, FaToggleOff, FaToggleOn } from "react-icons/fa";

const buildDisplayName = (user) => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    return fullName || user?.username || "Not updated";
};

const buildInitials = (user) => {
    const firstName = user?.firstName?.trim()?.[0];
    const lastName = user?.lastName?.trim()?.[0];

    if (firstName || lastName) {
        return `${firstName || ""}${lastName || ""}`.toUpperCase();
    }

    return (user?.username || "U").slice(0, 2).toUpperCase();
};

function UserRow({ user, onEdit, onDelete, onToggleActive, isSaving }) {
    return (
        <tr>
            <td>
                <div className="user-cell user-cell-avatar">
                    <div className="user-avatar" aria-hidden="true">
                        {buildInitials(user)}
                    </div>
                    <div>
                        <strong>{buildDisplayName(user)}</strong>
                        <span>{user?.username || "-"}</span>
                    </div>
                </div>
            </td>
            <td>{user?.email || "-"}</td>
            <td>{user?.phone || "-"}</td>
            <td>
                <span className={`user-role role-${user?.role || "customer"}`}>
                    {user?.role === "admin" ? "Admin" : user?.role === "staff" ? "Staff" : "Customer"}
                </span>
            </td>
            <td>
                <span className={`user-status ${user?.isActive ? "active" : "inactive"}`}>
                    {user?.isActive ? "Active" : "Inactive"}
                </span>
            </td>
            <td>
                <div className="user-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onEdit(user)}
                        disabled={isSaving}
                    >
                        <FaEdit />
                        <span>Edit</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onToggleActive(user)}
                        disabled={isSaving}
                    >
                        {user?.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        <span>{user?.isActive ? "Disable" : "Enable"}</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(user)}
                        disabled={isSaving}
                    >
                        <FaTrash />
                        <span>Delete</span>
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default UserRow;
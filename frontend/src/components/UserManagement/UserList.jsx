import { useMemo, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import UserRow from "./UserRow";

const SORT_LABELS = {
    name: "Name",
    email: "Email",
    role: "Role",
};

function UserList({ users, onEdit, onDelete, onToggleActive, isSaving }) {
    const [sortKey, setSortKey] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    const sortedUsers = useMemo(() => {
        const normalized = [...users];

        normalized.sort((left, right) => {
            const leftName = `${left?.firstName || ""} ${left?.lastName || ""}`.trim();
            const rightName = `${right?.firstName || ""} ${right?.lastName || ""}`.trim();

            const getValue = (user, nameValue) => {
                if (sortKey === "email") {
                    return (user?.email || "").toLowerCase();
                }

                if (sortKey === "role") {
                    return (user?.role || "").toLowerCase();
                }

                return (nameValue || user?.username || "").toLowerCase();
            };

            const leftValue = getValue(left, leftName);
            const rightValue = getValue(right, rightName);

            if (leftValue === rightValue) {
                return 0;
            }

            const direction = sortDirection === "asc" ? 1 : -1;
            return leftValue > rightValue ? direction : -direction;
        });

        return normalized;
    }, [sortDirection, sortKey, users]);

    const toggleSort = (nextKey) => {
        if (sortKey === nextKey) {
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(nextKey);
        setSortDirection("asc");
    };

    const sortIcon = (key) => {
        if (sortKey !== key) {
            return <FaSort />;
        }

        return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
    };

    return (
        <div className="user-table-wrap">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>
                            <button type="button" className="table-sort-btn" onClick={() => toggleSort("name")}>
                                <span>{SORT_LABELS.name}</span>
                                {sortIcon("name")}
                            </button>
                        </th>
                        <th>
                            <button type="button" className="table-sort-btn" onClick={() => toggleSort("email")}>
                                <span>{SORT_LABELS.email}</span>
                                {sortIcon("email")}
                            </button>
                        </th>
                        <th>Phone</th>
                        <th>
                            <button type="button" className="table-sort-btn" onClick={() => toggleSort("role")}>
                                <span>{SORT_LABELS.role}</span>
                                {sortIcon("role")}
                            </button>
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((user) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleActive={onToggleActive}
                            isSaving={isSaving}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;
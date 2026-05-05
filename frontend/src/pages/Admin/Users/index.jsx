import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useToast } from "../../../components/Toast/useToast";
import UserForm from "../../../components/UserManagement/UserForm";
import UserList from "../../../components/UserManagement/UserList";
import {
  deleteUser,
  getUsers,
  updateUser,
  createUser,
} from "../../../services/adminUserApi";
import "./Users.css";

const PAGE_SIZE = 10;

function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const loadUsers = async (nextPage = page, nextQuery = query) => {
    setLoading(true);
    setError("");

    const response = await getUsers({
      page: nextPage,
      limit: PAGE_SIZE,
      q: nextQuery,
    });

    if (response.success) {
      setUsers(response.data.users);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } else {
      setUsers([]);
      setPagination({
        page: nextPage,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
      });
      setError(response.message || "Failed to load users list.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers(page, query);
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  const pageSummary = useMemo(() => {
    if (!pagination.total) {
      return "No data";
    }

    const from = (pagination.page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.page * pagination.limit, pagination.total);
    return `${from}-${to} / ${pagination.total}`;
  }, [pagination]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(queryInput.trim());
  };

  const refreshUsers = async () => {
    await loadUsers(page, query);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
  };

  const handleSaveUser = async (payload) => {
    if (!selectedUser) return;

    setIsSaving(true);

    if (!selectedUser.id) {
      // create
      const response = await createUser(payload);
      if (response.success) {
        toast.success(response.message || "User created successfully");
        setSelectedUser(null);
        await refreshUsers();
      } else {
        toast.error(response.message || "Failed to create user");
      }

      setIsSaving(false);
      return;
    }

    const response = await updateUser(selectedUser.id, payload);

    if (response.success) {
      toast.success(response.message || "User updated successfully");
      setSelectedUser(null);
      await refreshUsers();
    } else {
      toast.error(response.message || "Failed to update user");
    }

    setIsSaving(false);
  };

  const handleToggleActive = async (user) => {
    setIsSaving(true);
    const response = await updateUser(user.id, { isActive: !user.isActive });

    if (response.success) {
      toast.success(response.message || "Status updated successfully");
      await refreshUsers();
    } else {
      toast.error(response.message || "Failed to update status");
    }

    setIsSaving(false);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.username || user.email}?`)) {
      return;
    }

    setIsSaving(true);
    const response = await deleteUser(user.id);

    if (response.success) {
      toast.success(response.message || "User deleted successfully");
      await refreshUsers();
    } else {
      toast.error(response.message || "Failed to delete user");
    }

    setIsSaving(false);
  };

  return (
    <section className="page-panel users-page">
      <div className="page-toolbar users-toolbar">
        <div>
          <h2>User Management</h2>
          <p>Manage user accounts, roles, and active status</p>
        </div>

        <div className="page-actions users-actions">
          <div>
            <button
              type="button"
              className=" btn-outline"
              onClick={() => setSelectedUser({})}
              disabled={isSaving}
            >
              Add
            </button>
          </div>
          <form className="users-search" onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="user-search">
              Search users
            </label>
            <span className="users-search-icon" aria-hidden="true">
              <FaSearch />
            </span>
            <input
              id="user-search"
              className="input-field"
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Search by name, email..."
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isSaving}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-state">
          <div className="dashboard-spinner" />
          <p>Loading users list...</p>
        </div>
      ) : error ? (
        <div className="dashboard-state dashboard-state-error">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => loadUsers(page, query)}
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="dashboard-state">
          <p>No users found</p>
        </div>
      ) : (
        <>
          <div className="users-summary">
            <span>{pageSummary}</span>
            <span>{isSaving ? "Processing..." : ""}</span>
          </div>

          <UserList
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            isSaving={isSaving}
          />

          <div className="users-pagination">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page <= 1 || loading || isSaving}
            >
              Previous
            </button>
            <span>
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= pagination.totalPages || loading || isSaving}
            >
              Next
            </button>
          </div>
        </>
      )}

      {selectedUser ? (
        <UserForm
          key={selectedUser.id}
          user={selectedUser}
          isSaving={isSaving}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      ) : null}
    </section>
  );
}

export default Users;

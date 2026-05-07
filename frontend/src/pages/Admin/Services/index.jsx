import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

import {
  createService,
  deleteService,
  fetchServices,
  updateService,
} from "../../../services/serviceApi";
import "./Services.css";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  durationMinutes: "",
  category: "",
  imageUrl: "",
  isActive: true,
  orderIndex: 0,
};

function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const isEditing = Boolean(selectedService?.id);

  const pageSummary = useMemo(() => {
    if (!services.length) {
      return "No services yet";
    }

    return `${services.length} services`;
  }, [services]);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchServices();

      if (response.success && Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        setServices([]);
        setError(response.message || "Failed to load services");
      }
    } catch (err) {
      console.error(err);
      setServices([]);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  // Defer the initial load so state updates are not synchronous within the effect.
  useEffect(() => {
    const id = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(id);
  }, []);

  const openCreate = () => {
    setSelectedService({});
    setForm(EMPTY_FORM);
  };

  const openEdit = (service) => {
    setSelectedService(service);
    setForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price || "",
      durationMinutes: service.durationMinutes || "",
      category: service.category || "",
      imageUrl: service.imageUrl || "",
      isActive: service.isActive ?? true,
      orderIndex: service.orderIndex ?? 0,
    });
  };

  const closeModal = () => {
    setSelectedService(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      price: Number.parseFloat(form.price),
      durationMinutes: Number.parseInt(form.durationMinutes, 10),
      orderIndex: Number.parseInt(form.orderIndex, 10) || 0,
    };

    // Preserve branchId when editing an existing service
    if (isEditing && selectedService?.branchId) {
      payload.branchId = selectedService.branchId;
    }

    try {
      if (isEditing) {
        await updateService(selectedService.id, payload);
      } else {
        await createService(payload);
      }

      await load();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save service");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa dịch vụ này?")) {
      return;
    }

    try {
      await deleteService(id);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to delete service");
    }
  };

  const formatPrice = (value) => {
    const amount = typeof value === "string" ? Number.parseFloat(value) : value;

    if (Number.isNaN(amount)) {
      return "0";
    }

    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="page-panel services-page">
      <div className="page-toolbar services-toolbar">
        <div>
          <h2>Service Management</h2>
          <p>Quản lý danh sách dịch vụ và thông tin hiển thị</p>
        </div>

        <div className="page-actions services-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreate}
          >
            Add
          </button>
        </div>
      </div>

      <div className="services-summary">
        <span>{pageSummary}</span>
        <span>{loading ? "Loading..." : ""}</span>
      </div>

      {error ? (
        <div className="dashboard-state dashboard-state-error services-state">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={load}>
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="dashboard-state services-state">
          <div className="dashboard-spinner" />
          <p>Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="dashboard-state services-state">
          <p>No services found</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreate}
          >
            Create the first service
          </button>
        </div>
      ) : (
        <div className="services-table-wrap">
          <table className="services-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Chi nhánh</th>
                <th>Giá</th>
                <th>Thời lượng</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="service-cell">
                      {service.imageUrl ? (
                        <img
                          className="service-thumb"
                          src={service.imageUrl}
                          alt={service.name}
                        />
                      ) : (
                        <div className="service-thumb service-thumb-fallback">
                          {service.name?.charAt(0) || "S"}
                        </div>
                      )}
                      <div>
                        <strong>{service.name}</strong>
                        <span>{service.description || "No description"}</span>
                      </div>
                    </div>
                  </td>
                  <td>{service.branch?.name || service.branchId}</td>
                  <td>{formatPrice(service.price)} VND</td>
                  <td>{service.durationMinutes} phút</td>
                  <td>{service.category || "-"}</td>
                  <td>
                    <span
                      className={`service-status ${service.isActive ? "active" : "inactive"}`}
                    >
                      {service.isActive ? "Active" : "Không hoạt động"}
                    </span>
                  </td>
                  <td>
                    <div className="service-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openEdit(service)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(service.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedService !== null && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="modal-card services-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>{isEditing ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}</h3>
                <p>Điền đầy đủ thông tin dịch vụ trước khi lưu.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="modal-form services-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <span>Tên</span>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                />
              </div>

              <div className="field-group">
                <span>Giá</span>
                <input
                  className="input-field"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                  required
                />
              </div>

              <div className="field-group field-span-2">
                <span>Mô tả</span>
                <textarea
                  className="input-field services-textarea"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </div>

              <div className="field-group">
                <span>Thời lượng (phút)</span>
                <input
                  className="input-field"
                  type="number"
                  value={form.durationMinutes}
                  onChange={(event) =>
                    setForm({ ...form, durationMinutes: event.target.value })
                  }
                  required
                />
              </div>

              <div className="field-group">
                <span>Danh mục</span>
                <input
                  className="input-field"
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                />
              </div>

              <div className="field-group field-span-2">
                <span>Image URL</span>
                <input
                  className="input-field"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm({ ...form, imageUrl: event.target.value })
                  }
                />
              </div>

              <div className="field-group">
                <span>Order Index</span>
                <input
                  className="input-field"
                  type="number"
                  value={form.orderIndex}
                  onChange={(event) =>
                    setForm({ ...form, orderIndex: event.target.value })
                  }
                />
              </div>

              <label className="field-check">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                />
                <span>Hoạt động</span>
              </label>

              <div className="modal-footer field-span-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminServices;

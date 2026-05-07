import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

void React;

import Register from "../pages/Register";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockRegisterApi = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../contexts/useAuth", () => ({
  useAuth: () => ({
    user: null,
    login: mockLogin,
  }),
}));

vi.mock("../services/authApi", () => ({
  register: (...args) => mockRegisterApi(...args),
}));

vi.mock("../components/Header", () => ({
  default: () => <div data-testid="mock-header" />,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div data-testid="mock-footer" />,
}));

const renderRegister = () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );
};

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/Tên đăng nhập/i), {
    target: { value: "newuser" },
  });
  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: "newuser@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/Mật khẩu/i), {
    target: { value: "123456" },
  });
};

describe("Register page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders register form fields and submit button", () => {
    renderRegister();

    expect(screen.getByLabelText(/Họ/i)).toBeTruthy();
    expect(screen.getByLabelText(/^Tên$/i)).toBeTruthy();
    expect(screen.getByLabelText(/Tên đăng nhập/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeTruthy();
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tạo tài khoản/i })).toBeTruthy();
  });

  it("submits successfully, then logs in and navigates home", async () => {
    const userData = { id: "1", username: "newuser" };
    const token = "token-123";

    mockRegisterApi.mockResolvedValue({
      success: true,
      data: {
        user: userData,
        token,
      },
    });

    renderRegister();
    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: /Tạo tài khoản/i }));

    await waitFor(() => {
      expect(mockRegisterApi).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "newuser",
          email: "newuser@example.com",
          password: "123456",
        }),
      );
    });

    expect(mockLogin).toHaveBeenCalledWith(userData, token);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows duplicate error message when submit fails", async () => {
    mockRegisterApi.mockRejectedValue({
      response: {
        data: {
          message: "Email already exists",
        },
      },
    });

    renderRegister();
    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: /Tạo tài khoản/i }));

    expect(await screen.findByText("Email already exists")).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("disables submit button and shows loading text while submitting", async () => {
    let resolveRegister;
    const pendingPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });

    mockRegisterApi.mockReturnValue(pendingPromise);

    renderRegister();
    fillRequiredFields();

    const submitButton = screen.getByRole("button", { name: /Tạo tài khoản/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Đang xử lý.../i }).disabled,
      ).toBe(true);
    });

    resolveRegister({
      success: true,
      data: {
        user: { id: "1", username: "newuser" },
        token: "token-123",
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Tạo tài khoản/i }).disabled,
      ).toBe(false);
    });
  });
});

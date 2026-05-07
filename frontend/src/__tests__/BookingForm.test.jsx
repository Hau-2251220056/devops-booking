import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingForm from "../components/BookingForm";
import { createBooking } from "../api/booking";

void React;

vi.mock("../api/booking", () => ({
  createBooking: vi.fn(),
}));

const getDateInput = () =>
  screen.queryByLabelText(/ngày|date/i) ||
  screen.queryByPlaceholderText(/ngày|date/i) ||
  screen.queryByTestId("booking-date");

const getTimeInput = () =>
  screen.queryByLabelText(/giờ|time|slot/i) ||
  screen.queryByRole("combobox", { name: /giờ|time|slot/i }) ||
  screen.queryByPlaceholderText(/giờ|time/i) ||
  screen.queryByTestId("booking-time");

const getSubmitButton = () =>
  screen.queryByRole("button", { name: /đặt lịch|book|submit/i }) ||
  screen.queryByTestId("booking-submit");

const fillValidForm = () => {
  const dateInput = getDateInput();
  const timeInput = getTimeInput();

  expect(dateInput).toBeTruthy();
  fireEvent.change(dateInput, { target: { value: "2099-01-10" } });

  if (timeInput) {
    fireEvent.change(timeInput, { target: { value: "09:00" } });
    return;
  }

  // Fallback for UI using selectable time-slot buttons
  const slotButton =
    screen.queryByRole("button", { name: /09:00|9:00/i }) ||
    screen.queryByRole("button", { name: /09:30|9:30/i });

  if (slotButton) {
    fireEvent.click(slotButton);
  }
};

describe("BookingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with date input, time input (or time slots), and submit button", () => {
    render(<BookingForm />);

    expect(getDateInput()).toBeTruthy();
    expect(getTimeInput() || screen.queryByTestId("time-slots")).toBeTruthy();
    expect(getSubmitButton()).toBeTruthy();
  });

  it("submits booking successfully and shows success message", async () => {
    createBooking.mockResolvedValue({
      data: {
        success: true,
        message: "Booking created successfully",
      },
    });

    render(<BookingForm />);

    fillValidForm();

    const submitButton = getSubmitButton();
    expect(submitButton).toBeTruthy();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledTimes(1);
      expect(createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          date: "2099-01-10",
          time: "09:00",
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByText(
          /booking created successfully|đặt lịch thành công|success/i,
        ),
      ).toBeTruthy();
    });
  });

  it("handles duplicate booking error (409) and shows error message", async () => {
    createBooking.mockRejectedValue({
      response: {
        status: 409,
        data: { message: "Time slot already booked" },
      },
    });

    render(<BookingForm />);

    fillValidForm();

    const submitButton = getSubmitButton();
    expect(submitButton).toBeTruthy();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(
          /time slot already booked|already booked|trùng lịch/i,
        ),
      ).toBeTruthy();
    });
  });

  it("shows validation error when missing required fields and does not call API", async () => {
    render(<BookingForm />);

    const submitButton = getSubmitButton();
    expect(submitButton).toBeTruthy();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createBooking).not.toHaveBeenCalled();
      expect(
        screen.queryByText(/required|vui lòng|thiếu|validation/i),
      ).toBeTruthy();
    });
  });

  it("disables submit button or shows loading state while submitting", async () => {
    let resolvePromise;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    createBooking.mockReturnValue(pendingPromise);

    render(<BookingForm />);

    fillValidForm();

    const submitButton = getSubmitButton();
    expect(submitButton).toBeTruthy();
    fireEvent.click(submitButton);

    await waitFor(() => {
      const loadingButton = getSubmitButton();
      const hasLoadingText = Boolean(
        screen.queryByText(/loading|đang xử lý|submitting/i),
      );
      expect(loadingButton?.disabled || hasLoadingText).toBe(true);
    });

    resolvePromise({
      data: { success: true, message: "Booking created successfully" },
    });

    await waitFor(() => {
      const buttonAfterDone = getSubmitButton();
      if (buttonAfterDone) {
        expect(buttonAfterDone.disabled).toBe(false);
      }
    });
  });
});

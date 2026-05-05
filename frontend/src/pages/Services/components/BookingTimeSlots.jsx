import { useEffect, useMemo, useRef, useState } from "react";
import { formatDateForApi } from "../../../utils/dateHelper";
import "./BookingTimeSlots.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const normalizeSlots = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.availableSlots)) {
    return payload.data.availableSlots;
  }

  return [];
};

const getSlotKey = (slot) => `${slot.start}-${slot.end}`;

function BookingTimeSlots({
  selectedDate,
  workerId,
  selectedSlot,
  onSelectSlot,
  reloadKey = 0,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const onSelectSlotRef = useRef(onSelectSlot);
  const selectedSlotRef = useRef(selectedSlot || null);

  useEffect(() => {
    onSelectSlotRef.current = onSelectSlot;
  }, [onSelectSlot]);

  useEffect(() => {
    selectedSlotRef.current = selectedSlot || null;
  }, [selectedSlot]);

  useEffect(() => {
    if (!selectedDate || !workerId) {
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort?.();
    abortRef.current = controller;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const loadSlots = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          date: formatDateForApi(selectedDate),
          workerId,
        });

        const response = await fetch(
          `${API_URL}/api/bookings/available-slots?${params.toString()}`,
          {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Không thể tải khung giờ");
        }

        if (requestIdRef.current !== requestId) {
          return;
        }

        const normalizedSlots = normalizeSlots(payload)
          .map((slot) => ({
            start: slot.start ?? slot.startTime,
            end: slot.end ?? slot.endTime,
            available: Boolean(slot.available),
          }))
          .filter((slot) => slot.start && slot.end)
          .sort((left, right) => left.start.localeCompare(right.start));

        setSlots(normalizedSlots);

        if (
          selectedSlotRef.current &&
          !normalizedSlots.some(
            (slot) => getSlotKey(slot) === getSlotKey(selectedSlotRef.current),
          )
        ) {
          selectedSlotRef.current = null;
          onSelectSlotRef.current?.(null);
        }
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }

        if (requestIdRef.current !== requestId) {
          return;
        }

        setSlots([]);
        setError(fetchError.message || "Không thể tải khung giờ");
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    };

    loadSlots();

    return () => {
      controller.abort();
    };
  }, [reloadKey, selectedDate, workerId]);

  const handleSelectSlot = (slot) => {
    if (!slot.available) {
      return;
    }

    selectedSlotRef.current = slot;
    onSelectSlotRef.current?.(slot);
  };

  const selectedSlotKey = useMemo(
    () => (selectedSlot ? getSlotKey(selectedSlot) : ""),
    [selectedSlot],
  );
  const skeletonKeys = useMemo(
    () => Array.from({ length: 8 }, (_, i) => i),
    [],
  );
  const hasDate = Boolean(selectedDate);
  const hasWorker = Boolean(workerId);
  const canLoadSlots = hasDate && hasWorker;
  const displaySlots = canLoadSlots ? slots : [];
  const displayLoading = Boolean(selectedDate && workerId && loading);
  const displayError = selectedDate && workerId ? error : "";

  return (
    <div className="booking-time-slots booking-section">
      <h2 className="section-title">
        <span className="step-number">4</span>
        Chọn giờ
      </h2>

      {displayLoading && (
        <div className="time-slots-grid time-slots-skeleton" aria-hidden="true">
          {skeletonKeys.map((key) => (
            <div key={key} className="time-slot-skeleton" />
          ))}
        </div>
      )}

      {!displayLoading && displayError && (
        <p className="time-slot-state error">{displayError}</p>
      )}

      {!hasDate && (
        <p className="time-slot-state">Vui lòng chọn ngày để xem khung giờ.</p>
      )}

      {hasDate && !hasWorker && (
        <p className="time-slot-state">Vui lòng chọn thợ để xem khung giờ.</p>
      )}

      {!displayLoading &&
        !displayError &&
        canLoadSlots &&
        displaySlots.length === 0 && (
          <p className="time-slot-state empty">Hết lịch</p>
        )}

      {!displayLoading && !displayError && displaySlots.length > 0 && (
        <div className="time-slots-grid">
          {displaySlots.map((slot) => {
            const isSelected = getSlotKey(slot) === selectedSlotKey;
            const isDisabled = !slot.available;

            return (
              <button
                key={getSlotKey(slot)}
                type="button"
                className={`time-slot ${isSelected ? "selected" : ""} ${
                  isDisabled ? "disabled" : ""
                }`}
                onClick={() => handleSelectSlot(slot)}
                disabled={isDisabled}
              >
                {slot.start} - {slot.end}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BookingTimeSlots;

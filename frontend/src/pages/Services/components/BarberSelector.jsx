import { Scissors } from "lucide-react";
import "./BarberSelector.css";

function BarberSelector({ barbers, selectedBarber, onSelectBarber }) {
    return (
        <div className="booking-section">
            <h2 className="section-title">
                <span className="step-number">1</span>
                Chọn thợ cắt tóc
            </h2>

            <div className="barbers-grid booking-barbers-grid">
                {barbers.map((barber) => {
                    const isSelected = selectedBarber?.id === barber.id;
                    const fullName = `${barber?.user?.firstName || "Barber"} ${barber?.user?.lastName || ""}`.trim();

                    return (
                        <button
                            key={barber.id}
                            type="button"
                            className={`barber-option ${isSelected ? "selected" : ""}`}
                            onClick={() => onSelectBarber(barber)}
                        >
                            <div className="barber-option-icon">
                                <Scissors size={18} />
                            </div>
                            <div className="barber-option-content">
                                <strong>{fullName}</strong>
                                <span>{barber.specialization || "Thợ cắt tóc chuyên nghiệp"}</span>
                            </div>
                            <div className="barber-option-meta">
                                {barber.isAvailable ? "Sẵn sàng" : "Bận"}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default BarberSelector;
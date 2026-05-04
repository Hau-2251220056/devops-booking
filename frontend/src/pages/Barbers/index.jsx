import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    AlertCircle,
    BadgeCheck,
    Scissors,
    Search,
    Star,
    Users,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BarberCard from "../../components/BarberCard";
import { fetchBarbers } from "../../services/barberApi";
import "./Barbers.css";

function BarbersPage() {
    const [searchParams] = useSearchParams();
    const selectedBarberId = searchParams.get("barberId");

    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    useEffect(() => {
        const loadBarbers = async () => {
            try {
                setLoading(true);
                const response = await fetchBarbers();
                const data = Array.isArray(response) ? response : response?.data || [];
                setBarbers(data);
                setError(null);
            } catch (fetchError) {
                console.error("Error loading barbers:", fetchError);
                setError("Không thể tải danh sách thợ cắt tóc. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        loadBarbers();
    }, []);

    const normalizedQuery = query.trim().toLowerCase();

    const filteredBarbers = barbers.filter((barber) => {
        const fullName = `${barber?.user?.firstName || ""} ${barber?.user?.lastName || ""}`.toLowerCase();
        const specialization = (barber?.specialization || "").toLowerCase();
        const matchesQuery =
            !normalizedQuery ||
            fullName.includes(normalizedQuery) ||
            specialization.includes(normalizedQuery);
        const matchesAvailability = !onlyAvailable || barber?.isAvailable;

        return matchesQuery && matchesAvailability;
    });

    const availableCount = barbers.filter((barber) => barber?.isAvailable).length;

    return (
        <div className="barbers-page-root">
            <Header />

            <main className="barbers-page">
                <section className="barbers-hero">
                    <div className="container">
                        <div className="barbers-hero-grid">
                            <div className="barbers-hero-copy">
                                <p className="eyebrow">Đội ngũ thợ cắt tóc</p>
                                <h1>Chọn đúng thợ phù hợp với phong cách của bạn</h1>
                                <p className="lead">
                                    Xem toàn bộ đội ngũ, lọc theo khả năng phục vụ và đặt lịch trực tiếp với thợ bạn muốn.
                                </p>

                                <div className="barbers-stats">
                                    <div className="stat-card">
                                        <Users size={18} />
                                        <div>
                                            <strong>{barbers.length}</strong>
                                            <span>Thợ đang có</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <BadgeCheck size={18} />
                                        <div>
                                            <strong>{availableCount}</strong>
                                            <span>Đang sẵn sàng</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <Star size={18} />
                                        <div>
                                            <strong>5.0</strong>
                                            <span>Đánh giá trung bình</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="barbers-hero-panel">
                                <div className="panel-item">
                                    <Scissors size={20} />
                                    <div>
                                        <h2>Đặt lịch theo thợ</h2>
                                        <p>Chọn thợ trực tiếp từ danh sách và đi sang trang booking.</p>
                                    </div>
                                </div>
                                <div className="panel-item">
                                    <AlertCircle size={20} />
                                    <div>
                                        <h2>Đồng bộ dữ liệu</h2>
                                        <p>Dữ liệu hiển thị lấy từ API barber hiện có, không tạo luồng rẽ riêng.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="barbers-list-section">
                    <div className="container">
                        <div className="barbers-toolbar">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Tìm theo tên hoặc chuyên môn"
                                    aria-label="Tìm thợ cắt tóc"
                                />
                            </div>

                            <label className="availability-filter">
                                <input
                                    type="checkbox"
                                    checked={onlyAvailable}
                                    onChange={(event) => setOnlyAvailable(event.target.checked)}
                                />
                                Chỉ hiển thị thợ đang sẵn sàng
                            </label>
                        </div>

                        {selectedBarberId ? (
                            <div className="selected-note">
                                Bạn đã chọn sẵn thợ từ link trước đó. <Link to={`/booking?barberId=${selectedBarberId}`}>Tiếp tục đặt lịch</Link>
                            </div>
                        ) : null}

                        {loading ? (
                            <div className="barbers-state">Đang tải danh sách thợ cắt tóc...</div>
                        ) : error ? (
                            <div className="barbers-state error">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        ) : filteredBarbers.length > 0 ? (
                            <div className="barbers-grid">
                                {filteredBarbers.map((barber) => (
                                    <BarberCard key={barber.id} barber={barber} />
                                ))}
                            </div>
                        ) : (
                            <div className="barbers-state empty">Không tìm thấy thợ phù hợp.</div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default BarbersPage;
// @ts-nocheck
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../contexts/useAuth';
import { register as apiRegister } from '../../services/authApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../Login/Auth.css';

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiRegister(formData);
            if (response.success && response.data) {
                login(response.data.user, response.data.token);
                navigate('/');
            } else {
                setError(response.message || 'Đăng ký thất bại');
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <Header />

            <div className="auth-container register-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>Tạo tài khoản mới</h1>
                        <p>Tham gia LuxeCut ngay hôm nay</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">Họ</label>
                                <div className="input-wrapper">
                                    <FaUser className="input-icon" />
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Họ của bạn"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Tên</label>
                                <div className="input-wrapper">
                                    <FaUser className="input-icon" />
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Tên của bạn"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="nhập tên đăng nhập"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nhập email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <div className="input-wrapper">
                                <FaPhone className="input-icon" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="số điện thoại (tùy chọn)"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="nhập mật khẩu (tối thiểu 6 ký tự)"
                                    required
                                    minLength="6"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                            {!loading && <FaArrowRight />}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="auth-link">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="auth-graphic">
                    <div className="graphic-content">
                        <h2>Bắt đầu hành trình</h2>
                        <p>Tạo tài khoản LuxeCut để truy cập đầy đủ các dịch vụ của chúng tôi.</p>
                        <ul className="feature-list">
                            <li>Miễn phí tạo tài khoản</li>
                            <li>Quản lý lịch hẹn dễ dàng</li>
                            <li>Nhận ưu đãi độc quyền</li>
                            <li>Truy cập 24/7</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

// @ts-nocheck
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../contexts/useAuth';
import { login as apiLogin } from '../../services/authApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
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
            const response = await apiLogin(formData);
            if (response.success && response.data) {
                login(response.data.user, response.data.token);
                navigate('/');
            } else {
                setError(response.message || 'Đăng nhập thất bại');
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

            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>Đăng nhập</h1>
                        <p>Chào mừng trở lại LuxeCut</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="identifier">Email hoặc Tên đăng nhập</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="text"
                                    id="identifier"
                                    name="identifier"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    placeholder="nhập email hoặc tên đăng nhập"
                                    required
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
                                    placeholder="nhập mật khẩu"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            {!loading && <FaArrowRight />}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="auth-link">
                                Tạo tài khoản mới
                            </Link>
                        </p>
                        <p>
                            <a href="#" className="auth-link">
                                Quên mật khẩu?
                            </a>
                        </p>
                    </div>
                </div>

                <div className="auth-graphic">
                    <div className="graphic-content">
                        <h2>Trải nghiệm dịch vụ cao cấp</h2>
                        <p>Đăng nhập để đặt lịch cắt tóc, xem lịch hẹn và quản lý tài khoản của bạn.</p>
                        <ul className="feature-list">
                            <li>Đặt lịch nhanh chóng</li>
                            <li>Xem lịch hẹn của bạn</li>
                            <li>Nhận thông báo</li>
                            <li>Lưu thông tin thanh toán</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

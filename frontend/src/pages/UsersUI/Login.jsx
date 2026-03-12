import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../contexts/UserContext";
import { useApi } from "../../utils/useApi";
import Eye from "../../components/ui/Eye";
import logo from "../../assets/logo.svg";
import bookIcon from "../../assets/icons/onlybook.svg";
import AuthImage from "../../assets/images/auth-image.png";
import "./Login.css";

const Login = ({ onLogin }) => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useSession();
    const api = useApi();
    const emailRegex = /^\S+@\S+\.\S+$/;

    const validate = () => {
        const errs = {};
        if (!emailRegex.test(form.email)) {
            errs.email = "Invalid email address";
        }
        if (form.password.length < 8) {
            errs.password = "Password must be at least 8 characters";
        }
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            try {
                const result = await signIn(form);
                
                if (result.success) {
                                            // Взимаме профила на потребителя за определяне на пренасочването
                        try {
                            const profileResponse = await api.get('/api/auth/profile');
                            if (profileResponse.success && profileResponse.user) {
                                // Пренасочваме според ролята на потребителя
                                if (profileResponse.user.role === 'ADMIN') {
                                    navigate("/admin/home");
                                } else {
                                    // Потребител - пренасочваме към началната страница
                                    navigate("/home");
                                }
                            } else {
                                // Пренасочваме към началната страница при грешка
                                navigate("/home");
                            }
                        } catch (profileErr) {
                            console.warn('Failed to fetch profile, redirecting to home:', profileErr);
                            navigate("/home");
                        }
                } else {
                    setErrors({ api: result.error || "Login failed. Please check your credentials." });
                }
            } catch (err) {
                console.error(err);
                setErrors({ api: err.message || "An error occurred" });
            }
        }
    };

    return (
        <div className="sign-up">
            <div className="container">
                <div className="form-wrapper">
                    <form className="form" onSubmit={handleSubmit} noValidate>
                        <header className="form-header">
                            <div className="logo-wrap">
                                <img
                                    src={logo}
                                    alt="Digital Library Logo"
                                    className="logo-img"
                                />
                                <span className="logo-text">Digital Library</span>
                            </div>
                            <h1 className="title">Welcome Back to the Digital Library</h1>
                            <p className="subtitle">
                                Access the vast collection of resources, and stay updated
                            </p>
                        </header>

                        <div className="fields">
                            <div className="field">
                                <label>Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    className={`input ${errors.email ? "error" : ""}`}
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@student.bfu.com"
                                />
                                {errors.email && <p className="error">{errors.email}</p>}
                            </div>
                            <div className="field">
                                <label>Password</label>
                                <div className="input-with-icon">
                                    <input
                                        name="password"
                                        type={showPwd ? "text" : "password"}
                                        className={`input ${errors.password ? "error" : ""}`}
                                        placeholder="At least 8 characters long"
                                        value={form.password}
                                        onChange={handleChange}
                                    />
                                    <Eye
                                        isVisible={showPwd}
                                        onToggle={() => setShowPwd(v => !v)}
                                        className="eye-instance"
                                    />
                                </div>
                                {errors.password && <p className="error">{errors.password}</p>}
                            </div>
                        </div>
                        <button type="submit" className="button-instance">
                            <img
                                src={bookIcon}
                                alt="Book icon"
                                className="button-icon"
                            />
                            Login
                        </button>
                        <p className="have-account">
                            Don't have an account already?
                            <span 
                                className="login-link" 
                                onClick={() => navigate('/register')}
                                style={{ cursor: 'pointer' }}
                            > Register here</span>
                        </p>
                    </form>
                </div>

                <div className="image-wrapper">
                    <img
                        src={AuthImage}
                        alt="Library books"
                        className="auth-image"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;

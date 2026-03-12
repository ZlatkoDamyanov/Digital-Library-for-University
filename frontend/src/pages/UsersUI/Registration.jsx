// Компонент за регистрация на потребители

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../utils/useApi";
import Eye from "../../components/ui/Eye";
import logo from "../../assets/logo.svg";
import bookIcon from "../../assets/icons/onlybook.svg";
import AuthImage from "../../assets/images/auth-image.png";
import "./Registration.css";

const Registration = ({ onRegistration }) => {
  const api = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    universityId: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const emailRegex = /^\S+@\S+\.\S+$/;

  const validate = () => {
    const errs = {};
    const isAdminEmail = form.email && form.email.endsWith('@bfu.bg');
    
    if (!form.firstName.trim() || form.firstName.length < 3) {
      errs.firstName = "First name must be at least 3 characters";
    }
    if (!form.lastName.trim() || form.lastName.length < 3) {
      errs.lastName = "Last name must be at least 3 characters";
    }
    if (!emailRegex.test(form.email)) {
      errs.email = "Invalid email address";
    }
    // Университетски номер е задължителен само за студенти
    if (!isAdminEmail && !form.universityId.trim()) {
      errs.universityId = "Please enter a valid university ID";
    }
    if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Изчистваме грешките когато потребителят започне да пише
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Обработваме изпращането на формуляра за регистрация
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Изчистваме предишни съобщения
    setErrors({});
    setSuccessMessage("");
    
    const validationErrors = validate();
    
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        // Изпращаме само необходимите данни без confirmPassword
        const { confirmPassword, ...registrationData } = form;
        const resp = await api.post('/api/auth/register', registrationData);
        
        setSuccessMessage("Registration successful! Please wait for admin approval.");
        
        // Уведомяваме родителския компонент след успешна регистрация
        if (onRegistration) {
          onRegistration(resp);
        }
      } catch (err) {
        setErrors({ general: err.message || 'Registration failed. Please try again.' });
      } finally {
        setIsLoading(false);
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
                <img src={logo} alt="Digital Library Logo" className="logo-img" />
                <span className="logo-text">Digital Library</span>
              </div>
              <h1 className="title">Create Your Library Account</h1>
              <p className="subtitle">
                Please complete all fields to gain access to the library. 
                University ID is required for student accounts (@students.bfu.bg), 
                but optional for admin accounts (@bfu.bg).
              </p>
            </header>

            {/* Success Message */}
            {successMessage && (
              <div className="success-message" style={{
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                color: '#155724',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px'
              }}>
                {successMessage}
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="error-message" style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                color: '#721c24',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px'
              }}>
                {errors.general}
              </div>
            )}

            <div className="fields">
              <div className="field-row">
                <div className="field">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    className={`input ${errors.firstName ? 'error' : ''}`}
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Your first name"
                  />
                  {errors.firstName && <p className="error">{errors.firstName}</p>}
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    className={`input ${errors.lastName ? 'error' : ''}`}
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Your last name"
                  />
                  {errors.lastName && <p className="error">{errors.lastName}</p>}
                </div>
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  className={`input ${errors.email ? 'error' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@students.bfu.bg or you@bfu.bg"
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>

              <div className="field">
                <label>
                  University ID Number
                  {form.email && form.email.endsWith('@bfu.bg') && (
                    <span style={{ fontSize: '0.9em', color: '#666', fontWeight: 'normal' }}>
                      {' '}(Optional for admin accounts)
                    </span>
                  )}
                </label>
                <input
                  name="universityId"
                  className={`input ${errors.universityId ? 'error' : ''}`}
                  value={form.universityId}
                  onChange={handleChange}
                  placeholder={form.email && form.email.endsWith('@bfu.bg') ? "Optional for admin accounts" : "eg: 21311023"}
                />
                {errors.universityId && (
                  <p className="error">{errors.universityId}</p>
                )}
              </div>

              <div className="field">
                <label>Password</label>
                <div className="input-with-icon">
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    className={`input ${errors.password ? 'error' : ''}`}
                    placeholder="At least 8 characters long"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <Eye
                    isVisible={showPwd}
                    onToggle={() => setShowPwd((v) => !v)}
                    className="eye-instance"
                  />
                </div>
                {errors.password && <p className="error">{errors.password}</p>}
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <div className="input-with-icon">
                  <input
                    name="confirmPassword"
                    type={showConfirmPwd ? "text" : "password"}
                    className={`input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <Eye
                    isVisible={showConfirmPwd}
                    onToggle={() => setShowConfirmPwd((v) => !v)}
                    className="eye-instance"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="error">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button type="submit" className="button-instance" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Registering...
                </>
              ) : (
                <>
                  <img src={bookIcon} alt="Book icon" className="button-icon" />
                  Registration
                </>
              )}
            </button>

            <p className="have-account">
              <span>Have an account already?</span>
              <span 
                className="login-link" 
                onClick={() => navigate('/login')}
                style={{ cursor: 'pointer' }}
              > Login</span>
            </p>
          </form>
        </div>

        <div className="image-wrapper">
          <img src={AuthImage} alt="Library books" className="auth-image" />
        </div>
      </div>
    </div>
  );
};

export default Registration;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Eye, EyeOff, HardHat, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import apiClient from '../api/client';
import './Login.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
const DEFAULT_TENANT_ID =
  import.meta.env.VITE_TENANT_ID ?? '11111111-1111-1111-1111-111111111111';

const Login = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const autofillAdminCredentials = () => {
    if (!isLocalhost) return;
    setValue('email', 'admin@maquinaria.com', { shouldValidate: true });
    setValue('password', 'Admin123!', { shouldValidate: true });
    setError(null);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const tenantId = localStorage.getItem('tenantId') ?? DEFAULT_TENANT_ID;
      localStorage.setItem('tenantId', tenantId);

      const { data: response } = await apiClient.post('/auth/login', data, {
        headers: { 'x-tenant-id': tenantId },
      });

      const authData = response?.data ?? response;
      login(authData.accessToken, authData.usuario);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;
        setError(Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage ?? 'No se pudo iniciar sesión');
      } else {
        setError('Ocurrió un error al iniciar sesión');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <button
            type="button"
            onClick={autofillAdminCredentials}
            aria-label="Autocompletar credenciales admin"
            title={isLocalhost ? 'Autocompletar admin seed' : undefined}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: isLocalhost ? 'pointer' : 'default',
            }}
          >
            <HardHat size={48} color="var(--color-primary)" />
          </button>
          <h1>GESTOR MAQUINARIA</h1>
          <p>Potenciando tu flota de activos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@maquinaria.com"
              {...register('email')}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`password-input ${errors.password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          {error && <div className="alert-error">{error}</div>}

          <button type="submit" className="btn-primary login-btn" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>¿Problemas para acceder? <a href="#">Contacta a soporte</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

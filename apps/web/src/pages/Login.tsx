import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HardHat, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import './Login.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // MOCK LOGIN FOR BOOTSTRAP
      // En producción esto llamaría a un servicio de auth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (data.email === 'admin@admin.com' && data.password === 'admin123') {
        login('mock-jwt-token', {
          id: '1',
          email: data.email,
          nombre: 'Administrador Senior',
          rol: 'admin',
        });
      } else {
        setError('Credenciales inválidas. Usa admin@admin.com / admin123');
      }
    } catch (err) {
      setError('Ocurrió un error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <HardHat size={48} color="var(--color-primary)" />
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
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'input-error' : ''}
            />
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

import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { loginWithEmail, loginWithGoogle } from '../services/authService';
import { getAuthErrorMessage } from '../utils/authErrors';
import { validateLogin } from '../utils/validators';

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner />;
  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateLogin(email, password);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await loginWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitError('');
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      {submitError && <ErrorMessage message={submitError} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormInput label="Email" name="email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <FormInput label="Contraseña" name="password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <button type="submit" disabled={submitting}
          className="rounded-lg bg-blue-600 py-2 font-medium text-white disabled:opacity-50">
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <button onClick={handleGoogle} className="rounded-lg border py-2 font-medium">
        Continuar con Google
      </button>
      <p className="text-center text-sm">
        ¿No tenés cuenta? <Link to="/register" className="text-blue-600">Registrate</Link>
      </p>
    </main>
  );
}
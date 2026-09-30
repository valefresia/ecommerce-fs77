import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { registerWithEmail } from '../services/authService';
import { getAuthErrorMessage } from '../utils/authErrors';
import { validateRegister } from '../utils/validators';

export default function Register() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateRegister>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateRegister(name, email, password, confirm);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await registerWithEmail(email, password, name.trim());
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      {submitError && <ErrorMessage message={submitError} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormInput label="Nombre" name="name" value={name}
          onChange={(e) => setName(e.target.value)} error={errors.name} />
        <FormInput label="Email" name="email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <FormInput label="Contraseña" name="password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <FormInput label="Repetir contraseña" name="confirm" type="password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <button type="submit" disabled={submitting}
          className="rounded-lg bg-blue-600 py-2 font-medium text-white disabled:opacity-50">
          {submitting ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>
      <p className="text-center text-sm">
        ¿Ya tenés cuenta? <Link to="/login" className="text-blue-600">Iniciá sesión</Link>
      </p>
    </main>
  );
}
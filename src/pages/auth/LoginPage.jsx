import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, TextInput } from 'flowbite-react';
import { login } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/ui/PasswordInput';
import LoadingButton from '../../components/ui/LoadingButton';
import Field from '../../components/ui/Field';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Informe o email e a senha.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      signIn(data);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(err.status === 0 ? err.message : err.status === 400 ? 'Email ou senha inválidos.' : 'Não foi possível entrar agora. Tente de novo.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <h1 className="text-3xl font-semibold uppercase text-text">Entrar</h1>
        <p className="mt-1 text-sm text-text-soft">Acesso restrito à administração do Braz Taxi.</p>
      </div>
      {error && <Alert color="failure">{error}</Alert>}
      <Field id="email" label="Email">
        <TextInput id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoFocus />
      </Field>
      <Field id="password" label="Senha">
        <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
      </Field>
      <LoadingButton type="submit" className="w-full" loading={loading}>Entrar</LoadingButton>
      {loading && <p className="text-center text-xs text-text-soft">Se o servidor estiver dormindo, o primeiro acesso pode levar até 1 minuto.</p>}
    </form>
  );
}

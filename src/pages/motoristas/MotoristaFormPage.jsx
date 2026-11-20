import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, TextInput, ToggleSwitch } from 'flowbite-react';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { createDriver, getDriver, updateDriver } from '../../api/adminApi';
import { errorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Field from '../../components/ui/Field';
import PasswordInput from '../../components/ui/PasswordInput';
import LoadingButton from '../../components/ui/LoadingButton';
import { ErrorState, Loading } from '../../components/ui/States';

const EMPTY = { name: '', email: '', password: '', password2: '', telefone: '', doc: '', ativo: true, veiculo: { modelo: '', cor: '', placa: '' }, pix: { favorecido: '', chave: '' } };
const onlyDigits = (s) => s.replace(/\D/g, '');
// placa: ABC1234 ou Mercosul ABC1D23
const plateOk = (p) => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(p.replace(/[^A-Z0-9]/gi, '').toUpperCase());

function validate(f, isNew) {
  // Cadastro novo segue as regras completas. Na edição as regras são mais brandas para não
  // travar motoristas antigos cadastrados com dados em outro formato.
  const e = {};
  if (!f.name.trim()) e.name = 'Informe o nome.';
  const tel = onlyDigits(f.telefone);
  if (!tel) e.telefone = 'Informe o telefone.';
  else if (isNew && (tel.length < 10 || tel.length > 11)) e.telefone = 'Telefone com DDD (10 ou 11 dígitos).';
  if (isNew) {
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Email inválido.';
    if (f.password.length < 6) e.password = 'A senha precisa ter pelo menos 6 caracteres.';
    else if (f.password !== f.password2) e.password2 = 'As senhas não conferem.';
    if (!f.doc.trim()) e.doc = 'Informe o documento.';
    if (!f.veiculo.modelo.trim()) e.modelo = 'Informe o modelo.';
    if (!f.veiculo.cor.trim()) e.cor = 'Informe a cor.';
    if (!plateOk(f.veiculo.placa)) e.placa = 'Placa inválida (ex.: ABC1D23).';
    if (!f.pix.favorecido.trim()) e.favorecido = 'Informe o favorecido.';
    if (!f.pix.chave.trim()) e.chave = 'Informe a chave Pix.';
  }
  return e;
}

export default function MotoristaFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isNew) return;
    const controller = new AbortController();
    getDriver(id, controller.signal)
      .then((d) => {
        setForm({
          ...EMPTY,
          name: d.name ?? '', email: d.email ?? '', telefone: d.telefone ?? '', doc: d.doc ?? '', ativo: d.ativo !== false,
          veiculo: { ...EMPTY.veiculo, ...d.veiculo }, pix: { ...EMPTY.pix, ...d.pix },
        });
        setLoading(false);
      })
      .catch((err) => { if (err.name !== 'AbortError') { setLoadError(errorMessage(err)); setLoading(false); } });
    return () => controller.abort();
  }, [id, isNew]);

  const set = (path, value) => setForm((f) => {
    const [a, b] = path.split('.');
    return b ? { ...f, [a]: { ...f[a], [b]: value } } : { ...f, [a]: value };
  });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, isNew);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true); setSaveError('');
    const payload = {
      name: form.name.trim(),
      telefone: onlyDigits(form.telefone),
      doc: form.doc.trim(),
      veiculo: { modelo: form.veiculo.modelo.trim(), cor: form.veiculo.cor.trim(), placa: form.veiculo.placa.replace(/[^A-Z0-9]/gi, '').toUpperCase() },
      pix: { favorecido: form.pix.favorecido.trim(), chave: form.pix.chave.trim() },
    };
    try {
      if (isNew) {
        const created = await createDriver({ ...payload, email: form.email.trim().toLowerCase(), password: form.password });
        toast.success('Motorista cadastrado. Passe o email e a senha para ele entrar no app.');
        navigate(`/motoristas/${created._id}`, { replace: true });
      } else {
        await updateDriver(id, { ...payload, ativo: form.ativo });
        toast.success('Dados do motorista salvos.');
        navigate(`/motoristas/${id}`, { replace: true });
      }
    } catch (err) {
      setSaveError(errorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (loadError) return <ErrorState message={loadError} />;

  const input = (path, props = {}) => {
    const key = path.split('.').pop();
    const value = path.includes('.') ? form[path.split('.')[0]][key] : form[path];
    return <TextInput id={key} value={value} onChange={(e) => set(path, e.target.value)} color={errors[key] ? 'failure' : undefined} disabled={saving} {...props} />;
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl animate-fade-up space-y-6">
      <div className="flex items-center gap-3">
        <Button color="light" size="sm" onClick={() => navigate(-1)} aria-label="Voltar"><HiOutlineArrowLeft className="h-4 w-4" /></Button>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Motoristas</div>
          <h1 className="text-3xl font-semibold uppercase text-text">{isNew ? 'Novo motorista' : `Editar ${form.name.split(' ')[0]}`}</h1>
        </div>
      </div>

      {saveError && <Alert color="failure">{saveError}</Alert>}

      <Card title="Dados pessoais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nome completo" error={errors.name} className="sm:col-span-2">{input('name', { autoFocus: isNew })}</Field>
          <Field id="email" label="Email (login no app)" error={errors.email} hint={isNew ? undefined : 'O email não pode ser alterado por aqui.'}>{input('email', { type: 'email', disabled: !isNew || saving })}</Field>
          <Field id="telefone" label="Telefone / WhatsApp" error={errors.telefone}>{input('telefone', { inputMode: 'tel', placeholder: '(35) 99999-9999' })}</Field>
          <Field id="doc" label="Documento (CPF ou CNH)" error={errors.doc}>{input('doc')}</Field>
          {!isNew && (
            <div className="flex items-end pb-2">
              <ToggleSwitch checked={form.ativo} onChange={(v) => set('ativo', v)} label={form.ativo ? 'Ativo: pode usar o app' : 'Bloqueado: não pode usar o app'} disabled={saving} />
            </div>
          )}
        </div>
      </Card>

      {isNew && (
        <Card title="Acesso ao app">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="password" label="Senha" error={errors.password}>
              <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={(e) => set('password', e.target.value)} color={errors.password ? 'failure' : undefined} disabled={saving} />
            </Field>
            <Field id="password2" label="Confirmar senha" error={errors.password2}>
              <PasswordInput id="password2" autoComplete="new-password" value={form.password2} onChange={(e) => set('password2', e.target.value)} color={errors.password2 ? 'failure' : undefined} disabled={saving} />
            </Field>
          </div>
        </Card>
      )}

      <Card title="Veículo">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="modelo" label="Modelo" error={errors.modelo}>{input('veiculo.modelo', { placeholder: 'Ex.: Onix' })}</Field>
          <Field id="cor" label="Cor" error={errors.cor}>{input('veiculo.cor', { placeholder: 'Ex.: Prata' })}</Field>
          <Field id="placa" label="Placa" error={errors.placa}>{input('veiculo.placa', { placeholder: 'ABC1D23', className: '[&_input]:uppercase', maxLength: 8 })}</Field>
        </div>
      </Card>

      <Card title="Pix para repasse">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="favorecido" label="Favorecido" error={errors.favorecido}>{input('pix.favorecido')}</Field>
          <Field id="chave" label="Chave Pix" error={errors.chave}>{input('pix.chave')}</Field>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button color="light" onClick={() => navigate(-1)} disabled={saving}>Cancelar</Button>
        <LoadingButton type="submit" loading={saving}>{isNew ? 'Cadastrar motorista' : 'Salvar alterações'}</LoadingButton>
      </div>
    </form>
  );
}

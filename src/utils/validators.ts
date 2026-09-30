export const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

export function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!isValidEmail(email)) errors.email = 'Ingresá un email válido.';
  if (password.length < 6) errors.password = 'Mínimo 6 caracteres.';
  return errors;
}

export function validateRegister(name: string, email: string, password: string, confirm: string) {
  const errors: { name?: string; email?: string; password?: string; confirm?: string } = {
    ...validateLogin(email, password),
  };
  if (name.trim().length < 2) errors.name = 'Ingresá tu nombre.';
  if (confirm !== password) errors.confirm = 'Las contraseñas no coinciden.';
  return errors;
}
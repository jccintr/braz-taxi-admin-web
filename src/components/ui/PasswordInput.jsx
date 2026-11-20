import { forwardRef, useState } from 'react';
import { TextInput } from 'flowbite-react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <TextInput ref={ref} type={visible ? 'text' : 'password'} className={`[&_input]:pr-10 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={props.disabled}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar senha' : 'Exibir senha'}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-soft hover:text-text disabled:opacity-50"
      >
        {visible ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
      </button>
    </div>
  );
});
export default PasswordInput;

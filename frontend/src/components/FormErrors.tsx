interface FormErrorsProps {
  errors: string[];
}

const FormErrors: React.FC<FormErrorsProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  if (errors.length === 1) {
    return <p className='form-error'>{errors[0]}</p>;
  }

  return (
    <ul className='form-error form-error-list'>
      {errors.map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  );
};

export default FormErrors;

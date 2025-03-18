"use client";

import styles from "./Auth.module.css";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}

export default function FormField({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
  placeholder = "",
}: FormFieldProps) {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id} className={styles.inputLabel}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={styles.inputField}
      />
    </div>
  );
} 
import { forwardRef, ReactNode } from 'react';

// Form Group Component
interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

// Form Label Component
interface FormLabelProps {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function FormLabel({ htmlFor, children, required, className = '' }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`block text-sm font-medium text-neutral-700 ${className}`}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
}

// Form Input Component
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helpText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, helpText, className = '', ...props }, ref) => {
    const baseClasses = 'form-input focus-ring w-full';
    const errorClasses = error ? 'border-error focus:border-error' : '';
    
    return (
      <div>
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          {...props}
        />
        {helpText && !error && (
          <p id={`${props.id}-help`} className="mt-1 text-caption text-neutral-600">
            {helpText}
          </p>
        )}
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-caption text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// Form Error Component
interface FormErrorProps {
  error?: { message?: string };
}

export function FormError({ error }: FormErrorProps) {
  if (!error?.message) return null;
  
  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {error.message}
    </p>
  );
}

// Form Select Component
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ error, helpText, options, placeholder, className = '', ...props }, ref) => {
    const baseClasses = 'form-input focus-ring w-full pr-10 appearance-none bg-white';
    const errorClasses = error ? 'border-error focus:border-error' : '';
    
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {helpText && !error && (
          <p id={`${props.id}-help`} className="mt-1 text-caption text-neutral-600">
            {helpText}
          </p>
        )}
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-caption text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Form Textarea Component
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helpText?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, helpText, className = '', ...props }, ref) => {
    const baseClasses = 'form-input focus-ring w-full resize-y';
    const errorClasses = error ? 'border-error focus:border-error' : '';
    
    return (
      <div>
        <textarea
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          {...props}
        />
        {helpText && !error && (
          <p id={`${props.id}-help`} className="mt-1 text-caption text-neutral-600">
            {helpText}
          </p>
        )}
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-caption text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// Checkbox Component
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={`mt-1 w-4 h-4 text-primary-500 border-neutral-300 rounded focus-ring ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          <span className="text-sm text-neutral-700">{label}</span>
        </label>
        {error && (
          <p className="mt-1 text-caption text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio Group Component
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export function RadioGroup({ 
  name, 
  options, 
  value, 
  onChange, 
  error, 
  className = '' 
}: RadioGroupProps) {
  return (
    <div className={className}>
      <div className="space-y-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="mt-1 w-4 h-4 text-primary-500 border-neutral-300 focus-ring"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-700">
                {option.label}
              </div>
              {option.description && (
                <div className="text-caption text-neutral-600">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
} 
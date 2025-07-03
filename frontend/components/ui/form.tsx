"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "../../lib/utils"
import { Label } from "./label"

// Custom form types
type FormValues = Record<string, any>
type FormErrors = Record<string, string | undefined>
type FormTouched = Record<string, boolean>

interface FormState {
  values: FormValues
  errors: FormErrors
  touched: FormTouched
  isSubmitting: boolean
}

interface FormContextValue {
  formState: FormState
  setFieldValue: (name: string, value: any) => void
  setFieldError: (name: string, error: string | undefined) => void
  setFieldTouched: (name: string, touched: boolean) => void
  validateField: (name: string) => void
  handleSubmit: (onSubmit: (values: FormValues) => void | Promise<void>) => (e?: React.FormEvent) => void
  register: (name: string, options?: RegisterOptions) => RegisterReturn
}

interface RegisterOptions {
  required?: boolean | string
  minLength?: number | { value: number; message: string }
  maxLength?: number | { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  validate?: (value: any) => string | undefined
}

interface RegisterReturn {
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  value: any
}

const FormContext = React.createContext<FormContextValue | null>(null)

// Custom Form Provider
interface FormProviderProps {
  children: React.ReactNode
  defaultValues?: FormValues
  onSubmit?: (values: FormValues) => void | Promise<void>
}

const FormProvider: React.FC<FormProviderProps> = ({ 
  children, 
  defaultValues = {},
  onSubmit 
}) => {
  const [formState, setFormState] = React.useState<FormState>({
    values: defaultValues,
    errors: {},
    touched: {},
    isSubmitting: false
  })

  const validators = React.useRef<Record<string, RegisterOptions>>({})

  const validateField = React.useCallback((name: string) => {
    const options = validators.current[name]
    const value = formState.values[name]
    let error: string | undefined

    if (options?.required) {
      const requiredMessage = typeof options.required === 'string' 
        ? options.required 
        : `${name} is required`
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        error = requiredMessage
      }
    }

    if (!error && options?.minLength && value) {
      const minLength = typeof options.minLength === 'number' 
        ? options.minLength 
        : options.minLength.value
      const message = typeof options.minLength === 'object' 
        ? options.minLength.message 
        : `Minimum length is ${minLength}`
      
      if (value.length < minLength) {
        error = message
      }
    }

    if (!error && options?.maxLength && value) {
      const maxLength = typeof options.maxLength === 'number' 
        ? options.maxLength 
        : options.maxLength.value
      const message = typeof options.maxLength === 'object' 
        ? options.maxLength.message 
        : `Maximum length is ${maxLength}`
      
      if (value.length > maxLength) {
        error = message
      }
    }

    if (!error && options?.pattern && value) {
      if (!options.pattern.value.test(value)) {
        error = options.pattern.message
      }
    }

    if (!error && options?.validate && value) {
      error = options.validate(value)
    }

    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error }
    }))
  }, [formState.values])

  const setFieldValue = React.useCallback((name: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value }
    }))
  }, [])

  const setFieldError = React.useCallback((name: string, error: string | undefined) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error }
    }))
  }, [])

  const setFieldTouched = React.useCallback((name: string, touched: boolean) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched }
    }))
  }, [])

  const register = React.useCallback((name: string, options?: RegisterOptions): RegisterReturn => {
    if (options) {
      validators.current[name] = options
    }

    return {
      name,
      value: formState.values[name] || '',
      onChange: (e) => {
        const value = e.target.value
        setFieldValue(name, value)
        if (formState.touched[name]) {
          setTimeout(() => validateField(name), 0)
        }
      },
      onBlur: () => {
        setFieldTouched(name, true)
        validateField(name)
      }
    }
  }, [formState.values, formState.touched, setFieldValue, setFieldTouched, validateField])

  const handleSubmit = React.useCallback((onSubmitCallback: (values: FormValues) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      // Validate all fields
      Object.keys(validators.current).forEach(validateField)

      const hasErrors = Object.values(formState.errors).some(error => error)
      
      if (!hasErrors) {
        setFormState(prev => ({ ...prev, isSubmitting: true }))
        try {
          await onSubmitCallback(formState.values)
        } finally {
          setFormState(prev => ({ ...prev, isSubmitting: false }))
        }
      }
    }
  }, [formState.errors, formState.values, validateField])

  const contextValue: FormContextValue = {
    formState,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    handleSubmit,
    register
  }

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  )
}

// Hook to use form context
const useFormContext = () => {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}

const Form = FormProvider

// Form Field Context
type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

interface FormFieldProps {
  name: string
  children: React.ReactNode
}

const FormField: React.FC<FormFieldProps> = ({ name, children }) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      {children}
    </FormFieldContext.Provider>
  )
}

// Form Item Context
type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { name } = fieldContext
  const { id } = itemContext
  const error = formContext.formState.errors[name]

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error,
  }
}

export {
  useFormField,
  useFormContext,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormProvider,
}

export type { FormValues, RegisterOptions, RegisterReturn }

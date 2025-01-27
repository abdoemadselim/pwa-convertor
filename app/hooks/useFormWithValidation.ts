import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  name: z.string().min(1, { message: "Name is required" }),
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Please enter a valid hex color" }),
  icon: z
    .instanceof(File)
    .refine((file) => file.type === "image/png", {
      message: "Only PNG files are allowed",
    })
    .optional(),
})

export type FormValues = z.infer<typeof formSchema>

export function useFormWithValidation(onSubmit: (values: FormValues) => Promise<void>) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      name: "",
      themeColor: "#3b82f6",
    },
  })

  const handleSubmit = form.handleSubmit(onSubmit)

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit,
  }
}


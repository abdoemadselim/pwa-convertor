"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { convertToPWA } from "../actions/convertToPWA"
import { Globe, Palette, Type, ImageIcon, Loader2 } from "lucide-react"
import IconUpload from "./IconUpload"
import { useFormWithValidation } from "../hooks/useFormWithValidation"

interface PWAConverterFormProps {
  setIsLoading: (isLoading: boolean) => void
}

export default function PWAConverterForm({ setIsLoading }: PWAConverterFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  const onSubmit = useCallback(
    async (values: any) => {
      setIsLoading(true)
      try {
        const formData = new FormData()
        formData.append("url", values.url)
        formData.append("name", values.name)
        formData.append("themeColor", values.themeColor)
        if (values.icon instanceof File) {
          formData.append("icon", values.icon)
        }

        const result = await convertToPWA(formData)
        router.push(`/success?pwaUrl=${encodeURIComponent(result.pwaUrl)}`)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to convert website to PWA. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    },
    [setIsLoading, router, toast],
  )

  const { form, isSubmitting } = useFormWithValidation(onSubmit)

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-8 max-w-2xl mx-auto"
        aria-label="PWA Conversion Form"
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-lg" htmlFor="url">
                  <Globe className="w-5 h-5" aria-hidden="true" />
                  <span>Website URL</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    {...field}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 backdrop-blur-sm text-lg py-6"
                    aria-describedby="url-description"
                  />
                </FormControl>
                <FormDescription id="url-description" className="text-gray-400 text-base">
                  Enter the full URL of the website you want to convert to a PWA. Include https:// or http://.
                </FormDescription>
                <FormMessage className="text-base" />
              </FormItem>
            </motion.div>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-lg" htmlFor="name">
                  <Type className="w-5 h-5" aria-hidden="true" />
                  <span>PWA Name</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder="My Awesome PWA"
                    {...field}
                    className="bg-gray-700/50 border-gray-600 text-gray-100 backdrop-blur-sm text-lg py-6"
                    aria-describedby="name-description"
                  />
                </FormControl>
                <FormDescription id="name-description" className="text-gray-400 text-base">
                  Choose a name for your PWA. This will appear on the home screen and in app stores.
                </FormDescription>
                <FormMessage className="text-base" />
              </FormItem>
            </motion.div>
          )}
        />
        <FormField
          control={form.control}
          name="themeColor"
          render={({ field }) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-lg" htmlFor="themeColor">
                  <Palette className="w-5 h-5" aria-hidden="true" />
                  <span>Theme Color</span>
                </FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="themeColor"
                      type="color"
                      {...field}
                      className="w-16 h-16 p-1 rounded-md bg-gray-700/50 border-gray-600 backdrop-blur-sm"
                      aria-label="Color picker for PWA theme"
                    />
                    <Input
                      {...field}
                      placeholder="#3b82f6"
                      className="flex-grow bg-gray-700/50 border-gray-600 text-gray-100 backdrop-blur-sm text-lg py-6"
                      aria-label="Theme color hex value"
                    />
                  </div>
                </FormControl>
                <FormDescription id="theme-description" className="text-gray-400 text-base">
                  Select a theme color for your PWA. This color will be used in the browser's address bar and other UI elements.
                </FormDescription>
                <FormMessage className="text-base" />
              </FormItem>
            </motion.div>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <FormItem>
                <FormLabel className="flex items-center space-x-2 text-lg" htmlFor="icon">
                  <ImageIcon className="w-5 h-5" aria-hidden="true" />
                  <span>PWA Icon</span>
                </FormLabel>
                <FormControl>
                  <IconUpload 
                    id="icon"
                    onIconChange={(file) => field.onChange(file)}
                    defaultIcon={field.value instanceof File ? URL.createObjectURL(field.value) : undefined}
                  />
                </FormControl>
                <FormDescription id="icon-description" className="text-gray-400 text-base">
                  Upload a 192x192 PNG file for your PWA icon. This will be used as the app icon on devices.
                </FormDescription>
                <FormMessage className="text-base" />
              </FormItem>
            </motion.div>
          )}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl font-semibold rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
            aria-label={isSubmitting ? "Converting website to PWA..." : "Convert website to PWA"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" aria-hidden="true" />
                Forging PWA...
              </>
            ) : (
              "PWAify It"
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  )
}

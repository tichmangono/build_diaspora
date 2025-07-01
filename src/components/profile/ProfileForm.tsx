'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/Button'
import { FormInput, FormTextarea, FormError, FormGroup, FormLabel } from '@/components/ui/FormComponents'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { User, MapPin, Briefcase, Building, Globe, Linkedin, Upload } from 'lucide-react'
import Image from 'next/image'

interface ProfileFormProps {
  initialData?: Partial<ProfileUpdateFormData>
  onSubmit: (data: ProfileUpdateFormData & { avatarFile?: File }) => Promise<void>
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function ProfileForm({ 
  initialData, 
  onSubmit, 
  isLoading = false, 
  mode = 'edit' 
}: ProfileFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      phone: initialData?.phone || '',
      location: initialData?.location || '',
      profession: initialData?.profession || '',
      company: initialData?.company || '',
      bio: initialData?.bio || '',
      website: initialData?.website || '',
      linkedinUrl: initialData?.linkedinUrl || '',
    },
  })

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)')
        return
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB')
        return
      }

      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = async (data: ProfileUpdateFormData) => {
    try {
      await onSubmit({
        ...data,
        avatarFile: avatarFile || undefined,
      })
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  const bioLength = watch('bio')?.length || 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            {mode === 'create' ? 'Complete Your Profile' : 'Edit Profile'}
          </h2>
          <p className="text-neutral-600">
            {mode === 'create' 
              ? 'Tell us about yourself to help other professionals connect with you.'
              : 'Update your information to keep your profile current.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-neutral-200 overflow-hidden">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-neutral-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-2 cursor-pointer hover:bg-primary-600 transition-colors">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-neutral-500 text-center">
              Upload a profile photo (JPEG, PNG, or WebP, max 5MB)
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel htmlFor="fullName" required>
                Full Name
              </FormLabel>
              <div className="relative">
                <FormInput
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                  error={errors.fullName?.message}
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
              <FormError error={errors.fullName} />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="phone">
                Phone Number
              </FormLabel>
              <FormInput
                id="phone"
                {...register('phone')}
                placeholder="+263 77 123 4567"
                type="tel"
                error={errors.phone?.message}
              />
              <FormError error={errors.phone} />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel htmlFor="location">
                Location
              </FormLabel>
              <div className="relative">
                <FormInput
                  id="location"
                  {...register('location')}
                  placeholder="Harare, Zimbabwe"
                  error={errors.location?.message}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
              <FormError error={errors.location} />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="profession">
                Profession
              </FormLabel>
              <div className="relative">
                <FormInput
                  id="profession"
                  {...register('profession')}
                  placeholder="Software Developer"
                  error={errors.profession?.message}
                  className="pl-10"
                />
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              </div>
              <FormError error={errors.profession} />
            </FormGroup>
          </div>

          <FormGroup>
            <FormLabel htmlFor="company">
              Company
            </FormLabel>
            <div className="relative">
              <FormInput
                id="company"
                {...register('company')}
                placeholder="Company or Organization"
                error={errors.company?.message}
                className="pl-10"
              />
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
            <FormError error={errors.company} />
          </FormGroup>

          {/* Bio Section */}
          <FormGroup>
            <FormLabel htmlFor="bio">
              Bio
            </FormLabel>
            <FormTextarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              rows={4}
              error={errors.bio?.message}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-neutral-500">
                Share your story and professional background
              </p>
              <p className={`text-xs ${bioLength > 450 ? 'text-warning' : 'text-neutral-500'}`}>
                {bioLength}/500
              </p>
            </div>
            <FormError error={errors.bio} />
          </FormGroup>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <FormLabel htmlFor="website">
                  Website
                </FormLabel>
                <div className="relative">
                  <FormInput
                    id="website"
                    {...register('website')}
                    placeholder="https://yourwebsite.com"
                    error={errors.website?.message}
                    className="pl-10"
                  />
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
                <FormError error={errors.website} />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="linkedinUrl">
                  LinkedIn Profile
                </FormLabel>
                <div className="relative">
                  <FormInput
                    id="linkedinUrl"
                    {...register('linkedinUrl')}
                    placeholder="https://linkedin.com/in/yourprofile"
                    error={errors.linkedinUrl?.message}
                    className="pl-10"
                  />
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
                <FormError error={errors.linkedinUrl} />
              </FormGroup>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || isLoading}
              className="min-w-[120px]"
            >
              {isSubmitting || isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                mode === 'create' ? 'Create Profile' : 'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileForm 
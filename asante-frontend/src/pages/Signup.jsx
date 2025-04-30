// src/pages/Signup.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
//import { createCustomer } from '../services/customer/customer-service';

const steps = [
  'Personal Info',
  'Location',
  'Preferences',
  'Causes',
  'Interests',
  'Review',
]

const interestOptions = [
  'Pet supplies',
  'Electronics',
  'Kitchen & Dining',
  'Garden',
  'Arts & Crafts - Esty',
  'Food & Pantry',
  'Beauty',
  'Clothing',
  'Bed & Bath',
  'Health & Wellbeing',
  'Sports & Outdoors',
  'Shoes',
  'Jewelry & Watches',
]

const causeCategories = {
  Community: [
    'Disadvantaged Populations',
    'Events & Advocacy',
    'First Responders',
    'Homelessness',
    'Schools & Teachers',
  ],
  'Emergency Relief': ['Animal Welfare', 'Food Systems', 'Wildfire Protection'],
  Environment: [
    'Climate Advocacy',
    'Climate Refugees',
    'Drought & Fire Management',
    'Water Sustainability',
  ],
  'Innovation/Entrepreneurship': [
    'Social Entrepreneurship',
    'Social Innovation',
    'Sustainable Innovation',
    'Youth Empowerment',
  ],
  Social: ['Arts', 'Education', 'Mental Health & Wellbeing', 'Social Justice', 'Sports'],
}

export default function Signup() {
  const [currentStep, setCurrentStep] = useState(0)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  const navigate = useNavigate()

  const selectedCauses = watch('cause_preferences', [])
  const selectedInterests = watch('interests', [])

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (data) => {
    // Clip to max 3
    data.cause_preferences = (data.cause_preferences || []).slice(0, 3)
    data.interests = (data.interests || []).slice(0, 3)

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || res.statusText)
      }
      const { user_id } = await res.json()
      navigate(`/dashboard/${user_id}`)
    } catch (err) {
      console.error('Signup failed:', err)
      alert("Sorry, we couldn't create your account. Please try again.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          Create Your Asante Account
        </h1>

        {/* Step Indicator */}
        <div className="flex justify-between mb-10">
          {steps.map((label, i) => (
            <div key={i} className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i <= currentStep ? 'bg-asante-blue text-white' : 'bg-gray-200'
                }`}
              >
                {i + 1}
              </div>
              <span className="text-sm mt-2">{label}</span>
              {i < steps.length - 1 && (
                <div className="absolute w-full h-0.5 bg-gray-200 top-5 left-1/2 z-0">
                  <div
                    className={`h-full ${
                      i < currentStep ? 'bg-asante-blue' : 'bg-gray-200'
                    }`}
                    style={{ width: i < currentStep ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Personal Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="asante-input"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^@]+@[^@]+\.[^@]+$/,
                        message: 'Invalid email',
                      },
                    })}
                    className="asante-input"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  {...register('phone_number', {
                    required: 'Phone number is required',
                  })}
                  className="asante-input"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    {...register('age', { required: 'Age is required' })}
                    className="asante-input"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="asante-input"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {['city', 'state', 'zipcode'].map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-medium mb-1">
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </label>
                    <input
                      {...register(f, { required: `${f} is required` })}
                      className="asante-input"
                    />
                    {errors[f] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[f].message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Income Level
                </label>
                <select {...register('income_level')} className="asante-input">
                  <option value="">Select...</option>
                  <option value="0-25000">$0–25k</option>
                  <option value="25001-50000">$25–50k</option>
                  <option value="50001-75000">$50–75k</option>
                  <option value="75001-100000">$75–100k</option>
                  <option value="100001+">$100k+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Sensitivity
                </label>
                <select
                  {...register('discount_sensitivity')}
                  className="asante-input"
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Referral Source
                </label>
                <select
                  {...register('signup_referral_source')}
                  className="asante-input"
                >
                  <option value="">Select...</option>
                  <option value="social_media">Social Media</option>
                  <option value="friend">Friend/Family</option>
                  <option value="search">Search Engine</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Causes */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <label className="block text-lg font-medium mb-4">
                Select up to 3 Causes
              </label>
              {Object.entries(causeCategories).map(([cat, subs]) => (
                <div key={cat} className="mb-4">
                  <h3 className="font-medium">{cat}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {subs.map((sub) => {
                      const value = `${cat}:${sub}`
                      const checked = selectedCauses.includes(value)
                      const disabled =
                        !checked && selectedCauses.length >= 3
                      return (
                        <label
                          key={value}
                          className={`flex items-center justify-between p-2 border rounded ${
                            checked ? 'bg-asante-light-blue' : ''
                          }`}
                        >
                          <span>{sub}</span>
                          <input
                            type="checkbox"
                            value={value}
                            disabled={disabled}
                            {...register('cause_preferences', {
                              validate: (v) =>
                                v.length <= 3 || 'Max 3 causes',
                            })}
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
              {errors.cause_preferences && (
                <p className="text-red-500 text-sm">
                  {errors.cause_preferences.message}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Interests */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <label className="block text-lg font-medium mb-4">
                Select up to 3 Interests
              </label>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map((opt) => {
                  const checked = selectedInterests.includes(opt)
                  const disabled =
                    !checked && selectedInterests.length >= 3
                  return (
                    <label
                      key={opt}
                      className={`flex items-center p-2 border rounded ${
                        checked ? 'bg-asante-light-blue' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        disabled={disabled}
                        {...register('interests', {
                          validate: (v) =>
                            v.length <= 3 || 'Max 3 interests',
                        })}
                      />
                      <span className="ml-2">{opt}</span>
                    </label>
                  )
                })}
              </div>
              {errors.interests && (
                <p className="text-red-500 text-sm">
                  {errors.interests.message}
                </p>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && ( 
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Review & Submit</h2>
              <p>Please confirm everything before you click Complete Signup.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border rounded"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="asante-button ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="asante-button ml-auto"
              >
                Complete Signup
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

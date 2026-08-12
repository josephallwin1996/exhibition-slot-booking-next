"use client";

import { useState } from "react";

const categories = [
  "Jewellery",
  "Clothing",
  "Food",
  "Decor",
];

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    category: "",
    description: "",
    instagram: "",
    socialMedia: "",
    logo: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value, files } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required.";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required.";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please describe your business.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
  event.preventDefault();

  setSuccessMessage("");
  setErrorMessage("");

  if (!validateForm()) {
    return;
  }

  setSubmitting(true);

  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessName: formData.businessName,
        contactPerson: formData.contactPerson,
        mobile: formData.mobile,
        email: formData.email,
        category: formData.category,
        description: formData.description,
        instagram: formData.instagram,
        socialMedia: formData.socialMedia,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(
        data.message || "Unable to submit your application."
      );

      return;
    }

    setSuccessMessage(
      "Your application has been submitted successfully. We will review it and contact you by email."
    );

    setFormData({
      businessName: "",
      contactPerson: "",
      mobile: "",
      email: "",
      category: "",
      description: "",
      instagram: "",
      socialMedia: "",
      logo: null,
    });
  } catch (error) {
    console.error(error);

    setErrorMessage(
      "Unable to submit your application. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
            Exhibition 2026
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Exhibitor Application
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Tell us about your business and apply for your exhibition stall.
            Our team will review your application and get back to you.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
          >
            {/* Business Information */}
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">
                  Business Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Please provide your business details.
                </p>
              </div>

              <div className="space-y-6">
                {/* Business Name */}
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Business Name *
                  </label>

                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />

                  {errors.businessName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                {/* Contact + Mobile */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contactPerson"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Contact Person *
                    </label>

                    <input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Full name"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                    {errors.contactPerson && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.contactPerson}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="mobile"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Mobile Number *
                    </label>

                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                    {errors.mobile && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />

                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Business Category *
                  </label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className={`cursor-pointer rounded-xl border px-4 py-4 text-center text-sm font-semibold transition ${
                          formData.category === category
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={formData.category === category}
                          onChange={handleChange}
                          className="sr-only"
                        />

                        {category}
                      </label>
                    ))}
                  </div>

                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Brief Business Description *
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us briefly about your business, products and brand..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />

                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">
                  Social Media
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Help us learn more about your brand.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="instagram"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Instagram Profile
                  </label>

                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@yourbrand"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="socialMedia"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Other Social Media
                  </label>

                  <input
                    id="socialMedia"
                    name="socialMedia"
                    type="text"
                    value={formData.socialMedia}
                    onChange={handleChange}
                    placeholder="Facebook, website, etc."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="border-b border-slate-200 p-6 sm:p-8">
              <div className="mb-7">
                <h2 className="text-xl font-bold text-slate-900">
                  Brand Logo
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    Optional
                  </span>
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload your business logo or brand image.
                </p>
              </div>

              <label
                htmlFor="logo"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 text-center transition hover:border-slate-500 hover:bg-slate-50"
              >
                <div className="mb-3 text-3xl">↑</div>

                <p className="font-semibold text-slate-700">
                  Click to upload your logo
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG or WEBP
                </p>

                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleChange}
                  className="hidden"
                />

                {formData.logo && (
                  <p className="mt-4 text-sm font-medium text-green-600">
                    {formData.logo.name}
                  </p>
                )}
              </label>
            </div>

            {successMessage && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium text-green-700">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
                    {errorMessage}
                </div>
            )}

            {/* Submit */}
            <div className="bg-slate-50 p-6 sm:p-8">
              <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {submitting ? "Submitting Application..." : "Submit Application"}
                </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                By submitting this application, you agree that the information
                provided may be reviewed by the exhibition organizers.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
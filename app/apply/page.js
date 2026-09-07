"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ApplyPage() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    categoryId: "",
    description: "",
    instagram: "",
    socialMedia: "",
    logo: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const [errors, setErrors] = useState({});

  /*
   * Load categories dynamically from MongoDB.
   */
  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load categories."
          );
        }

        setCategories(data.categories || []);
      } catch (error) {
        console.error(
          "Category loading error:",
          error
        );

        setErrorMessage(
          "Unable to load business categories. Please refresh the page."
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  function handleChange(event) {
    const {
      name,
      value,
      files,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setErrorMessage("");
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName =
        "Business name is required.";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile =
        "Mobile number is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email address is required.";
    }

    if (!formData.categoryId) {
      newErrors.categoryId =
        "Please select a category.";
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

    console.log(
      "Submitting application:",
      formData
    );

    try {
      const response = await fetch(
        "/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName:
              formData.businessName,

            contactPerson:
              formData.contactPerson,

            mobile: formData.mobile,

            email: formData.email,

            /*
             * IMPORTANT:
             * Submit Category ObjectId,
             * not category name.
             */
            categoryId:
              formData.categoryId,

            description:
              formData.description,

            instagram:
              formData.instagram,

            socialMedia:
              formData.socialMedia,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Unable to submit your application."
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
        categoryId: "",
        description: "",
        instagram: "",
        socialMedia: "",
        logo: null,
      });

      setErrors({});
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
    <main className="min-h-screen overflow-x-hidden bg-[#f8f1e6] text-[#42151c]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#7d1727]/10 bg-[#f8f1e6]/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* Brand */}
          <a href="/" className="flex items-center gap-3">
            {/* <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#a77932]/50" /> */}
              <Image
                  src="/logo.png"
                  alt="Exhibition Logo"
                  width={75}
                  height={75}
                  loading="eager"
                  //className="relative h-8 w-8 object-contain"
                />
              {/* <span className="font-serif text-lg font-bold text-[#7d1727]">
                Y
              </span> */}
            {/* </div> */}

            <div>
              <p className="font-serif text-[18px] font-semibold leading-none text-[#7d1727]">
                Yarntree
              </p>

              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-[#465337]">
                Exhibition & Sale
              </p>
              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.25em] text-[#465337]">
                9th Edition
              </p>
            </div>
          </a>

          <a
            href="/"
            className="hidden text-[10px] font-bold uppercase tracking-[0.15em] text-[#7d1727] sm:block"
          >
            ← Back to Event
          </a>
        </div>
      </header>

      {/* =====================================================
          PAGE INTRO
      ====================================================== */}

      <section className="relative overflow-hidden px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-[#7d1727]/5 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-[#465337]/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex w-fit items-center gap-3">
            <span className="h-px w-7 bg-[#a77932]" />

            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7d1727]">
              Christmas Street '26
            </p>

            <span className="h-px w-7 bg-[#a77932]" />
          </div>

          <h1 className="font-serif text-[46px] leading-[0.9] text-[#7d1727] sm:text-6xl">
            Apply to Exhibit
          </h1>

          <p className="mt-4 font-serif text-lg italic text-[#62524b] sm:text-xl">
            Bring your brand to Christmas Street.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#806d64]">
            Tell us about your business and apply for
            your exhibition stall. Our team will review
            your application and get back to you.
          </p>
        </div>
      </section>

      {/* =====================================================
          EVENT STRIP
      ====================================================== */}

      <section className="px-4 pb-7 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#a77932]/30 bg-[#efe5d6] px-4 py-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-[#7d1727]/10 text-center">
            <div className="px-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#7d1727]">
                Date
              </p>

              <p className="mt-1 font-serif text-sm text-[#42151c] sm:text-base">
                Nov 20 & 21
              </p>
            </div>

            <div className="px-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#7d1727]">
                Venue
              </p>

              <p className="mt-1 font-serif text-sm text-[#42151c] sm:text-base">
                Chakolas Pavilion
              </p>
            </div>

            <div className="px-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#7d1727]">
                Location
              </p>

              <p className="mt-1 font-serif text-sm text-[#42151c] sm:text-base">
                Anchery Chira Thrissur
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FORM
      ====================================================== */}

      <section className="px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-[28px] border border-[#7d1727]/10 bg-[#fffaf3] shadow-xl shadow-[#42151c]/5"
          >
            {/* =================================================
                FORM HEADER
            ================================================== */}

            <div className="border-b border-[#7d1727]/10 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7d1727] font-serif text-lg text-white">
                  1
                </div>

                <div>
                  <h2 className="font-serif text-2xl text-[#42151c]">
                    Business Information
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#806d64]">
                    Please provide your business details.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                BUSINESS INFORMATION
            ================================================== */}

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <div className="space-y-5">
                {/* Business Name */}

                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]"
                  >
                    Business Name *
                  </label>

                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={
                      formData.businessName
                    }
                    onChange={handleChange}
                    placeholder="Enter your business name"
                    className={inputClass(
                      errors.businessName
                    )}
                  />

                  {errors.businessName && (
                    <ErrorMessage>
                      {errors.businessName}
                    </ErrorMessage>
                  )}
                </div>

                {/* Contact + Mobile */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contactPerson"
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]"
                    >
                      Contact Person
                    </label>

                    <input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      value={
                        formData.contactPerson
                      }
                      onChange={handleChange}
                      placeholder="Full name"
                      className={inputClass(
                        errors.contactPerson
                      )}
                    />

                    {errors.contactPerson && (
                      <ErrorMessage>
                        {errors.contactPerson}
                      </ErrorMessage>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="mobile"
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]"
                    >
                      Mobile Number *
                    </label>

                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={
                        formData.mobile
                      }
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className={inputClass(
                        errors.mobile
                      )}
                    />

                    {errors.mobile && (
                      <ErrorMessage>
                        {errors.mobile}
                      </ErrorMessage>
                    )}
                  </div>
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]"
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
                    className={inputClass(
                      errors.email
                    )}
                  />

                  {errors.email && (
                    <ErrorMessage>
                      {errors.email}
                    </ErrorMessage>
                  )}
                </div>

                {/* =================================================
                    CATEGORY
                ================================================== */}

                <div className="pt-2">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]">
                    Business Category *
                  </label>

                  {categoriesLoading ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-[#7d1727]/10 bg-[#f8f1e6] px-4 py-5 text-sm text-[#806d64]">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#7d1727]/20 border-t-[#7d1727]" />

                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                      No categories are currently
                      available. Please try again later.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                      {categories.map(
                        (category) => {
                          const selected =
                            formData.categoryId ===
                            String(
                              category._id
                            );

                          return (
                            <label
                              key={
                                category._id
                              }
                              className={`relative flex min-h-[72px] cursor-pointer items-center justify-center rounded-2xl border px-3 py-3 text-center transition active:scale-[0.98] ${
                                selected
                                  ? "border-[#7d1727] bg-[#7d1727] text-white shadow-md shadow-[#7d1727]/15"
                                  : "border-[#7d1727]/10 bg-[#f8f1e6] text-[#62524b] hover:border-[#7d1727]/30 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name="categoryId"
                                value={
                                  category._id
                                }
                                checked={
                                  selected
                                }
                                onChange={
                                  handleChange
                                }
                                className="sr-only"
                              />

                              <span className="text-xs font-bold leading-4 sm:text-sm">
                                {
                                  category.name
                                }
                              </span>

                              {selected && (
                                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px]">
                                  ✓
                                </span>
                              )}
                            </label>
                          );
                        }
                      )}
                    </div>
                  )}

                  {errors.categoryId && (
                    <ErrorMessage>
                      {errors.categoryId}
                    </ErrorMessage>
                  )}
                </div>

                {/* Description */}

                <div className="pt-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]"
                  >
                    Additional Items
                  </label>

                  <p className="mb-2 text-xs leading-5 text-[#806d64]">
                    Mention if you are bringing any
                    additional items or equipment for
                    the exhibition.
                  </p>

                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    placeholder="Please mention any additional items/equipment you plan to bring..."
                    className={`${inputClass(
                      errors.description
                    )} resize-none`}
                  />

                  {errors.description && (
                    <ErrorMessage>
                      {errors.description}
                    </ErrorMessage>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                SOCIAL MEDIA
            ================================================== */}

            <div className="border-t border-[#7d1727]/10 px-5 py-6 sm:px-8 sm:py-8">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#465337] font-serif text-lg text-white">
                  2
                </div>

                <div>
                  <h2 className="font-serif text-2xl text-[#42151c]">
                    Your Brand
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#806d64]">
                    Help us learn a little more about
                    your brand.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#62524b]"
                >
                  Instagram Profile
                </label>

                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={
                    formData.instagram
                  }
                  onChange={handleChange}
                  placeholder="@yourbrand"
                  className={inputClass()}
                />

                <p className="mt-2 text-[11px] leading-5 text-[#806d64]">
                  Optional — share your Instagram
                  handle so our team can learn more
                  about your brand.
                </p>
              </div>
            </div>

            {/* =================================================
                MESSAGES
            ================================================== */}

            {(successMessage ||
              errorMessage) && (
              <div className="border-t border-[#7d1727]/10 px-5 pt-6 sm:px-8">
                {successMessage && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium leading-6 text-green-700">
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                        ✓
                      </span>

                      <span>
                        {successMessage}
                      </span>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium leading-6 text-red-700">
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                        !
                      </span>

                      <span>
                        {errorMessage}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                SUBMIT
            ================================================== */}

            <div className="mt-6 border-t border-[#7d1727]/10 bg-[#efe5d6] px-5 py-6 sm:px-8 sm:py-8">
              <button
                type="submit"
                disabled={
                  submitting ||
                  categoriesLoading ||
                  categories.length === 0
                }
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#7d1727] px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-[#7d1727]/15 transition hover:bg-[#65121f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application

                    <span className="text-base transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              <p className="mx-auto mt-4 max-w-md text-center text-[10px] leading-5 text-[#806d64]">
                By submitting this application, you
                agree that the information provided may
                be reviewed by the exhibition organizers.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#7d1727]/10 bg-[#efe5d6]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-7 text-center">
          <p className="font-serif text-lg text-[#7d1727]">
            Christmas Street '26
          </p>

          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#465337]">
            Yarn Tree Exhibition & Sale
          </p>

          <p className="mt-2 text-[9px] text-[#806d64]">
            November 20 & 21 · Chakolas Pavilion ·
            Anchery Chira Thrissur
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

function inputClass(error) {
  return `w-full rounded-2xl border bg-[#f8f1e6] px-4 py-3.5 text-sm text-[#42151c] placeholder:text-[#a2948c] outline-none transition focus:bg-white focus:ring-4 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-[#7d1727]/10 focus:border-[#7d1727]/40 focus:ring-[#7d1727]/5"
  }`;
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function ErrorMessage({ children }) {
  return (
    <p className="mt-2 text-xs font-medium text-red-600">
      {children}
    </p>
  );
}
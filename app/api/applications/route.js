import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";
import Category from "@/models/Category";

import {
  sendApplicationSubmittedEmail,
  sendNewApplicationAdminEmail,
} from "@/lib/email";

import {
  sendWhatsAppTemplate,
} from "@/lib/whatsapp";

/*
 * =========================================================
 * NORMALIZE WHATSAPP NUMBER
 * =========================================================
 *
 * Meta expects the phone number in international format
 * without +, spaces, or other characters.
 *
 * Example:
 * +91 9645395716
 * becomes:
 * 919645395716
 *
 * This assumes Indian numbers when the user enters
 * a local 10-digit number.
 */

function normalizeWhatsAppNumber(
  mobile
) {
  if (!mobile) {
    return null;
  }

  let number = String(mobile).trim();

  // Remove spaces, +, -, brackets, etc.
  number = number.replace(
    /[^\d]/g,
    ""
  );

  // If exactly 10 digits, assume India.
  if (number.length === 10) {
    number = `91${number}`;
  }

  return number;
}

export async function POST(request) {
  try {
    const body =
      await request.json();

    const {
      businessName,
      contactPerson,
      mobile,
      email,
      categoryId,
      description,
      instagram,
      socialMedia,
    } = body;

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

    if (
      !businessName ||
      !mobile ||
      !email ||
      !categoryId
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Please fill in all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // --------------------------------------------------
    // Validate category
    // --------------------------------------------------

    const category =
      await Category.findOne({
        _id: categoryId,
      }).lean();

    if (!category) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid category selected.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // Check whether this email already has
    // an active application
    // --------------------------------------------------

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingApplication =
      await Application.findOne({
        email: normalizedEmail,

        status: {
          $in: [
            "pending",
            "approved",
          ],
        },
      });

    if (existingApplication) {
      return Response.json(
        {
          success: false,
          message:
            "An application with this email address already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------
    // Create application
    // --------------------------------------------------

    const application =
      await Application.create({
        businessName:
          businessName.trim(),

        contactPerson:
          contactPerson.trim(),

        mobile:
          mobile.trim(),

        email:
          normalizedEmail,

        categoryId:
          category._id,

        description:
          description?.trim() || "",

        instagram:
          instagram?.trim() || "",

        socialMedia:
          socialMedia?.trim() || "",

        status: "pending",
      });

    // --------------------------------------------------
    // Application reference
    // --------------------------------------------------
    //
    // We are not changing your Application model.
    // For WhatsApp we use the MongoDB application ID
    // as the reference for now.
    //
    // Later, if you already have an application reference
    // field, we can replace this with that value.
    //

    const applicationReference =
      String(application._id);

    // --------------------------------------------------
    // Emails
    // --------------------------------------------------

    try {
      await sendApplicationSubmittedEmail({
        name:
          application.contactPerson,

        email:
          application.email,

        businessName:
          application.businessName,

        category:
          category.name,
      });

      await sendNewApplicationAdminEmail({
        businessName:
          application.businessName,

        contactPerson:
          application.contactPerson,

        email:
          application.email,

        category:
          category.name,
      });
    } catch (emailError) {
      console.error(
        "Application email error:",
        emailError
      );
    }

    // --------------------------------------------------
    // WhatsApp notifications
    // --------------------------------------------------

    const applicantWhatsApp =
      normalizeWhatsAppNumber(
        application.mobile
      );

    /*
     * Applicant:
     * application_submitted
     *
     * Template variables:
     *
     * {{1}} = Contact person
     * {{2}} = Business name
     * {{3}} = Application reference
     */

    if (applicantWhatsApp) {
      try {
        await sendWhatsAppTemplate({
          to: applicantWhatsApp,

          templateName:
            "application_submitted",

          languageCode:
            "en",

          components: [
            {
              type: "body",

              parameters: [
                {
                  type: "text",
                  text:
                    application.contactPerson,
                },

                {
                  type: "text",
                  text:
                    application.businessName,
                },

                {
                  type: "text",
                  text:
                    applicationReference,
                },
              ],
            },
          ],
        });

        console.log(
          "Application submitted WhatsApp sent:",
          applicantWhatsApp
        );
      } catch (whatsappError) {
        /*
         * IMPORTANT:
         *
         * WhatsApp failure must NOT cause
         * the application submission to fail.
         */

        console.error(
          "Application submitted WhatsApp error:",
          whatsappError
        );
      }
    } else {
      console.warn(
        "WhatsApp notification skipped: invalid applicant mobile number."
      );
    }

    // --------------------------------------------------
    // Admin WhatsApp notification
    // --------------------------------------------------

    /*
     * We will add the admin WhatsApp number
     * through an environment variable.
     *
     * Example:
     *
     * WHATSAPP_ADMIN_NUMBER=919876543210
     *
     * Do NOT hard-code the admin number here.
     */

    const adminWhatsAppNumber =
      normalizeWhatsAppNumber(
        process.env.WHATSAPP_ADMIN_NUMBER
      );

    if (adminWhatsAppNumber) {
      try {
        /*
         * Template variables:
         *
         * {{1}} = Business name
         * {{2}} = Applicant/contact person
         * {{3}} = Category
         * {{4}} = Application reference
         * {{5}} = Dashboard URL
         */

        await sendWhatsAppTemplate({
            to: adminWhatsAppNumber,

            templateName: "new_application_admin",

            languageCode: "en",

            components: [
              {
                type: "body",

                parameters: [
                  {
                    type: "text",
                    text: application.businessName,
                  },

                  {
                    type: "text",
                    text: application.contactPerson,
                  },

                  {
                    type: "text",
                    text: category.name,
                  },

                  {
                    type: "text",
                    text: applicationReference,
                  },
                ],
              },

              // URL BUTTON
              {
                type: "button",
                sub_type: "url",
                index: "0",

                parameters: [
                  {
                    type: "text",
                    text: applicationReference,
                  },
                ],
              },
            ],
          });

        console.log(
          "New application admin WhatsApp sent:",
          adminWhatsAppNumber
        );
      } catch (whatsappError) {
        /*
         * Again, WhatsApp failure must NOT
         * affect application submission.
         */

        console.error(
          "New application admin WhatsApp error:",
          whatsappError
        );
      }
    } else {
      console.warn(
        "Admin WhatsApp notification skipped: WHATSAPP_ADMIN_NUMBER is not configured."
      );
    }

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return Response.json(
      {
        success: true,

        message:
          "Application submitted successfully.",

        applicationId:
          application._id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Application submission error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
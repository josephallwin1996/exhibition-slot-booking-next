import mongoose from "mongoose";


import Category from "../models/Category.js";
import Application from "../models/Application.js";


const categories = [
  {
    name: "Jewellery",
    slug: "jewellery",
    position: 1,
  },
  {
    name: "Clothing",
    slug: "clothing",
    position: 2,
  },
  {
    name: "Food",
    slug: "food",
    position: 3,
  },
  {
    name: "Decor",
    slug: "decor",
    position: 4,
  },
  {
    name: "Shared Stall",
    slug: "shared",
    position: 5,
  },
];

async function migrate() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined"
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "Connected to MongoDB"
    );

    /*
     * -------------------------------------------------------
     * 1. Create / update categories
     * -------------------------------------------------------
     */

    const categoryMap = new Map();

    for (const categoryData of categories) {
      const category =
        await Category.findOneAndUpdate(
          {
            slug: categoryData.slug,
          },
          {
            $set: {
              name: categoryData.name,
              position:
                categoryData.position,
              active: true,
            },
            $setOnInsert: {
              slug: categoryData.slug,
              description: "",
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

      categoryMap.set(
        categoryData.name,
        category._id
      );

      console.log(
        `Category ready: ${category.name}`
      );
    }

    /*
     * -------------------------------------------------------
     * 2. Migrate existing applications
     * -------------------------------------------------------
     */

    let migrated = 0;
    let skipped = 0;

    const applications =
      await Application.find({
        categoryId: null,
      }).select(
        "_id category categoryId"
      );

    for (const application of applications) {
      const categoryId =
        categoryMap.get(
          application.category
        );

      if (!categoryId) {
        console.warn(
          `Skipping application ${application._id}: unknown category "${application.category}"`
        );

        skipped++;
        continue;
      }

      await Application.updateOne(
        {
          _id: application._id,
        },
        {
          $set: {
            categoryId,
          },
        }
      );

      migrated++;
    }

    console.log("");
    console.log(
      `Applications migrated: ${migrated}`
    );

    console.log(
      `Applications skipped: ${skipped}`
    );

    console.log("");
    console.log(
      "Category migration completed successfully."
    );
  } catch (error) {
    console.error(
      "Category migration failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
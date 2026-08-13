import mongoose from "mongoose";

import Slot from "../models/Slot.js";
import Category from "../models/Category.js";

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
     * Load all categories and create a
     * quick name -> ObjectId lookup.
     */
    const categories =
      await Category.find({});

    const categoryMap = new Map();

    for (const category of categories) {
      categoryMap.set(
        category.name.trim().toLowerCase(),
        category._id
      );
    }

    console.log(
      `Found ${categories.length} categories`
    );

    /*
     * Find slots whose category is still
     * stored as a string.
     *
     * We intentionally don't modify slots
     * that already contain an ObjectId.
     */
    const slots = await Slot.find({});

    let migrated = 0;
    let alreadyMigrated = 0;
    let skipped = 0;

    for (const slot of slots) {
      /*
       * Mongoose may already cast the value
       * depending on the current model/schema.
       */
      console.log(slot);
      if (
        slot.category &&
        mongoose.Types.ObjectId.isValid(
          slot.category
        ) &&
        typeof slot.category !== "string"
      ) {
        alreadyMigrated++;
        continue;
      }

      const categoryName =
        String(slot.category || "")
          .trim()
          .toLowerCase();

      if (!categoryName) {
        console.warn(
          `Skipping slot ${slot.slotNumber}: no category`
        );

        skipped++;
        continue;
      }

      const categoryId =
        categoryMap.get(categoryName);

      if (!categoryId) {
        console.warn(
          `Skipping slot ${slot.slotNumber}: category "${slot.category}" not found`
        );

        skipped++;
        continue;
      }

      /*
       * Use updateOne directly so MongoDB receives
       * the ObjectId without Mongoose trying to
       * validate the old string value against the
       * new schema.
       */
      await Slot.collection.updateOne(
        {
          _id: slot._id,
        },
        {
          $set: {
            category: categoryId,
          },
        }
      );

      migrated++;

      console.log(
        `Migrated slot ${slot.slotNumber} → ${categoryName}`
      );
    }

    console.log("");
    console.log(
      "--------------------------------"
    );
    console.log(
      `Total slots: ${slots.length}`
    );
    console.log(
      `Migrated: ${migrated}`
    );
    console.log(
      `Already migrated: ${alreadyMigrated}`
    );
    console.log(
      `Skipped: ${skipped}`
    );
    console.log(
      "--------------------------------"
    );
    console.log("");

    if (skipped > 0) {
      console.warn(
        "Some slots were skipped. Review the warnings above before continuing."
      );
    } else {
      console.log(
        "Slot category migration completed successfully."
      );
    }
  } catch (error) {
    console.error(
      "Slot category migration failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
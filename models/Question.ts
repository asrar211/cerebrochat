import mongoose, { Schema, models, Document } from "mongoose";
import type { DisorderKey } from "@/types/disorder";
import { DISORDER_KEYS } from "@/types/disorder";

export type DisorderCategory = DisorderKey;

export interface IQuestion extends Document {
  text: string;
  category: DisorderCategory;
  type: "scale";
  order: number;
  weight: number;
  isActive: boolean;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: DISORDER_KEYS,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["scale"],
      default: "scale",
    },

    order: {
      type: Number,
      required: true,
      index: true,
    },

    weight: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 2,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

QuestionSchema.index({ order: 1 }, { unique: true });

export default models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

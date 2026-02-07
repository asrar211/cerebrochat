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
  options?: {
    value: string;
    label: string;
    score: number;
  }[];
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

    options: {
      type: [
        {
          value: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true },
          score: { type: Number, required: true, min: 0, max: 4 },
        },
      ],
      default: undefined,
    },
  },
  { timestamps: true }
);

QuestionSchema.index({ order: 1 }, { unique: true });

export default models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

import mongoose, { Schema, models, Document } from "mongoose";

export interface IQuestion extends Document {
  text: string;
  category: "depression" | "anxiety" | "stress" | "sleep" | "burnout";
  type: "scale";
  order: number;
  isActive: boolean;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    category: {
  type: String,
  enum: [
    "depression",
    "anxiety",
    "stress",
    "sleep",
    "burnout",
    ],
  required: true,
  },
    type: {
      type: String,
      enum: ["scale"],
      default: "scale",
    },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

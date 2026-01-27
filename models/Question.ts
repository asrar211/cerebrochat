import mongoose, {Schema, models, Document} from "mongoose";

export interface IQuestion extends Document {
    _id: mongoose.Types.ObjectId;
    text: string;
    category: "anxiety" | "depression" | "stress";
    order: number;
    type: "text" | "scale" | "yesno";
    isActive: boolean;
}

const QuestionSchema = new Schema<IQuestion>({
    text: { type: String, required: true },
    category: {
      type: String,
      enum: ["anxiety", "depression", "stress"],
      required: true,
    },
    order: { type: Number, required: true },
    type: {
      type: String,
      enum: ["text", "scale", "yesno"],
      default: "text",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Question = models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
import mongoose, { Schema, models, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  currentQuestionIndex: number;
  answers: {
    questionId: mongoose.Types.ObjectId;
    option: string;
  }[];
  status: "in_progress" | "completed";
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    currentQuestionIndex: { type: Number, default: 0 },

    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        option: {
          type: String,
          required: true,
        },
      },
    ],

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, createdAt: -1 });

export default models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);

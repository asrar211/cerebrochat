import mongoose, {Schema, models, Document} from "mongoose";

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    currentQuestionIndex: number;
    answers: {
        questionId: mongoose.Types.ObjectId;
        answer: string;
    }[];
    status: "inProgress" | "completed"
}

const sessionSchema = new Schema<ISession>(
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
        answer: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["inProgress", "completed"],
      default: "inProgress",
    },
  },
  { timestamps: true }
);

const Session = models.Session || mongoose.model<ISession>("Session", sessionSchema);

export default Session;
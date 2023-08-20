import mongoose, { Document, Schema } from 'mongoose';

interface MealPlan extends Document {
    title: string;
    description: string;
    result: string;
    user: mongoose.Schema.Types.ObjectId;
}

const MealPlanSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    result: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const MealPlanModel = mongoose.model<MealPlan>('mealplantable', MealPlanSchema);

export default MealPlanModel;

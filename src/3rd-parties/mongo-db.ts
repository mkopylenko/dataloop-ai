import mongoose from 'mongoose';
import Database from '../interfaces/database.interface';

interface IData extends Document {
  region_name: string,
  city_code: number,
  city_name: string,
  street_code: number,
  street_name: string,
  street_name_status: string,
  official_code: number,
  streetId: number
}
class MongoDb implements Database {
  readonly dataSchema = new mongoose.Schema<IData>({
    region_name: String,
    city_code: Number,
    city_name: String,
    street_code: Number,
    street_name: String,
    street_name_status: String,
    official_code: Number,
    streetId: Number
  });

  readonly DataModel: mongoose.Model<IData> = mongoose.model<IData>('Data', this.dataSchema);

  async saveStreets(streets: IData[]): Promise<void> {
    try {
      await this.connect();

      const upsertOperations = streets.map(data => ({
        updateOne: {
            filter: { streetId: data.streetId },
            update: { $set: { ...data } },
            upsert: true
        }
      }));

      await this.DataModel.bulkWrite(upsertOperations);

      console.log('Data saved successfully');

   } catch (error) {
      console.error('Error saving data to MongoDB:', error);
   } finally {
      await mongoose.disconnect();
   }
  }

  private async connect() {
    await mongoose.connect(process.env.MONGO_URL ?? 'mongodb://localhost:27017/GEODB');
  }
    async selectDataByField(fieldName: keyof IData, fieldValue: any): Promise<IData[]> {
        try {
            await this.connect();
            return await this.DataModel.find({[fieldName]: fieldValue});
        } catch (error) {
            console.error(`Error selecting data by ${fieldName} from MongoDB:`, error);
            return [];
        } finally {
            await mongoose.disconnect();
        }
    }


    async deleteDataByField(fieldName: keyof IData, fieldValue: any) {
        try {
            await this.connect();
            const result = await this.DataModel.deleteMany({ [fieldName]: fieldValue });
            console.log(`Data deleted successfully by ${fieldName}:`, result);
        } catch (error) {
            console.error(`Error deleting data by ${fieldName} from MongoDB:`, error);
        } finally {
            await mongoose.disconnect();
        }
    }
}

export default MongoDb;

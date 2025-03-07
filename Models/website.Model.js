import mongoose, {Schema} from 'mongoose';

const WebsiteSchema = new Schema(
  {
    key: {
      type: String,
      unique: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
  }
);

const getFeaturedReports = async () => await Websites.findOne({"key": 'featured_reports'}, {'data': 1}).lean().exec({"virtuals": true})

const assignFeaturedReports = async (reportIds) => Websites.update(
  {"key": 'featured_reports'},
  {"data.reportIds": reportIds},
  {upsert: true}
);


const Websites = mongoose.model('Website', WebsiteSchema);

// Exporting model to external world
module.exports = {
  Websites,
  assignFeaturedReports,
  getFeaturedReports
};
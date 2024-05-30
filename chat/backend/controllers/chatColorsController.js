
const { Colorr , colorSchema } = require("../models/ColorsModal");


// saveColors Endpoint
module.exports.saveColors = async (req, res) => {
    try {
      const { companyPrefix , colors } = req.body;
      const connection = req.databaseConnection;
      const Color = connection.model('Color', colorSchema);
      await Color.updateOne({}, { $set: { colors } }, { upsert: true });
      res.json({ success: true, message: 'Colors saved successfully.' });
    } catch (error) {
      console.error('Error saving colors:', error);
      res.status(500).json({ success: false, message: 'Failed to save colors.' });
    }
  };

// retrievecolor endpoint ( get colors from teh db)
module.exports.retrieveColors = async (req, res, next) => {
    try {

      const connection = req.databaseConnection;
      const Color = connection.model('Color', colorSchema);
      const colorsDoc = await Color.findOne({});
      if (!colorsDoc) {
        return res.status(404).json({ success: false, message: 'Colors not found.' });
      }
      const colors = colorsDoc.colors;
      res.json({ success: true, colors });
    } catch (error) {
      console.error('Error fetching colors:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch colors.' });
    }
  };
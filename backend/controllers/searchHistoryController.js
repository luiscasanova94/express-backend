const { SearchHistory } = require('../db/models');

exports.createSearchHistory = async (req, res) => {
  try {
    const { date, keyword, type, resultType, state, response } = req.body;
    const newSearch = await SearchHistory.create({
      userId: req.user.id, 
      date,
      keyword,
      type,
      resultType,
      state,
      response 
    });
    res.status(201).json(newSearch);
  } catch (error) {
    res.status(500).json({ error: 'Error creating search history' });
  }
};


exports.getAllSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.findAll({ where: { userId: req.user.id } });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching search history' });
  }
};

exports.getSearchHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const search = await SearchHistory.findOne({ where: { id, userId: req.user.id } });
    if (search) {
      res.status(200).json(search);
    } else {
      res.status(404).json({ error: 'Search history not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching search history' });
  }
};

exports.updateSearchHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await SearchHistory.update(req.body, {
      where: { id, userId: req.user.id }
    });
    if (updated) {
      const updatedSearch = await SearchHistory.findOne({ where: { id } });
      res.status(200).json(updatedSearch);
    } else {
      res.status(404).json({ error: 'Search history not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating search history' });
  }
};

exports.deleteSearchHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SearchHistory.destroy({
      where: { id, userId: req.user.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Search history not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting search history' });
  }
};
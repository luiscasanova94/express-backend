const { TrackedPerson } = require('../db/models');

// Añadir una persona a la lista de monitoreo
exports.trackPerson = async (req, res) => {
  try {
    const { personData } = req.body;
    const dataAxleId = personData.id;

    const [trackedPerson, created] = await TrackedPerson.findOrCreate({
      where: { userId: req.user.id, dataAxleId: dataAxleId },
      defaults: {
        userId: req.user.id,
        dataAxleId: dataAxleId,
        personData: personData
      }
    });

    if (!created) {
      return res.status(200).json({ message: 'Person is already being tracked.', trackedPerson });
    }
    res.status(201).json(trackedPerson);
  } catch (error) {
    console.error('Error tracking person:', error);
    res.status(500).json({ error: 'Failed to track person.' });
  }
};

// Dejar de monitorear a una persona
exports.untrackPerson = async (req, res) => {
  try {
    const { dataAxleId } = req.params;
    const deleted = await TrackedPerson.destroy({
      where: { userId: req.user.id, dataAxleId: dataAxleId }
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Tracked person not found.' });
    }
  } catch (error) {
    console.error('Error untracking person:', error);
    res.status(500).json({ error: 'Failed to untrack person.' });
  }
};

// Obtener todas las personas monitoreadas por el usuario
exports.getTrackedPeople = async (req, res) => {
  try {
    const trackedPeople = await TrackedPerson.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(trackedPeople);
  } catch (error) {
    console.error('Error fetching tracked people:', error);
    res.status(500).json({ error: 'Failed to fetch tracked people.' });
  }
};

// Verificar si una persona específica está siendo monitoreada
exports.getTrackingStatus = async (req, res) => {
  try {
    const { dataAxleId } = req.params;
    const trackedPerson = await TrackedPerson.findOne({
      where: { userId: req.user.id, dataAxleId: dataAxleId }
    });
    res.status(200).json({ isTracking: !!trackedPerson });
  } catch (error) {
    console.error('Error fetching tracking status:', error);
    res.status(500).json({ error: 'Failed to fetch tracking status.' });
  }
};
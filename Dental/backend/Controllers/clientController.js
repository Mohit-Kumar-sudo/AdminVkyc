const Client = require('../Models/Client');

async function createClient(req, res) {
  try {
    const { name, email, contact, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const client = await Client.create({ name, email, contact, notes });
    return res.status(201).json(client);
  } catch (err) {
    console.error('Create client error:', err);
    return res.status(500).json({ error: 'Failed to create client' });
  }
}

async function listClients(req, res) {
  try {
    if (req.user.role === 'admin') {
      const clients = await Client.find({}).sort({ createdAt: -1 });
      return res.json(clients);
    }
    // subadmin: only their client
    const clients = await Client.find({ _id: req.user.client }).limit(1);
    return res.json(clients);
  } catch (err) {
    console.error('List clients error:', err);
    return res.status(500).json({ error: 'Failed to list clients' });
  }
}

async function getClient(req, res) {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (req.user.role !== 'admin' && client._id.toString() !== req.user.client) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json(client);
  } catch (err) {
    console.error('Get client error:', err);
    return res.status(500).json({ error: 'Failed to get client' });
  }
}

async function updateClient(req, res) {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { name, email, contact, notes } = req.body;
    if (name !== undefined) client.name = name;
    if (email !== undefined) client.email = email;
    if (contact !== undefined) client.contact = contact;
    if (notes !== undefined) client.notes = notes;
    await client.save();
    return res.json(client);
  } catch (err) {
    console.error('Update client error:', err);
    return res.status(500).json({ error: 'Failed to update client' });
  }
}

async function deleteClient(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    await Client.deleteOne({ _id: client._id });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete client error:', err);
    return res.status(500).json({ error: 'Failed to delete client' });
  }
}

module.exports = { createClient, listClients, getClient, updateClient, deleteClient };

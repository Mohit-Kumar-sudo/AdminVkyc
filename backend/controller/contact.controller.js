const Contact = require('../models/contact.model.js');


// Create and Save a new Contact
exports.create = (req, res) => {

    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "Contact content can not be empty"
        });
    }

    // Create a Contact
    const contact = new Contact({
        name:  req.body.name,
        number:  req.body.number,
        email:  req.body.email,
        subject: req.body.subject,
        message:  req.body.message,
    });

    // Save Contact in the database
    contact.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Contact."
        });
    });
};

// Retrieve and return all Contacts from the database.
exports.findAll = (req, res, next) => {
Contact.find()
    .then(contact => {
        res.send(contact);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving contact."
        });
    });
};

// // Find a single contact with a contactId
exports.findOne = (req, res) => {
Contact.findById(req.params.contactId)
    .then(contact => {
        console.log(contact)
        if(!contact) {
            return res.status(404).send({
                message: "contact not found with id " + req.params.contactId
            });            
        }
        res.send(contact);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "contact not found with id " + req.params.contactId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving contact with id " + req.params.contactId
        });
    });
};

// // Update a contact identified by the contactId in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.params.contactId || !req.body.name || !req.body.number || !req.body.email || !req.body.subject || !req.body.message) {
        return res.status(400).send({
            message: "Contact information cannot be empty"
        });
    }

    // Find contact and update it with the request body
    Contact.findByIdAndUpdate(req.params.contactId, {
        name: req.body.name,
        number: req.body.number,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
    }, { new: true })
    .then(contact => {
        if (!contact) {
            return res.status(404).send({
                message: "Contact not found with id " + req.params.contactId
            });
        }
        res.send(contact);
    }).catch(err => {
        if (err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Contact not found with id " + req.params.contactId
            });                
        }
        return res.status(500).send({
            message: "Error updating contact with id " + req.params.contactId
        });
    });
};

// // Delete a contact with the specified contactId in the request
exports.delete = (req, res) => {
Contact.findByIdAndDelete(req.params.contactId)
    .then(contact => {
        if(!contact) {
            return res.status(404).send({
                message: "contact not found with id " + req.params.contactId
            });
        }
        res.send({message: "contact deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "contact not found with id " + req.params.contactId
            });                
        }
        return res.status(500).send({
            message: "Could not delete contact with id " + req.params.contactId
        });
    });
};


// Delete all Contacts from the database.
exports.deleteAll = async (req, res) => {
    try {
        const result = await Contact.deleteMany({});
        if (result.deletedCount === 0) {
            res.status(404).send({ message: "No contacts found to delete." });
        } else {
            res.status(200).send({ message: "All contacts deleted successfully." });
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting contacts."
        });
    }
};
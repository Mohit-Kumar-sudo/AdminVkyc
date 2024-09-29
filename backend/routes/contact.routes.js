module.exports = (app) => {
    const contact = require('../controller/contact.controller.js');
    const {verifyToken} = require('../middleware/verifytokendata.js')

    // Create a new Note
    app.post('/contact', contact.create);

    // // Retrieve all contact
    app.get('/contact',verifyToken, contact.findAll);

    // // Retrieve a single Contact with contactId
    app.get('/contact/:contactId',verifyToken, contact.findOne);

    // // Update a Note with contactId
    app.put('/contact/:contactId',verifyToken, contact.update);

    // // Delete a Note with contactId
    app.delete('/contact/:contactId',verifyToken, contact.delete);

    // // Delete all contact
    app.delete('/contact',verifyToken, contact.deleteAll);
}

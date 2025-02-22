const app = require('./config/server');
const connection = require('./config/db');

require('./app/routes/test.js')(app);

app.listen(app.get('port'), () => {
    console.log("servidor en el puerto: ", app.get('port'));
})

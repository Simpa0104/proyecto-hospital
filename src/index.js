const app = require('./config/server');

app.listen(app.get('port'), () => {
    console.log("Servidor en puerto:", app.get('port'));
});
const app = require("../../config/server");
const bcryptjs = require("bcryptjs");
const connection = require("../../config/db");
const { render } = require("../../config/server");
const { redirect } = require("express/lib/response");

module.exports = app => {

    app.get('/Riesgo_alto', (req, res) => {
        res.render('test1.ejs');
    });

    app.get('/Riesgos', (req, res) => {
        res.render('test2.ejs');
    });

    app.get('/Historial_Test1', (req, res) => {
        connection.query('SELECT * FROM resultados_tests1', (err, result_tests1) => {
            res.render('historialt1.ejs', {
                test1: result_tests1,
            });
        });
    });

    app.get('/Historial_Test2', (req, res) => {
        connection.query('SELECT * FROM resultados_tests2', (err, result_tests2) => {
            res.render('historialt2.ejs', {
                test2: result_tests2
            });
        });
    });

    app.get('/deleteHistorial1/:idtest1',(req, res) => {
        const id= req.params.id;
        console.log(id);
        const queryDelete= ("DELETE FROM `test_1` WHERE `test_1`.`idtest1`");
        connection.query(queryDelete,[id], (err, result)=>{
            if(err){
                res.send(err);
            }else{
                res.redirect("/Historial_Test1");
            }
        });
    });

    app.get('/deleteHistorial2/:idtest2',(req, res) => {
        const id= req.params.id;
        console.log(id);
        const queryDelete= ("DELETE FROM `test_2` WHERE `test_2`.`idtest2`");
        connection.query(queryDelete,[id], (err, result)=>{
            if(err){
                res.send(err);
            }else{
                res.redirect("/Historial_Test2");
            }
        });
    });

    app.post('/formulario1', async (req, res) => {
        const { nombre, episodio, pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, pregunta6 } = req.body;

        let riesgo1 = "Psicológico/Social";
        let riesgo2 = "Psicológico/Biológico/Social";
        let riesgo3 = "Ninguno";

        connection.query('INSERT INTO test_1 SET ?', {
            nombre: nombre,
            episodio: episodio,
            pregunta1: pregunta1,
            pregunta2: pregunta2,
            pregunta3: pregunta3,
            pregunta4: pregunta4,
            pregunta5: pregunta5,
            pregunta6: pregunta6

        }, async (error, results) => {
            if (error) {
                console.log(error);
            } else {

                if (pregunta1 === "1" || pregunta2 === "1" || pregunta3 === "1" || pregunta4 === "1" || pregunta5 === "1" || pregunta6 === "1") {
                    connection.query('SELECT MAX(idtest1) AS id FROM test_1', (err, result) => {

                        if (pregunta1 === "1" && pregunta3 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta1 === "1" && pregunta4 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta1 === "1" && pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta2 === "1" && pregunta3 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta2 === "1" && pregunta4 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta2 === "1" && pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta6 === "1" && pregunta3 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta6 === "1" && pregunta4 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta6 === "1" && pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta1 === "1" || pregunta2 === "1" || pregunta6 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo1,
                                idtest1: result[0].id
                            });
                        } else if (pregunta3 === "1" || pregunta4 === "1" || pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo3,
                                idtest1: result[0].id
                            });
                        }
                    });

                    res.redirect("/Riesgo_alto");
                    
                } else {
                    connection.query('SELECT MAX(idtest1) AS id FROM test_1', (err, result) => {

                        if (pregunta1 === "1" && pregunta3 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta1 === "1" && pregunta4 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta1 === "1" && pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta2 === "1" && pregunta3 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta2 === "1" && pregunta4 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta2 === "1" && pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta6 === "1" && pregunta3 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta6 === "1" && pregunta4 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta6 === "1" && pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else if (pregunta1 === "1" || pregunta2 === "1" || pregunta6 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo1,
                                idtest1: result[0].id
                            });
                        } else if (pregunta3 === "1" || pregunta4 === "1" || pregunta5 === "1") {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo2,
                                idtest1: result[0].id
                            });
                        } else {
                            connection.query('INSERT INTO resultados_tests1 SET ?', {
                                nombre_completo: nombre,
                                episodio: episodio,
                                riesgo_form1: riesgo3,
                                idtest1: result[0].id
                            });
                        }
                    });

                    res.redirect("/Riesgos");
                }
            }
        });
    });

    app.post('/formulario2', async (req, res) => {

        const { pregunta7, pregunta8, pregunta9, pregunta10, pregunta11, pregunta12 } = req.body;

        let riesgo1 = "ALTO Psicológico";
        let riesgo2 = "ALTO Biológico";
        let riesgo3 = "ALTO Social";
        let riesgo4 = "MEDIO Psicológico";
        let riesgo5 = "MEDIO Biológico";
        let riesgo6 = "MEDIO Social";

        connection.query('INSERT INTO test_2 SET ?', {

            pregunta7: pregunta7,
            pregunta8: pregunta8,
            pregunta9: pregunta9,
            pregunta10: pregunta10,
            pregunta11: pregunta11,
            pregunta12: pregunta12


        }, async (error, results) => {
            if (error) {
                console.log(error);

            } else {
                connection.query('SELECT MAX(idtest1) AS id1 FROM test_1', (err, id1result) => {
                    connection.query('SELECT MAX(idtest2) AS id2 FROM test_2', (err, id2result) => {
                        connection.query('SELECT nombre, episodio FROM test_1 WHERE idtest1 = ?', [id1result[0].id1], (err, result) => {

                            if (pregunta7 === "2") {
                                connection.query('INSERT INTO resultados_tests2 SET ?', {
                                    nombre_completo: result[0].nombre,
                                    episodio: result[0].episodio,
                                    riesgo_form2: riesgo1,
                                    idtest2: id2result[0].id2
                                });
                            }
                            else if (pregunta7 === "0") {
                                connection.query('INSERT INTO resultados_tests2 SET ?', {
                                    nombre_completo: result[0].nombre,
                                    episodio: result[0].episodio,
                                    riesgo_form2: riesgo4,
                                    idtest2: id2result[0].id2
                                });
                            }
                            if (pregunta8 === "2" || pregunta9 === "2") {
                                connection.query('INSERT INTO resultados_tests2 SET ?', {
                                    nombre_completo: result[0].nombre,
                                    episodio: result[0].episodio,
                                    riesgo_form2: riesgo2,
                                    idtest2: id2result[0].id2
                                });
                            }
                            else if (pregunta8 === "0" || pregunta9 === "0") {
                                connection.query('INSERT INTO resultados_tests2 SET ?', {
                                    nombre_completo: result[0].nombre,
                                    episodio: result[0].episodio,
                                    riesgo_form2: riesgo5,
                                    idtest2: id2result[0].id2
                                });
                            }
                            if (pregunta10 === "2" || pregunta11 === "2" || pregunta12 === "2") {
                                connection.query('INSERT INTO resultados_tests2 SET ?', {
                                    nombre_completo: result[0].nombre,
                                    episodio: result[0].episodio,
                                    riesgo_form2: riesgo3,
                                    idtest2: id2result[0].id2
                                });
                            }
                            else if (pregunta10 === "0" || pregunta11 === "0" || pregunta12 === "0") {
                                connection.query('INSERT INTO resultados_tests2 SET ?', {
                                    nombre_completo: result[0].nombre,
                                    episodio: result[0].episodio,
                                    riesgo_form2: riesgo6,
                                    idtest2: id2result[0].id2
                                });
                            }

                            res.redirect('/Riesgo_alto');
                        });
                    });
                });
            }
        });
    });

}

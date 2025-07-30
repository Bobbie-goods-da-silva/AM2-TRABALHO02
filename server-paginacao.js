const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.get('/usuarios', (req, res) => {
    fs.readFile('./usuarios.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler arquivo');
        }
        const usuarios = JSON.parse(data);
        res.json(usuarios); // Retorna todos os registros
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
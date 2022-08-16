const express = require('express');
const { listarContas, criarConta, deletarConta, atualizarConta, depositar, sacar, transferir, saldo, extrato } = require('../controladores/contas.js');
const validarSenha = require('../intermediarios/validarSenha.js');
const { verificarDadosQuery, verificarDepositoSaque, verificarDadosBody } = require('../intermediarios/verificacoes.js');

const rotas = express();

//CONTAS
rotas.get('/contas', validarSenha, listarContas);
rotas.post('/contas', verificarDadosBody, criarConta);
rotas.put('/contas/:numero_conta', verificarDadosBody, atualizarConta);
rotas.delete('/contas/:numero_conta', deletarConta);
rotas.get('/contas/saldo', verificarDadosQuery, saldo);
rotas.get('/contas/extrato', verificarDadosQuery, extrato);

//TRANSACOES
rotas.post('/transacoes/depositar', verificarDepositoSaque, depositar);
rotas.post('/transacoes/sacar', verificarDepositoSaque, sacar);
rotas.post('/transacoes/transferir', transferir);


module.exports = rotas;
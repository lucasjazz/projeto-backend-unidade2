const banco = require('../bancodedados');

const verificarDadosBody = (req, res, next) => {
    const { nome, cpf, email, data_nascimento, telefone, senha } = req.body;
    if (!nome) return res.status(401).json({ mensagem: 'nome obrigatório.' });
    if (!cpf) return res.status(401).json({ mensagem: 'cpf obrigatório.' });
    if (!email) return res.status(401).json({ mensagem: 'email obrigatório.' });
    if (!data_nascimento) return res.status(401).json({ mensagem: 'data de nascimento obrigatório.' });
    if (!telefone) return res.status(401).json({ mensagem: 'telefone obrigatório.' });
    if (!senha) return res.status(401).json({ mensagem: 'senha obrigatório.' });
    next();
};
const verificarDepositoSaque = (req, res, next) => {
    const { numero_conta, valor } = req.body;
    if (!numero_conta || !valor) return res.status(401).json({ mensagem: 'O valor e o numero da conta são obrigatórios.' });
    if (valor <= 0) return res.status(401).json({ mensagem: 'O deposito tem que ser maior que zero.' });
    next();
};
const verificarDadosQuery = (req, res, next) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) return res.status(401).json({ mensagem: 'É necessário informar o número da conta e a senha no query.' });

    let conta = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });
    if (!conta) return res.status(401).json({ mensagem: 'Conta não encontrada.' });
    if (Number(numero_conta) !== conta.numero) return res.status(401).json({ mensagem: 'Número da conta não existe.' });
    if (senha !== conta.senha) return res.status(401).json({ mensagem: 'Senha incorreta.' });
    next();
};

module.exports = {
    verificarDadosBody,
    verificarDepositoSaque,
    verificarDadosQuery
};
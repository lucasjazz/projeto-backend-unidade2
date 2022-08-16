const banco = require('../bancodedados');
const { format } = require('date-fns');
const data = new Date();
const dataFormat = format(data, "dd MMM yyyy - HH:mm");

const listarContas = async (req, res) => {
    return res.json(banco.contas);
};
const criarConta = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const verificarConta = banco.contas.find((conta) => {
        return conta.cpf === cpf || conta.email === email;
    });
    if (verificarConta) return res.status(401).json({ mensagem: 'Já existe uma conta com o cpf ou e-mail informado!' });
    const novaConta = {
        numero: banco.numero++,
        saldo: 0,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    };
    banco.contas.push(novaConta);
    return res.status(201).json({ mensagem: 'Conta criada com sucesso!' });
};
const atualizarConta = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const { numero_conta } = req.params;

    let conta = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });
    if (!conta) return res.status(401).json({ mensagem: 'conta não existe.' });
    const verificarConta = banco.contas.find((conta) => {
        return conta.cpf === cpf || conta.email === email;
    });
    if (verificarConta && verificarConta.numero !== conta.numero) return res.status(401).json({ mensagem: 'Dados já cadastrados!' });
    conta.nome = nome;
    conta.cpf = cpf;
    conta.data_nascimento = data_nascimento;
    conta.telefone = telefone;
    conta.email = email;
    conta.senha = senha;
    return res.json({ mensagem: 'Conta atualizada com sucesso!' });
};
const deletarConta = async (req, res) => {
    const { numero_conta } = req.params;

    const conta = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });
    if (!conta) return res.status(401).json({ mensagem: 'conta não existe.' });
    if (conta.saldo !== 0) return res.status(401).json({ mensagem: 'Seu saldo precisa ser 0' });

    banco.contas = banco.contas.filter((x) => {
        return conta.numero !== x.numero
    });
    return res.status(204).send()
};
const depositar = async (req, res) => {
    const { numero_conta, valor } = req.body;

    let conta = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });
    if (!conta) return res.status(401).json({ mensagem: 'conta não existe.' });
    conta.saldo += valor;
    const deposito = {
        data: dataFormat,
        numero_conta: conta.numero,
        valor: valor
    };
    banco.depositos.push(deposito);
    return res.status(201).json(deposito);
};
const sacar = async (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!senha) return res.status(401).json({ mensagem: 'Por favor informe a senha' });
    let conta = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });
    if (!conta) return res.status(401).json({ mensagem: 'Conta não existe.' });
    if (conta.senha !== senha) return res.status(401).json({ mensagem: 'Senha incorreta.' });
    if (valor > conta.saldo) return res.status(403).json({ mensagem: 'Saldo insuficiente.' });
    conta.saldo -= valor;
    const saque = {
        data: dataFormat,
        numero_conta: conta.numero,
        valor: valor
    };
    banco.saques.push(saque);
    return res.status(201).json(saque);
};
const transferir = async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) return res.status(401).json({ mensagem: 'Todos os campos são obrigatórios.' });
    if (valor <= 0) return res.status(401).json({ mensagem: 'A transferência precisa ser maior que zero.' });

    let contaOrigem = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta_origem);
    });
    let contaDestino = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta_destino);
    });
    if (contaOrigem === contaDestino) return res.status(404).json({ mensagem: 'Não é possivel enviar valores para a mesma conta.' });
    if (!contaOrigem) return res.status(401).json({ mensagem: 'Conta de origem não encontrada.' });
    if (!contaDestino) return res.status(401).json({ mensagem: 'Conta de destino não encontrada.' });
    if (valor > contaOrigem.saldo) return res.status(401).json({ mensagem: 'Saldo insuficiente para realizar transação.' });
    if (contaOrigem.senha !== senha) return res.status(401).json({ mensagem: 'Senha incorreta.' });

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const tranferencia = {
        data: dataFormat,
        numero_conta_origem: contaOrigem.numero,
        numero_conta_destino: contaDestino.numero,
        valor
    };
    banco.transferencias.push(tranferencia);
    return res.status(200).send(tranferencia);
};
const saldo = async (req, res) => {
    const { numero_conta, senha } = req.query;
    let conta = banco.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });
    return res.status(200).json({ saldo: conta.saldo });
};
const extrato = async (req, res) => {
    const { numero_conta, senha } = req.query;

    const filtroDepositos = banco.depositos.filter((deposito) => {
        return deposito.numero_conta === Number(numero_conta);
    });
    const filtroSaques = banco.saques.filter((saque) => {
        return saque.numero_conta === Number(numero_conta);
    });
    const filtroTransferenciasEnviadas = banco.transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === Number(numero_conta);
    });
    const filtroTransferenciasRecebidas = banco.transferencias.filter((transferencia) => {
        return transferencia.numero_conta_destino === Number(numero_conta);
    });
    const extrato = [
        { depositos: filtroDepositos },
        { saques: filtroSaques },
        { transferenciasEnviadas: filtroTransferenciasEnviadas },
        { transferenciasRecebidas: filtroTransferenciasRecebidas }
    ];
    return res.json(extrato);
};
module.exports = {
    listarContas,
    criarConta,
    atualizarConta,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
};
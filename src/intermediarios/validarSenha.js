const { banco } = require("../bancodedados.js");

const validarSenha = (req, res, next) => {
    const { senha_banco } = req.query;
    if (!senha_banco) {
        return res.status(401).json({ mensagem: "Senha do banco obrigatória!" });
    };

    if (senha_banco !== banco.senha) {
        return res.status(401).json({ mensagem: "Senha incorreta!" });
    };
    next();
};

module.exports = validarSenha;
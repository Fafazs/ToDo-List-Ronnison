const bcrypt = require("bcrypt");

const supabase = require("../config/supaBase");

// REGISTER
async function register(req, res) {
  const { user, email, password } = req.body;

  console.log(user, email, password);

  if (!user || !email || !password) {
    return res.status(400).json({
      message: "Preencha todos os campos.",
    });
  }

  try {
    // VERIFICAR SE JÁ EXISTE
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        message: "Usuário já existe.",
      });
    }

    // CRIPTOGRAFAR SENHA
    const hashedPassword = await bcrypt.hash(password, 10);

    // INSERIR NO BANCO
    const { error } = await supabase.from("users").insert([
      {
        username: user,
        email,
        password: hashedPassword,
      },
    ]);
    console.log(user, email, password);
    
    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(201).json({
      message: "Usuário criado com sucesso!",
    });
  } catch (error) {

    console.log(error);

    res.status(500).json({
        message: error.message
    });
  }
}



// LOGIN
async function login(req, res) {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({
      message: "Preencha todos os campos.",
    });
  }

  try {
    // BUSCAR USUÁRIO
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", user)
      .single();

    if (error || !existingUser) {
      return res.status(404).json({
        message: "Usuário não encontrado.",
      });
    }

    // COMPARAR SENHA
    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Senha incorreta.",
      });
    }

    res.status(200).json({
      message: "Login realizado com sucesso!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}

module.exports = {
  register,
  login,
};

// Módulo de Interface
const ui = {
    elements: {
      loginContainer: document.getElementById('login-container'),
      registerContainer: document.getElementById('register-container'),
      financeContainer: document.getElementById('finance-container'),
      profileContainer: document.getElementById('profile-container'),
      recoverContainer: document.getElementById('recover-container'),
      resetContainer: document.getElementById('reset-container'),
      balanceElement: document.getElementById('balance'),
      transactionsElement: document.getElementById('transactions'),
      financeChartElement: document.getElementById('financeChart').getContext('2d')
    },
    financeChart: null,
  
    showLogin: function() {
      this.hideAll();
      this.elements.loginContainer.style.display = 'block';
      document.getElementById('login-form').reset();
      this.clearErrors('login');
    },
  
    showRegister: function() {
      this.hideAll();
      this.elements.registerContainer.style.display = 'block';
      document.getElementById('register-form').reset();
      this.clearErrors('register');
    },
  
    showRecover: function() {
      this.hideAll();
      this.elements.recoverContainer.style.display = 'block';
      document.getElementById('recover-form').reset();
      this.clearErrors('recover');
      document.getElementById('recover-instructions').className = '';
      document.getElementById('recover-instructions').textContent = 'Digite seu e-mail para receber o link de recuperação';
    },
  
    showReset: function(token) {
      this.hideAll();
      this.elements.resetContainer.style.display = 'block';
      document.getElementById('reset-form').reset();
      this.clearErrors('reset');
      sessionStorage.setItem('resetToken', token);
    },
  
    showFinance: function() {
      this.hideAll();
      this.elements.financeContainer.style.display = 'block';
      finance.updateUI();
    },
  
    showProfile: function() {
      this.hideAll();
      this.elements.profileContainer.style.display = 'block';
      document.getElementById('current-username').textContent = auth.currentUser;
    },
  
    hideAll: function() {
      for (const key in this.elements) {
        if (key.includes('Container')) {
          this.elements[key].style.display = 'none';
        }
      }
    },
  
    clearErrors: function(formType) {
      const errorElements = document.querySelectorAll(`#${formType}-form .error-message`);
      errorElements.forEach(el => el.textContent = '');
    },
  
    showSuccessMessage: function(elementId, message) {
      const element = document.getElementById(elementId);
      element.className = 'success-message';
      element.textContent = message;
    }
  };
  
  // Módulo de Autenticação
  const auth = {
    currentUser: localStorage.getItem('currentUser') || null,
    users: JSON.parse(localStorage.getItem('users')) || [],
    recoveryTokens: JSON.parse(localStorage.getItem('recoveryTokens')) || {},
  
    validateEmail: function(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
  
    generateToken: function() {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
  
    login: function() {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const emailError = document.getElementById('login-email-error');
      const passwordError = document.getElementById('login-password-error');
  
      emailError.textContent = '';
      passwordError.textContent = '';
  
      if (!email) {
        emailError.textContent = 'Por favor, insira seu e-mail.';
        return;
      }
  
      if (!this.validateEmail(email)) {
        emailError.textContent = 'Por favor, insira um e-mail válido.';
        return;
      }
  
      if (!password) {
        passwordError.textContent = 'Por favor, insira sua senha.';
        return;
      }
  
      const user = this.users.find(user => user.email === email && user.password === password);
  
      if (user) {
        this.currentUser = email;
        localStorage.setItem('currentUser', this.currentUser);
        ui.showFinance();
      } else {
        passwordError.textContent = 'E-mail ou senha incorretos.';
      }
    },
  
    register: function() {
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      const nameError = document.getElementById('register-name-error');
      const emailError = document.getElementById('register-email-error');
      const passwordError = document.getElementById('register-password-error');
      const confirmPasswordError = document.getElementById('register-confirm-password-error');
  
      nameError.textContent = '';
      emailError.textContent = '';
      passwordError.textContent = '';
      confirmPasswordError.textContent = '';
  
      let isValid = true;
  
      if (!name) {
        nameError.textContent = 'Por favor, insira seu nome completo.';
        isValid = false;
      }
  
      if (!email) {
        emailError.textContent = 'Por favor, insira seu e-mail.';
        isValid = false;
      } else if (!this.validateEmail(email)) {
        emailError.textContent = 'Por favor, insira um e-mail válido.';
        isValid = false;
      }
  
      if (!password) {
        passwordError.textContent = 'Por favor, insira uma senha.';
        isValid = false;
      } else if (password.length < 6) {
        passwordError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        isValid = false;
      }
  
      if (!confirmPassword) {
        confirmPasswordError.textContent = 'Por favor, confirme sua senha.';
        isValid = false;
      } else if (password !== confirmPassword) {
        confirmPasswordError.textContent = 'As senhas não coincidem.';
        isValid = false;
      }
  
      if (!isValid) return;
  
      if (this.users.find(user => user.email === email)) {
        emailError.textContent = 'Este e-mail já está cadastrado.';
        return;
      }
  
      this.users.push({ name, email, password });
      localStorage.setItem('users', JSON.stringify(this.users));
      alert('Cadastro realizado com sucesso!');
      ui.showLogin();
    },
  
    sendRecoveryEmail: async function() {
      const email = document.getElementById('recover-email').value.trim();
      const emailError = document.getElementById('recover-email-error');
      const instructions = document.getElementById('recover-instructions');
  
      emailError.textContent = '';
      instructions.className = '';
      instructions.textContent = 'Enviando e-mail...';
  
      if (!email) {
        emailError.textContent = 'Por favor, insira seu e-mail.';
        return;
      }
  
      if (!this.validateEmail(email)) {
        emailError.textContent = 'Por favor, insira um e-mail válido.';
        return;
      }
  
      const userExists = this.users.some(user => user.email === email);
      if (!userExists) {
        emailError.textContent = 'E-mail não cadastrado no sistema.';
        return;
      }
  
      const token = this.generateToken();
      const expiration = Date.now() + 3600000;
  
      this.recoveryTokens[email] = { token, expires: expiration };
      localStorage.setItem('recoveryTokens', JSON.stringify(this.recoveryTokens));
  
      const result = await emailService.sendRecoveryEmail(email, token);
      
      if (result.success) {
        ui.showSuccessMessage('recover-instructions', `E-mail enviado para ${email}. Verifique sua caixa de entrada.`);
        
        // Para testes (aparece no console)
        console.log(`Token gerado: ${token}`);
        console.log(`Link de recuperação: ${window.location.origin}?token=${token}&email=${encodeURIComponent(email)}`);
      } else {
        instructions.className = 'error-message';
        instructions.textContent = result.error || 'Erro ao enviar e-mail. Tente novamente.';
      }
    },
  
    resetPassword: function() {
      const newPassword = document.getElementById('reset-password').value;
      const confirmPassword = document.getElementById('reset-confirm-password').value;
      const passwordError = document.getElementById('reset-password-error');
      const confirmPasswordError = document.getElementById('reset-confirm-password-error');
  
      passwordError.textContent = '';
      confirmPasswordError.textContent = '';
  
      let isValid = true;
  
      if (!newPassword) {
        passwordError.textContent = 'Por favor, insira uma nova senha.';
        isValid = false;
      } else if (newPassword.length < 6) {
        passwordError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        isValid = false;
      }
  
      if (!confirmPassword) {
        confirmPasswordError.textContent = 'Por favor, confirme a nova senha.';
        isValid = false;
      } else if (newPassword !== confirmPassword) {
        confirmPasswordError.textContent = 'As senhas não coincidem.';
        isValid = false;
      }
  
      if (!isValid) return;
  
      const token = sessionStorage.getItem('resetToken');
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');
      
      if (!token && !email) {
        alert('Token inválido ou expirado. Solicite um novo link de recuperação.');
        ui.showRecover();
        return;
      }
  
      const tokenData = this.recoveryTokens[email];
      if (!tokenData || tokenData.token !== token || tokenData.expires < new Date().getTime()) {
        alert('Token inválido ou expirado. Solicite um novo link de recuperação.');
        ui.showRecover();
        return;
      }
  
      this.users = this.users.map(user => {
        if (user.email === email) {
          return { ...user, password: newPassword };
        }
        return user;
      });
  
      localStorage.setItem('users', JSON.stringify(this.users));
      
      delete this.recoveryTokens[email];
      localStorage.setItem('recoveryTokens', JSON.stringify(this.recoveryTokens));
      sessionStorage.removeItem('resetToken');
  
      alert('Senha redefinida com sucesso!');
      ui.showLogin();
    },
  
    checkRecoveryToken: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');
  
      if (token && email) {
        const tokenData = this.recoveryTokens[email];
        
        if (tokenData && tokenData.token === token && tokenData.expires > new Date().getTime()) {
          ui.showReset(token);
          return true;
        } else {
          alert('Token inválido ou expirado. Solicite um novo link de recuperação.');
          ui.showRecover();
          return false;
        }
      }
      return false;
    },
  
    changePassword: function() {
      const newPassword = document.getElementById('new-password').value;
  
      if (!newPassword) {
        alert('Por favor, insira uma nova senha.');
        return;
      }
  
      if (newPassword.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
  
      this.users = this.users.map(user => {
        if (user.email === this.currentUser) {
          return { ...user, password: newPassword };
        }
        return user;
      });
  
      localStorage.setItem('users', JSON.stringify(this.users));
      alert('Senha alterada com sucesso!');
    },
  
    logout: function() {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      ui.showLogin();
    }
  };
  
  // Módulo de Finanças
  const finance = {
    transactions: JSON.parse(localStorage.getItem('transactions')) || [],
  
    addTransaction: function() {
      const date = document.getElementById('date').value;
      const description = document.getElementById('description').value;
      const amount = document.getElementById('amount').value;
      const type = document.getElementById('type').value;
  
      if (!date || !description || !amount || isNaN(amount)) {
        alert('Preencha todos os campos corretamente!');
        return;
      }
  
      const transaction = { 
        date, 
        description, 
        amount: parseFloat(amount), 
        type, 
        user: auth.currentUser 
      };
      
      this.transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(this.transactions));
      this.updateUI();
    },
  
    removeTransaction: function(index) {
      this.transactions.splice(index, 1);
      localStorage.setItem('transactions', JSON.stringify(this.transactions));
      this.updateUI();
    },
  
    updateUI: function() {
      const userTransactions = this.transactions.filter(
        transaction => transaction.user === auth.currentUser
      );
      
      const balance = userTransactions.reduce((acc, transaction) => {
        return transaction.type === 'income' ? 
          acc + transaction.amount : 
          acc - transaction.amount;
      }, 0);
      
      ui.elements.balanceElement.textContent = balance.toFixed(2);
      
      ui.elements.transactionsElement.innerHTML = userTransactions
        .map((transaction, index) => `
          <div class="transaction-item">
            <strong>${transaction.description}</strong><br>
            Data: ${transaction.date}<br>
            Valor: R$ ${transaction.amount.toFixed(2)} (${transaction.type === 'income' ? 'Entrada' : 'Saída'})
            <button onclick="finance.removeTransaction(${index})" class="remove-btn">Remover</button>
          </div>
        `).join('');
  
      this.updateChart(userTransactions);
    },
  
    updateChart: function(userTransactions) {
      const income = userTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
        
      const expense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
  
      if (ui.financeChart) {
        ui.financeChart.destroy();
      }
  
      ui.financeChart = new Chart(ui.elements.financeChartElement, {
        type: 'doughnut',
        data: {
          labels: ['Entradas', 'Saídas'],
          datasets: [{
            data: [income, expense],
            backgroundColor: ['#00b894', '#d63031'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }
  };
  
  // Inicialização da aplicação
  document.addEventListener('DOMContentLoaded', function() {
    if (auth.currentUser) {
      ui.showFinance();
    } else {
      ui.showLogin();
      auth.checkRecoveryToken();
    }
  });
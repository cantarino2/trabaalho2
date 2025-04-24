const emailService = {
    config: {
        userID: 'user_XXXXXXXXXXXXXXXX', // Cole seu User ID aqui
        serviceID: 'service_XXXXXXXX',   // Cole seu Service ID aqui
        templateID: 'template_XXXXXXXX', // Cole seu Template ID aqui
        senderEmail: 'cantarinogeandra@gmail.com',
        appName: 'Gerenciador de Finanças'
      },
  
    init: function() {
      try {
        emailjs.init(this.config.userID);
        console.log('EmailJS inicializado com sucesso');
        return true;
      } catch (error) {
        console.error('Erro ao inicializar EmailJS:', error);
        return false;
      }
    },
  
    sendRecoveryEmail: async function(recipientEmail, token) {
      if (!this.init()) {
        return this.simulateEmailSending(recipientEmail, token);
      }
  
      try {
        const templateParams = {
          to_email: recipientEmail,
          from_name: this.config.appName,
          from_email: this.config.senderEmail,
          reply_to: this.config.senderEmail,
          reset_link: `${window.location.href.split('?')[0]}?token=${token}&email=${encodeURIComponent(recipientEmail)}`,
          token: token,
          app_name: this.config.appName
        };
  
        console.log('Enviando e-mail de recuperação para:', recipientEmail);
        
        const response = await emailjs.send(
          this.config.serviceID,
          this.config.templateID,
          templateParams
        );
  
        console.log('E-mail enviado com sucesso:', response);
        return { success: true };
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        return {
          success: false,
          error: 'Erro ao enviar e-mail. Tente novamente mais tarde.'
        };
      }
    },
  
    simulateEmailSending: function(recipientEmail, token) {
      console.group('[SIMULAÇÃO] Email de Recuperação');
      console.log('De:', this.config.senderEmail);
      console.log('Para:', recipientEmail);
      console.log('Token:', token);
      console.log('Link:', `${window.location.href.split('?')[0]}?token=${token}&email=${encodeURIComponent(recipientEmail)}`);
      console.groupEnd();
      
      return Promise.resolve({
        success: true,
        simulated: true,
        message: 'E-mail simulado (modo desenvolvimento)'
      });
    }
  };
  
  // Fallback para desenvolvimento
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS não encontrado - ativando modo simulação');
    window.emailjs = {
      init: () => console.log('Simulação: EmailJS inicializado'),
      send: (service, template, params) => {
        console.log('Simulação: EmailJS.send()', { service, template, params });
        return Promise.resolve({ status: 200, text: 'OK (simulado)' });
      }
    };
  }
  
  // Inicializa o serviço
  document.addEventListener('DOMContentLoaded', function() {
    emailService.init();
  });
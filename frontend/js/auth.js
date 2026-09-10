document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginMsg = document.getElementById('login-message');
  const registerMsg = document.getElementById('register-message');

  function showMessage(el, msg) {
    if (el) {
      el.textContent = msg;
      el.classList.remove('hidden');
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginMsg.classList.add('hidden');
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const btn = loginForm.querySelector('button');
      btn.textContent = 'Logging in...';

      try {
        const { status, data } = await fetchAPI('/auth/login', {
          method: 'POST',
         body: JSON.stringify({ emailOrUsername: email, password })
        });

        if (status === 200 && data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = 'index.html';
        } else {
          showMessage(loginMsg, data.message || 'Login failed');
          if (typeof showToast === 'function') showToast(data.message || 'Login failed', 'error');
        }
      } catch (err) {
        showMessage(loginMsg, 'An error occurred');
      } finally {
        btn.textContent = 'Log In';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      registerMsg.classList.add('hidden');
      
      const name = document.getElementById('name').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const btn = registerForm.querySelector('button');

      if (password !== confirmPassword) {
        showMessage(registerMsg, 'Passwords do not match');
        return;
      }

      btn.textContent = 'Signing up...';

      try {
        const { status, data } = await fetchAPI('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, username, email, password })
        });

        if (status === 201 && data.success) {
          window.location.href = 'login.html';
        } else {
          showMessage(registerMsg, data.message || 'Registration failed');
          if (typeof showToast === 'function') showToast(data.message || 'Registration failed', 'error');
        }
      } catch (err) {
        showMessage(registerMsg, 'An error occurred during registration');
      } finally {
        btn.textContent = 'Sign Up';
      }
    });
  }
});

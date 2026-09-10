document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authMessage = document.getElementById('auth-message');

  function showMessage(msg, isError = false) {
    if (!authMessage) return;
    authMessage.textContent = msg;
    authMessage.className = `alert ${isError ? 'alert-error' : 'alert-success'} mb-1`;
    authMessage.classList.remove('hidden');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailOrUsername = document.getElementById('emailOrUsername').value;
      const password = document.getElementById('password').value;

      try {
        const { status, data } = await fetchAPI('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ emailOrUsername, password }),
        });

        if (status === 200 && data.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data));
          window.location.href = 'index.html';
        } else {
          showMessage(data.message || 'Login failed', true);
        }
      } catch (error) {
        showMessage('An error occurred during login', true);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        showMessage('Passwords do not match', true);
        return;
      }

      try {
        const { status, data } = await fetchAPI('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, username, email, password }),
        });

        if (status === 201 && data.success) {
          showMessage('Registration successful! Redirecting to login...', false);
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        } else {
          showMessage(data.message || 'Registration failed', true);
        }
      } catch (error) {
        showMessage('An error occurred during registration', true);
      }
    });
  }
});

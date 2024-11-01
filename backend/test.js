fetch('http://localhost:3000/answer/2', {
  method: 'GET',
  headers: {
    'x-secret-key': 'your_secret_key',
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));

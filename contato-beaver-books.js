async function handleSubmit(e){
  e.preventDefault();

  const lgpd=document.getElementById('lgpd');
  if(!lgpd.checked){
    lgpd.focus();
    alert('Por favor, aceite a política de privacidade para continuar.');
    return;
  }

  const btn = document.querySelector('.btn-cta');
  btn.textContent = 'Enviando…';
  btn.disabled = true;

  const fileInput = document.getElementById('file-input');
  const arquivo = fileInput.files[0] ? fileInput.files[0].name : null;

  const dados = {
    nome:       document.getElementById('nome').value,
    email:      document.getElementById('email').value,
    whatsapp:   document.getElementById('whatsapp').value,
    cidade:     document.getElementById('cidade').value,
    objetivo:   document.getElementById('objetivo').value,
    genero:     document.getElementById('genero')?.value || null,
    finalizado: document.querySelector('input[name="finalizado"]:checked')?.value || null,
    paginas:    document.getElementById('paginas')?.value || null,
    obj_livro:  document.getElementById('obj_livro')?.value || null,
    prazo:      document.getElementById('prazo')?.value || null,
    mensagem:   document.getElementById('mensagem').value,
    arquivo,
  };

  try {
    const res = await fetch('/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (res.ok) {
      document.getElementById('contact-form').style.display = 'none';
      document.getElementById('success-msg').classList.add('show');
      window.scrollTo({top:document.getElementById('form').offsetTop-80,behavior:'smooth'});
    } else {
      throw new Error('Erro no servidor');
    }
  } catch (err) {
    alert('Erro ao enviar. Tente novamente.');
    btn.textContent = 'Enviar para análise gratuita';
    btn.disabled = false;
  }
}

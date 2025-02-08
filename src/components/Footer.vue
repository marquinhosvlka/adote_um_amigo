<template>
<div class="flex-container">
  <div class="content">
    <!-- Conteúdo principal da página -->
  </div>
  <footer class="bg-green-500 text-white py-4 mt-8">
    <div class="container mx-auto px-4 text-center">
      <p class="text-sm">
        <span>Adote um Amigo - Todos os direitos reservados.</span>
      </p>
      <p class="text-xs mt-2">
        Desenvolvido com ❤️ por Adote um Amigo
      </p>
    </div>
  </footer>
</div>
</template>

<script setup>
// Coloque lógica adicional aqui, se necessário
</script>

<style scoped>
/* Configuração do Flexbox para manter o footer na parte inferior */
.flex-container {
display: flex;
flex-direction: column;
min-height: 100vh;
}

.content {
flex: 1;
}

/* Estilos do footer */
footer {
background-color: #4CAF50;
color: white;
padding: 16px 0;
margin-top: 32px;
}

footer p {
margin: 0;
}

footer .container {
max-width: 1200px;
margin-left: auto;
margin-right: auto;
}

footer .text-center {
text-align: center;
}

footer .text-sm {
font-size: 14px;
}

footer .text-xs {
font-size: 12px;
}

footer .mt-2 {
margin-top: 8px;
}
</style>

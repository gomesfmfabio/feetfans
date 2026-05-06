// Script de automação para importar workflow no N8N
// Execute este script no console do browser (F12) enquanto estiver logado no N8N

console.log('🤖 Iniciando importação automática do workflow...');

// Ler o arquivo JSON do workflow
const workflowJson = `WORKFLOW_JSON_AQUI`;

// Função para importar workflow
async function importWorkflow() {
  try {
    // Parse do JSON
    const workflow = JSON.parse(workflowJson);

    // Fazer request para API do N8N
    const response = await fetch('/api/v1/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Workflow importado com sucesso!');
      console.log('ID:', result.id);
      console.log('Nome:', result.name);

      // Redirecionar para o workflow
      window.location.href = `/workflow/${result.id}`;
    } else {
      console.error('❌ Erro ao importar:', response.status, response.statusText);
      const error = await response.text();
      console.error('Detalhes:', error);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
importWorkflow();

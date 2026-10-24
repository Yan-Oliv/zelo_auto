export type ErrorCode = 404 | 500 | 503

export const errorMessages = {
  404: {
    title: 'Página não encontrada',
    description: 'O caminho que você procura não existe ou não está mais disponível.',
    eyebrow: 'Nem todos os caminhos levam ao destino.',
  },
  500: {
    title: 'Algo saiu do percurso',
    description: 'Não foi possível concluir esta ação. Tente novamente em instantes.',
    eyebrow: 'Cada detalhe importa.',
  },
  503: {
    title: 'Serviço temporariamente indisponível',
    description: 'Não conseguimos concluir sua solicitação agora. Você pode tentar novamente ou entrar em contato conosco.',
    eyebrow: 'Uma breve pausa no caminho.',
  },
} as const

// Kept independent from landing configuration: recovery must not import its assets or APIs.
export const errorContactUrl = 'https://wa.me/5564996161968?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20or%C3%A7amento%20para%20meu%20ve%C3%ADculo.'

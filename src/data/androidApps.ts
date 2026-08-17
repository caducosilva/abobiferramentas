// Catálogo da página "Apps Android Open Source".
//
// Regra de curadoria: só entra app de código aberto cuja licença permite redistribuição e que
// publica o APK em fonte oficial (GitHub Releases do próprio desenvolvedor ou F-Droid). Por isso
// aqui não tem app pago "desbloqueado", mod de app proprietário nem espelho de APK de terceiro:
// além de ser distribuição ilegal, esses arquivos costumam vir com o pacote adulterado.
//
// Os campos `repo` e `fdroidId` são as chaves usadas para casar com a resposta de
// /api/app-releases, que devolve versão, data e o link direto do .apk. Ao adicionar um app aqui,
// acrescente a mesma chave na allowlist correspondente em api/app-releases.js, senão o card
// aparece sem versão e sem botão de download direto.

export type AndroidAppCategory =
  | 'lojas'
  | 'revanced'
  | 'midia'
  | 'privacidade'
  | 'navegadores'
  | 'utilitarios';

export interface AndroidApp {
  id: string;
  name: string;
  developer: string;
  description: string;
  category: AndroidAppCategory;
  license: string;
  /** owner/repo no GitHub, quando o desenvolvedor publica o APK nos Releases */
  repo?: string;
  /** id do pacote no F-Droid, quando o app está publicado lá */
  fdroidId?: string;
  siteUrl: string;
  keywords: string[];
  /** Aviso curto exibido no card (pré-requisito, pegadinha de instalação, etc.) */
  note?: string;
}

export const APP_CATEGORIES: { id: AndroidAppCategory; label: string }[] = [
  { id: 'lojas', label: 'Lojas & Atualizadores' },
  { id: 'revanced', label: 'ReVanced' },
  { id: 'midia', label: 'Vídeo, Música & Podcast' },
  { id: 'privacidade', label: 'Privacidade & Segurança' },
  { id: 'navegadores', label: 'Navegadores' },
  { id: 'utilitarios', label: 'Utilitários' },
];

export const ANDROID_APPS: AndroidApp[] = [
  // ---------------------------------------------------------------- Lojas & atualizadores
  {
    id: 'fdroid',
    name: 'F-Droid',
    developer: 'F-Droid Limited',
    description:
      'Loja de aplicativos que só publica software livre, com tudo compilado a partir do código-fonte pelo próprio projeto. É a forma mais segura de instalar e manter atualizado quase tudo desta página.',
    category: 'lojas',
    license: 'GPL-3.0',
    fdroidId: 'org.fdroid.fdroid',
    siteUrl: 'https://f-droid.org',
    keywords: ['loja', 'store', 'fdroid', 'open source', 'repositorio'],
  },
  {
    id: 'obtainium',
    name: 'Obtainium',
    developer: 'ImranR98',
    description:
      'Instala e atualiza apps direto da fonte oficial de cada projeto (GitHub, GitLab, F-Droid, site do desenvolvedor). Você cola o link do repositório e ele avisa quando sai versão nova.',
    category: 'lojas',
    license: 'GPL-3.0',
    repo: 'ImranR98/Obtainium',
    siteUrl: 'https://github.com/ImranR98/Obtainium',
    keywords: ['atualizar', 'updater', 'github', 'obtainium', 'automatico'],
  },
  {
    id: 'neo-store',
    name: 'Neo Store',
    developer: 'Machiav3lli',
    description:
      'Cliente alternativo do F-Droid, bem mais rápido que o oficial e com filtros melhores por repositório, permissões e tipo de app.',
    category: 'lojas',
    license: 'GPL-3.0',
    fdroidId: 'com.machiav3lli.fdroid',
    siteUrl: 'https://github.com/NeoApplications/Neo-Store',
    keywords: ['fdroid', 'cliente', 'loja', 'neo store', 'droidify'],
  },
  {
    id: 'aurora-store',
    name: 'Aurora Store',
    developer: 'Aurora OSS',
    description:
      'Cliente livre da Play Store: baixa os mesmos APKs oficiais do Google, mas sem exigir conta logada e sem os serviços de rastreamento da loja original.',
    category: 'lojas',
    license: 'GPL-3.0',
    fdroidId: 'com.aurora.store',
    siteUrl: 'https://auroraoss.com',
    keywords: ['play store', 'aurora', 'anonimo', 'google play', 'loja'],
    note: 'Baixa apps da Play Store de forma anônima, mas os apps em si continuam sendo proprietários.',
  },

  // ---------------------------------------------------------------- ReVanced
  {
    id: 'revanced-manager',
    name: 'ReVanced Manager',
    developer: 'ReVanced',
    description:
      'Aplica os patches do ReVanced no APK que você mesmo fornece, direto no celular. É assim que se obtém YouTube ReVanced e YouTube Music ReVanced de forma legítima: o app modificado é gerado no seu aparelho, não baixado pronto de terceiros.',
    category: 'revanced',
    license: 'GPL-3.0',
    repo: 'ReVanced/revanced-manager',
    siteUrl: 'https://revanced.app',
    keywords: ['revanced', 'youtube', 'patch', 'manager', 'sem anuncio', 'youtube music'],
  },
  {
    id: 'gmscore',
    name: 'GmsCore (microG do ReVanced)',
    developer: 'ReVanced',
    description:
      'Versão do microG mantida pelo ReVanced. É o pré-requisito para conseguir fazer login na conta Google dentro do YouTube ReVanced sem root.',
    category: 'revanced',
    license: 'Apache-2.0',
    repo: 'ReVanced/GmsCore',
    siteUrl: 'https://github.com/ReVanced/GmsCore',
    keywords: ['microg', 'gmscore', 'revanced', 'login', 'google', 'conta'],
    note: 'Instale o GmsCore antes de abrir o app patcheado, senão o login na conta Google falha.',
  },
  {
    id: 'revanced-cli',
    name: 'ReVanced CLI',
    developer: 'ReVanced',
    description:
      'Mesma engine de patches do Manager, em linha de comando, para quem prefere gerar o APK no PC com mais controle sobre quais patches entram.',
    category: 'revanced',
    license: 'GPL-3.0',
    repo: 'ReVanced/revanced-cli',
    siteUrl: 'https://github.com/ReVanced/revanced-cli',
    keywords: ['revanced', 'cli', 'terminal', 'avancado', 'patch'],
    note: 'Requer Java 17 ou superior instalado no computador.',
  },

  // ---------------------------------------------------------------- Mídia
  {
    id: 'newpipe',
    name: 'NewPipe',
    developer: 'Team NewPipe',
    description:
      'Cliente leve de YouTube sem anúncios e sem serviços do Google, com reprodução em segundo plano, modo janela flutuante e download de vídeo e áudio.',
    category: 'midia',
    license: 'GPL-3.0',
    repo: 'TeamNewPipe/NewPipe',
    fdroidId: 'org.schabi.newpipe',
    siteUrl: 'https://newpipe.net',
    keywords: ['youtube', 'newpipe', 'sem anuncio', 'background', 'video'],
  },
  {
    id: 'libretube',
    name: 'LibreTube',
    developer: 'LibreTube',
    description:
      'Alternativa ao YouTube que passa por instâncias Piped, então o Google não vê o seu IP nem monta perfil do que você assiste. Inscrições e playlists ficam no app.',
    category: 'midia',
    license: 'GPL-3.0',
    repo: 'libre-tube/LibreTube',
    fdroidId: 'com.github.libretube',
    siteUrl: 'https://libretube.dev',
    keywords: ['youtube', 'libretube', 'piped', 'privacidade', 'video'],
  },
  {
    id: 'vlc',
    name: 'VLC',
    developer: 'VideoLAN',
    description:
      'O reprodutor que abre praticamente qualquer formato de vídeo e áudio, incluindo streams de rede, sem codec extra e sem anúncio.',
    category: 'midia',
    license: 'GPL-2.0',
    fdroidId: 'org.videolan.vlc',
    siteUrl: 'https://www.videolan.org/vlc/download-android.html',
    keywords: ['vlc', 'player', 'video', 'audio', 'mkv', 'reprodutor'],
  },
  {
    id: 'antennapod',
    name: 'AntennaPod',
    developer: 'AntennaPod',
    description:
      'Gerenciador de podcasts completo: assinatura por RSS, download automático, velocidade variável e sincronização por gpodder, sem depender de plataforma nenhuma.',
    category: 'midia',
    license: 'GPL-3.0',
    repo: 'AntennaPod/AntennaPod',
    fdroidId: 'de.danoeh.antennapod',
    siteUrl: 'https://antennapod.org',
    keywords: ['podcast', 'rss', 'antennapod', 'audio'],
  },

  // ---------------------------------------------------------------- Privacidade & segurança
  {
    id: 'aegis',
    name: 'Aegis Authenticator',
    developer: 'Beem Development',
    description:
      'Autenticador de dois fatores (TOTP/HOTP) com banco criptografado, backup exportável e bloqueio por biometria. Substitui o Google Authenticator sem prender seus códigos a uma conta.',
    category: 'privacidade',
    license: 'GPL-3.0',
    repo: 'beemdevelopment/Aegis',
    fdroidId: 'com.beemdevelopment.aegis',
    siteUrl: 'https://getaegis.app',
    keywords: ['2fa', 'autenticador', 'totp', 'aegis', 'seguranca', 'codigo'],
  },
  {
    id: 'keepassdx',
    name: 'KeePassDX',
    developer: 'Kunzisoft',
    description:
      'Gerenciador de senhas offline no formato KeePass. O cofre é um arquivo seu, guardado onde você quiser, sem servidor e sem assinatura mensal.',
    category: 'privacidade',
    license: 'GPL-3.0',
    repo: 'Kunzisoft/KeePassDX',
    fdroidId: 'com.kunzisoft.keepass.libre',
    siteUrl: 'https://www.keepassdx.com',
    keywords: ['senha', 'keepass', 'cofre', 'gerenciador', 'offline'],
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    developer: 'Bitwarden Inc.',
    description:
      'Gerenciador de senhas com sincronização entre aparelhos e plano gratuito sem limite de senhas. Dá para usar o servidor oficial ou hospedar o seu.',
    category: 'privacidade',
    license: 'GPL-3.0',
    repo: 'bitwarden/android',
    siteUrl: 'https://bitwarden.com',
    keywords: ['senha', 'bitwarden', 'cofre', 'sincronizar', 'gerenciador'],
  },
  {
    id: 'signal',
    name: 'Signal',
    developer: 'Signal Foundation',
    description:
      'Mensageiro com criptografia de ponta a ponta em tudo, incluindo chamadas e grupos, e praticamente nenhum metadado guardado no servidor.',
    category: 'privacidade',
    license: 'AGPL-3.0',
    repo: 'signalapp/Signal-Android',
    siteUrl: 'https://signal.org',
    keywords: ['mensagem', 'signal', 'criptografia', 'chat', 'privacidade'],
  },
  {
    id: 'shizuku',
    name: 'Shizuku',
    developer: 'RikkaApps',
    description:
      'Dá a outros apps acesso a APIs de sistema via ADB, sem root. Vários utilitários de personalização e de bloqueio de anúncios dependem dele.',
    category: 'privacidade',
    license: 'Apache-2.0',
    repo: 'RikkaApps/Shizuku',
    siteUrl: 'https://shizuku.rikka.app',
    keywords: ['shizuku', 'adb', 'root', 'permissao', 'sistema'],
    note: 'Precisa ser reativado via ADB ou depuração sem fio a cada reinício do aparelho.',
  },

  // ---------------------------------------------------------------- Navegadores
  {
    id: 'cromite',
    name: 'Cromite',
    developer: 'uazo',
    description:
      'Chromium com bloqueio de anúncios embutido, sem os serviços do Google e com proteções extras contra fingerprint. Sucessor do antigo Bromite.',
    category: 'navegadores',
    license: 'GPL-3.0',
    repo: 'uazo/cromite',
    siteUrl: 'https://www.cromite.org',
    keywords: ['navegador', 'chromium', 'cromite', 'adblock', 'bromite'],
  },
  {
    id: 'fennec',
    name: 'Fennec F-Droid',
    developer: 'F-Droid / Mozilla',
    description:
      'Firefox recompilado pelo F-Droid sem os componentes proprietários de telemetria da Mozilla, mantendo o suporte a extensões como uBlock Origin.',
    category: 'navegadores',
    license: 'MPL-2.0',
    fdroidId: 'org.mozilla.fennec_fdroid',
    siteUrl: 'https://f-droid.org/packages/org.mozilla.fennec_fdroid/',
    keywords: ['firefox', 'fennec', 'navegador', 'ublock', 'extensao'],
  },

  // ---------------------------------------------------------------- Utilitários
  {
    id: 'termux',
    name: 'Termux',
    developer: 'Termux',
    description:
      'Emulador de terminal com ambiente Linux completo no Android: gerenciador de pacotes, Python, Node, git e ssh, tudo sem root.',
    category: 'utilitarios',
    license: 'GPL-3.0',
    repo: 'termux/termux-app',
    fdroidId: 'com.termux',
    siteUrl: 'https://termux.dev',
    keywords: ['terminal', 'linux', 'termux', 'shell', 'python', 'ssh'],
    note: 'Não misture a versão do F-Droid com a do GitHub: as assinaturas são diferentes e os plugins param de funcionar.',
  },
  {
    id: 'organic-maps',
    name: 'Organic Maps',
    developer: 'Organic Maps',
    description:
      'Mapas e navegação GPS offline baseados no OpenStreetMap, sem anúncio e sem rastreamento. Funciona no modo avião depois de baixar o estado.',
    category: 'utilitarios',
    license: 'Apache-2.0',
    repo: 'organicmaps/organicmaps',
    fdroidId: 'app.organicmaps',
    siteUrl: 'https://organicmaps.app',
    keywords: ['mapa', 'gps', 'offline', 'navegacao', 'openstreetmap'],
  },
  {
    id: 'fossify-gallery',
    name: 'Fossify Gallery',
    developer: 'Fossify',
    description:
      'Galeria offline com editor básico e organização por pastas, sem nuvem e sem pedir permissão de internet. Sucessora da Simple Gallery.',
    category: 'utilitarios',
    license: 'GPL-3.0',
    repo: 'FossifyOrg/Gallery',
    fdroidId: 'org.fossify.gallery',
    siteUrl: 'https://www.fossify.org',
    keywords: ['galeria', 'fotos', 'fossify', 'simple gallery', 'offline'],
  },
  {
    id: 'fossify-files',
    name: 'Fossify File Manager',
    developer: 'Fossify',
    description:
      'Gerenciador de arquivos leve, com pasta protegida por senha, suporte a root opcional e nenhuma tela de anúncio.',
    category: 'utilitarios',
    license: 'GPL-3.0',
    repo: 'FossifyOrg/File-Manager',
    fdroidId: 'org.fossify.filemanager',
    siteUrl: 'https://www.fossify.org',
    keywords: ['arquivos', 'gerenciador', 'fossify', 'explorer', 'pasta'],
  },
  {
    id: 'fossify-calendar',
    name: 'Fossify Calendar',
    developer: 'Fossify',
    description:
      'Agenda offline com eventos recorrentes, widgets e importação de arquivos .ics, sem exigir conta Google.',
    category: 'utilitarios',
    license: 'GPL-3.0',
    fdroidId: 'org.fossify.calendar',
    siteUrl: 'https://www.fossify.org',
    keywords: ['calendario', 'agenda', 'fossify', 'evento', 'offline'],
  },
  {
    id: 'material-files',
    name: 'Material Files',
    developer: 'Hai Zhang',
    description:
      'Gerenciador de arquivos com visual Material Design, suporte a arquivos compactados, FTP, SFTP e SMB da rede local.',
    category: 'utilitarios',
    license: 'GPL-3.0',
    fdroidId: 'me.zhanghai.android.files',
    siteUrl: 'https://github.com/zhanghai/MaterialFiles',
    keywords: ['arquivos', 'smb', 'ftp', 'rede', 'material'],
  },
  {
    id: 'markor',
    name: 'Markor',
    developer: 'Gregor Santner',
    description:
      'Editor de texto e Markdown offline que trabalha direto em arquivos simples da memória do celular, com to-do list e bloco de notas.',
    category: 'utilitarios',
    license: 'Apache-2.0',
    fdroidId: 'net.gsantner.markor',
    siteUrl: 'https://github.com/gsantner/markor',
    keywords: ['markdown', 'notas', 'editor', 'texto', 'markor', 'todo'],
  },
  {
    id: 'florisboard',
    name: 'FlorisBoard',
    developer: 'FlorisBoard',
    description:
      'Teclado livre com correção offline, temas e gestos, sem enviar o que você digita para servidor nenhum.',
    category: 'utilitarios',
    license: 'Apache-2.0',
    repo: 'florisboard/florisboard',
    fdroidId: 'dev.patrickgold.florisboard',
    siteUrl: 'https://florisboard.org',
    keywords: ['teclado', 'keyboard', 'floris', 'privacidade', 'digitacao'],
  },
];

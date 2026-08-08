import { useEffect, useState } from 'react';
import { Lock, Unlock, ShieldCheck, Plus, Trash2, Pencil, X, Save, KeyRound, AlertTriangle } from 'lucide-react';
import { encryptJSON, decryptJSON, EncryptedPayload } from '../../utils/vaultCrypto';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

interface EncryptedNote extends EncryptedPayload {
  id: string;
  updatedAt: number;
}

interface NotePlain {
  title: string;
  body: string;
}

const CHECK_KEY = 'abobi_vault_check';
const NOTES_KEY = 'abobi_vault_notes';

function loadCheck(): EncryptedPayload | null {
  try {
    const raw = localStorage.getItem(CHECK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadNotes(): EncryptedNote[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function LocalNotesVault({ onCopyToast }: ToolProps) {
  const [hasVault, setHasVault] = useState(() => loadCheck() !== null);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const [notes, setNotes] = useState<EncryptedNote[]>([]);
  const [plainById, setPlainById] = useState<Record<string, NotePlain>>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!unlocked) return;
    setNotes(loadNotes());
  }, [unlocked]);

  const persistNotes = (updated: EncryptedNote[]) => {
    setNotes(updated);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  };

  const handleCreateVault = async () => {
    if (passwordInput.length < 6) {
      setUnlockError('Use uma senha com pelo menos 6 caracteres.');
      return;
    }
    if (passwordInput !== confirmInput) {
      setUnlockError('As senhas não conferem.');
      return;
    }
    setBusy(true);
    try {
      const check = await encryptJSON({ check: 'ok' }, passwordInput);
      localStorage.setItem(CHECK_KEY, JSON.stringify(check));
      localStorage.setItem(NOTES_KEY, JSON.stringify([]));
      setHasVault(true);
      setUnlocked(true);
      setPassword(passwordInput);
      setNotes([]);
      setPlainById({});
      onCopyToast('Cofre criado! Guarde bem sua senha — ela nunca é enviada nem salva em nenhum servidor.');
    } finally {
      setBusy(false);
      setPasswordInput('');
      setConfirmInput('');
    }
  };

  const handleUnlock = async () => {
    const check = loadCheck();
    if (!check) return;
    setBusy(true);
    setUnlockError('');
    try {
      await decryptJSON(check, passwordInput);
      const stored = loadNotes();
      const decrypted: Record<string, NotePlain> = {};
      for (const note of stored) {
        try {
          decrypted[note.id] = await decryptJSON<NotePlain>(note, passwordInput);
        } catch {
          decrypted[note.id] = { title: '(falha ao decodificar)', body: '' };
        }
      }
      setPlainById(decrypted);
      setNotes(stored);
      setPassword(passwordInput);
      setUnlocked(true);
    } catch {
      setUnlockError('Senha incorreta.');
    } finally {
      setBusy(false);
      setPasswordInput('');
    }
  };

  const handleLock = () => {
    setUnlocked(false);
    setPassword('');
    setPlainById({});
    setNotes([]);
    setEditingId(null);
    setExpandedId(null);
    onCopyToast('Cofre bloqueado.');
  };

  const handleSaveNote = async () => {
    if (!draftTitle.trim()) {
      onCopyToast('Dê um título para a nota.');
      return;
    }
    setBusy(true);
    try {
      const plain: NotePlain = { title: draftTitle.trim(), body: draftBody };
      const encrypted = await encryptJSON(plain, password);
      const isNew = !editingId || editingId === '__new__';
      const id = isNew ? crypto.randomUUID() : editingId!;
      const entry: EncryptedNote = { id, updatedAt: Date.now(), ...encrypted };

      const updated = isNew ? [entry, ...notes] : notes.map((n) => (n.id === editingId ? entry : n));
      persistNotes(updated);
      setPlainById((prev) => ({ ...prev, [id]: plain }));
      setEditingId(null);
      setDraftTitle('');
      setDraftBody('');
      onCopyToast('Nota salva no seu navegador!');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (note: EncryptedNote) => {
    const plain = plainById[note.id];
    setEditingId(note.id);
    setDraftTitle(plain?.title ?? '');
    setDraftBody(plain?.body ?? '');
    setExpandedId(note.id);
  };

  const startNew = () => {
    setEditingId('__new__');
    setDraftTitle('');
    setDraftBody('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle('');
    setDraftBody('');
  };

  const handleDeleteNote = (id: string) => {
    if (!window.confirm('Apagar esta nota permanentemente?')) return;
    persistNotes(notes.filter((n) => n.id !== id));
    setPlainById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleDeleteVault = () => {
    if (!window.confirm('Isso apaga o cofre e TODAS as notas salvas neste navegador. Não pode ser desfeito. Continuar?'))
      return;
    localStorage.removeItem(CHECK_KEY);
    localStorage.removeItem(NOTES_KEY);
    setHasVault(false);
    handleLock();
    onCopyToast('Cofre apagado deste navegador.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          Cofre de Notas Local
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Notas criptografadas com uma senha só sua, salvas apenas no seu navegador.
        </p>
      </div>

      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Suas notas são criptografadas (AES-GCM + PBKDF2) com a senha que você escolher, direto no seu navegador. Nem
          o texto nem a senha são enviados para nosso servidor — tudo fica salvo apenas neste dispositivo. Se você
          esquecer a senha, não há como recuperar as notas.
        </p>
      </div>

      {!hasVault && (
        <div className="max-w-sm mx-auto space-y-3">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center">
            Crie uma senha para o seu cofre
          </p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Senha (mín. 6 caracteres)"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Confirme a senha"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateVault()}
          />
          {unlockError && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {unlockError}
            </p>
          )}
          <button
            onClick={handleCreateVault}
            disabled={busy}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" /> Criar cofre
          </button>
        </div>
      )}

      {hasVault && !unlocked && (
        <div className="max-w-sm mx-auto space-y-3">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Digite a senha do seu cofre"
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />
          {unlockError && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {unlockError}
            </p>
          )}
          <button
            onClick={handleUnlock}
            disabled={busy || !passwordInput}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" /> Desbloquear
          </button>
          <button
            onClick={handleDeleteVault}
            className="w-full py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Esqueci a senha — apagar cofre deste navegador
          </button>
        </div>
      )}

      {unlocked && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLock}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> Bloquear cofre
            </button>
            {editingId === null && (
              <button
                onClick={startNew}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nova nota
              </button>
            )}
          </div>

          {editingId !== null && (
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Título da nota"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none"
              />
              <textarea
                rows={5}
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder="Conteúdo da nota..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={cancelEdit}
                  className="px-3.5 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={busy}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {notes.length === 0 && editingId === null && (
              <p className="text-center text-sm text-slate-400 py-8">
                Nenhuma nota ainda. Clique em "Nova nota" para começar.
              </p>
            )}
            {notes.map((note) => {
              const plain = plainById[note.id];
              const isExpanded = expandedId === note.id;
              return (
                <div key={note.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : note.id)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{plain?.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(note.updatedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(note);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="p-4 pt-0">
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                        {plain?.body || <span className="text-slate-400">Sem conteúdo.</span>}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleDeleteVault}
            className="w-full py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Apagar cofre e todas as notas deste navegador
          </button>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, Shield, User as UserIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createUser, deleteUser, getUsers, updateUser } from '@/lib/api';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function SettingsUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<SystemUser | null>(null);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers((response.data as SystemUser[]) || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar usuários';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditing(user);
    setShowForm(true);
  };

  const handleOpenView = (user: SystemUser) => {
    setViewing(user);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const role = String(form.get('role') || 'user') as 'admin' | 'user';
    const active = String(form.get('active') || 'true') === 'true';
    const password = String(form.get('password') || '').trim();

    if (!name || !email) {
      toast({ title: 'Atenção', description: 'Nome e email são obrigatórios', variant: 'destructive' });
      return;
    }

    if (!editing && password.length < 6) {
      toast({ title: 'Atenção', description: 'Senha deve ter ao menos 6 caracteres', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await updateUser(editing.id, {
          name,
          email,
          role,
          active,
          ...(password ? { password } : {}),
        });
        toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso' });
      } else {
        await createUser({
          name,
          email,
          password,
          role,
          active,
        });
        toast({ title: 'Sucesso', description: 'Usuário criado com sucesso' });
      }

      setShowForm(false);
      setEditing(null);
      loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao salvar usuário';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskDelete = (id: string) => {
    setConfirmUserId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmUserId) return;
    try {
      await deleteUser(confirmUserId);
      toast({ title: 'Sucesso', description: 'Usuário deletado com sucesso' });
      setConfirmOpen(false);
      setConfirmUserId(null);
      loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao deletar usuário';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerenciamento de usuários do sistema</p>
        </div>
        <Button onClick={handleOpenCreate} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou papel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">{filteredUsers.length} usuários</div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Usuário</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Papel</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-foreground">Nenhum usuário encontrado</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button type="button" onClick={() => handleOpenEdit(u)} className="p-1.5 rounded-lg hover:bg-muted" title="Editar usuário">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleOpenView(u)} className="p-1.5 rounded-lg hover:bg-muted" title="Visualizar usuário">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleAskDelete(u.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Desativar usuário">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm mb-1 font-medium">Nome *</label>
              <Input name="name" defaultValue={editing?.name || ''} required />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Email *</label>
              <Input name="email" type="email" defaultValue={editing?.email || ''} required />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">Senha {editing ? '(opcional)' : '*'}</label>
              <Input name="password" type="password" minLength={editing ? 0 : 6} required={!editing} placeholder={editing ? 'Deixe vazio para manter a atual' : ''} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 font-medium">Papel</label>
                <select name="role" defaultValue={editing?.role || 'user'} className="w-full h-10 rounded-md border border-input px-3 bg-background">
                  <option value="admin">Administrador</option>
                  <option value="user">Usuário</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium">Status</label>
                <select name="active" defaultValue={String(editing?.active ?? true)} className="w-full h-10 rounded-md border border-input px-3 bg-background">
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={submitting}>
                {submitting ? 'Salvando...' : editing ? 'Atualizar' : 'Criar usuário'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Usuário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Confirma a exclusão deste usuário?</p>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Deletar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Visualizar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nome</p>
              <p className="font-medium">{viewing?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{viewing?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Papel</p>
              <p className="font-medium">{viewing?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{viewing?.active ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>
          <div className="pt-3 flex justify-end">
            <Button variant="outline" onClick={() => setViewing(null)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

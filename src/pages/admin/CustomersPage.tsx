import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Debugging: log confirm dialog state changes
  useEffect(() => {
    console.log('confirmOpen state:', confirmOpen);
  }, [confirmOpen]);

  // Carregar clientes
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomers();
      setCustomers(response.data || []);
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro ao carregar clientes';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    c.cpf.includes(search)
  );

  const handleDelete = (id: string) => {
    // Open confirmation dialog instead of using window.confirm
    console.log('handleDelete called for', id);
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    try {
      await deleteCustomer(confirmId);
      setCustomers(prev => prev.filter(c => c.id !== confirmId));
      toast({
        title: 'Sucesso',
        description: 'Cliente deletado com sucesso',
        className: 'bg-green-600 text-white border-0'
      });
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Erro ao deletar cliente',
        variant: 'destructive'
      });
    } finally {
      setConfirmId(null);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name') as string,
      cpf: form.get('cpf') as string,
      phone: form.get('phone') as string,
      email: form.get('email') as string || undefined,
      address: form.get('address') as string || undefined,
      city: form.get('city') as string || undefined,
      state: form.get('state') as string || undefined,
      zipCode: form.get('zipCode') as string || undefined,
      notes: form.get('notes') as string || undefined
    };

    // Validação básica
    if (!data.name.trim()) {
      setError('Nome é obrigatório');
      setSubmitting(false);
      return;
    }
    if (!data.cpf.trim()) {
      setError('CPF é obrigatório');
      setSubmitting(false);
      return;
    }
    if (!data.phone.trim()) {
      setError('Telefone é obrigatório');
      setSubmitting(false);
      return;
    }

    try {
      let response;
      if (editing) {
        response = await updateCustomer(editing.id, data);
        const updatedCustomers = customers.map(c => c.id === editing.id ? response.data : c);
        setCustomers(updatedCustomers);
        setSuccessMessage('Cliente atualizado com sucesso!');
      } else {
        response = await createCustomer(data);
        setCustomers(prev => [...prev, response.data]);
        setSuccessMessage('Cliente criado com sucesso!');
      }

      toast({
        title: 'Sucesso',
        description: response.message || 'Operação realizada com sucesso',
        className: 'bg-green-600 text-white border-0'
      });

      setTimeout(() => {
        setShowForm(false);
        setEditing(null);
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro ao salvar cliente';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenForm = (customer?: Customer) => {
    setEditing(customer || null);
    setError(null);
    setSuccessMessage(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Clientes</h1>
          <p className="text-muted-foreground">{customers.length} clientes cadastrados</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, email ou CPF..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Contato</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">CPF</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cidade</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Obs.</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {c.email && <p>{c.email}</p>}
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-foreground">{c.cpf}</td>
                    <td className="py-3 px-4 text-foreground">{c.city}/{c.state || '-'}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs max-w-[150px] truncate">{c.notes || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button type="button" onClick={() => handleOpenForm(c)} className="p-1.5 rounded-lg hover:bg-muted" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Deletar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>

          {successMessage && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 flex gap-3 text-green-600">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" name="name" required defaultValue={editing?.name} disabled={submitting} />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" name="cpf" required defaultValue={editing?.cpf} disabled={submitting} />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" name="phone" required defaultValue={editing?.phone} disabled={submitting} />
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" defaultValue={editing?.email} disabled={submitting} />
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" name="address" defaultValue={editing?.address} disabled={submitting} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" defaultValue={editing?.city} disabled={submitting} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" maxLength={2} defaultValue={editing?.state} disabled={submitting} />
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" name="notes" defaultValue={editing?.notes} disabled={submitting} />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deletion */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md z-[99999]">
          <DialogHeader>
            <DialogTitle className="font-display">Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => { setConfirmOpen(false); setConfirmId(null); }}>Cancelar</Button>
              <Button type="button" className="bg-destructive text-white" onClick={confirmDelete}>Deletar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { mockCustomers } from '@/data/mockData';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf.includes(search)
  );

  const handleDelete = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const customer: Customer = {
      id: editing?.id || Date.now().toString(),
      name: form.get('name') as string,
      email: form.get('email') as string,
      phone: form.get('phone') as string,
      cpf: form.get('cpf') as string,
      address: form.get('address') as string,
      city: form.get('city') as string,
      state: form.get('state') as string,
      zipCode: form.get('zipCode') as string,
      notes: form.get('notes') as string,
      createdAt: editing?.createdAt || new Date().toISOString().split('T')[0],
    };
    if (editing) {
      setCustomers(prev => prev.map(c => c.id === editing.id ? customer : c));
    } else {
      setCustomers(prev => [...prev, customer]);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Clientes</h1>
          <p className="text-muted-foreground">{customers.length} clientes cadastrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, email ou CPF..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

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
              {filtered.map(c => (
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
                    <p>{c.email}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-foreground">{c.cpf}</td>
                  <td className="py-3 px-4 text-foreground">{c.city}/{c.state}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs max-w-[150px] truncate">{c.notes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-muted"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1"><Label>Nome</Label><Input name="name" required defaultValue={editing?.name} /></div>
              <div className="space-y-1"><Label>E-mail</Label><Input name="email" type="email" required defaultValue={editing?.email} /></div>
              <div className="space-y-1"><Label>Telefone</Label><Input name="phone" required defaultValue={editing?.phone} /></div>
              <div className="space-y-1"><Label>CPF</Label><Input name="cpf" required defaultValue={editing?.cpf} /></div>
              <div className="space-y-1"><Label>CEP</Label><Input name="zipCode" defaultValue={editing?.zipCode} /></div>
              <div className="col-span-2 space-y-1"><Label>Endereço</Label><Input name="address" defaultValue={editing?.address} /></div>
              <div className="space-y-1"><Label>Cidade</Label><Input name="city" defaultValue={editing?.city} /></div>
              <div className="space-y-1"><Label>Estado</Label><Input name="state" defaultValue={editing?.state} /></div>
              <div className="col-span-2 space-y-1"><Label>Observações</Label><Input name="notes" defaultValue={editing?.notes} /></div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

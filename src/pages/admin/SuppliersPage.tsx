import { useState } from 'react';
import { mockSuppliers } from '@/data/mockData';
import { Supplier } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.cnpj.includes(search)
  );

  const handleDelete = (id: string) => setSuppliers(prev => prev.filter(s => s.id !== id));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const supplier: Supplier = {
      id: editing?.id || Date.now().toString(),
      name: form.get('name') as string,
      cnpj: form.get('cnpj') as string,
      email: form.get('email') as string,
      phone: form.get('phone') as string,
      contact: form.get('contact') as string,
      address: form.get('address') as string,
      city: form.get('city') as string,
      state: form.get('state') as string,
      category: form.get('category') as string,
      createdAt: editing?.createdAt || new Date().toISOString().split('T')[0],
    };
    if (editing) setSuppliers(prev => prev.map(s => s.id === editing.id ? supplier : s));
    else setSuppliers(prev => [...prev, supplier]);
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground">{suppliers.length} fornecedores cadastrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou CNPJ..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fornecedor</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">CNPJ</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Contato</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Categoria</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cidade</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{s.name}</span>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{s.cnpj}</td>
                  <td className="py-3 px-4 text-foreground">
                    <p>{s.contact}</p>
                    <p className="text-xs text-muted-foreground">{s.phone}</p>
                  </td>
                  <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s.category}</span></td>
                  <td className="py-3 px-4 text-foreground">{s.city}/{s.state}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-muted"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
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
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1"><Label>Razão Social</Label><Input name="name" required defaultValue={editing?.name} /></div>
              <div className="space-y-1"><Label>CNPJ</Label><Input name="cnpj" required defaultValue={editing?.cnpj} /></div>
              <div className="space-y-1"><Label>Categoria</Label><Input name="category" required defaultValue={editing?.category} /></div>
              <div className="space-y-1"><Label>E-mail</Label><Input name="email" type="email" required defaultValue={editing?.email} /></div>
              <div className="space-y-1"><Label>Telefone</Label><Input name="phone" required defaultValue={editing?.phone} /></div>
              <div className="col-span-2 space-y-1"><Label>Pessoa de Contato</Label><Input name="contact" defaultValue={editing?.contact} /></div>
              <div className="col-span-2 space-y-1"><Label>Endereço</Label><Input name="address" defaultValue={editing?.address} /></div>
              <div className="space-y-1"><Label>Cidade</Label><Input name="city" defaultValue={editing?.city} /></div>
              <div className="space-y-1"><Label>Estado</Label><Input name="state" defaultValue={editing?.state} /></div>
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

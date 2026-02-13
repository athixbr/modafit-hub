import { useState } from 'react';
import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: form.get('name') as string,
      description: form.get('description') as string,
      category: form.get('category') as string,
      size: (form.get('sizes') as string).split(',').map(s => s.trim()),
      color: form.get('color') as string,
      price: parseFloat(form.get('price') as string),
      costPrice: parseFloat(form.get('costPrice') as string),
      quantity: parseInt(form.get('quantity') as string),
      minStock: parseInt(form.get('minStock') as string),
      sku: form.get('sku') as string,
      image: form.get('image') as string || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
      images: [],
      active: true,
      createdAt: editingProduct?.createdAt || new Date().toISOString().split('T')[0],
    };
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? product : p));
    } else {
      setProducts(prev => [...prev, product]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Estoque</h1>
          <p className="text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, SKU ou categoria..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => { setEditingProduct(product); setShowForm(true); }} className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                  <Edit className="h-3.5 w-3.5 text-foreground" />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {product.quantity <= product.minStock && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-destructive/90 text-destructive-foreground text-xs font-medium">
                  Estoque baixo
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{product.sku} • {product.category}</p>
              <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">{product.quantity} un.</span>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {product.size.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Nome</Label>
                <Input name="name" required defaultValue={editingProduct?.name} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Descrição</Label>
                <textarea name="description" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-20" defaultValue={editingProduct?.description} />
              </div>
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Input name="category" required defaultValue={editingProduct?.category} />
              </div>
              <div className="space-y-1">
                <Label>SKU</Label>
                <Input name="sku" required defaultValue={editingProduct?.sku} />
              </div>
              <div className="space-y-1">
                <Label>Preço Venda</Label>
                <Input name="price" type="number" step="0.01" required defaultValue={editingProduct?.price} />
              </div>
              <div className="space-y-1">
                <Label>Preço Custo</Label>
                <Input name="costPrice" type="number" step="0.01" required defaultValue={editingProduct?.costPrice} />
              </div>
              <div className="space-y-1">
                <Label>Quantidade</Label>
                <Input name="quantity" type="number" required defaultValue={editingProduct?.quantity} />
              </div>
              <div className="space-y-1">
                <Label>Estoque Mínimo</Label>
                <Input name="minStock" type="number" required defaultValue={editingProduct?.minStock} />
              </div>
              <div className="space-y-1">
                <Label>Tamanhos (separados por vírgula)</Label>
                <Input name="sizes" required defaultValue={editingProduct?.size.join(', ')} />
              </div>
              <div className="space-y-1">
                <Label>Cor</Label>
                <Input name="color" required defaultValue={editingProduct?.color} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>URL da Imagem</Label>
                <Input name="image" defaultValue={editingProduct?.image} placeholder="https://..." />
              </div>
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
